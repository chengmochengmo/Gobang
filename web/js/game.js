const socket = io.connect('http://localhost:3000/');

function Gobang() {
    this.canvas = checkerboard;
    this.context = this.canvas.getContext('2d');
    this.lastTime = 0; // 上次滑动时间戳 ms
    this.lastDowningPieceX = -1; // 上一次绘制的没有下落棋子 X坐标
    this.lastDowningPieceY = -1; // 上一次绘制的没有下落棋子 Y坐标
    this.init();
    this.eventInit();
    // 接受服务端发来消息
    socket.on(constants.PIECE_DOWN, (position) => {
        this.downPiece(...position, pieceColor.other);
        otherPieceLists.push(position); // 对方棋子位置存入
        console.log('对方棋子位置：', otherPieceLists);
        canHandle = true;
        countDownStart(); // 计时
    });
}
// 初始化棋盘
Gobang.prototype.init = function () {
    this.context.width = this.context.height = this.canvas.width = this.canvas.height = this.canvas.offsetHeight; //设置棋盘宽高
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
Gobang.prototype.eventInit = function () {
    this.canvas.addEventListener('touchstart',(e)=> { //手指按下事件监听
        if(!canHandle) return;
        const {pageX, pageY} = e.targetTouches[0];
        const {offsetTop} = e.targetTouches[0].target;
        this.lastFill = this.setLastFill();
        this.downingPiece(pageX, pageY - offsetTop);
    },false);
    this.canvas.addEventListener('touchmove',(e)=> { // 手指滑动事件监听
        if(!canHandle) return;
        let nowTime = (new Date()).valueOf(); // 获取当前时间戳
        if (nowTime - 100 <= this.lastTime) return; // 100ms截流
        this.lastTime = nowTime;
        const {pageX, pageY} = e.targetTouches[0];
        const {offsetTop} = e.targetTouches[0].target;
        this.downingPiece(pageX, pageY - offsetTop);
    },false);
    this.canvas.addEventListener('touchend',(e)=> { // 手指抬起事件监听
        if(!canHandle) return;
        canHandle = false;
        const {pageX, pageY} = e.changedTouches[0];
        const {offsetTop} = e.changedTouches[0].target;
        const {X, Y} = getPosition(pageX, pageY - offsetTop, this.spacing);
        // 已经落子 通过websocket发送 并且保存数据
        this.downingPiece(pageX, pageY - offsetTop);
        pieceLists.push([X, Y]); // 自己棋子位置存入
        console.log('自己棋子位置：', pieceLists);
        socket.emit(constants.PIECE_DOWN, { roomName, position: [X, Y] });
        countDownStart();  // 计时
    },false);
}
// 填补清除后的空白 (优化性能，离屏canvas)
Gobang.prototype.setLastFill = function () {
    const offCanvas = document.createElement('canvas');
    const offContext = offCanvas.getContext('2d');
    offContext.width = offContext.height = offCanvas.width = offCanvas.height = this.canvas.width;
    offContext.drawImage(this.canvas, 0, 0);
    return offCanvas;
}
// 绘制线条
Gobang.prototype.drawLine = function (startX, startY, endX, endY) {
    this.context.moveTo (startX, startY); // 设置起点状态
    this.context.lineTo (endX, endY); // 设置末端状态
    this.context.lineWidth = 1;
    this.context.strokeStyle = constants.LINE_COLOR;
    this.context.stroke(); // 绘制
}
// 绘制圆形
Gobang.prototype.drawCircular = function (x, y, radius, color) {
    this.context.lineWidth = 0;
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, Math.PI * 2);
    this.context.stroke();
    this.context.fillStyle = color || 'black'; // 棋子颜色
    this.context.fill(); // 填充
}
// 落子 绘制棋子
Gobang.prototype.downPiece = function (x, y, color) {
    this.drawCircular(this.spacing * x, this.spacing * y, this.pieceSize, color || 'black');
}
// 选择落子位置提示
Gobang.prototype.downingPiece = function (pageX, pageY) {
    const {X, Y} = getPosition(pageX, pageY, this.spacing);
    const lastDowningPieceX = clearRectPosition(this.lastDowningPieceX, this.spacing);
    const lastDowningPieceY = clearRectPosition(this.lastDowningPieceY, this.spacing);
    // this.context.clearRect(0,0,this.canvas.width,this.canvas.width)
    this.context.drawImage(this.lastFill, 0, 0);
    this.lastDowningPieceX = X; // 保存上一次选择下落的X位置
    this.lastDowningPieceY = Y; // 保存上一次选择下落的Y位置
    this.downPiece(X, Y, pieceColor.my);
}
// 清空画布 重新开始
Gobang.prototype.reLoadGame = function () {
    this.context.clearRect(0,0,this.canvas.width,this.canvas.width);
    this.init();
}

// 计算清除位置的X、Y位置
function clearRectPosition (position, spacing) {
    return position * spacing - spacing / 2;
}

// 计算落子位置
function getPosition(pageX, pageY, spacing) {
    return {
        X: Math.floor(pageX / spacing),
        Y: Math.floor((pageY  - spacing * 2) / spacing)
    }
}