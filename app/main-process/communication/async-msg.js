const ipc = require('electron').ipcMain

// 渲染线程与主线程异步通信
ipc.on('asynchronous-message', function (event, arg) {
  event.sender.send('asynchronous-reply', 'pong')
})
