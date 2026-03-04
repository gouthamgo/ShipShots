# Architecture

## Overview

ScreenForge is a Next.js 16 application that enables users to create professional iPhone App Store screenshots through an intuitive visual editor. The app uses HTML5 Canvas for rendering and exports images in Apple's required dimensions.

## Tech Stack

- **Frontend Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4 + CSS Variables
- **State Management**: Zustand with shallow equality
- **Canvas Rendering**: Native HTML5 Canvas API
- **Batch Export**: JSZip
- **Build Tool**: Turbopack

## Project Structure

```
└── package.json
```

## State Management

The application uses Zustand for state management with the following stores:

### App Store (`app-store.ts`)

```typescript
interface AppState {
  // Screenshot data
  screenshots: Screenshot[];
  currentScreenshotId: string | null;
  
  // Output settings
  outputDevice: string;
  
  // History for undo/redo
  history: Screenshot[][];
  historyIndex: number;
  
  // Actions
  addScreenshot: (imageData: string) => void;
  updateScreenshot: (id: string, updates: Partial<Screenshot>) => void;
  deleteScreenshot: (id: string) => void;
  setCurrentScreenshot: (id: string) => void;
  setOutputDevice: (deviceId: string) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
}
```

Key principles:
- **Shallow equality**: Using `zustand/react/shallow` for optimized re-renders
- **Persistence**: State can be persisted to localStorage/IndexedDB
- **Immutability**: All updates create new objects to enable history
