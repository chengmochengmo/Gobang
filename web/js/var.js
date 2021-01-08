// 游戏实例
export let Game = undefined;
// 房间名
export let roomName = undefined;
// 颜色棋子
export let pieceColor = {
    my: '',
    other: ''
}
// 双方落子位置
export let pieceLists = [];
export let otherPieceLists = [];
// 是否可以落子
export let canHandle = false;
// 步时
export let countDownTime = 60;
export let countDownTimeRunner = 0;
// 步时定时器
export let countDownTimer = null;
// 用户名
export let userName = localStorage.getItem('userName');
export let userId = localStorage.getItem('userId');
export let socketId = null;