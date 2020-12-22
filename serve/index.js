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
        if (!rooms[roomName]) {
            console.log(1,roomName,JSON.stringify(rooms))
            rooms[roomName] = {};
        }
        if (Object.keys(rooms[roomName]).length >= 2) {
            socket.emit(constants.MESSAGE, { // 此房间已满
                code: 1,
                data: '房间已满'
            });
        } else {
            rooms[roomName][socket.id] = {
                pieceColor: getPieceColor(rooms[roomName]),
                userName
            };
            // 发送给客户端 棋子颜色
            socket.join([roomName]);
            io.in(roomName).emit(constants.PLAYER_JOIN, JSON.stringify(rooms[roomName]));
        }
        console.log(socket.rooms, '房间列表：', JSON.stringify(rooms), socket.id)
    });

    // 离开房间
    socket.on(constants.PLAYER_LEAVE, function (roomName) {
        if(rooms[roomName]) delete rooms[roomName][socket.id];
    });
    
    // 接受落子消息
    socket.on(constants.PIECE_DOWN, function (data) {
        const {roomName, position} = data
        socket.to(roomName).emit(constants.PIECE_DOWN, position);
    });
});

// 分配棋子颜色
function getPieceColor(roomName) {
    let peoples = Object.keys(roomName);
    if(peoples.length == 0) return 'black';
    return roomName[peoples[0]].pieceColor == 'black' ? 'white' : 'black';
}

server.listen(3000);