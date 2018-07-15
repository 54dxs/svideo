const path = require('path')
const glob = require('glob')
const url = require('url')
const electron = require('electron')
const autoUpdater = require('./auto-updater')

const app = electron.app
const BrowserWindow = electron.BrowserWindow

const debug = /--debug/.test(process.argv[2])

if(process.mas) app.setName('共享视频')

let mainWindow = null

function init() {
	var shouldQuit = makeSingleInstance()
	if(shouldQuit) return app.quit()

	//loadDemos()

	function createWindow() {
		// 创建浏览器窗体对象
		let windowOptions = {
			width: 1080,
			minWidth: 680,
			height: 840,
			title: app.getName(),
			fullscreen: false,
			frame: true,
			webPreferences: {
		      nodeIntegration: false,
		      preload: path.join(__dirname, 'preload.js')
		    }
		}

		if(app.platform === 'linux') {
			windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/512.png')
		} else {
			windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/512.png')
		}

		mainWindow = new BrowserWindow(windowOptions)

		// 加载index.html到app
//		mainWindow.loadURL(url.format({
//			pathname: path.join(__dirname, 'renderer-process/index.html'),
//			protocol: 'file:',
//			slashes: true
//		}))
//		mainWindow.loadURL("https://www.baidu.com/")
	   	mainWindow.loadURL(path.join('file://', __dirname, 'renderer-process/index.html'))
		
		// 开启开发者调试模式(DevTools)
		if(debug) {
			mainWindow.webContents.openDevTools()
			mainWindow.maximize()
			require('devtron').install()
		}

		// 当窗口关闭时，将会回调该事件
		mainWindow.on('closed', function() {
			// 如果你的应用程序支持多窗口，那么你应该把窗口存储在一个数组中，这时你应该删除相应的元素。
			mainWindow = null
		})
	}

	// 当Electron完成初始化并准备创建浏览器窗口时，将调用此方法。某些API只能在发生此事件之后使用。
	app.on('ready', function() {
		createWindow()
		autoUpdater.initialize()
	})

	// 当所有窗口关闭时app将退出。
	app.on('window-all-closed', function() {
		// 在OS X上，应用程序和菜单栏通常保持活跃，直到用户用CMD+Q明确退出。
		if(process.platform !== 'darwin') {
			app.quit()
		}
	})

	app.on('activate', function() {
		// 在OS X上，当点击图标时，在应用程序中重新创建窗口是常见的，并且没有其他窗口打开。
		if(mainWindow === null) {
			createWindow()
		}
	})
}

/**
 * 保证这个app是一个单实例app(避免启动两个)
 * 
 * 主窗口将被恢复和聚焦，而不是当一个人试图启动第二个实例时打开的第二个窗口。
 * 
 * true：当前版本的app应该退出(程序启动时发现已有当前app进程，为保证单实例，则应该退出)
 */
function makeSingleInstance() {
	if(process.mas) return false

	return app.makeSingleInstance(function() {
		if(mainWindow) {
			if(mainWindow.isMinimized()) mainWindow.restore()
			mainWindow.focus()
		}
	})
}

// 遍历导入所有main-process目录下的JS文件(主进程的运行脚本)
function loadDemos () {
  var files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
  files.forEach(function (file) {
    require(file)
  })
  autoUpdater.updateMenu()
}

// 在窗口启动事件发生时，根据指令执行对应逻辑
switch (process.argv[1]) {
  case '--squirrel-install':
    autoUpdater.createShortcut(function () { app.quit() })
    break
  case '--squirrel-uninstall':
    autoUpdater.removeShortcut(function () { app.quit() })
    break
  case '--squirrel-obsolete':
  case '--squirrel-updated':
    app.quit()
    break
  default:
    init()
}