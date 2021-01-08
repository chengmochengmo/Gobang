export default {
    // 游戏实例
    Game: 11,
    // 房间名
    roomName: undefined,
    // 颜色棋子
    pieceColor: {
        my: '',
        other: ''
    },
    // 双方落子位置
    pieceLists: [],
    otherPieceLists: [],
    // 是否可以落子
    canHandle: false,
    // 步时
    countDownTime: 60,
    countDownTimeRunner: 0,
    // 步时定时器
    countDownTimer: null,
    // 用户名
    userName: localStorage.getItem('userName'),
    userId: localStorage.getItem('userId'),
    socketId: null
}

