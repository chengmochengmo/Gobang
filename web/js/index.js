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
// 是否可以落子
let canHandle = false;
// 步时
let countDownTime = 60;
let countDownTimeRunner = 0;
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
        domHandle(inputInfo,'style.display', 'flex');
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
            domHandle(inputInfo, 'style.display', 'none');
            initGame();
        }
    })
    // 玩家准备
    readyBtn.addEventListener('click', startGame);
    // 重新开始对局
    reStartBtn.addEventListener('click', reStart);
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
    // 服务端提示性消息
    socket.on(constants.MESSAGE, function (data) {
        console.log('服务端提示：', data);
        if(data.code == 1) {
            showToast(data.data);
        }
    })
}

// 玩家准备
function startGame() {
    domHandle(readyConfirm, 'style.display', 'none');
    socket.emit(constants.PLAYER_READY, {
        roomName, userId
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
    domHandle([window[handle+ 'CountDown'], window[handle+ 'CountDown'], window[other+ 'CountDown'], window[other+ 'CountDown']], 
        ['innerText', 'classList.add', 'classList.remove', 'innerText'], 
        [`${countDownTimeRunner}s`, 'active', 'active', '60s']);
}
// 清除计步器
function countDownClear() {
    countDownTimeRunner = countDownTime; // 设置步时
    clearTimeout(countDownTimer);
    domHandle([blackCountDown, whiteCountDown, blackCountDown, whiteCountDown,], 
        ['innerText', 'innerText', 'classList.remove', 'classList.remove',], 
        ['60s', '60s', 'active', 'active']);
    blackCountDown.innerText = '60s';
    whiteCountDown.innerText = '60s';
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