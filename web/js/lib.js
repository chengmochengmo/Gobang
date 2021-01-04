let maskDiv = undefined;
let toastDiv = undefined;
// 展示弹窗 单例
function showToast (content, time, cb) {
    if (!maskDiv) {
        createToast();
    }
    console.log('toast内容：', content);
    domHandle([toastDiv, maskDiv], ['innerText', 'style.display'], [content, 'flex']);
    let timer = setTimeout(() => {
        domHandle(maskDiv, 'style.display', 'none');
        clearTimeout(timer);
        timer = null;
        cb && cb();
    }, time || 2500);
}
// 创建弹窗DOM元素
function createToast() {
    maskDiv = document.createElement('div');
    toastDiv = document.createElement('div');
    domHandle([maskDiv, toastDiv], 
        ['classList.add', 'classList.add'], 
        ['mask', 'toast']);
    maskDiv.appendChild(toastDiv);
    document.body.appendChild(maskDiv);
    
}

// DOM操作通用方法
function domHandle(dom, method, value) {
    if (Array.isArray(dom) && Array.isArray(method) && Array.isArray(value)) {
        if (dom.length !== method.length || method.length !== value.length) throw new Error('domHandle args: length is difference');
        for(let i = 0; i < dom.length; i++) {
            domHandle(dom[i], method[i], value[i]);
        }
        return;
    }
    if (!(dom instanceof HTMLElement)) throw new Error('domHandle args: dom not HTMLElement');
    let methods = method.split('.');
    let domMethod = 'dom';
    for (let i = 0; i < methods.length; i++) {
        domMethod += `['${methods[i]}']`;
    }
    if (typeof (new Function('dom', `return ${domMethod}`))(dom) === 'function') return (new Function('dom', `${domMethod}('${value}')`))(dom);
    return (new Function('dom', `${domMethod}='${value}'`))(dom);
}

// 事件委托 查找元素
function getNode(node) {
    try {
        if (node && node.className === 'room-item') {
            return node;
        } else {
            return getNode(node.parentNode);
        }
    } catch (e) {
        return null;
    }
}