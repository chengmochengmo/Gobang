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
    socket.on(constants.PLAYER_JOIN, function (room) { // 玩家加入房间
        if (!rooms[room]) {
            rooms[room] = [];
            rooms[room].playerTeam = ['black', 'white'];
        }
        if (rooms[room].length == 2) {
            socket.emit(constants.MESSAGE, { // 此房间已满
                code: 1,
                data: '房间已满'
            });
        } else {
            rooms[room].push(socket.id);
            // 发送给客户端 棋子颜色
            socket.emit(constants.PLAYER_JOIN, rooms[room].playerTeam[rooms[room].indexOf(socket.id)]);
            socket.join([room]);
        }
        console.log(socket.rooms, '房间列表:' + JSON.stringify(rooms), socket.id)
    });
    
    //接受落子消息
    socket.on(constants.PIECE_DOWN, function (msg) {
        socket.broadcast.emit(constants.PIECE_DOWN, msg);
    });
});

server.listen(3000);