import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // File system operations
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, data: string) => ipcRenderer.invoke('write-file', filePath, data),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectFile: () => ipcRenderer.invoke('select-file'),
  exists: (filePath: string) => ipcRenderer.invoke('file-exists', filePath),
  mkdir: (dirPath: string) => ipcRenderer.invoke('mkdir', dirPath),

  // Config operations
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config: any) => ipcRenderer.invoke('save-config', config),

  // Account operations
  loadAccounts: (filePath: string) => ipcRenderer.invoke('load-accounts', filePath),
  saveAccounts: (filePath: string, accounts: any) => ipcRenderer.invoke('save-accounts', filePath, accounts)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
