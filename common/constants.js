module.exports = {
    // 系统配置
    port: 31231, // 启动服务端口号

    // 棋盘样式配置
    BACKGROUND_COLOR: '#F8E7B8', // 棋盘背景色
    LINE_COLOR: '#C1A37B', // 棋盘线条色

    // 对局关系映射
    PVPMap: {
        black: ['黑'],
        white: ['白'],
        otherColor: c => c == 'black' ? 'white' : 'black',
        victoryOrDefeat: (w, m) => w == m ? '赢' : '输',
        victoryer: c => c ? 'other' : 'my'
    },

    // socket事件名
    CONNECTION: 'connection', // socket连接事件 服务端
    CONNECT: 'connect', // socket连接事件 客户端
    DISCONNECT: 'disconnect', // socket断开事件 服务端
    DISCONNECTING: 'disconnecting', // 当客户端断开连接 但尚未离开rooms 服务端
    ERROR: 'error', // 发生错误

    // 自定义事件名
    PLAYER_JOIN: 'player.join', // 玩家加入房间
    PLAYER_LEAVE: 'player.leave', // 玩家退出房间
    PLAYER_INFO: 'player.info', // 分配玩家信息
    PLAYER_READY: 'player.ready', // 玩家准备
    PLAYER_END: 'player.end', // 对局结束 胜负已经分
    PIECE_DOWN: 'piece.down', // 棋子下落事件
    PIECE_RECHESS: 'piece.rechess', // 申请悔棋
    ROOMS_INFO: 'rooms.info', // 游戏大厅信息

    MESSAGE: 'message', // 发给客户端的普通消息 {code: 0, data: 'xxx'}, 0：成功、下一步 1：前端toast内容
}