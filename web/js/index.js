let Game = undefined;
// 房间名
let roomName = undefined;
// 颜色棋子
let pieceColor = {
    my: '',
    other: ''
}
// 双方落子位置
let pieceLists = [];
let otherPieceLists = [];
// 是否可以落子
let canHandle = false;
// 步时
let countDownTime = 60;
let countDownTimeRunner = 0;
// 步时定时器
let countDownTimer = null;
// 用户名
let userName = localStorage.getItem('userName');
let socketId = null;

window.onload = function () {
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
        console.log(rooms);
        renderGamesLobby(rooms);
    });
    socket.on('ping',function(data){
        console.log(data,'ping');
    });
    socket.on('pong',function(data){
        console.log(data,'pong');
    });
    // 服务端提示性消息
    socket.on(constants.MESSAGE, function (data) {
        console.log('服务端提示：', data);
        if(data.code == 1) {
            showToast(data.data);
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

// 渲染游戏大厅
function renderGamesLobby(rooms) {
    gamesLobby.innerHTML = '';
    for (let i in rooms) {
        let room = rooms[i];
        let peoples = Object.keys(room);
        let people1 = peoples.length && room[peoples[0]];
        let people2 = peoples.length == 2 && room[peoples[1]];
        let div = `<div class="room-item" id="${i}">
            <div class="room-item-avatar ${people1 || 'filter'}">
                <img src="../web/images/avatar-boy.png" alt="" width="100%">
                <div class="room-item-username">${people1 ? people1.userName : '待加入'}</div>
            </div>
            <div class="room-item-checkerboard ${peoples.length == 2 ? '' : 'filter'}">
                <img src="../web/images/checkerboard.png" alt="" width="100%">
            </div>
            <div class="room-item-avatar ${people2 || 'filter'}"">
                <img src="../web/images/avatar-boy.png" alt="" width="100%">
                <div class="room-item-username">${people2 ? people2.userName : '待加入'}</div>
            </div>
        </div>`
        gamesLobby.innerHTML += div;
    }
}

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
        const element = getNode(e.target);
        if (element) {
            roomName = element.id;
            console.log('加入房间，房间名：', roomName);
            // 发送加入房间
            socket.emit(constants.PLAYER_JOIN, {
                userName,
                roomName
            });
        }
    });
    // 返回游戏大厅 退出房间
    goBack.addEventListener('click', function (e) {
        // 离开房间
        socket.emit(constants.PLAYER_LEAVE, roomName);
        domHandle([game, readyConfirm, readyConfirm, gamesLobby], 
            ['style.display', 'style.display', 'style.display', 'style.display'], 
            ['none', 'none', 'none', 'block']);
    })
}
// 玩家游戏按键事件绑定 需在确定身份之后
function playerEventInit() {
    // 认输
    window[pieceColor.my + 'AdminDefeat'].addEventListener('click', playend.bind(window, pieceColor.other));
    // 悔棋
    window[pieceColor.my + 'RegretChess'].addEventListener('click', function () {
        
    });
}

// 初始化
function initGame() {
    // 进入游戏
    Game = new Gobang(); 
    // 分配到的用户信息
    socket.on(constants.PLAYER_INFO, function(data) {
        console.log('用户信息：', data)
        pieceColor.my = data.pieceColor;
        pieceColor.other = pieceColor.my == 'black' ? 'white' : 'black';
        userName = data.userName;
        socketId = data.socketId;
        domHandle([window[pieceColor.other + 'AdminDefeat'], window[pieceColor.other + 'RegretChess']], 
            ['style.opacity', 'style.opacity'], 
            ['0.5', '0.5']);
        playerEventInit();
        if (!data.ready) {
            // 未准备
            domHandle(readyConfirm, 'style.display', 'flex');
        }
    }); 
    // 房间信息
    socket.on(constants.PLAYER_JOIN, function(data){
        console.log('房间信息：', data)
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
        showToast(`${constants.PVPMap[winner][0]}方胜，您${constants.PVPMap.victoryOrDefeat(winner, pieceColor.my)}了`, null, function() {
            reStartConfirm.style.display = 'flex';
        });
    }); 
}

// 玩家准备
function startGame() {
    domHandle(readyConfirm, 'style.display', 'none');
    socket.emit(constants.PLAYER_READY, {
        roomName, socketId
    }); 
}
// 重新开始对局
function reStart() {
    domHandle(reStartConfirm, 'style.display', 'none');
    Game.reLoadGame();
    pieceLists = [];
    startGame();
}
// 当前对局结束 胜负已分
function playend(winner) {
    socket.emit(constants.PLAYER_END, {
        roomName, winner
    }); 
}

// 倒计时 计步时
function countDown() {
    if(countDownTimeRunner <= 0) {
        clearTimeout(countDownTimer);
        // 时间到了 提示输赢
        constants.PVPMap.victoryer(canHandle) == 'my' && playend(pieceColor[constants.PVPMap.victoryer(canHandle)]);
        canHandle = false;
        return;
    }
    countDownTimeRunner--;
    if(canHandle) {
        renderUserCountDown(pieceColor.my, pieceColor.other);
    } else {
        renderUserCountDown(pieceColor.other, pieceColor.my);
    }
    countDownTimer = setTimeout(function () {
        countDown();
    }, 1000)
}

// 渲染倒计时
function renderUserCountDown(handle, other) {
    domHandle([window[handle+ 'CountDown'], window[handle+ 'Avatar'], window[other+ 'Avatar'], window[other+ 'CountDown']], 
        ['innerText', 'classList.add', 'classList.remove', 'innerText'], 
        [`${countDownTimeRunner}s`, 'active', 'active', '60s']);
}
// 清除计步器
function countDownClear() {
    countDownTimeRunner = countDownTime; // 设置步时
    clearTimeout(countDownTimer);
    domHandle([blackCountDown, whiteCountDown, blackAvatar, whiteAvatar,], 
        ['innerText', 'innerText', 'classList.remove', 'classList.remove',], 
        ['60s', '60s', 'active', 'active']);
}
// 落子后重计时
function countDownRestart() {
    countDownClear();
    countDown();
}
// 重置落子权
function handleDown(color) {
    if(pieceColor.my == color) canHandle = true; // 可以落子了
}