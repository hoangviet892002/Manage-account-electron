# Account Manager

An Electron desktop application for managing accounts with a modern UI built with React, TypeScript, Tailwind CSS, and Ant Design.

## Features

- **Account Management**: View, search, and manage multiple accounts
- **JSON-based Storage**: Load accounts from JSON files
- **Modern UI**: Clean interface with Ant Design components
- **Search Functionality**: Quick search across account details
- **Status Tracking**: Monitor account status (active, inactive, pending)
- **Cross-platform**: Works on Windows, macOS, and Linux

## Account Data Format

Accounts are stored in a JSON file with the following structure:

```json
{
  "accounts": [
    {
      "id": "1",
      "username": "user@example.com",
      "password": "securePassword",
      "displayName": "John Doe",
      "resource": "Production",
      "description": "Main production account",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "version": "1.0.0",
  "lastUpdated": "2024-03-15T10:00:00Z"
}
```

## Configuration

Create an `app-config.json` file to configure the application:

```json
{
  "accountsFolderPath": "/path/to/your/accounts/folder",
  "accountsFileName": "accounts.json",
  "autoLoad": true
}
```

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## Tech Stack

- **Electron**: Desktop application framework
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Ant Design**: React UI component library
- **Vite**: Fast build tool
