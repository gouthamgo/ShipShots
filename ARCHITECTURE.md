# Architecture

## Overview

ScreenForge is a Next.js 16 application that enables users to create professional iPhone App Store screenshots through an intuitive visual editor. The app uses HTML5 Canvas for rendering and exports images in Apple's required dimensions.

---

## Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| Next.js | Frontend framework with App Router | 16.1.6 |
| React | UI library | 19.2.3 |
| Tailwind CSS | Styling with CSS variables | 4 |
| Zustand | State management | 5.0.11 |
| HTML5 Canvas | Image rendering | - |
| JSZip | Batch export | 3.10.1 |
| Turbopack | Build tool | - |

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
│   │   └── ui/                 # Reusable UI components
│   ├── stores/                 # Zustand stores
│   │   └── app-store.ts        # Main state store
│   ├── lib/                    # Utilities
│   │   ├── canvas.ts           # Rendering logic
│   │   └── storage/            # IndexedDB helpers
│   │       └── image-store.ts
│   └── types/                  # TypeScript types
│       └── index.ts            # Shared types
├── public/                     # Static assets
│   └── screenshot.png          # README screenshot
├── next.config.ts              # Next.js config
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
└── package.json
```

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AppHeader                                │
│  ┌─────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │    Brand    │  │  DeviceSelector  │  │  ExportButtons   │  │
│  │             │  │  ┌──────────────┐ │  │  ┌────────────┐  │  │
│  │  • Logo    │  │  │ Dropdown     │ │  │  │ Single     │  │  │
│  │  • Title   │  │  │ with 5 sizes │ │  │  │ Export    │  │  │
│  │  • Version │  │  └──────────────┘ │  │  └────────────┘  │  │
│  └─────────────┘  │  ViewModeToggle  │  │  ┌────────────┐  │  │
│                   │  (Editor/Preview) │  │  │ Batch      │  │  │
│                   └────────────────────┘  │  │ Export    │  │  │
│                                             │  └────────────┘  │  │
│                                             └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       WorkflowBar                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  [ 1. Upload ] ──────► [ 2. Style ] ──────► [ 3. Export ]│
│  │       ●                    ○                      ○        │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│                    ┌─────────────────┐                          │
│                    │ Target: 1320×2868 │                         │
│                    └─────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   AssetRail      │  │   CanvasStage    │  │  ControlPanel    │
│   (Left Sidebar) │  │  (Center Area)   │  │  (Right Panel)   │
│                  │  │                  │  │                  │
│ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │
│ │ AssetUploader│ │  │ │   Canvas     │ │  │ │  Tab Bar     │ │
│ │              │ │  │ │  ┌─────────┐  │ │  │ │              │ │
│ │ • Drag/drop  │ │  │ │  │ Background│ │  │ │ • Background │ │
│ │ • Click      │ │  │ │  └─────────┘  │ │  │ │ • Device     │ │
│ │ • Multi-upload│ │  │ │  ┌─────────┐  │ │  │ │ • Text       │ │
│ └──────────────┘ │  │ │  │ Device  │  │ │  │ │ • Effects    │ │
│                  │  │ │  │ Frame   │  │ │  │ └──────────────┘ │
│ ┌──────────────┐ │  │ │  └─────────┘  │ │  │                  │
│ │  AssetList   │ │  │ │  ┌─────────┐  │ │  │ ┌──────────────┐ │
│ │              │ │  │ │  │Screenshot│ │ │  │ │ Panel Content│ │
│ │ • Thumbnails │ │  │ │  └─────────┘  │ │  │ │              │ │
│ │ • Selection  │ │  │ │  ┌─────────┐  │ │  │ │ • Gradient   │ │
│ │ • Delete     │ │  │ │  │  Text   │  │ │  │ │   picker     │ │
│ │ • Reorder    │ │  │ │  └─────────┘  │ │  │ │ • Device     │ │
│ └──────────────┘ │  │ │  ┌─────────┐  │ │  │ │   presets    │ │
│                  │  │ │  │ Effects │  │ │  │ │ • Text       │ │
│ ┌──────────────┐ │  │ │  └─────────┘  │ │  │ │   controls   │ │
│ │AppStoreCheck │ │  │ └──────────────┘ │  │ │ • Effect      │ │
│ │              │ │  │                  │  │ │   sliders    │ │
│ │ • Resolution │ │  │                  │  │ └──────────────┘ │
│ │ • Format     │ │  │                  │  │                  │
│ │ • Count      │ │  │                  │  │                  │
│ │ • Text len   │ │  │                  │  │                  │
│ │ • Safe area  │ │  │                  │  │                  │
│ └──────────────┘ │  │                  │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## Component Details

### AppHeader

The top navigation bar containing:
- **Brand**: Logo ("S") and app name with version
- **DeviceSelector**: Dropdown to choose export device size
- **ViewModeToggle**: Switch between Editor and Preview modes
- **Undo/Redo Buttons**: With keyboard shortcut hints
- **Export Buttons**: Single export and batch export (ZIP)

### WorkflowBar

Progress indicator showing:
- Step 1: Upload (active when no screenshots)
- Step 2: Style (active when screenshots exist)
- Step 3: Export (active when styled)
- Target dimensions display

### AssetRail (Left Sidebar)

Manages uploaded screenshots:
- **AssetUploader**: Drag/drop zone + click to upload
- **AssetList**: Thumbnail grid with selection
- **AppStoreChecklist**: Compliance validation
- **ScenePresets**: Template quick-select

### CanvasStage (Center)

Main editing canvas:
- Responsive canvas sizing
- Drag-to-position screenshots
- Zoom/pan controls
- Empty state with instructions

### ControlPanel (Right Sidebar)

Style editing tabs:
- **Background**: Gradient/solid colors
- **Device**: Frame selection
- **Text**: Headline & subtitle
- **Effects**: Glow, reflection, shadow

---

## State Management

### App Store Interface

```typescript
interface Screenshot {
  id: string;
  imageId: string;
  imageData: string | null;
  screenshot: {
    x: number;        // Position X (0-100%)
    y: number;        // Position Y (0-100%)
    scale: number;    // Scale factor
    rotation: number; // Rotation angle
  };
  background: {
    type: 'gradient' | 'solid';
    gradientId?: string;
    gradientColors?: string[];
    solidColor?: string;
  };
  device: {
    frameId: string;
    angle: 'front' | 'tilt' | 'iso' | '3/4';
  };
  text: {
    headline: { text: string; x: number; y: number };
    subhead: { text: string; x: number; y: number };
  };
  effects: {
    glow: number;
    reflection: number;
    shadow: number;
    border: number;
  };
}

interface AppState {
  screenshots: Screenshot[];
  currentScreenshotId: string | null;
  outputDevice: string;
  canUndo: boolean;
  canRedo: boolean;
  addScreenshot: (imageData: string) => string;
  updateScreenshot: (id: string, updates: Partial<Screenshot>) => void;
  deleteScreenshot: (id: string) => void;
  setCurrentScreenshot: (id: string) => void;
  setOutputDevice: (deviceId: string) => void;
  hydrateScreenshotImage: (id: string, imageData: string) => void;
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
| **Derived State** | `canUndo`/`canRedo` computed from `historyIndex` |

---

## Canvas Rendering Pipeline

```
┌────────────────────────────────────────────────────────────────┐
│                     RENDERING PIPELINE                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │
│  │  Background │───▶│Device Frame  │───▶│ Screenshot   │    │
│  │   Layer     │    │    Layer     │    │    Layer     │    │
│  │              │    │              │    │              │    │
│  │ • Gradient  │    │ • Front view │    │ • Position   │    │
│  │ • Solid     │    │ • Tilt       │    │ • Scale      │    │
│  │ • Custom    │    │ • Isometric  │    │ • Crop       │    │
│  │   color     │    │ • 3/4 view   │    │ • Rotation   │    │
│  └──────────────┘    └──────────────┘    └──────────────┘    │
│                                                │               │
│                                                ▼               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │
│  │   Effects    │◀───│    Text      │◀───│   Composite  │    │
│  │   Layer      │    │    Layer     │    │    Output    │    │
│  │              │    │              │    │              │    │
│  │ • Glow       │    │ • Headline   │    │ • PNG Blob   │    │
│  │ • Reflection │    │ • Subhead    │    │ • ZIP Archive│    │
│  │ • Shadow     │    │ • Position   │    │              │    │
│  │ • Border     │    │ • Styling    │    │              │    │
│  └──────────────┘    └──────────────┘    └──────────────┘    │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Layer Details

| Layer | Function | Drawing Order |
|-------|----------|--------------|
| Background | Gradient/solid fill | 1st |
| Device Frame | iPhone overlay image | 2nd |
| Screenshot | User's app screenshot | 3rd |
| Text | Headline + subtitle | 4th |
| Effects | Glow, reflection, shadow | 5th |

### Export Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `renderToCanvas` | canvas, screenshot, deviceId | void | Renders screenshot to canvas |
| `exportImage` | canvas, screenshot, deviceId | `Promise<Blob>` | Single PNG export |
| `exportAllAsZip` | screenshots[], deviceId | `Promise<Blob>` | Batch ZIP export |

---

## Device Presets

| Device | Width | Height | Aspect Ratio |
|--------|-------|--------|--------------|
| iPhone 17 Pro Max | 1320 | 2868 | 9:19.5 |
| iPhone 17 6.9" | 1290 | 2796 | 9:19.5 |
| iPhone 17 6.9" | 1260 | 2736 | 9:19.5 |
| iPhone 17 Pro | 1206 | 2622 | 9:19.5 |
| iPhone 17 | 1179 | 2556 | 9:19.5 |

Each preset includes:
- `width`, `height` - Pixel dimensions
- `scale` - Rendering scale factor
- `safeArea` - Text positioning margins
- `name` - Human-readable name

---

## Gradient Presets

| ID | Name | Colors |
|----|------|--------|
| `purple-haze` | Purple Haze | #6366f1 → #a855f7 |
| `sunset-glow` | Sunset Glow | #f97316 → #ec4899 |
| `ocean-deep` | Ocean Deep | #0ea5e9 → #6366f1 |
| `forest-mist` | Forest Mist | #10b981 → #3b82f6 |
| `midnight` | Midnight | #1e1b4b → #312e81 |
| `aurora` | Aurora | #22d3ee → #a855f7 |
| `ember` | Ember | #f43f5e → #f97316 |
| `arctic` | Arctic | #e0f2fe → #7dd3fc |
| `rose-gold` | Rose Gold | #fb7185 → #fde68a |
| `slate` | Slate | #334155 → #475569 |

---

## Device Frame Angles

| Angle | Description | Use Case |
|-------|-------------|----------|
| `front` | Straight-on view | Standard screenshots |
| `tilt` | Slight tilt (15°) | Dynamic look |
| `iso` | Isometric (30°) | Premium feel |
| `3/4` | Three-quarter view | Show depth |

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   USER ACTION                                                   │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    Event Handler                         │   │
│   │  • onChange (inputs)                                    │   │
│   │  • onDrop (drag/drop)                                   │   │
│   │  • onClick (buttons)                                    │   │
│   │  • onKeyDown (shortcuts)                                │   │
│   └─────────────────────────────────────────────────────────┘   │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                 Zustand Action                           │   │
│   │  • addScreenshot()     → creates new screenshot         │   │
│   │  • updateScreenshot()  → merges updates                  │   │
│   │  • deleteScreenshot()  → removes screenshot             │   │
│   │  • pushHistory()       → saves to history               │   │
│   └─────────────────────────────────────────────────────────┘   │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                  State Update                            │   │
│   │  • Immutable update (immer-like pattern)               │   │
│   │  • History index incremented                            │   │
│   │  • IndexedDB synced (if image)                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              React Re-render Cycle                       │   │
│   │  • useShallow selector triggers                         │   │
│   │  • Only affected components re-render                   │   │
│   │  • CanvasStage.useEffect → renderToCanvas()            │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Step-by-Step Flow

1. **Upload** → User drops image → `FileReader` reads as dataURL
2. **Store** → `addScreenshot()` → Updates Zustand state + IndexedDB
3. **Render** → `useEffect` detects change → Canvas redraws
4. **Edit** → User adjusts styles → `updateScreenshot()` → Re-render
5. **Export** → `canvas.toBlob()` → JSZip bundles → Download

---

## Storage Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        STORAGE LAYERS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌───────────────────────────────────────────────────────────┐ │
│   │                    Zustand Store                           │ │
│   │  • currentScreenshotId    • screenshots[]                │ │
│   │  • outputDevice            • history[]                   │ │
│   │  • canUndo/canRedo         • historyIndex                │ │
│   └───────────────────────────────────────────────────────────┘ │
│                              │                                   │
│              ┌───────────────┼───────────────┐                  │
│              ▼                               ▼                  │
│   ┌─────────────────────┐         ┌─────────────────────┐        │
│   │    localStorage    │         │     IndexedDB       │        │
│   │                     │         │                     │        │
│   │ • outputDevice     │         │ • Screenshot       │        │
│   │ • viewMode         │         │   images (base64)  │        │
│   │ • panelState       │         │                     │        │
│   │ • lastExport       │         │ Database: screens   │        │
│   │                     │         │   Store: screenshots│        │
│   └─────────────────────┘         └─────────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### IndexedDB Schema

| Database | Store | Key | Value |
|----------|-------|-----|-------|
| `screenforge` | `screenshots` | `id` (string) | `{ imageData: string, timestamp: number }` |

### Storage API

```typescript
// Save image to IndexedDB
saveScreenshotImage(id: string, imageData: string): Promise<void>

// Load image from IndexedDB  
getScreenshotImage(id: string): Promise<string | null>

// Delete image from IndexedDB
deleteScreenshotImage(id: string): Promise<void>

// Clear all images
clearAllImages(): Promise<void>
```

---

## Keyboard Shortcuts

| Shortcut | Action | Location |
|----------|--------|----------|
| `⌘Z` | Undo | Global |
| `⌘⇧Z` | Redo | Global |
| `⌘S` | Export | Global |
| `Esc` | Close modal | Modal |
| `Delete` | Remove screenshot | AssetRail |

---

## CSS Design System

### Color Palette

| Variable | Hex | Usage |
|----------|-----|-------|
| `--bg-primary` | #0a0a0b | Main background |
| `--bg-secondary` | #141416 | Panels, sidebar |
| `--bg-tertiary` | #1c1c1f | Hover states |
| `--text-primary` | #fafafa | Main text |
| `--text-secondary` | #a1a1aa | Secondary text |
| `--text-tertiary` | #71717a | Hints, disabled |
| `--accent` | #6366f1 | Primary actions |
| `--accent-hover` | #818cf8 | Button hover |
| `--border` | #27272a | Dividers |
| `--success` | #22c55e | Success states |
| `--warning` | #f59e0b | Warnings |
| `--error` | #ef4444 | Errors |

### Typography

| Font | Usage | Weight |
|------|-------|--------|
| DM Sans | UI text | 400, 500, 600 |
| Space Grotesk | Headlines | 500, 700 |
| Inter | Fallback | 400 |

### Spacing Scale

| Token | Value |
|-------|-------|
| `--radius-sm` | 6px |
| `--radius-md` | 8px |
| `--radius-lg` | 12px |
| `--radius-xl` | 16px |

### Component Classes

| Component | Classes |
|-----------|---------|
| Button | `btn btn-primary` / `btn btn-secondary` |
| Input | `input` |
| Select | `select` |
| Panel | `panel` |
| Card | `card` |

---

## Performance Optimization

| Technique | Where | Benefit |
|-----------|-------|---------|
| **Shallow Selectors** | Zustand `useShallow` | Prevents unnecessary re-renders |
| **RAF Batching** | Canvas drag handler | Smooth 60fps updates |
| **Lazy Loading** | IndexedDB hydration | Fast initial load |
| **Selective Effects** | `useEffect` deps | Only re-render on changes |
| **Parallel Export** | `Promise.all` ZIP | Faster batch processing |
| **Memoization** | `useCallback` handlers | Stable references |
| **Virtual List** | Asset thumbnails | Memory efficient |

### Rendering Optimization

```typescript
// Only re-render canvas when relevant state changes
useEffect(() => {
  if (!canvasRef.current) return;
  renderToCanvas(canvasRef.current, currentScreenshot, outputDevice);
}, [currentScreenshot, outputDevice]);

// NOT: useEffect(() => { ... }, [screenshots])
```

---

## Error Handling

| Error | Handling | User Feedback |
|-------|----------|---------------|
| Image load failed | Retry logic | Toast: "Failed to load image" |
| Export failed | Error boundary | Toast: "Export failed" |
| IndexedDB full | Clear old data | Toast: "Storage full, clearing cache" |
| Invalid file type | Validation | Toast: "Only images allowed" |

---

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | Full |
| Firefox | 88+ | Full |
| Safari | 14+ | Full |
| Edge | 90+ | Full |

### Required APIs

- `HTMLCanvasElement.toBlob()`
- `IndexedDB`
- `requestAnimationFrame`
- `FileReader`
- `Blob` / `URL.createObjectURL`

---

## Testing Strategy

### Unit Tests

- State actions (add/update/delete screenshot)
- Canvas rendering functions
- Storage utilities
- Type utilities

### Integration Tests

- User flows (upload → edit → export)
- Keyboard shortcuts
- Drag and drop

### E2E Tests (Future)

- Full export pipeline
- Cross-browser testing

---

## Deployment

### Build

```bash
npm run build    # Production build
npm run start   # Production server
```

### Environment

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |

### Production Considerations

- Static export possible (no server features used)
- CDN for static assets
- Service worker for offline support (future)

---

## Future Improvements

| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Template Library | High | Planned | Pre-made screenshot templates |
| Multi-device Export | High | Planned | Export to all sizes at once |
| Cloud Storage | Medium | Backlog | Save projects to cloud |
| AI Text Suggestions | Low | Backlog | Auto-generate headlines |
| Collaborative Editing | Low | Backlog | Real-time multiplayer |
| More Device Frames | Medium | Backlog | Android, iPad support |

---

## File Statistics

| File | Lines | Purpose |
|------|-------|---------|
| `page.tsx` | 281 | Main editor logic |
| `app-store.ts` | ~150 | State management |
| `canvas.ts` | ~200 | Rendering functions |
| `ControlPanel.tsx` | ~150 | Style controls |
| `AssetRail.tsx` | ~120 | Screenshot management |
| `EffectsPanel.tsx` | ~100 | Effect sliders |

---

## Dependencies Tree

```
screenforge
├── next@16.1.6
│   └── react@19.2.3
│       └── react-dom@19.2.3
├── react@19.2.3
├── react-dom@19.2.3
├── zustand@5.0.11
├── jszip@3.10.1
└── tailwindcss@4
    └── @tailwindcss/postcss@4
```
