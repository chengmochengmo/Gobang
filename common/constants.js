const constants = {
    // 棋盘样式配置
    BACKGROUND_COLOR: '#F8E7B8', // 棋盘背景色
    LINE_COLOR: '#C1A37B', // 棋盘线条色

    // 对局关系映射
    PVPMap: {
        black: ['黑'],
        white: ['白'],
        victoryOrDefeat: (w, m) => w == m ? '赢' : '输',
        victoryer: c => c ? 'other' : 'my'
    },

    // socket事件名
    CONNECTION: 'connection', // socket链接事件 服务端
    CONNECT: 'connect', // socket链接事件 客户端
    PLAYER_JOIN: 'player.join', // 玩家加入房间
    PLAYER_LEAVE: 'player.leave', // 玩家退出房间
    PLAYER_INFO: 'player.info', // 分配玩家信息
    PLAYER_READY: 'player.ready', // 玩家准备
    PLAYER_END: 'player.end', // 对局结束 胜负已经分
    PIECE_DOWN: 'piece.down', // 棋子下落事件
    MESSAGE: 'message', // 发给客户端的普通消息 用于toast展示
}

if (typeof window !== 'undefined' && this === window) {
    window.constants = constants;
} else {
    module.exports = constants;
}