let maskDiv = undefined;
let toastDiv = undefined;
// 展示弹窗 单例
function showToast (content, time) {
    if (!maskDiv) {
        createToast();
    }
    toastDiv.innerText = content;
    maskDiv.style.display = 'flex';
    let timer = setTimeout(() => {
        maskDiv.style.display = 'none';
        clearTimeout(timer);
        timer = null;
    }, time || 2500);
}
// 创建弹窗
function createToast() {
    maskDiv = document.createElement('div');
    maskDiv.classList.add('mask');
    toastDiv = document.createElement('div');
    toastDiv.classList.add('toast');
    maskDiv.appendChild(toastDiv);
    document.body.appendChild(maskDiv);
}