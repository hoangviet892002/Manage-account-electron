import { AppConfig } from '../types/account'

const DEFAULT_CONFIG: AppConfig = {
  accountsFolderPath: '',
  accountsFileName: 'accounts.json',
  autoLoad: false
}

export class ConfigService {
  private static instance: ConfigService
  private config: AppConfig = { ...DEFAULT_CONFIG }

  private constructor() {}

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService()
    }
    return ConfigService.instance
  }

  async loadConfig(): Promise<AppConfig> {
    try {
      const loadedConfig = await window.api.getConfig()
      this.config = { ...DEFAULT_CONFIG, ...loadedConfig }
      return this.config
    } catch (error) {
      console.log('No existing config found, using defaults')
      return this.config
    }
  }

  async saveConfig(config: Partial<AppConfig>): Promise<void> {
    this.config = { ...this.config, ...config }

    try {
      await window.api.saveConfig(this.config)
    } catch (error) {
      console.error('Error saving config:', error)
      throw new Error('Failed to save configuration')
    }
  }

  getConfig(): AppConfig {
    return { ...this.config }
  }

  updateConfig(updates: Partial<AppConfig>): AppConfig {
    this.config = { ...this.config, ...updates }
    return this.getConfig()
  }

  getAccountsFilePath(): string {
    if (!this.config.accountsFolderPath) {
      return ''
    }
    return `${this.config.accountsFolderPath}/${this.config.accountsFileName}`
  }
}

export const configService = ConfigService.getInstance()
