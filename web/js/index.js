let Game = undefined;
// 房间名 前端生成
let roomName = 'room1';
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
let countDownTime = 0;
// 步时定时器
let countDownTimer = null;
// 用户名
let userName = localStorage.getItem('userName');
let userId = null;
// 监听与服务器端的连接成功事件
socket.on(constants.CONNECT,function(){
    console.log('socket连接成功');
});
window.onload = function () {
    documentEventInit(); 
    if(userName) {
        initGame();
    } else {
        inputInfo.style.display = "flex";
    }
}

// 网页关闭或刷新事件坚挺，离开房间
window.addEventListener('beforeunload',function() {
    socket.emit(constants.PLAYER_LEAVE, roomName);
})

// 绑定全局dom事件
function documentEventInit() {
    // 用户名确认
    inputBtn.addEventListener('click', function (e) {
        if (!inputUserName.value) {
            showToast('用户名不能为空')
        } else {
            userName = inputUserName.value;
            localStorage.setItem('userName', userName);
            inputInfo.style.display = 'none';
            initGame();
        }
    })
    // 玩家准备
    readyBtn.addEventListener('click', startGame);
    // 重新开始对局
    reStartBtn.addEventListener('click', reStart);
}

// 初始化
function initGame() {
    // 进入游戏
    Game = new Gobang(); 
    // 加入房间
    socket.emit(constants.PLAYER_JOIN, {
        userName,
        roomName: roomName
    }); 
    // 分配到的用户信息
    socket.on(constants.PLAYER_INFO, function(data) {
        console.log('用户信息：', data)
        pieceColor.my = data.pieceColor;
        pieceColor.other = pieceColor.my == 'black' ? 'white' : 'black';
        userName = data.userName;
        userId = data.id;
        if (!data.ready) {
            // 未准备
            readyConfirm.style.display = 'flex';
        }
    }); 
    // 房间信息
    socket.on(constants.PLAYER_JOIN, function(data){
        console.log('房间信息：', data)
        for(let i in data) {
            renderUserName(data[i]);
        }
    });
    // 双方准备情况
    socket.on(constants.PLAYER_READY, function(data){
        console.log('玩家准备情况', data);
        let readyPeople = 0;
        let startPeople = 'black';
        for (let i in data) {
            if (data[i].ready) {
                window[data[i].pieceColor + 'Ready'].style.display = 'block';
                readyPeople++;
            }
            if (!data[i].win) {
                startPeople = data[i].pieceColor;
            }
        }
        // 双方都准备可以落子了
        if(readyPeople == 2) {
            showToast(`开始游戏！${constants.PVPMap[startPeople][0]}方先`);
            blackReady.style.display = 'none';
            whiteReady.style.display = 'none';
            blackCountDown.innerText = '60s';
            whiteCountDown.innerText = '60s';
            handleDown(startPeople);
        }
    });
    // 服务端提示性消息
    socket.on(constants.MESSAGE, function (data) {
        console.log(data);
        if(data.code == 1) {
            showToast(data.data);
        }
    })
}

// 玩家准备
function startGame() {
    readyConfirm.style.display = 'none';
    socket.emit(constants.PLAYER_READY, {
        roomName, userId
    }); 
}
// 重新开始对局
function reStart() {
    reStartConfirm.style.display = 'none';
    Game.reLoadGame();
    pieceLists = [];
    otherPieceLists = [];
    startGame();
}
// 当前对局结束 胜负已分
function playend() {
    let winner = pieceColor[constants.PVPMap.victoryer(canHandle)];
    showToast(`${constants.PVPMap[winner][0]}方胜，您${constants.PVPMap.victoryOrDefeat(canHandle)}了`, null, function() {
        reStartConfirm.style.display = 'flex';
    });
    socket.emit(constants.PLAYER_END, {
        roomName, winner
    }); 
}

// 倒计时 计步时
function countDown() {
    if(countDownTime <= 0) {
        // 时间到了 提示输赢
        playend();
        countDownTime = 10;
        clearTimeout(countDownTimer);
        canHandle = false;
        return;
    }
    countDownTime--;
    if(canHandle) {
        renderUserHandle(pieceColor.my, pieceColor.other);
    } else {
        renderUserHandle(pieceColor.other, pieceColor.my);
    }
    countDownTimer = setTimeout(function () {
        countDown();
    }, 1000)
}

// 渲染玩家用户名
function renderUserName(current) {
    window[current.pieceColor + 'Username'].innerText = current.userName;
    window[current.pieceColor + 'Piece'].style.background = current.pieceColor;
}

// 渲染倒计时
function renderUserHandle(handle, other) {
    window[handle+ 'CountDown'].innerText = `${countDownTime}s`;
    window[handle+ 'CountDown'].classList.add('active');
    window[other+ 'CountDown'].classList.remove('active');
    window[other+ 'CountDown'].innerText = '60s';
}

// 落子后重计时
function countDownStart() {
    countDownTime = 60; // 设置步时
    clearTimeout(countDownTimer);
    blackCountDown.innerText = '60s';
    whiteCountDown.innerText = '60s';
    countDown();
}
// 重置落子权
function handleDown(color) {
    if(pieceColor.my == color) canHandle = true; // 可以落子了
}