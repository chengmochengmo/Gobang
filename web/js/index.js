// 房间名
let roomName = 'room1';
// 颜色棋子
let pieceColor = '';
let otherPieceColor = '';
// 双方落子位置
let pieceLists = [];
let otherPieceLists = [];
// 监听与服务器端的连接成功事件
socket.on(constants.CONNECT,function(){
    console.log('socket连接成功');
});
// 是否可以落子
let canHandle = false;
// 步时
let countDownTime = 60;
// 步时定时器
let countDownTimer = null;

let userName = localStorage.getItem('userName'); // 用户名

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
    confirmBtn.addEventListener('click', function (e) {
        if (!inputUserName.value) {
            showToast('用户名不能为空')
        } else {
            userName = inputUserName.value;
            localStorage.setItem('userName', userName);
            inputInfo.style.display = 'none';
            initGame();
        }
    })
    // 重新开始对局
    reStartBtn.addEventListener('click', function (e) {
        reStart();
    })
}

// 初始化
function initGame() {
    // 进入游戏
    new Gobang(); 
    // 加入房间
    socket.emit(constants.PLAYER_JOIN, {
        userName,
        roomName: roomName
    }); 
    socket.on(constants.PLAYER_JOIN, function(data){
        console.log('房间信息：', JSON.stringify(data))
        let roomInfo = JSON.parse(data);
        for(let i in roomInfo) {
            if(userName == roomInfo[i].userName) {
                renderUserName(roomInfo[i]);
                pieceColor = roomInfo[i].pieceColor;
            } else {
                renderUserName(roomInfo[i]);
                otherPieceColor = roomInfo[i].pieceColor;
            }
        }
        if(pieceColor == 'black') canHandle = true;
        console.log(canHandle)
    });
    // 服务端提示性消息
    socket.on(constants.MESSAGE, function (data) {
        console.log(data);
        if(data.code == 1) {
            showToast(data.data);
        }
    })
}

// 重新开始对局
function reStart() {
    new Gobang();
    pieceLists = [];
    otherPieceLists = [];
}

// 渲染玩家用户名
function renderUserName(current) {
    if(current.pieceColor == 'black') {
        leftUsername.innerText = current.userName;
        leftPiece.style.background = current.pieceColor;
    }
    if(current.pieceColor == 'white') {
        rightUsername.innerText = current.userName;
        rightPiece.style.background = current.pieceColor;
    }
}
// 倒计时 计步时
function countDown() {
    if(countDownTime <= 0) {
        if(pieceColor == 'black') {
            if(canHandle) {
                showToast(`白方胜，您输了`);
            } else {
                showToast(`黑方胜，您赢了`);
            }
        }
        if(pieceColor == 'white') {
            if(canHandle) {
                showToast(`黑方胜，您输了`);
            } else {
                showToast(`白方胜，您赢了`);
            }
        }
        countDownTime = 10;
        clearTimeout(countDownTimer);
        return;
    }
    countDownTime--;
    if(pieceColor == 'black') {
        if(canHandle) {
            leftCountDown.innerText = `${countDownTime}s`;
            leftCountDown.classList.add('active');
            rightCountDown.classList.remove('active');
            rightCountDown.innerText = '60s';
        } else {
            rightCountDown.innerText = `${countDownTime}s`;
            rightCountDown.classList.add('active');
            leftCountDown.classList.remove('active');
            leftCountDown.innerText = '60s';
        }
    }
    if(pieceColor == 'white') {
        if(canHandle) {
            rightCountDown.innerText = `${countDownTime}s`;
            rightCountDown.classList.add('active');
            leftCountDown.classList.remove('active');
            leftCountDown.innerText = '60s';
        } else {
            leftCountDown.innerText = `${countDownTime}s`;
            leftCountDown.classList.add('active');
            rightCountDown.classList.remove('active');
            rightCountDown.innerText = '60s';
        }
    }
    countDownTimer = setTimeout(function () {
        countDown();
    }, 1000)
}
// 落子后开始计时
function countDownStart() {
    countDownTime = 60;
    clearTimeout(countDownTimer);
    leftCountDown.innerText = '60s';
    rightCountDown.innerText = '60s';
    countDown();
}