const express = require("express");
const path = require("path");
const http = require('http');
const crypto = require('crypto');
const IO = require('socket.io');
const constants = require('../common/constants'); //全局常量
const app = express();

// 设置资源访问路径
app.use(express.static(path.join(__dirname, '../public')));
app.use('/common', express.static(path.join(__dirname, '../common')));
app.use('/web', express.static(path.join(__dirname, '../web')));

const server = http.createServer(app);
const io = IO(server, {
    pingInterval: 5000,
    pingTimeout: 2000,
});

// 自己维护的房间列表 默认4个房间
let rooms = {
    room1: {},
    room2: {},
    room3: {},
    room4: {},
};

io.on(constants.CONNECTION, function (socket) {
    console.log('客户端已经连接');
    let userId = null;
    // 发送游戏大厅信息 给刚进入的人
    socket.emit(constants.ROOMS_INFO, rooms);
    // 玩家加入房间
    socket.on(constants.PLAYER_JOIN, function (data) {
        const {roomName, userName} = data;
        userId = data.userId; // 用户id
        if (!userId) { // 新用户 生成新的userId
            userId = crypto.createHash('md5').update(
                userName + Number(
                    Math.random()
                        .toString()
                        .substr(3, 12) + Date.now(),
                ).toString(36)
            ).digest("hex");
            console.log('新用户生成userId：', userId);
        }
        if (!rooms[roomName]) { // 如果房间不存在
            rooms[roomName] = {};
        }
        if (!rooms[roomName][userId] && Object.keys(rooms[roomName]).length >= 2) {  // 此房间已满
            socket.emit(constants.MESSAGE, {
                code: 1,
                data: '房间已满'
            });
        } else { // 玩家入座
            socket.emit(constants.MESSAGE, {
                code: 0,
                data: '可以进入'
            });
            rooms[roomName][userId] = {
                pieceColor: getPieceColor(rooms[roomName]),
                userName,
                socketId: socket.id,
                ready: false, // 是否准备
                win: false, // 上局输赢
                userId,
                piecesList: [] // 棋子位置信息
            };
            socket.join([roomName]);
            // 用户信息
            socket.emit(constants.PLAYER_INFO, rooms[roomName][userId]);
            // 房间信息
            emitRoomInfo(roomName);
        }
        console.log(socket.rooms, '房间列表：', JSON.stringify(rooms), userId)
        roomsChange();
    });

    // 玩家准备
    socket.on(constants.PLAYER_READY, function (data) {
        const {roomName, userId} = data;
        rooms[roomName][userId].ready = true;
        io.in(roomName).emit(constants.PLAYER_READY, rooms[roomName]);
    });

    // 申请悔棋
    socket.on(constants.PIECE_RECHESS, function (data) {
        const {roomName, userId} = data;
        socket.to(roomName).emit(constants.PIECE_RECHESS, data);
    });
    
    // 落子消息
    socket.on(constants.PIECE_DOWN, function (data) {
        const {roomName, position} = data;
        socket.to(roomName).emit(constants.PIECE_DOWN, position);
    });

    // 游戏结束 胜负已分
    socket.on(constants.PLAYER_END, function (data) {
        const {roomName, winner} = data;
        io.in(roomName).emit(constants.PLAYER_END, winner);
        let room = rooms[roomName];
        for (let i in room) {
            // 重置准备状态
            room[i].ready = false;
            room[i].pieceColor == winner ? room[i].win = true : room[i].win = false;
        }
    });

    // 离开房间
    socket.on(constants.PLAYER_LEAVE, function (data) {
        const {roomName, userName, userId} = data;
        if(rooms[roomName]) delete rooms[roomName][userId];
        roomsChange();
    });
    // 断开链接事件
    socket.on(constants.DISCONNECT, function () {
        playerLeaveRooms(userId);
    });
    // 当客户端断开连接（但尚未离开rooms）时触发
    socket.on(constants.DISCONNECTING, function (reason) {
        let roomName = playerLeaveRooms(userId);
        if (roomName) {
            emitRoomInfo(roomName);
            socket.to(roomName).emit(constants.MESSAGE, {
                code: 1,
                data: '对手已逃走'
            });
        }
    });
    // 连接发生错误时触发
    socket.on(constants.ERROR, function(error) {
        console.log('error', error)
    });
});


// 分配棋子颜色
function getPieceColor(roomName) {
    let peoples = Object.keys(roomName);
    if(peoples.length == 0) return 'black';
    return constants.PVPMap.otherColor(roomName[peoples[0]].pieceColor);
}

// 发送游戏大厅信息 房间有人进出了 给所有人发
function roomsChange() {
    io.emit(constants.ROOMS_INFO, rooms);
}

// 把退出的玩家从房间中去除
function playerLeaveRooms(userId) {
    for (let roomName in rooms) {
        for (let uid in rooms[roomName]) {
            if (uid == userId) {
                delete rooms[roomName][userId];
                roomsChange();
                return roomName;
            }
        }
    }
}

// 广播房间信息
function emitRoomInfo(roomName) {
    io.in(roomName).emit(constants.PLAYER_JOIN, rooms[roomName]);
}

server.listen(3000);