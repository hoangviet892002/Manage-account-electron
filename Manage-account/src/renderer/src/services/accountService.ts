import { Account, AccountConfig } from '../types/account'

export class AccountService {
  private static instance: AccountService
  private accounts: Account[] = []
  private configPath: string = ''

  private constructor() {}

  static getInstance(): AccountService {
    if (!AccountService.instance) {
      AccountService.instance = new AccountService()
    }
    return AccountService.instance
  }

  async loadAccountsFromPath(filePath: string): Promise<Account[]> {
    try {
      this.configPath = filePath
      const data: AccountConfig = await window.api.loadAccounts(filePath)

      this.accounts = data.accounts || []
      return this.accounts
    } catch (error) {
      console.error('Error loading accounts:', error)
      throw new Error('Failed to load accounts from file')
    }
  }

  async saveAccounts(): Promise<void> {
    if (!this.configPath) {
      throw new Error('No file path configured')
    }

    try {
      const data: AccountConfig = {
        accounts: this.accounts,
        version: '1.0.0',
        lastUpdated: new Date().toISOString()
      }
      await window.api.saveAccounts(this.configPath, data)
    } catch (error) {
      console.error('Error saving accounts:', error)
      throw new Error('Failed to save accounts')
    }
  }

  getAccounts(): Account[] {
    return this.accounts
  }

  getAccountById(id: string): Account | undefined {
    return this.accounts.find(account => account.id === id)
  }

  async addAccount(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const newAccount: Account = {
      ...account,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Account
    this.accounts.push(newAccount)
    await this.saveAccounts()
    return newAccount
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<Account | null> {
    const index = this.accounts.findIndex(account => account.id === id)
    if (index === -1) return null

    this.accounts[index] = {
      ...this.accounts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    await this.saveAccounts()
    return this.accounts[index]
  }

  async deleteAccount(id: string): Promise<boolean> {
    const index = this.accounts.findIndex(account => account.id === id)
    if (index === -1) return false

    this.accounts.splice(index, 1)
    await this.saveAccounts()
    return true
  }

  searchAccounts(query: string): Account[] {
    const lowerQuery = query.toLowerCase()
    return this.accounts.filter(
      account => {
        // Base fields that all accounts have
        const baseFields =
          ('username' in account && account.username?.toLowerCase().includes(lowerQuery)) ||
          account.displayName.toLowerCase().includes(lowerQuery) ||
          account.resource.toLowerCase().includes(lowerQuery) ||
          account.description.toLowerCase().includes(lowerQuery)

        // Search in type-specific fields
        if ('url' in account && account.url?.toLowerCase().includes(lowerQuery)) {
          return true
        }
        if ('host' in account && account.host?.toLowerCase().includes(lowerQuery)) {
          return true
        }
        if ('ip' in account && account.ip?.toLowerCase().includes(lowerQuery)) {
          return true
        }
        if ('hostname' in account && account.hostname?.toLowerCase().includes(lowerQuery)) {
          return true
        }
        if ('endpoint' in account && account.endpoint?.toLowerCase().includes(lowerQuery)) {
          return true
        }
        if ('database' in account && account.database?.toLowerCase().includes(lowerQuery)) {
          return true
        }
        if ('email' in account && account.email?.toLowerCase().includes(lowerQuery)) {
          return true
        }
        if ('platform' in account && account.platform?.toLowerCase().includes(lowerQuery)) {
          return true
        }

        return baseFields
      }
    )
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

export const accountService = AccountService.getInstance()
