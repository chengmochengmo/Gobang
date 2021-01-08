// 全局常量
const constants = require('../../common/constants');

// socket连接
export default io.connect(`http://localhost:${constants.port}/`, {
    rememberUpgrade: true,
    transports: ['websocket'],
    secure: true, 
    rejectUnauthorized: false
});