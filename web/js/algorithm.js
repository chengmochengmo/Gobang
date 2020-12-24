// let pieceLists = [
//     '[4,5]',
//     '[4,6]',
//     '[4,8]',
//     '[4,9]',
//     '[6,10]',
//     '[7,10]',
//     '[5,6]',
//     '[6,7]',
//     '[8,10]',
//     '[9,10]',
//     '[10,10]',
//     '[7,8]',
//     '[4,7]',
//     '[8,9]',
// ]; 

// let piece = [4,9]; // 竖
// let piece = [8,9]; // 斜
// let piece = [10,10]; // 横
// let piece = [0,0]; // 小边界
// let piece = [16,16]; // 大边界

// 判断输赢算法 传入新落下棋子位置
function winAlgorithm(piecePosition) {
    // 解构新落下棋子的位置信息
    let [pieceX, pieceY] = piecePosition;
    // 四个方向有多少连子 超过5个即为获胜
    let rowConnectNum = 0;
    let columnConnectNum = 0;
    let obliqueDownConnectNum = 0;
    let obliqueUpConnectNum = 0;
    // 查找的条件
    let deviation = 4;
    let frequency = 9;
    let pointer = 0;
    // 优化边界情况 超出棋盘位置的不再计算
    let maxPiece = Math.max(pieceX, pieceY);
    let minPiece = Math.min(pieceX, pieceY);
    if (maxPiece < 4) {
        frequency = frequency - (deviation - maxPiece);
        deviation = maxPiece;
    }
    if (minPiece > 12) {
        frequency = frequency - (minPiece - 12);
    }
    // 落子后 查找当前落子点为中点 最大范围上下左右4格内 是否出现5连
    while (pointer < frequency) {
        // 算出连成线的棋子的路径
        let x = pieceX + pointer - deviation;
        let y = pieceY + pointer - deviation;
        let minusY = pieceY + (frequency - 1 -pointer) - deviation;
        // 算出来可能连着位置的所有坐标
        let row = `[${x},${pieceY}]`;
        let column = `[${pieceX},${y}]`;
        let obliqueDown = `[${x},${y}]`;
        let obliqueUp = `[${x},${minusY}]`;
        
        // 在棋子位置数组中进行匹配 没有匹配到的话就清0 因为不是连着的了
        if (pieceLists.indexOf(row) !== -1) {
            rowConnectNum++;
        } else{
            rowConnectNum = 0;
        }
        if(rowConnectNum == 5) {
            return '横向五连';
        }
        if (pieceLists.indexOf(column) !== -1) {
            columnConnectNum++;
        } else{
            columnConnectNum = 0;
        }
        if(columnConnectNum == 5) {
            return '竖向五连';
        }
        if (pieceLists.indexOf(obliqueDown) !== -1) {
            obliqueDownConnectNum++;
        } else{
            obliqueDownConnectNum = 0;
        }
        if(obliqueDownConnectNum == 5) {
            return '向下斜向五连';
        }
        if (pieceLists.indexOf(obliqueUp) !== -1) {
            obliqueUpConnectNum++;
        } else{
            obliqueUpConnectNum = 0;
        }
        if(obliqueUpConnectNum == 5) {
            return '向上斜向五连';
        }
        pointer++;
    }
    return '没有五连';
}

// console.log(winAlgorithm(piece))