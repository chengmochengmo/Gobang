// socket实例
import socket from './socket'
// 工具方法
import { domHandle} from './lib'
// 全局常量
const constants = require('../../common/constants');

// 计算落子位置
export function getPosition(pageX, pageY, spacing) {
    return {
        X: Math.floor(pageX / spacing),
        Y: Math.floor((pageY  - spacing * 2) / spacing)
    }
}
// 玩家准备
export function startGame() {
    domHandle(readyConfirm, 'style.display', 'none');
    socket.emit(constants.PLAYER_READY, {
        roomName, userId
    });
}
// 重置落子权
export function handleDown(color) {
    if(pieceColor.my == color) canHandle = true; // 可以落子了
}
// 当前对局结束 胜负已分
export function playend(winner) {
    socket.emit(constants.PLAYER_END, {
        roomName, winner
    }); 
}
// 重新开始对局
export function reStart() {
    domHandle(reStartConfirm, 'style.display', 'none');
    Game.reLoadGame();
    pieceLists = [];
    startGame();
}
// 清除计步器
export function countDownClear() {
    countDownTimeRunner = countDownTime; // 设置步时
    clearTimeout(countDownTimer);
    domHandle([blackCountDown, whiteCountDown, blackAvatar, whiteAvatar,], 
        ['innerText', 'innerText', 'classList.remove', 'classList.remove',], 
        ['60s', '60s', 'active', 'active']);
}
// 倒计时 计步时
function countDown() {
    if(countDownTimeRunner <= 0) {
        clearTimeout(countDownTimer);
        // 时间到了 提示输赢
        constants.PVPMap.victoryer(canHandle) == 'my' && playend(pieceColor[constants.PVPMap.victoryer(canHandle)]);
        canHandle = false;
        return;
    }
    countDownTimeRunner--;
    if(canHandle) {
        renderUserCountDown(pieceColor.my, pieceColor.other);
    } else {
        renderUserCountDown(pieceColor.other, pieceColor.my);
    }
    countDownTimer = setTimeout(function () {
        countDown();
    }, 1000)
}

// 渲染倒计时
function renderUserCountDown(handle, other) {
    domHandle([window[handle+ 'CountDown'], window[handle+ 'Avatar'], window[other+ 'Avatar'], window[other+ 'CountDown']], 
        ['innerText', 'classList.add', 'classList.remove', 'innerText'], 
        [`${countDownTimeRunner}s`, 'active', 'active', '60s']);
}
// 落子后重计时
export function countDownRestart() {
    countDownClear();
    countDown();
}