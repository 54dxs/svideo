const ipc = require('electron').ipcMain

// 渲染线程与主线程同步通信
ipc.on('synchronous-message', function (event, arg) {
  event.returnValue = 'pong'
})
