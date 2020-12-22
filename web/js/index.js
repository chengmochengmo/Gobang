let userName = localStorage.getItem('userName'); // 用户名
window.onload = function () {
    documentEventInit(); 
    if(userName) {
        initGame();
    } else {
        inputInfo.style.display = "flex";
    }
}

// 绑定全局dom事件
function documentEventInit() {
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
}

// 初始化
function initGame() {
    new Gobang(); // 进入游戏
}