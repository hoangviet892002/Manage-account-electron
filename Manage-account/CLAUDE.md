# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Electron desktop application built with React and TypeScript, using electron-vite as the build system. The app follows Electron's multi-process architecture with separate main, preload, and renderer processes.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs typecheck first)
- `npm run typecheck` - Run TypeScript type checking for both node and web
- `npm run typecheck:node` - Type check main/preload processes only
- `npm run typecheck:web` - Type check renderer process only
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run build:win` - Build Windows installer
- `npm run build:mac` - Build macOS app
- `npm run build:linux` - Build Linux packages (AppImage, snap, deb)

## Architecture

### Process Structure

The app follows Electron's three-process architecture:

1. **Main Process** ([`src/main/index.ts`](src/main/index.ts)) - Node.js environment, manages app lifecycle and creates windows
2. **Preload Script** ([`src/preload/index.ts`](src/preload/index.ts)) - Secure bridge between main and renderer, exposes APIs via `contextBridge`
3. **Renderer Process** ([`src/renderer/`](src/renderer/)) - React application running in Chromium

### Build System

Uses **electron-vite** with separate configurations for each process:
- Main process: Node.js environment
- Preload script: Node.js environment
- Renderer: Vite with React plugin, supports `@renderer` alias for `src/renderer/src`

### TypeScript Configuration

Three separate tsconfig files:
- `tsconfig.node.json` - Main and preload processes (Node.js types)
- `tsconfig.web.json` - Renderer process (DOM types)
- `tsconfig.json` - Base configuration

### IPC Communication

- Main process registers handlers with `ipcMain.on()` in [`src/main/index.ts`](src/main/index.ts:53)
- Preload script exposes APIs via `contextBridge.exposeInMainWorld()` in [`src/preload/index.ts`](src/preload/index.ts:12)
- Renderer calls exposed APIs via `window.electron.ipcRenderer.send()` (see [`App.tsx`](src/renderer/src/App.tsx:5))

Type definitions for exposed APIs are in [`src/preload/index.d.ts`](src/preload/index.d.ts:4)

### Code Quality

- ESLint with React, React Hooks, and React Refresh plugins
- Prettier for formatting
- TypeScript strict mode enabled
- React 19 with JSX runtime

## Key Files

- [`electron.vite.config.ts`](electron.vite.config.ts) - Build configuration
- [`electron-builder.yml`](electron-builder.yml) - Packaging and distribution config
- [`package.json`](package.json) - Dependencies and scripts
- [`src/main/index.ts`](src/main/index.ts) - Main process entry point
- [`src/preload/index.ts`](src/preload/index.ts) - Preload script
- [`src/renderer/src/App.tsx`](src/renderer/src/App.tsx) - React root component
