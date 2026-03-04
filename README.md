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
- **Real-time Preview** - See changes instantly as you edit

## Supported Export Sizes

| Device | Dimensions |
|--------|------------|
| iPhone 17 Pro Max | 1320×2868 |
| iPhone 17 6.9" | 1290×2796 |
| iPhone 17 6.9" | 1260×2736 |
| iPhone 17 Pro | 1206×2622 |
| iPhone 17 | 1179×2556 |

## Getting Started

```bash
# Clone the repository
git clone https://github.com/gouthamgo/ShipShots.git
cd screenforge

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Usage

1. **Upload** - Drag and drop screenshots or click "Add Screenshots"
2. **Style** - Use the Background, Device, Text, and Effects tabs to customize
3. **Apply to All** - Copy current style to all screenshots in batch
4. **Export** - Download individual PNGs or batch ZIP for all devices

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘Z` | Undo |
| `⌘⇧Z` | Redo |

## Tech Stack

- **Framework**: Next.js 16 + React 19
- **Styling**: Tailwind CSS 4 + Custom CSS
- **State Management**: Zustand with persistence
- **Canvas**: HTML5 Canvas API
- **Export**: JSZip for batch downloads
- **Build**: Turbopack

## Screenshots

The app features a modern, professional interface with:
- Left sidebar for asset management
- Center canvas for editing
- Right panel for style controls
- Top header with device selection and export options
- Bottom workflow bar showing progress

## App Store Checklist

ScreenForge includes a built-in compliance checklist to help ensure your screenshots meet Apple's requirements:
- Resolution and aspect ratio validation
- File format verification (PNG required)
- Screenshot count recommendations
- Text length warnings
- Safe area guidance

## License

MIT
