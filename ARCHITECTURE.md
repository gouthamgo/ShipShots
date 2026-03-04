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
screenforge/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx       # Root layout with providers
│   │   ├── page.tsx         # Main editor page
│   │   └── globals.css      # Global styles + CSS variables
│   ├── components/          # React components
│   │   ├── AppHeader.tsx   # Top header with device selector
│   │   ├── WorkflowBar.tsx  # Bottom workflow progress
│   │   ├── AssetRail.tsx    # Left sidebar for screenshots
│   │   ├── CanvasStage.tsx  # Main canvas editing area
│   │   ├── ControlPanel.tsx # Right panel for style controls
│   │   ├── EffectsPanel.tsx # Effects tab controls
│   │   └── ui/              # Reusable UI components
│   ├── stores/              # Zustand state stores
│   │   └── app-store.ts     # Main application state
│   ├── lib/                 # Utility functions
│   │   ├── canvas.ts        # Canvas rendering logic
│   │   └── storage/         # IndexedDB storage helpers
│   └── types/               # TypeScript type definitions
│       └── index.ts         # Shared types
├── public/                  # Static assets
│   └── screenshot.png       # README screenshot
└── package.json
```
