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
```

## Canvas Rendering

The canvas rendering system is the core of ScreenForge. It handles:

### Rendering Pipeline (`lib/canvas.ts`)

1. **Background Layer** - Gradient or solid color fill
2. **Device Frame Layer** - Isometric iPhone device overlay
3. **Screenshot Layer** - User's app screenshot with positioning
4. **Text Layer** - Headline and subtitle overlays
5. **Effects Layer** - Glow, reflection, shadows

### Export Functions

```typescript
// Single image export
export async function exportImage(
  canvas: HTMLCanvasElement,
  screenshot: Screenshot,
  deviceId: string
): Promise<Blob>

// Batch export as ZIP
export async function exportAllAsZip(
  screenshots: Screenshot[],
  deviceId: string
): Promise<Blob>
```

### Device Presets

Each device preset defines:
- `width` and `height` in pixels
- `scale` factor for rendering
- `safeArea` margins for text positioning
```

## Component Flow

```
page.tsx (Main Page)
├── AppHeader
│   ├── DeviceSelector
│   ├── ViewModeToggle (Editor/Preview)
│   └── ExportButtons
├── WorkflowBar
│   └── WorkflowSteps (1. Upload → 2. Style → 3. Export)
├── AssetRail
│   ├── AssetUploader
│   ├── AssetList
│   └── AppStoreChecklist
├── CanvasStage
│   └── HTMLCanvasElement
└── ControlPanel
    ├── BackgroundPanel
    ├── DevicePanel
    ├── TextPanel
    └── EffectsPanel
```

### Data Flow

1. User uploads image → `addScreenshot()` action
2. Screenshot stored in Zustand state
3. Canvas re-renders via `useEffect` on state change
4. User adjusts styles → `updateScreenshot()` action
5. Export triggers canvas blob generation

## Storage

### IndexedDB for Images

Large image data is stored in IndexedDB to avoid localStorage limits:

```typescript
// lib/storage/image-store.ts
export async function saveScreenshotImage(
  id: string,
  imageData: string
): Promise<void>

export async function getScreenshotImage(
  id: string
): Promise<string | null>
```

### State Persistence

Zustand middleware can persist selected state to localStorage:
- Output device preference
- Recent edits (optional)
- UI preferences (view mode, panel state)

## Keyboard Shortcuts

The app supports keyboard shortcuts for common actions:

| Shortcut | Action |
|----------|--------|
| `⌘Z` | Undo last change |
| `⌘⇧Z` | Redo undone change |

Shortcuts are implemented via global event listeners in `page.tsx`.

## Performance Considerations

1. **Canvas Optimization** - Only re-render when relevant state changes
2. **Image Lazy Loading** - Screenshots loaded on-demand from IndexedDB
3. **Shallow Selectors** - Zustand `useShallow` prevents unnecessary re-renders
4. **Debounced Updates** - Canvas position updates use requestAnimationFrame
5. **Batch Processing** - ZIP export processes images in parallel

## Future Improvements

- [ ] Cloud storage integration
- [ ] Template library
- [ ] AI-powered text suggestions
- [ ] Multi-device batch export
- [ ] Collaborative editing

