export enum AccountType {
  BASIC = 'basic',
  WEB = 'web',
  VPS = 'vps',
  DATABASE = 'database',
  API = 'api',
  SSH = 'ssh',
  EMAIL = 'email',
  SOCIAL = 'social',
  CUSTOM = 'custom'
}

export interface BaseAccount {
  id: string
  username: string
  password: string
  displayName: string
  resource: string
  description: string
  status?: 'active' | 'inactive' | 'pending'
  createdAt?: string
  updatedAt?: string
}

export interface WebAccount {
  id: string
  username: string
  password: string
  displayName: string
  resource: string
  description: string
  status?: 'active' | 'inactive' | 'pending'
  createdAt?: string
  updatedAt?: string
  type: AccountType.WEB
  url?: string
  apiKey?: string
  endpoints?: string[]
}

export interface VPSAccount {
  id: string
  username: string
  password: string
  displayName: string
  resource: string
  description: string
  status?: 'active' | 'inactive' | 'pending'
  createdAt?: string
  updatedAt?: string
  type: AccountType.VPS
  ip: string
  port: number
  protocol?: 'http' | 'https' | 'ssh' | 'ftp'
  hostname?: string
  region?: string
  provider?: string
}

export interface DatabaseAccount {
  id: string
  password: string
  displayName: string
  resource: string
  description: string
  status?: 'active' | 'inactive' | 'pending'
  createdAt?: string
  updatedAt?: string
  type: AccountType.DATABASE
  host: string
  port: number
  database: string
  schema?: string
  username?: string
  connectionString?: string
  provider?: string
}

export interface APIAccount {
  id: string
  password: string
  displayName: string
  resource: string
  description: string
  status?: 'active' | 'inactive' | 'pending'
  createdAt?: string
  updatedAt?: string
  type: AccountType.API
  endpoint: string
  apiKey?: string
  apiSecret?: string
  version?: string
  environment?: 'development' | 'staging' | 'production'
}

export interface SSHAccount {
  id: string
  password: string
  displayName: string
  resource: string
  description: string
  status?: 'active' | 'inactive' | 'pending'
  createdAt?: string
  updatedAt?: string
  type: AccountType.SSH
  hostname: string
  port: number
  username?: string
  keyPath?: string
  authMethod?: 'password' | 'key' | 'agent'
  region?: string
}

export interface EmailAccount {
  id: string
  password: string
  displayName: string
  resource: string
  description: string
  status?: 'active' | 'inactive' | 'pending'
  createdAt?: string
  updatedAt?: string
  type: AccountType.EMAIL
  email: string
  imapHost?: string
  imapPort?: number
  smtpHost?: string
  smtpPort?: number
  imapUsername?: string
  smtpUsername?: string
}

export interface SocialAccount {
  id: string
  password: string
  displayName: string
  resource: string
  description: string
  status?: 'active' | 'inactive' | 'pending'
  createdAt?: string
  updatedAt?: string
  type: AccountType.SOCIAL
  platform: string
  token?: string
  refreshToken?: string
  clientId?: string
  clientSecret?: string
}

export type Account = BaseAccount | WebAccount | VPSAccount | DatabaseAccount | APIAccount | SSHAccount | EmailAccount | SocialAccount

export interface AccountConfig {
  accounts: Account[]
  version: string
  lastUpdated: string
}

export interface AppConfig {
  accountsFolderPath: string
  accountsFileName: string
  autoLoad: boolean
}
