const constants = {
    // 棋盘样式配置
    BACKGROUND_COLOR: '#F8E7B8', // 棋盘背景色
    LINE_COLOR: '#C1A37B', // 棋盘线条色

    // socket事件名
    CONNECTION: 'connection', // socket链接事件 服务端
    CONNECT: 'connect', // socket链接事件 客户端
    PLAYER_JOIN: 'player.join', // 玩家加入房间事件
    PLAYER_LEAVE: 'player.leave', // 玩家退出房间事件
    PIECE_DOWN: 'piece.down', // 棋子下落事件
    MESSAGE: 'message', //发给客户端的普通消息 用于toast展示
}

if (typeof window !== 'undefined' && this === window) {
    window.constants = constants;
} else {
    module.exports = constants;
}