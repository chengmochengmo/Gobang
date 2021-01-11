// socket实例
import socket from './socket'
// 游戏
import Gobang from './game'
// 工具方法
import { showToast, domHandle, getNode} from './lib'
// 对局方法
import { 
    startGame,
    reStart,
    playend,
    countDownClear,
    handleDown
} from './game-methods'
// 全局常量
const constants = require('../../common/constants');

window.onload = function () {
    // showToast(
    //     "温馨提示：\\n1.由于此游戏运行于网页，体验暂时不是很好，中途尽量不要刷新；\\n2.只监听了touch没有监听click，所以在电脑上无法使用，只能手机上使用；\\n3.游戏未经专业测试，可能会有bug，如遇bug请微信上反馈，非常感谢～", 
    //     8 * 1000);
    documentEventInit();  // 注册全局dom事件
    if(!userName) {
        domHandle(inputInfo,'style.display', 'flex');
    }
}

// 监听与服务器端的连接成功事件
socket.on(constants.CONNECT,function(){
    console.log('socket连接成功');
    // 获取游戏大厅信息
    socket.on(constants.ROOMS_INFO,function(rooms){
        console.log('游戏大厅房间：', rooms);
        renderGamesLobby(rooms);
    });

    // 服务端提示性消息
    socket.on(constants.MESSAGE, function (data) {
        console.log('服务端提示：', data);
        if(data.code == 1) {
            showToast(data.data);
            if(data.data == '对手已逃走') {
                // 游戏中途有人强制退出
                countDownClear();
                domHandle(reStartConfirm, 'style.display', 'flex');
            }
        }
        if(data.code == 0) {
            if(data.data == '可以进入') {
                // 成功加入房间 初始化游戏
                domHandle([game, gamesLobby], ['style.display', 'style.display'], ['block', 'none']);
                initGame();
            }
        }
    })
});

// 注册全局dom事件
function documentEventInit() {
    // 用户名确认
    inputBtn.addEventListener('click', function (e) {
        if (!inputUserName.value) {
            showToast('用户名不能为空')
        } else {
            userName = inputUserName.value;
            localStorage.setItem('userName', userName);
            domHandle(inputInfo, 'style.display', 'none');
            initGame();
        }
    })
    // 玩家准备
    readyBtn.addEventListener('click', startGame);
    // 重新开始对局
    reStartBtn.addEventListener('click', reStart);
    // 进入房间
    gamesLobby.addEventListener('click', function (e) {
        const element = getNode(e.target, 'room-item');
        if (element) {
            roomName = element.id;
            console.log('加入房间，房间名：', roomName);
            // 发送加入房间
            socket.emit(constants.PLAYER_JOIN, {
                userName,
                roomName,
                userId
            });
        }
    });
    // 是否同意对方悔棋
    reChessConfirm.addEventListener('click', function(e) {
        const ok = getNode(e.target, 'btn ok');
        const no = getNode(e.target, 'btn no');
        if (ok || no) {
            socket.emit(constants.PIECE_RECHESS, {
                roomName, userId,
                apply: false,
                feedback: ok && true
            });
            ok && Game.reLastDraw('other', true);
            domHandle(reChessConfirm, 'style.display', 'none');
        }
    })
    // 返回游戏大厅 退出房间
    goBack.addEventListener('click', function (e) {
        // 离开房间
        socket.emit(constants.PLAYER_LEAVE, {
            userName,
            roomName,
            userId
        });
        domHandle([game, readyConfirm, readyConfirm, gamesLobby], 
            ['style.display', 'style.display', 'style.display', 'style.display'], 
            ['none', 'none', 'none', 'block']);
    })
}
// 玩家游戏按键事件绑定 需在确定身份之后
function playerEventInit() {
    // 认输
    window[pieceColor.my + 'AdminDefeat'].addEventListener('click', playend.bind(window, pieceColor.other));
    // 申请悔棋
    window[pieceColor.my + 'RegretChess'].addEventListener('click', function () {
        if (canHandle) return showToast('你还没有落子');
        socket.emit(constants.PIECE_RECHESS, {
            roomName, userId,
            apply: true
        });
    });
}

// 初始化 开始对局
function initGame() {
    // 进入游戏
    Game = new Gobang(); 
    // 分配到的玩家信息
    socket.on(constants.PLAYER_INFO, function(data) {
        console.log('玩家信息：', data)
        pieceColor.my = data.pieceColor;
        pieceColor.other = pieceColor.my == 'black' ? 'white' : 'black';
        userName = data.userName;
        socketId = data.socketId;
        if (!userId) {
            userId = data.userId;
            localStorage.setItem('userId', userId);
        }
        domHandle([window[pieceColor.other + 'AdminDefeat'], window[pieceColor.other + 'RegretChess']], 
            ['style.opacity', 'style.opacity'], 
            ['0.5', '0.5']);
        playerEventInit();
        // 未准备
        if (!data.ready) domHandle(readyConfirm, 'style.display', 'flex');
    }); 
    // 房间信息
    socket.on(constants.PLAYER_JOIN, function(data){
        console.log('房间信息：', data);
        let arr = ['black', 'white'];
        for(let i in arr) {
            let otherColor = constants.PVPMap.otherColor(arr[i]);
            domHandle(window[arr[i] + 'Username'], 'innerText', '等待玩家加入');
        }
        for(let i in data) {
            let current = data[i];
            domHandle([window[current.pieceColor + 'Username'], window[current.pieceColor + 'Piece']], 
                ['innerText', 'style.background'], 
                [current.userName, current.pieceColor]);
        }
    });
    // 双方准备情况
    socket.on(constants.PLAYER_READY, function(data){
        console.log('玩家准备情况', data);
        let readyPeople = 0;
        let startPeople = 'black';
        for (let i in data) {
            if (data[i].ready) {
                domHandle(window[data[i].pieceColor + 'Ready'], 'style.display', 'block');
                readyPeople++;
            }
            if (!data[i].win) {
                startPeople = data[i].pieceColor;
            }
        }
        // 双方都准备可以落子了
        if(readyPeople == 2) {
            countDownTimeRunner = countDownTime;
            showToast(`开始游戏！${constants.PVPMap[startPeople][0]}方先`);
            domHandle([blackReady, whiteReady, blackCountDown, whiteCountDown], 
                ['style.display', 'style.display', 'innerText', 'innerText'], 
                ['none', 'none', '60s', '60s']);
            handleDown(startPeople);
        }
    });
    // 接收输赢情况
    socket.on(constants.PLAYER_END, function (winner) {
        console.log('胜利者：', winner);
        countDownClear();
        window[winner + 'WinNum'].innerText++;
        showToast(`${constants.PVPMap[winner][0]}方胜，你${constants.PVPMap.victoryOrDefeat(winner, pieceColor.my)}了`, null, function() {
            domHandle(reStartConfirm, 'style.display', 'flex');
        });
    }); 
    // 接收悔棋情况
    socket.on(constants.PIECE_RECHESS, function (data) {
        const {apply, feedback} = data;
        if (apply) {
            // 有人像我申请悔棋
            domHandle(reChessConfirm, 'style.display', 'flex');
        } else {
            // 我像别人申请悔棋得到的反馈
            if (feedback) {
                Game.reLastDraw('my', true);
                canHandle = true;
                pieceLists.pop();
            } else {
                showToast('对方拒绝');
            }
        }
    }); 
}

// 惰性函数 渲染游戏大厅
var renderGamesLobby = function(rooms) {
    // 初始渲染
    for (let i in rooms) {
        let room = rooms[i];
        let peoples = Object.keys(room);
        let people1 = peoples.length && room[peoples[0]];
        let people2 = peoples.length == 2 && room[peoples[1]];
        let div = `<div class="room-item" id="${i}">
            <div class="room-item-avatar left-avatar ${people1 || 'filter'}">
                <img src="${require('/images/avatar-boy.png')}" alt="" width="100%">
                <div class="room-item-username left-username">${people1 ? people1.userName : '待加入'}</div>
            </div>
            <div class="room-item-checkerboard ${peoples.length == 2 ? '' : 'filter'}">
                <img src="${require('/images/checkerboard.png')}" alt="" width="100%">
            </div>
            <div class="room-item-avatar right-avatar ${people2 || 'filter'}"">
                <img src="${require('/images/avatar-boy.png')}" alt="" width="100%">
                <div class="room-item-username right-username">${people2 ? people2.userName : '待加入'}</div>
            </div>
        </div>`
        gamesLobby.innerHTML += div;
    }
    renderGamesLobby = function (rooms) {
        // 后续更新
        for (let i in rooms) {
            let room = rooms[i];
            let peoples = Object.keys(room);
            let people1 = peoples.length && room[peoples[0]];
            let people2 = peoples.length == 2 && room[peoples[1]];
            let people1classListHandle = `classList.${people1 ? 'remove' : 'add'}`;
            domHandle([window[i].getElementsByClassName('left-avatar')[0], window[i].getElementsByClassName('left-username')[0]], 
                    [people1classListHandle, 'innerText'], 
                    ['filter', people1 ? people1.userName : '待加入']);
            if (!people1) continue;
            let people2classListHandle = `classList.${people2 ? 'remove' : 'add'}`;
            domHandle([window[i].getElementsByClassName('right-avatar')[0], window[i].getElementsByClassName('right-username')[0], window[i].getElementsByClassName('room-item-checkerboard')[0]], 
                [people2classListHandle, 'innerText', people2classListHandle], 
                ['filter', people2 ? people2.userName : '待加入', 'filter']);
        }
    }
}