const express = require("express");
const path = require("path");
const http = require('http');
const IO = require('socket.io');
const constants = require('../common/constants'); //全局常量
const app = express();

// 设置资源访问路径
app.use(express.static(path.join(__dirname, '../public')));
app.use('/common', express.static(path.join(__dirname, '../common')));
app.use('/web', express.static(path.join(__dirname, '../web')));

const server = http.createServer(app);
const io = IO(server);

let rooms = {}; // 自己维护的房间列表

io.on(constants.CONNECTION, function (socket) {
    console.log('客户端已经连接');
    // 玩家加入房间
    socket.on(constants.PLAYER_JOIN, function (data) {
        const {roomName, userName} = data;
        if (!rooms[roomName]) { // 如果房间不存在
            rooms[roomName] = {};
        }
        if (Object.keys(rooms[roomName]).length >= 2) {  // 此房间已满
            socket.emit(constants.MESSAGE, {
                code: 1,
                data: '房间已满'
            });
        } else { // 玩家入座
            rooms[roomName][socket.id] = {
                pieceColor: getPieceColor(rooms[roomName]),
                userName,
                id: socket.id,
                ready: false, // 是否准备
                win: false, // 上局输赢
            };
            socket.join([roomName]);
            // 用户信息
            socket.emit(constants.PLAYER_INFO, rooms[roomName][socket.id]);
            // 房间信息
            io.in(roomName).emit(constants.PLAYER_JOIN, rooms[roomName]);
        }
        console.log(socket.rooms, '房间列表：', JSON.stringify(rooms), socket.id)
    });

    // 玩家准备
    socket.on(constants.PLAYER_READY, function (data) {
        const {roomName, userId} = data;
        rooms[roomName][userId].ready = true;
        io.in(roomName).emit(constants.PLAYER_READY, rooms[roomName]);
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
    socket.on(constants.PLAYER_LEAVE, function (roomName) {
        if(rooms[roomName]) delete rooms[roomName][socket.id];
    });
});

// 分配棋子颜色
function getPieceColor(roomName) {
    let peoples = Object.keys(roomName);
    if(peoples.length == 0) return 'black';
    return roomName[peoples[0]].pieceColor == 'black' ? 'white' : 'black';
}

server.listen(3000);