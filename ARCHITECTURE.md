# Architecture

## Overview

ScreenForge is a Next.js 16 application that enables users to create professional iPhone App Store screenshots through an intuitive visual editor. The app uses HTML5 Canvas for rendering and exports images in Apple's required dimensions.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | Frontend framework with App Router |
| React 19 | UI library |
| Tailwind CSS 4 | Styling with CSS variables |
| Zustand | State management |
| HTML5 Canvas | Image rendering |
| JSZip | Batch export |
| Turbopack | Build tool |

---

## Project Structure

```
screenforge/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout + providers
│   │   ├── page.tsx            # Main editor (281 lines)
│   │   └── globals.css         # Global styles + CSS vars
│   ├── components/             # React components
│   │   ├── AppHeader.tsx       # Top header bar
│   │   ├── WorkflowBar.tsx     # Bottom progress bar
│   │   ├── AssetRail.tsx       # Left sidebar
│   │   ├── CanvasStage.tsx     # Center canvas
│   │   ├── ControlPanel.tsx   # Right panel
│   │   ├── EffectsPanel.tsx   # Effects controls
│   │   ├── TemplateGallery.tsx # Template picker
│   │   └── ui/                 # Reusable UI
│   ├── stores/                 # Zustand stores
│   │   └── app-store.ts        # Main state
│   ├── lib/                    # Utilities
│   │   ├── canvas.ts           # Rendering logic
│   │   └── storage/            # IndexedDB helpers
│   └── types/                  # TypeScript types
│       └── index.ts            # Shared types
├── public/                     # Static assets
└── package.json
```

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AppHeader                                │
│  ┌─────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │    Brand    │  │  DeviceSelector  │  │  ExportButtons   │  │
│  └─────────────┘  └──────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       WorkflowBar                               │
│  [ 1. Upload ] ──► [ 2. Style ] ──► [ 3. Export ]               │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│  AssetRail   │    │   CanvasStage    │    │ControlPanel │
│              │    │                  │    │              │
│ ┌──────────┐ │    │  ┌────────────┐  │    │ ┌──────────┐ │
│ │Uploader  │ │    │  │  Canvas    │  │    │ │Background│ │
│ └──────────┘ │    │  │  Element   │  │    │ └──────────┘ │
│ ┌──────────┐ │    │  └────────────┘  │    │ ┌──────────┐ │
│ │AssetList │ │    │                  │    │ │  Device  │ │
│ └──────────┘ │    │                  │    │ └──────────┘ │
│ ┌──────────┐ │    │                  │    │ ┌──────────┐ │
│ │Checklist │ │    │                  │    │ │   Text   │ │
│ └──────────┘ │    │                  │    │ └──────────┘ │
└──────────────┘    └──────────────────┘    └──────────────┘
```

---

## State Management

### App Store Interface

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

### Key Principles

| Principle | Implementation |
|-----------|----------------|
| **Shallow Equality** | `zustand/react/shallow` for optimized re-renders |
| **Persistence** | localStorage/IndexedDB for state hydration |
| **Immutability** | All updates create new objects for history |

---

## Canvas Rendering Pipeline

```
┌────────────────────────────────────────────────────────────────┐
│                     RENDERING PIPELINE                         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │  Background │───▶│Device Frame  │───▶│ Screenshot   │     │
│  │   Layer     │    │    Layer     │    │    Layer     │     │
│  │              │    │              │    │              │     │
│  │ • Gradient  │    │ • Front view │    │ • Position   │     │
│  │ • Solid     │    │ • Tilt       │    │ • Scale      │     │
│  │ • Custom    │    │ • Isometric  │    │ • Crop       │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│                                                │               │
│                                                ▼               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │   Effects    │◀───│    Text      │◀───│   Composite  │     │
│  │   Layer      │    │    Layer     │    │    Output    │     │
│  │              │    │              │    │              │     │
│  │ • Glow       │    │ • Headline   │    │ • PNG Blob   │     │
│  │ • Reflection │    │ • Subhead    │    │ • ZIP Archive│     │
│  │ • Shadow     │    │ • Position   │    └──────────────┘     │
│  └──────────────┘    └──────────────┘                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Export Functions

| Function | Input | Output |
|----------|-------|--------|
| `exportImage` | Canvas + Screenshot + Device | `Promise<Blob>` |
| `exportAllAsZip` | Screenshot[] + Device | `Promise<Blob>` |

---

## Device Presets

| Device | Width | Height | Scale |
|--------|-------|--------|-------|
| iPhone 17 Pro Max | 1320 | 2868 | 1.0 |
| iPhone 17 6.9" | 1290 | 2796 | 1.0 |
| iPhone 17 6.9" | 1260 | 2736 | 1.0 |
| iPhone 17 Pro | 1206 | 2622 | 1.0 |
| iPhone 17 | 1179 | 2556 | 1.0 |

Each preset includes:
- `width`, `height` - Pixel dimensions
- `scale` - Rendering scale factor
- `safeArea` - Text positioning margins

---

## Data Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Upload  │────▶│  Store   │────▶│ Canvas   │────▶│ Export   │
│  Image   │     │  State   │     │ Re-render│     │  Blob    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │
     ▼                ▼                ▼                ▼
  FileReader    Zustand        useEffect       canvas.toBlob()
                 update         trigger           JSZip.pack()
```

### Step-by-Step Flow

1. **Upload** → User drops image → `FileReader` reads as dataURL
2. **Store** → `addScreenshot()` → Updates Zustand state
3. **Render** → `useEffect` detects change → Canvas redraws
4. **Export** → `canvas.toBlob()` → JSZip bundles → Download

---

## Storage Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        STORAGE LAYERS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    Zustand Store                         │  │
│   │  • currentScreenshotId  • screenshots[]                  │  │
│   │  • outputDevice         • history[]                      │  │
│   └─────────────────────────────────────────────────────────┘  │
│                              │                                  │
│              ┌───────────────┼───────────────┐                 │
│              ▼                               ▼                 │
│   ┌─────────────────────┐         ┌─────────────────────┐      │
│   │    localStorage    │         │     IndexedDB       │      │
│   │                     │         │                     │      │
│   │ • outputDevice     │         │ • Screenshot images │      │
│   │ • UI preferences   │         │   (base64 strings) │      │
│   │ • Recent edits     │         │                     │      │
│   └─────────────────────┘         └─────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### IndexedDB Schema

| Table | Key | Value |
|-------|-----|-------|
| `screenshots` | `id` (string) | `{ imageData: string, timestamp: number }` |

### API

```typescript
// Save image to IndexedDB
saveScreenshotImage(id: string, imageData: string): Promise<void>

// Load image from IndexedDB
getScreenshotImage(id: string): Promise<string | null>
```

---

## Keyboard Shortcuts

| Shortcut | Action | Component |
|----------|--------|-----------|
| `⌘Z` | Undo | `page.tsx` |
| `⌘⇧Z` | Redo | `page.tsx` |

---

## Performance Optimization

| Technique | Where | Benefit |
|-----------|-------|---------|
| **Shallow Selectors** | Zustand `useShallow` | Prevents unnecessary re-renders |
| **RAF Batching** | Canvas drag handler | Smooth 60fps updates |
| **Lazy Loading** | IndexedDB hydration | Fast initial load |
| **Selective Effects** | `useEffect` dependencies | Only re-render on relevant changes |
| **Parallel Export** | `Promise.all` in ZIP | Faster batch processing |

---

## CSS Variables

```css
:root {
  /* Colors */
  --bg-primary: #0a0a0b;
  --bg-secondary: #141416;
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-tertiary: #71717a;
  --accent: #6366f1;
  --border: #27272a;
  
  /* Spacing */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

---

## Future Improvements

| Feature | Priority | Description |
|---------|----------|-------------|
| Cloud Storage | Medium | Save projects to cloud |
| Template Library | High | Pre-made screenshot templates |
| AI Text Suggestions | Low | Auto-generate headlines |
| Multi-device Export | High | Export to all device sizes at once |
| Collaborative Editing | Low | Real-time multiplayer |

---

## File Sizes

| File | Lines | Purpose |
|------|-------|---------|
| `page.tsx` | 281 | Main editor logic |
| `app-store.ts` | ~150 | State management |
| `canvas.ts` | ~200 | Rendering functions |
| `ControlPanel.tsx` | ~150 | Style controls |
