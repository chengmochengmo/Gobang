// 游戏实例
window.Game = 11,
// 房间名
window.roomName = undefined,
// 颜色棋子
window.pieceColor = {
    my: '',
    other: ''
},
// 双方落子位置
window.pieceLists = [],
window.otherPieceLists = [],
// 是否可以落子
window.canHandle = false,
// 步时
window.countDownTime = 60,
window.countDownTimeRunner = 0,
// 步时定时器
window.countDownTimer = null,
// 用户名
window.userName = localStorage.getItem('userName'),
window.userId = localStorage.getItem('userId'),
window.socketId = null

