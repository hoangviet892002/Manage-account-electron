import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Card,
  Typography,
  message,
  Modal,
  Form,
  Select,
  Empty,
  Spin,
  Tooltip,
  InputNumber
} from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  FolderOpenOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  ApiOutlined,
  CloudServerOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { Account, AccountType } from '../types/account'
import { accountService } from '../services/accountService'
import { configService } from '../services/configService'

const { Title, Text } = Typography

const resourceOptions = [
  { label: 'Production', value: 'Production' },
  { label: 'Development', value: 'Development' },
  { label: 'Testing', value: 'Testing' },
  { label: 'Staging', value: 'Staging' },
  { label: 'Admin', value: 'Admin' },
  { label: 'Other', value: 'Other' }
]

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Pending', value: 'pending' }
]

const accountTypeOptions = [
  { label: 'Basic', value: AccountType.BASIC },
  { label: 'VPS/Server', value: AccountType.VPS },
  { label: 'Web Account', value: AccountType.WEB },
  { label: 'Database', value: AccountType.DATABASE },
  { label: 'API', value: AccountType.API },
  { label: 'SSH', value: AccountType.SSH },
  { label: 'Email', value: AccountType.EMAIL },
  { label: 'Social', value: AccountType.SOCIAL },
  { label: 'Custom', value: AccountType.CUSTOM }
]

const protocolOptions = [
  { label: 'SSH', value: 'ssh' },
  { label: 'FTP', value: 'ftp' },
  { label: 'SFTP', value: 'sftp' },
  { label: 'HTTP', value: 'http' },
  { label: 'HTTPS', value: 'https' },
  { label: 'Other', value: 'other' }
]

const autoLoadOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false }
]

const AccountManager: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [configPath, setConfigPath] = useState('')
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [isFolderModalVisible, setIsFolderModalVisible] = useState(false)
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType>(AccountType.BASIC)
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [folderForm] = Form.useForm()
  const [tableHeight, setTableHeight] = useState(500)

  useEffect(() => {
    loadConfig()
    calculateTableHeight()
    window.addEventListener('resize', calculateTableHeight)
    return () => window.removeEventListener('resize', calculateTableHeight)
  }, [])

  const calculateTableHeight = () => {
    const windowHeight = window.innerHeight
    const headerHeight = 200
    const footerHeight = 100
    const padding = 48
    const calculatedHeight = windowHeight - headerHeight - footerHeight - padding
    setTableHeight(Math.max(calculatedHeight, 300))
  }

  const loadConfig = async () => {
    try {
      const config = await configService.loadConfig()
      setConfigPath(config.accountsFolderPath)

      if (config.autoLoad && config.accountsFolderPath) {
        loadAccounts()
      }
    } catch (error) {
      console.error('Error loading config:', error)
    }
  }

  const loadAccounts = async () => {
    setLoading(true)
    try {
      const config = configService.getConfig()
      if (!config.accountsFolderPath) {
        message.warning('Please configure the accounts folder path first')
        return
      }

      const filePath = configService.getAccountsFilePath()
      const loadedAccounts = await accountService.loadAccountsFromPath(filePath)
      setAccounts(loadedAccounts)
      message.success(`Loaded ${loadedAccounts.length} accounts`)
    } catch (error) {
      message.error('Failed to load accounts. Please check the file path.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
    if (value) {
      const filtered = accountService.searchAccounts(value)
      setAccounts(filtered)
    } else {
      setAccounts(accountService.getAccounts())
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'green'
      case 'inactive':
        return 'red'
      case 'pending':
        return 'orange'
      default:
        return 'blue'
    }
  }

  const getAccountTypeColor = (type?: AccountType) => {
    switch (type) {
      case AccountType.BASIC:
        return 'default'
      case AccountType.WEB:
        return 'blue'
      case AccountType.VPS:
        return 'green'
      case AccountType.DATABASE:
        return 'orange'
      case AccountType.API:
        return 'purple'
      case AccountType.SSH:
        return 'cyan'
      case AccountType.EMAIL:
        return 'magenta'
      case AccountType.SOCIAL:
        return 'pink'
      case AccountType.CUSTOM:
        return 'geekblue'
      default:
        return 'default'
    }
  }

  const getAccountTypeIcon = (type?: AccountType) => {
    switch (type) {
      case AccountType.WEB:
        return <GlobalOutlined />
      case AccountType.VPS:
        return <CloudServerOutlined />
      case AccountType.DATABASE:
        return <DatabaseOutlined />
      case AccountType.API:
        return <ApiOutlined />
      case AccountType.SSH:
        return <CloudServerOutlined />
      case AccountType.EMAIL:
        return <LinkOutlined />
      case AccountType.SOCIAL:
        return <LinkOutlined />
      default:
        return null
    }
  }

  const handleAddAccount = async (values: any) => {
    try {
      const accountType = values.type || AccountType.BASIC

      // Build account object based on type
      const baseAccount: any = {
        displayName: values.displayName,
        resource: values.resource,
        description: values.description,
        status: values.status || 'active',
        type: accountType
      }

      // Only include username for account types that have it
      if ([AccountType.BASIC, AccountType.WEB, AccountType.VPS].includes(accountType)) {
        baseAccount.username = values.username
      }

      // Only include password for account types that have it
      if (
        [AccountType.BASIC, AccountType.WEB, AccountType.VPS, AccountType.DATABASE].includes(
          accountType
        )
      ) {
        baseAccount.password = values.password
      }

      // Add type-specific fields
      if (accountType === AccountType.WEB) {
        baseAccount.url = values.url
        baseAccount.apiKey = values.apiKey
      } else if (accountType === AccountType.VPS) {
        baseAccount.ip = values.ip
        baseAccount.port = values.port
        baseAccount.protocol = values.protocol
        baseAccount.hostname = values.hostname
        baseAccount.region = values.region
        baseAccount.provider = values.provider
      } else if (accountType === AccountType.DATABASE) {
        baseAccount.host = values.host
        baseAccount.port = values.port
        baseAccount.database = values.databaseName
        baseAccount.schema = values.schema
        baseAccount.username = values.username
        baseAccount.provider = values.provider
      } else if (accountType === AccountType.API) {
        baseAccount.endpoint = values.endpoint
        baseAccount.apiKey = values.apiKey
        baseAccount.apiSecret = values.apiSecret
        baseAccount.version = values.version
        baseAccount.environment = values.environment
      } else if (accountType === AccountType.SSH) {
        baseAccount.hostname = values.hostname
        baseAccount.port = values.port
        baseAccount.username = values.username
        baseAccount.keyPath = values.keyPath
        baseAccount.authMethod = values.authMethod
        baseAccount.region = values.region
      } else if (accountType === AccountType.EMAIL) {
        baseAccount.email = values.email
        baseAccount.imapHost = values.imapHost
        baseAccount.imapPort = values.imapPort
        baseAccount.smtpHost = values.smtpHost
        baseAccount.smtpPort = values.smtpPort
        baseAccount.imapUsername = values.imapUsername
        baseAccount.smtpUsername = values.smtpUsername
      } else if (accountType === AccountType.SOCIAL) {
        baseAccount.platform = values.platform
        baseAccount.token = values.token
        baseAccount.refreshToken = values.refreshToken
        baseAccount.clientId = values.clientId
        baseAccount.clientSecret = values.clientSecret
      }

      if (editingAccountId) {
        const updatedAccount = await accountService.updateAccount(editingAccountId, baseAccount)
        if (updatedAccount) {
          setAccounts((prev) => prev.map((acc) => (acc.id === editingAccountId ? updatedAccount : acc)))
          message.success('Account updated successfully')
        } else {
          message.error('Failed to update account')
        }
      } else {
        const newAccount = await accountService.addAccount(baseAccount)
        setAccounts([...accounts, newAccount])
        message.success('Account added successfully')
      }

      setIsAddModalVisible(false)
      setEditingAccountId(null)
      form.resetFields()
      setSelectedAccountType(AccountType.BASIC)
    } catch (error) {
      message.error(editingAccountId ? 'Failed to update account' : 'Failed to add account')
      console.error(error)
    }
  }

  const handleEditAccount = (account: Account) => {
    const accountType = 'type' in account ? account.type : AccountType.BASIC
    setEditingAccountId(account.id)
    setSelectedAccountType(accountType)

    form.setFieldsValue({
      ...account,
      type: accountType,
      databaseName: 'database' in account ? account.database : undefined
    })

    setIsAddModalVisible(true)
  }

  const handleDeleteAccount = (id: string) => {
    Modal.confirm({
      title: 'Delete Account',
      content: 'Are you sure you want to delete this account?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const success = await accountService.deleteAccount(id)
          if (success) {
            setAccounts(accounts.filter((acc) => acc.id !== id))
            message.success('Account deleted successfully')
          } else {
            message.error('Failed to delete account')
          }
        } catch (error) {
          message.error('Failed to delete account')
          console.error(error)
        }
      }
    })
  }

  const handleSelectFolder = async () => {
    try {
      const folderPath = await window.api.selectFolder()
      if (folderPath) {
        folderForm.setFieldsValue({ folderPath })
      }
    } catch (error) {
      message.error('Failed to select folder')
      console.error(error)
    }
  }

  const handleSaveFolderConfig = async (values: any) => {
    try {
      await configService.saveConfig({
        accountsFolderPath: values.folderPath,
        accountsFileName: values.fileName || 'accounts.json',
        autoLoad: values.autoLoad || false
      })
      setConfigPath(values.folderPath)
      message.success('Folder configured successfully')
      setIsFolderModalVisible(false)
      folderForm.resetFields()

      if (values.autoLoad) {
        loadAccounts()
      }
    } catch (error) {
      message.error('Failed to configure folder')
      console.error(error)
    }
  }

  const columns: ColumnsType<Account> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      fixed: 'left' as const,
      render: (text: string) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {text}
        </Text>
      )
    },
    {
      title: 'Display Name',
      dataIndex: 'displayName',
      key: 'displayName',
      width: 150,
      fixed: 'left' as const,
      render: (text: string) => (
        <Tooltip title={text}>
          <Text strong ellipsis style={{ maxWidth: 140 }}>
            {text}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type?: AccountType) => (
        <Tag color={getAccountTypeColor(type)} icon={getAccountTypeIcon(type)}>
          {type || 'Basic'}
        </Tag>
      )
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 200,
      render: (text: string) => (
        <Tooltip title={text}>
          <Text code copyable={{ text }} ellipsis style={{ maxWidth: 180 }}>
            {text}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Password',
      dataIndex: 'password',
      key: 'password',
      width: 120,
      render: (text: string) => (
        <Tooltip title="Click to copy">
          <Text code copyable={{ text }} style={{ cursor: 'pointer' }}>
            {'•'.repeat(Math.min(text.length, 8))}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
      width: 120,
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Connection Info',
      key: 'connectionInfo',
      width: 260,
      render: (_, record) => {
        const parts: string[] = []

        // Type-safe property access based on account type
        if ('url' in record && record.url) {
          parts.push(record.url)
        }
        if ('host' in record && record.host) {
          const hostWithPort = record.host
          if ('port' in record && record.port) {
            parts.push(`${hostWithPort}:${record.port}`)
          } else {
            parts.push(hostWithPort)
          }
        }
        if ('ip' in record && record.ip) {
          const ipWithPort = record.ip
          if ('port' in record && record.port) {
            parts.push(`${ipWithPort}:${record.port}`)
          } else {
            parts.push(ipWithPort)
          }
        }
        if ('hostname' in record && record.hostname) {
          const hostnameWithPort = record.hostname
          if ('port' in record && record.port) {
            parts.push(`${hostnameWithPort}:${record.port}`)
          } else {
            parts.push(hostnameWithPort)
          }
        }
        if ('endpoint' in record && record.endpoint) {
          parts.push(record.endpoint)
        }
        if ('database' in record && record.database) {
          parts.push(record.database)
        }
        if ('email' in record && record.email) {
          parts.push(record.email)
        }
        if ('platform' in record && record.platform) {
          parts.push(record.platform)
        }
        if ('port' in record && record.port && parts.length === 0) {
          parts.push(`Port: ${record.port}`)
        }

        if (parts.length === 0) {
          return <Text type="secondary">-</Text>
        }

        const uniqueParts = Array.from(new Set(parts))

        return (
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            {uniqueParts.slice(0, 3).map((item) => (
              <Tooltip key={item} title={`Click to copy: ${item}`}>
                <Text code copyable={{ text: item }} ellipsis style={{ maxWidth: 230 }}>
                  {item}
                </Text>
              </Tooltip>
            ))}
            {uniqueParts.length > 3 && (
              <Tooltip title={uniqueParts.slice(3).join(', ')}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  +{uniqueParts.length - 3} more
                </Text>
              </Tooltip>
            )}
          </Space>
        )
      }
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <Text type="secondary" ellipsis style={{ maxWidth: 180 }}>
            {text || '-'}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status?: string) => <Tag color={getStatusColor(status)}>{status || 'active'}</Tag>
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date?: string) => (
        <Tooltip title={date ? new Date(date).toLocaleString() : '-'}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {date ? new Date(date).toLocaleDateString() : '-'}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit account">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditAccount(record)}
            />
          </Tooltip>
          <Tooltip title="Delete account">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteAccount(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  return (
    <div className="h-screen flex flex-col bg-gray-50 pt-20">
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Title level={3} className="m-0">
                Account Manager
              </Title>
              {configPath && (
                <Tooltip title={configPath}>
                  <Tag icon={<InfoCircleOutlined />} color="blue">
                    Configured
                  </Tag>
                </Tooltip>
              )}
            </div>
            <Space size="middle">
              <Tooltip title="Configure accounts folder">
                <Button icon={<FolderOpenOutlined />} onClick={() => setIsFolderModalVisible(true)}>
                  Select Folder
                </Button>
              </Tooltip>
              <Tooltip title="Reload accounts">
                <Button icon={<ReloadOutlined />} onClick={loadAccounts} loading={loading}>
                  Reload
                </Button>
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingAccountId(null)
                  setSelectedAccountType(AccountType.BASIC)
                  form.resetFields()
                  setIsAddModalVisible(true)
                }}
              >
                Add Account
              </Button>
            </Space>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <Card className="mb-4">
            <Input
              placeholder="Search accounts by name, username, resource, or description..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              size="large"
            />
          </Card>

          <Card className="flex-1 flex flex-col overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Spin size="large" tip="Loading accounts..." />
              </div>
            ) : accounts.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Empty
                  description={
                    configPath
                      ? 'No accounts found. Click "Add Account" to create your first account.'
                      : 'Please configure the accounts folder path first to load accounts.'
                  }
                />
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={accounts}
                rowKey="id"
                scroll={{ y: tableHeight }}
                pagination={{
                  pageSize: 100,
                  pageSizeOptions: [10, 20, 50, 100],
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} accounts`
                }}
                size="middle"
              />
            )}
          </Card>
        </div>
      </div>

      <Modal
        title={editingAccountId ? 'Edit Account' : 'Add New Account'}
        open={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false)
          setEditingAccountId(null)
          form.resetFields()
          setSelectedAccountType(AccountType.BASIC)
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleAddAccount}>
          <Form.Item
            label="Display Name"
            name="displayName"
            rules={[{ required: true, message: 'Please enter display name' }]}
          >
            <Input placeholder="Enter display name" size="large" />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please enter username' }]}
          >
            <Input placeholder="Enter username or email" size="large" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter password' }]}
          >
            <Input.Password placeholder="Enter password" size="large" />
          </Form.Item>

          <Form.Item
            label="Resource"
            name="resource"
            rules={[{ required: true, message: 'Please select resource' }]}
          >
            <Select placeholder="Select resource" options={resourceOptions} size="large" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea placeholder="Enter description" rows={3} size="large" />
          </Form.Item>

          <Form.Item label="Account Type" name="type" initialValue={AccountType.BASIC}>
            <Select
              placeholder="Select account type"
              options={[
                { label: 'Basic', value: AccountType.BASIC },
                { label: 'VPS/Server', value: AccountType.VPS },
                { label: 'Web Account', value: AccountType.WEB },
                { label: 'Database', value: AccountType.DATABASE },
                { label: 'API', value: AccountType.API },
                { label: 'SSH', value: AccountType.SSH },
                { label: 'Email', value: AccountType.EMAIL },
                { label: 'Social', value: AccountType.SOCIAL },
                { label: 'Custom', value: AccountType.CUSTOM }
              ]}
              size="large"
              onChange={(value) => setSelectedAccountType(value)}
            />
          </Form.Item>

          {/* Conditional fields based on account type */}
          {selectedAccountType === AccountType.WEB && (
            <>
              <Form.Item label="URL" name="url">
                <Input placeholder="Enter website URL" size="large" />
              </Form.Item>
              <Form.Item label="API Key (Optional)" name="apiKey">
                <Input placeholder="Enter API key" size="large" />
              </Form.Item>
            </>
          )}

          {selectedAccountType === AccountType.VPS && (
            <>
              <Form.Item
                label="IP Address"
                name="ip"
                rules={[{ required: true, message: 'Please enter IP address' }]}
              >
                <Input placeholder="e.g., 192.168.1.1" size="large" />
              </Form.Item>
              <Form.Item
                label="Port"
                name="port"
                rules={[{ required: true, message: 'Please enter port number' }]}
              >
                <InputNumber placeholder="e.g., 22" min={1} max={65535} size="large" />
              </Form.Item>
              <Form.Item label="Protocol" name="protocol">
                <Select placeholder="Select protocol" options={protocolOptions} size="large" />
              </Form.Item>
              <Form.Item label="Hostname (Optional)" name="hostname">
                <Input placeholder="e.g., server.example.com" size="large" />
              </Form.Item>
              <Form.Item label="Region (Optional)" name="region">
                <Input placeholder="e.g., us-east-1" size="large" />
              </Form.Item>
              <Form.Item label="Provider (Optional)" name="provider">
                <Input placeholder="e.g., AWS, DigitalOcean" size="large" />
              </Form.Item>
            </>
          )}

          {selectedAccountType === AccountType.DATABASE && (
            <>
              <Form.Item
                label="Host"
                name="host"
                rules={[{ required: true, message: 'Please enter host address' }]}
              >
                <Input placeholder="e.g., localhost or db.example.com" size="large" />
              </Form.Item>
              <Form.Item
                label="Port"
                name="port"
                rules={[{ required: true, message: 'Please enter port number' }]}
              >
                <InputNumber placeholder="e.g., 3306" min={1} max={65535} size="large" />
              </Form.Item>
              <Form.Item
                label="Database Name"
                name="databaseName"
                rules={[{ required: true, message: 'Please enter database name' }]}
              >
                <Input placeholder="e.g., mydb" size="large" />
              </Form.Item>
              <Form.Item label="Schema (Optional)" name="schema">
                <Input placeholder="e.g., public" size="large" />
              </Form.Item>
              <Form.Item label="Provider (Optional)" name="provider">
                <Input placeholder="e.g., AWS RDS, MongoDB Atlas" size="large" />
              </Form.Item>
            </>
          )}

          {selectedAccountType === AccountType.API && (
            <>
              <Form.Item
                label="API Endpoint"
                name="endpoint"
                rules={[{ required: true, message: 'Please enter API endpoint' }]}
              >
                <Input placeholder="e.g., https://api.example.com/v1" size="large" />
              </Form.Item>
              <Form.Item label="API Key (Optional)" name="apiKey">
                <Input placeholder="Enter API key" size="large" />
              </Form.Item>
              <Form.Item label="API Secret (Optional)" name="apiSecret">
                <Input.Password placeholder="Enter API secret" size="large" />
              </Form.Item>
              <Form.Item label="Version" name="version">
                <Input placeholder="e.g., v1.0.0" size="large" />
              </Form.Item>
              <Form.Item label="Environment" name="environment">
                <Select
                  placeholder="Select environment"
                  options={[
                    { label: 'Development', value: 'development' },
                    { label: 'Staging', value: 'staging' },
                    { label: 'Production', value: 'production' }
                  ]}
                  size="large"
                />
              </Form.Item>
            </>
          )}

          {selectedAccountType === AccountType.SSH && (
            <>
              <Form.Item
                label="Hostname"
                name="hostname"
                rules={[{ required: true, message: 'Please enter hostname' }]}
              >
                <Input placeholder="e.g., server.example.com" size="large" />
              </Form.Item>
              <Form.Item
                label="Port"
                name="port"
                rules={[{ required: true, message: 'Please enter port number' }]}
              >
                <InputNumber placeholder="e.g., 22" min={1} max={65535} size="large" />
              </Form.Item>
              <Form.Item label="Username (Optional)" name="username">
                <Input placeholder="Enter SSH username" size="large" />
              </Form.Item>
              <Form.Item label="Auth Method" name="authMethod">
                <Select
                  placeholder="Select auth method"
                  options={[
                    { label: 'Password', value: 'password' },
                    { label: 'Key', value: 'key' },
                    { label: 'Agent', value: 'agent' }
                  ]}
                  size="large"
                />
              </Form.Item>
              <Form.Item label="Key Path (Optional)" name="keyPath">
                <Input placeholder="e.g., ~/.ssh/id_rsa" size="large" />
              </Form.Item>
              <Form.Item label="Region (Optional)" name="region">
                <Input placeholder="e.g., us-east-1" size="large" />
              </Form.Item>
            </>
          )}

          {selectedAccountType === AccountType.EMAIL && (
            <>
              <Form.Item
                label="Email Address"
                name="email"
                rules={[{ required: true, message: 'Please enter email address' }]}
              >
                <Input placeholder="e.g., user@example.com" size="large" />
              </Form.Item>
              <Form.Item label="IMAP Host (Optional)" name="imapHost">
                <Input placeholder="e.g., imap.gmail.com" size="large" />
              </Form.Item>
              <Form.Item label="IMAP Port (Optional)" name="imapPort">
                <InputNumber placeholder="e.g., 993" min={1} max={65535} size="large" />
              </Form.Item>
              <Form.Item label="SMTP Host (Optional)" name="smtpHost">
                <Input placeholder="e.g., smtp.gmail.com" size="large" />
              </Form.Item>
              <Form.Item label="SMTP Port (Optional)" name="smtpPort">
                <InputNumber placeholder="e.g., 587" min={1} max={65535} size="large" />
              </Form.Item>
              <Form.Item label="IMAP Username (Optional)" name="imapUsername">
                <Input placeholder="Enter IMAP username" size="large" />
              </Form.Item>
              <Form.Item label="SMTP Username (Optional)" name="smtpUsername">
                <Input placeholder="Enter SMTP username" size="large" />
              </Form.Item>
            </>
          )}

          {selectedAccountType === AccountType.SOCIAL && (
            <>
              <Form.Item
                label="Platform"
                name="platform"
                rules={[{ required: true, message: 'Please select platform' }]}
              >
                <Select
                  placeholder="Select platform"
                  options={[
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'Twitter', value: 'twitter' },
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'GitHub', value: 'github' },
                    { label: 'Google', value: 'google' },
                    { label: 'Other', value: 'other' }
                  ]}
                  size="large"
                />
              </Form.Item>
              <Form.Item label="Token (Optional)" name="token">
                <Input placeholder="Enter access token" size="large" />
              </Form.Item>
              <Form.Item label="Refresh Token (Optional)" name="refreshToken">
                <Input placeholder="Enter refresh token" size="large" />
              </Form.Item>
              <Form.Item label="Client ID (Optional)" name="clientId">
                <Input placeholder="Enter client ID" size="large" />
              </Form.Item>
              <Form.Item label="Client Secret (Optional)" name="clientSecret">
                <Input.Password placeholder="Enter client secret" size="large" />
              </Form.Item>
            </>
          )}

          {selectedAccountType === AccountType.CUSTOM && (
            <>
              <Form.Item label="Tags (Optional)" name="tags">
                <Select mode="tags" placeholder="Add tags" size="large" />
              </Form.Item>
              <Form.Item label="Metadata (Optional)" name="metadata">
                <Input.TextArea
                  placeholder="Enter additional metadata as JSON"
                  rows={3}
                  size="large"
                />
              </Form.Item>
            </>
          )}

          <Form.Item className="mb-0">
            <Space size="large">
              <Button type="primary" htmlType="submit" size="large">
                {editingAccountId ? 'Save Changes' : 'Add Account'}
              </Button>
              <Button onClick={() => setIsAddModalVisible(false)} size="large">
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Configure Accounts Folder"
        open={isFolderModalVisible}
        onCancel={() => setIsFolderModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={folderForm}
          layout="vertical"
          onFinish={handleSaveFolderConfig}
          initialValues={{
            fileName: 'accounts.json',
            autoLoad: true
          }}
        >
          <Form.Item
            label="Folder Path"
            name="folderPath"
            rules={[{ required: true, message: 'Please enter folder path' }]}
            help="Enter the full path to the folder containing your accounts file"
          >
            <Input
              placeholder="/path/to/your/accounts/folder"
              size="large"
              suffix={
                <Button type="primary" icon={<FolderOpenOutlined />} onClick={handleSelectFolder}>
                  Browse
                </Button>
              }
            />
          </Form.Item>

          <Form.Item
            label="Accounts File Name"
            name="fileName"
            rules={[{ required: true, message: 'Please enter file name' }]}
          >
            <Input placeholder="accounts.json" size="large" />
          </Form.Item>

          <Form.Item name="autoLoad" label="Auto Load Accounts">
            <Select
              placeholder="Auto load accounts on startup"
              options={autoLoadOptions}
              size="large"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space size="large">
              <Button type="primary" htmlType="submit" size="large">
                Save Configuration
              </Button>
              <Button onClick={() => setIsFolderModalVisible(false)} size="large">
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AccountManager
