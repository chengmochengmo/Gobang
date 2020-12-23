let maskDiv = undefined;
let toastDiv = undefined;
// 展示弹窗 单例
function showToast (content, time, cb) {
    if (!maskDiv) {
        createToast();
    }
    console.log('toast内容', content)
    toastDiv.innerText = content;
    maskDiv.style.display = 'flex';
    let timer = setTimeout(() => {
        maskDiv.style.display = 'none';
        clearTimeout(timer);
        timer = null;
        cb && cb();
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

// 操作dom通用方法
function domHandle(dom, method, value) {
    if (Array.isArray(dom) && Array.isArray(method) && Array.isArray(value)) {
        if (dom.length !== method.length || method.length !== value) {
            throw new Error('domHandle argument error: length is difference');
        }
        for(let i = 0; i < dom.length; i++) {
            domHandle(dom[i], method[i], value[i]);
        }
        return;
    }
    console.log(1)
    if (!(dom instanceof HTMLElement)) throw new Error('domHandle argument error: dom not HTMLElement');
    console.log(2)
    let methods = method.split('.');
    console.log(methods)
    let domMethod = dom;
    for (let i = 0; i < methods.length; i++) {
        domMethod = dom[methods[i]];
    }
    console.log(3)
    if (typeof domMethod === 'function') return domMethod(value);
    console.log(4)
    console.log(domMethod);
    domMethod = value;
}

domHandle(readyBtn, 'style.color', '#000')