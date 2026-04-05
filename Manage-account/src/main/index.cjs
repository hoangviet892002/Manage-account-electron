const electron = require('electron')
const { app, shell, BrowserWindow, ipcMain, dialog } = electron
const { join } = require('path')
const { readFile, writeFile, mkdir } = require('fs').promises
const { existsSync } = require('fs')
const path = require('path')

// Load icon
const iconPath = path.join(__dirname, '../../resources/icon.png')

// Simple utility functions
const is = {
  dev: process.env.NODE_ENV === 'development' || !app.isPackaged
}

const electronApp = {
  setAppUserModelId: (id) => {
    if (process.platform === 'win32') {
      app.setAppUserModelId(id)
    }
  }
}

const optimizer = {
  watchWindowShortcuts: (window) => {
    if (is.dev) {
      window.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'r' && (input.control || input.meta)) {
          event.preventDefault()
        }
      })
    }
  }
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon: iconPath } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// IPC Handlers
ipcMain.handle('read-file', async (_, filePath) => {
  try {
    const data = await readFile(filePath, 'utf-8')
    return data
  } catch (error) {
    console.error('Error reading file:', error)
    throw error
  }
})

ipcMain.handle('write-file', async (_, filePath, data) => {
  try {
    await writeFile(filePath, data, 'utf-8')
    return { success: true }
  } catch (error) {
    console.error('Error writing file:', error)
    throw error
  }
})

ipcMain.handle('select-folder', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
  } catch (error) {
    console.error('Error selecting folder:', error)
    throw error
  }
})

ipcMain.handle('select-file', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    return result.canceled ? null : result.filePaths[0]
  } catch (error) {
    console.error('Error selecting file:', error)
    throw error
  }
})

ipcMain.handle('file-exists', async (_, filePath) => {
  try {
    return existsSync(filePath)
  } catch (error) {
    console.error('Error checking file existence:', error)
    return false
  }
})

ipcMain.handle('mkdir', async (_, dirPath) => {
  try {
    await mkdir(dirPath, { recursive: true })
    return { success: true }
  } catch (error) {
    console.error('Error creating directory:', error)
    throw error
  }
})

ipcMain.handle('get-config', async () => {
  try {
    const configPath = path.join(app.getPath('userData'), 'app-config.json')
    if (existsSync(configPath)) {
      const data = await readFile(configPath, 'utf-8')
      return JSON.parse(data)
    }
    return {
      accountsFolderPath: '',
      accountsFileName: 'accounts.json',
      autoLoad: false
    }
  } catch (error) {
    console.error('Error getting config:', error)
    throw error
  }
})

ipcMain.handle('save-config', async (_, config) => {
  try {
    const configPath = path.join(app.getPath('userData'), 'app-config.json')
    const configDir = path.dirname(configPath)

    // Ensure directory exists
    if (!existsSync(configDir)) {
      await mkdir(configDir, { recursive: true })
    }

    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')
    return { success: true }
  } catch (error) {
    console.error('Error saving config:', error)
    throw error
  }
})

ipcMain.handle('load-accounts', async (_, filePath) => {
  try {
    if (!existsSync(filePath)) {
      return { accounts: [], version: '1.0.0', lastUpdated: new Date().toISOString() }
    }

    const data = await readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading accounts:', error)
    throw error
  }
})

ipcMain.handle('save-accounts', async (_, filePath, accountsData) => {
  try {
    const data = {
      ...accountsData,
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    }

    // Ensure directory exists
    const dir = path.dirname(filePath)
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }

    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return { success: true }
  } catch (error) {
    console.error('Error saving accounts:', error)
    throw error
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
