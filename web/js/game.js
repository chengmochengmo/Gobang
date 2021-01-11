// socket实例
import socket from './socket'
// 工具方法
import { showToast, domHandle} from './lib'
// 对局方法
import { countDownRestart, getPosition} from './game-methods'
// 判定胜负算法
import winAlgorithm from './algorithm'
// 全局常量
const constants = require('../../common/constants');

class Gobang {
    constructor () {
        this.canvas = checkerboard;
        this.context = this.canvas.getContext('2d');
        // 上次滑动时间戳 ms
        this.lastTime = 0;
        // 选择落子时画布
        this.myLastDowningFill = null;
        this.otherLastDowningFill = null;
        // 上次落子位置提示
        this.lastPosition = [-1, -1];
        this.relastPosition = [-1, -1];
        this.clearLastPoint = true;
        this.init(); // 初始化棋盘
        this.eventInit();
        // 接受服务端发来消息
        socket.on(constants.PIECE_DOWN, (position) => {
            let [X, Y] = position;
            let piecePosition = `[${X},${Y}]`;
            otherPieceLists.push(piecePosition); // 对手棋子位置存入
            this.downPiece(...position, pieceColor.other, true);
            canHandle = true;
            countDownRestart(); // 计时
        });
    }

    // 初始化棋盘
    init () {
        // 设置棋盘宽高
        this.context.width = this.context.height = this.canvas.width = this.canvas.height = this.canvas.offsetHeight;
        this.grid = 15; // 棋盘网格数
        this.spacing = this.context.width / (this.grid + 1); // 网格间距
        this.pieceSize = this.spacing / 2.5; // 棋子宽度
        this.lastPieceSize = this.pieceSize * 2.3; // 清除棋子的宽度
        this.context.fillStyle = constants.BACKGROUND_COLOR;
        this.context.fillRect(0, 0, this.context.width, this.context.height); // 绘制棋盘
        this.context.lineWidth = 2;
        this.context.strokeStyle = constants.LINE_COLOR;
        this.context.strokeRect(1, 1, this.context.width - 2, this.context.height - 2); // 棋盘边框
        this.context.lineWidth = 1.5;
        this.context.strokeRect(4, 4, this.context.width - 8, this.context.height - 8); // 棋盘内边框
        let i = 1;
        while(i <= this.grid + 1) { // 绘制网格
            let start = this.spacing * i;
            this.drawLine(start, 0, start, this.context.width); // 竖网格
            this.drawLine(0, start, this.context.width, start); // 横网格
            i++;
        }
        const speckPositon = { // 棋盘四角、中心定位小圆点
            center: [8, 8],
            topLeft: [3, 3],
            topRight: [3, 13],
            bottomLeft: [13, 3],
            bottomRight: [13, 13],
        }
        for(let j in speckPositon) { // 绘制小圆点
            const [x, y] = speckPositon[j];
            this.drawCircular(this.spacing * x, this.spacing * y, this.pieceSize / 4, constants.LINE_COLOR);
        } 
    }
    // 初始化点击事件监听
    eventInit () {
        //手指按下事件监听
        this.canvas.addEventListener('touchstart',(e)=> {
            if(!canHandle) return;
            const {pageX, pageY} = e.targetTouches[0];
            const {offsetTop} = e.targetTouches[0].target;
            this.myLastDowningFill = this.setLastFill();
            this.downingPiece(pageX, pageY - offsetTop);
        },false);
        // 手指滑动事件监听
        this.canvas.addEventListener('touchmove',(e)=> {
            if(!canHandle) return;
            let nowTime = (new Date()).valueOf(); // 获取当前时间戳
            if (nowTime - 100 <= this.lastTime) return; // 100ms截流
            this.lastTime = nowTime;
            const {pageX, pageY} = e.targetTouches[0];
            const {offsetTop} = e.targetTouches[0].target;
            this.downingPiece(pageX, pageY - offsetTop);
            console.log(1)
        },false);
        // 手指抬起事件监听
        this.canvas.addEventListener('touchend',(e)=> {
            if(!canHandle) return;
            const {pageX, pageY} = e.changedTouches[0];
            const {offsetTop} = e.changedTouches[0].target;
            const {X, Y} = getPosition(pageX, pageY - offsetTop, this.spacing);
            if(X < 0 || Y < 0 || X > 16 || Y > 16){
                this.context.drawImage(this.myLastDowningFill, 0, 0);
                return showToast('请在棋盘内落子');
            }
            let piecePosition = `[${X},${Y}]`;
            if(pieceLists.indexOf(piecePosition) !== -1 || otherPieceLists.indexOf(piecePosition) !== -1){
                this.context.drawImage(this.myLastDowningFill, 0, 0);
                return showToast('不能重复位置落子');
            }
            canHandle = false;
            // 已经落子 并且保存数据
            this.downingPiece(pageX, pageY - offsetTop, true);
            pieceLists.push(piecePosition); // 自己棋子位置存入
            console.log('自己棋子位置：', pieceLists);
            // 调用方法 判断输赢
            let winSituation = winAlgorithm([X, Y]);
            // 发送服务端
            socket.emit(constants.PIECE_DOWN, { roomName, position: [X, Y] });
            if(winSituation != '没有五连') return playend(pieceColor.my);
            countDownRestart();  // 计时
        },false);
    }
    // 填补清除后的空白 (优化性能，离屏canvas)
    setLastFill () {
        const offCanvas = document.createElement('canvas');
        const offContext = offCanvas.getContext('2d');
        offContext.width = offContext.height = offCanvas.width = offCanvas.height = this.canvas.width;
        offContext.drawImage(this.canvas, 0, 0);
        return offCanvas;
    }
    // 绘制线条
    drawLine (startX, startY, endX, endY) {
        this.context.moveTo (startX, startY); // 设置起点状态
        this.context.lineTo (endX, endY); // 设置末端状态
        this.context.lineWidth = 1;
        this.context.strokeStyle = constants.LINE_COLOR;
        this.context.stroke(); // 绘制
    }
    // 绘制圆形
    drawCircular (x, y, radius, color) {
        this.context.lineWidth = 0;
        this.context.beginPath();
        this.context.arc(x, y, radius, 0, Math.PI * 2);
        this.context.stroke();
        this.context.fillStyle = color || 'black'; // 棋子颜色
        this.context.fill(); // 填充
    }
    // 落子 绘制棋子
    downPiece (x, y, color, down) {
        this.drawCircular(this.spacing * x, this.spacing * y, this.pieceSize, color || 'black');
        this.drawCircular(this.spacing * x, this.spacing * y, this.pieceSize / 8, 'red');
        // 清除上一次的小红点
        if (down) {
            if (!this.clearLastPoint) {
                this.lastPosition = this.relastPosition;
            }
            this.relastPosition = this.lastPosition
            this.drawCircular(this.lastPosition[0] * this.spacing, this.lastPosition[1] * this.spacing, this.pieceSize, constants.PVPMap.otherColor(color));
            this.lastPosition = [x, y]
            this.clearLastPoint = true;
        }
    }
    // 选择落子位置提示
    downingPiece (pageX, pageY, down) {
        const {X, Y} = getPosition(pageX, pageY, this.spacing);
        this.reLastDraw('my');
        this.downPiece(X, Y, pieceColor.my, down);
        this.otherLastDowningFill = this.setLastFill();
    }
    // 恢复上一次落子前的画布
    reLastDraw (player, isReChess) {
        if(isReChess) this.clearLastPoint = false;
        this.context.drawImage(this[player + 'LastDowningFill'], 0, 0);
    }
    // 清空画布 重新开始
    reLoadGame () {
        this.context.clearRect(0,0,this.canvas.width,this.canvas.width);
        this.init();
    }
}

export default Gobang;