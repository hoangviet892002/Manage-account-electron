import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      readFile: (filePath: string) => Promise<string>
      writeFile: (filePath: string, data: string) => Promise<void>
      selectFolder: () => Promise<string | null>
      selectFile: () => Promise<string | null>
      exists: (filePath: string) => Promise<boolean>
      mkdir: (dirPath: string) => Promise<void>
      getConfig: () => Promise<any>
      saveConfig: (config: any) => Promise<void>
      loadAccounts: (filePath: string) => Promise<any>
      saveAccounts: (filePath: string, accounts: any) => Promise<void>
    }
  }
}
