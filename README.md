# ScreenForge

A polished web app for creating professional iPhone App Store screenshots. Upload your app screens, style them with device frames, gradients, text overlays, and export in the exact dimensions required by Apple.

![ScreenForge](public/screenshot.png)

## Features

- **iPhone Device Frames** - 12 isometric presets including front, tilt, iso, 3/4 views
- **Gradient & Solid Backgrounds** - 10 preset gradients + custom color picker
- **Text Overlays** - Headline and subheadline with font, weight, and positioning controls
- **Visual Effects** - Glow, reflection, 3D perspective, shadows, and borders
- **Batch Export** - Process up to 10 screenshots at once as ZIP
- **Undo/Redo** - Full keyboard shortcut support (⌘Z / ⌘⇧Z)
- **Canvas Drag** - Position screenshots interactively on the canvas
- **App Store Compliance** - Built-in checklist for screenshot requirements

## Supported Export Sizes

- iPhone 16/17 Pro Max: 1320×2868
- iPhone 16/17 6.9": 1290×2796
- iPhone 17 6.9": 1260×2736
- iPhone 16/17 Pro: 1206×2622
- iPhone 16/17: 1179×2556

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Tech Stack

- **Framework**: Next.js 16 + React 19
- **Styling**: Tailwind CSS 4 + Custom CSS
- **State**: Zustand with persistence
- **Canvas**: HTML5 Canvas API
- **Export**: jszip for batch downloads

## Usage

1. **Upload** - Drag and drop screenshots or click "Add Screenshots"
2. **Style** - Use the Background, Device, Text, and Effects tabs
3. **Apply to All** - Copy current style to all screenshots
4. **Export** - Download individual PNGs or batch ZIP

## Keyboard Shortcuts

- `⌘Z` - Undo
- `⌘⇧Z` - Redo

## License

MIT
