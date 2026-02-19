import { BackgroundConfig, ScreenshotConfig, TextConfig, Template, EffectsConfig, IsometricPreset } from '@/types';

export interface GradientPreset {
  name: string;
  angle: number;
  colors: string[];
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  { name: 'Purple Dream', angle: 135, colors: ['#667eea', '#764ba2'] },
  { name: 'Ocean', angle: 135, colors: ['#2193b0', '#6dd5ed'] },
  { name: 'Sunset', angle: 135, colors: ['#ff512f', '#dd2476'] },
  { name: 'Forest', angle: 135, colors: ['#134e5e', '#71b280'] },
  { name: 'Aurora', angle: 180, colors: ['#00c9ff', '#92fe9d'] },
  { name: 'Violet', angle: 135, colors: ['#8e2de2', '#4a00e0'] },
  { name: 'Teal', angle: 135, colors: ['#0093e9', '#80d0c7'] },
  { name: 'Coral', angle: 135, colors: ['#ff9966', '#ff5e62'] },
  { name: 'Mint', angle: 135, colors: ['#a8edea', '#fed6e3'] },
  { name: 'Electric', angle: 135, colors: ['#4776e6', '#8e54e9'] },
];

export interface PositionPreset {
  name: string;
  icon: string;
  scale: number;
  x: number;
  y: number;
  rotation: number;
}

export const POSITION_PRESETS: PositionPreset[] = [
  { name: 'Centered', icon: '⊡', scale: 70, x: 50, y: 50, rotation: 0 },
  { name: 'Float', icon: '◇', scale: 55, x: 50, y: 50, rotation: 0 },
  { name: 'Bleed Bottom', icon: '▽', scale: 85, x: 50, y: 65, rotation: 0 },
  { name: 'Bleed Top', icon: '△', scale: 85, x: 50, y: 35, rotation: 0 },
  { name: 'Tilt Left', icon: '◁', scale: 65, x: 48, y: 55, rotation: -12 },
  { name: 'Tilt Right', icon: '▷', scale: 65, x: 52, y: 55, rotation: 12 },
  { name: 'Hero', icon: '▣', scale: 90, x: 50, y: 55, rotation: 0 },
  { name: 'Offset', icon: '◲', scale: 65, x: 55, y: 55, rotation: 5 },
];

// ═══════════════════════════════════════
// ─── Isometric Presets ───
// ═══════════════════════════════════════

export const ISOMETRIC_PRESETS: IsometricPreset[] = [
  {
    id: 'front',
    name: 'Front',
    transform: { a: 1, b: 0, c: 0, d: 1 },
    edgeDirection: 'none',
    edgeThickness: 0,
  },
  {
    id: 'tilt-left',
    name: 'Tilt Left',
    transform: { a: 0.97, b: -0.15, c: 0, d: 1 },
    edgeDirection: 'right',
    edgeThickness: 0.035,
  },
  {
    id: 'tilt-right',
    name: 'Tilt Right',
    transform: { a: 0.97, b: 0.15, c: 0, d: 1 },
    edgeDirection: 'left',
    edgeThickness: 0.035,
  },
  {
    id: 'iso-left',
    name: 'Iso Left',
    transform: { a: 0.9, b: -0.32, c: 0, d: 0.97 },
    edgeDirection: 'right',
    edgeThickness: 0.065,
  },
  {
    id: 'iso-right',
    name: 'Iso Right',
    transform: { a: 0.9, b: 0.32, c: 0, d: 0.97 },
    edgeDirection: 'left',
    edgeThickness: 0.065,
  },
  {
    id: '3q-left',
    name: '3/4 Left',
    transform: { a: 0.84, b: -0.38, c: 0.1, d: 0.95 },
    edgeDirection: 'right',
    edgeThickness: 0.085,
  },
  {
    id: '3q-right',
    name: '3/4 Right',
    transform: { a: 0.84, b: 0.38, c: -0.1, d: 0.95 },
    edgeDirection: 'left',
    edgeThickness: 0.085,
  },
  {
    id: 'dramatic-left',
    name: 'Drama L',
    transform: { a: 0.76, b: -0.5, c: 0.12, d: 0.92 },
    edgeDirection: 'right',
    edgeThickness: 0.11,
  },
  {
    id: 'dramatic-right',
    name: 'Drama R',
    transform: { a: 0.76, b: 0.5, c: -0.12, d: 0.92 },
    edgeDirection: 'left',
    edgeThickness: 0.11,
  },
  {
    id: 'lay-left',
    name: 'Lay Left',
    transform: { a: 0.95, b: -0.18, c: 0.32, d: 0.72 },
    edgeDirection: 'right',
    edgeThickness: 0.04,
  },
  {
    id: 'lay-right',
    name: 'Lay Right',
    transform: { a: 0.95, b: 0.18, c: -0.32, d: 0.72 },
    edgeDirection: 'left',
    edgeThickness: 0.04,
  },
  {
    id: 'float',
    name: 'Float',
    transform: { a: 0.95, b: 0, c: 0.1, d: 0.9 },
    edgeDirection: 'none',
    edgeThickness: 0,
  },
];

export const FRAME_COLORS = [
  { id: 'black', name: 'Black', color: '#1a1a1a' },
  { id: 'silver', name: 'Silver', color: '#c0c0c0' },
  { id: 'gold', name: 'Gold', color: '#e2c49e' },
  { id: 'blue', name: 'Blue Titanium', color: '#394867' },
  { id: 'white', name: 'White', color: '#f5f0e8' },
];

// ═══════════════════════════════════════
// ─── Defaults ───
// ═══════════════════════════════════════

export const DEFAULT_EFFECTS: EffectsConfig = {
  glow: { enabled: false, color: '#3b82f6', intensity: 50, spread: 20 },
  reflection: { enabled: false, opacity: 30, offset: 20, fade: 50 },
  perspective: { rotateX: 0, rotateY: 0 },
};

export const DEFAULT_BACKGROUND: BackgroundConfig = {
  type: 'gradient',
  solid: '#ffffff',
  gradient: {
    angle: 135,
    stops: [
      { color: '#667eea', position: 0 },
      { color: '#764ba2', position: 100 },
    ],
  },
  image: null,
  imageFit: 'cover',
  imageBlur: 0,
  overlayColor: '#000000',
  overlayOpacity: 0,
  noise: false,
  noiseIntensity: 15,
};

export const DEFAULT_SCREENSHOT: ScreenshotConfig = {
  scale: 82,
  x: 50,
  y: 55,
  cornerRadius: 24,
  rotation: 0,
  shadow: {
    enabled: true,
    color: '#000000',
    blur: 60,
    opacity: 25,
    x: 0,
    y: 30,
  },
  border: {
    enabled: false,
    color: '#e2e5e9',
    width: 4,
    opacity: 100,
  },
  effects: DEFAULT_EFFECTS,
  deviceFrame: {
    enabled: true,
    presetId: 'front',
    frameColor: '#1a1a1a',
  },
};

export const DEFAULT_TEXT: TextConfig = {
  headlineEnabled: true,
  headline: 'Your Amazing App',
  headlineFont: 'Inter',
  headlineSize: 80,
  headlineWeight: '700',
  headlineColor: '#ffffff',
  headlinePosition: 'top',
  headlineOffsetY: 8,
  lineHeight: 120,

  subheadlineEnabled: true,
  subheadline: 'Describe your app in one line',
  subheadlineFont: 'Inter',
  subheadlineSize: 40,
  subheadlineWeight: '400',
  subheadlineColor: '#ffffff',
  subheadlineOpacity: 70,
  subheadlineOffsetY: 0,
};

export const FONT_OPTIONS = [
  { value: 'DM Sans', label: 'DM Sans' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Space Grotesk', label: 'Space Grotesk' },
  { value: 'system', label: 'System Font' },
];

export const WEIGHT_OPTIONS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semibold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
  { value: '900', label: 'Black' },
];

// ═══════════════════════════════════════
// ─── Templates ───
// ═══════════════════════════════════════

const df = (presetId = 'front', enabled = true): ScreenshotConfig['deviceFrame'] => ({
  enabled,
  presetId,
  frameColor: '#1a1a1a',
});

const effects = (overrides?: Partial<EffectsConfig>): EffectsConfig => ({
  ...DEFAULT_EFFECTS,
  ...overrides,
});

export const TEMPLATES: Template[] = [
  {
    id: 'clean-white',
    name: 'Clean White',
    category: 'minimal',
    tags: ['light', 'clean'],
    background: {
      type: 'solid', solid: '#ffffff',
      gradient: { angle: 135, stops: [{ color: '#fff', position: 0 }, { color: '#fff', position: 100 }] },
      image: null, imageFit: 'cover', imageBlur: 0,
      overlayColor: '#000000', overlayOpacity: 0,
      noise: false, noiseIntensity: 10,
    },
    screenshot: {
      scale: 68, x: 50, y: 55, cornerRadius: 24, rotation: 0,
      shadow: { enabled: true, color: '#000000', blur: 40, opacity: 15, x: 0, y: 20 },
      border: { enabled: false, color: '#e2e5e9', width: 4, opacity: 100 },
      effects: effects(), deviceFrame: df('front'),
    },
    text: {
      headlineEnabled: true, headline: 'Your Amazing App',
      headlineFont: 'Inter', headlineSize: 80, headlineWeight: '700', headlineColor: '#1a1a1a',
      headlinePosition: 'top', headlineOffsetY: 8, lineHeight: 120,
      subheadlineEnabled: true, subheadline: 'Simple and beautiful',
      subheadlineFont: 'Inter', subheadlineSize: 38, subheadlineWeight: '400',
      subheadlineColor: '#666666', subheadlineOpacity: 100, subheadlineOffsetY: 0,
    },
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    category: 'minimal',
    tags: ['dark', 'modern'],
    background: {
      type: 'solid', solid: '#0a0a0a',
      gradient: { angle: 135, stops: [{ color: '#000', position: 0 }, { color: '#000', position: 100 }] },
      image: null, imageFit: 'cover', imageBlur: 0,
      overlayColor: '#000000', overlayOpacity: 0,
      noise: true, noiseIntensity: 8,
    },
    screenshot: {
      scale: 65, x: 50, y: 55, cornerRadius: 20, rotation: 0,
      shadow: { enabled: true, color: '#000000', blur: 80, opacity: 60, x: 0, y: 40 },
      border: { enabled: false, color: '#333', width: 4, opacity: 100 },
      effects: effects(), deviceFrame: df('front'),
    },
    text: {
      headlineEnabled: true, headline: 'Clean & Simple',
      headlineFont: 'Inter', headlineSize: 72, headlineWeight: '700', headlineColor: '#ffffff',
      headlinePosition: 'top', headlineOffsetY: 8, lineHeight: 120,
      subheadlineEnabled: true, subheadline: 'Minimalist design at its best',
      subheadlineFont: 'Inter', subheadlineSize: 36, subheadlineWeight: '400',
      subheadlineColor: '#888888', subheadlineOpacity: 100, subheadlineOffsetY: 0,
    },
  },
  {
    id: 'vivid-gradient',
    name: 'Vivid Gradient',
    category: 'gradient',
    tags: ['purple', 'vibrant'],
    background: {
      type: 'gradient', solid: '#1a1a2e',
      gradient: { angle: 135, stops: [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }] },
      image: null, imageFit: 'cover', imageBlur: 0,
      overlayColor: '#000000', overlayOpacity: 0,
      noise: true, noiseIntensity: 12,
    },
    screenshot: {
      scale: 70, x: 50, y: 55, cornerRadius: 24, rotation: 0,
      shadow: { enabled: true, color: '#000000', blur: 60, opacity: 40, x: 0, y: 30 },
      border: { enabled: false, color: '#333', width: 4, opacity: 100 },
      effects: effects(), deviceFrame: df('iso-left'),
    },
    text: {
      headlineEnabled: true, headline: 'Your Amazing App',
      headlineFont: 'Inter', headlineSize: 80, headlineWeight: '700', headlineColor: '#ffffff',
      headlinePosition: 'top', headlineOffsetY: 8, lineHeight: 120,
      subheadlineEnabled: true, subheadline: 'Built for perfection',
      subheadlineFont: 'Inter', subheadlineSize: 40, subheadlineWeight: '400',
      subheadlineColor: '#ffffff', subheadlineOpacity: 70, subheadlineOffsetY: 0,
    },
  },
  {
    id: 'soft-pastel',
    name: 'Soft Pastel',
    category: 'gradient',
    tags: ['pastel', 'pink'],
    background: {
      type: 'gradient', solid: '#fce7f3',
      gradient: { angle: 180, stops: [{ color: '#fce7f3', position: 0 }, { color: '#ddd6fe', position: 50 }, { color: '#bfdbfe', position: 100 }] },
      image: null, imageFit: 'cover', imageBlur: 0,
      overlayColor: '#000000', overlayOpacity: 0,
      noise: false, noiseIntensity: 10,
    },
    screenshot: {
      scale: 68, x: 50, y: 55, cornerRadius: 24, rotation: 0,
      shadow: { enabled: true, color: '#8b5cf6', blur: 50, opacity: 20, x: 0, y: 20 },
      border: { enabled: false, color: '#333', width: 4, opacity: 100 },
      effects: effects(), deviceFrame: df('tilt-right'),
    },
    text: {
      headlineEnabled: true, headline: 'Beautifully Crafted',
      headlineFont: 'Inter', headlineSize: 76, headlineWeight: '700', headlineColor: '#7c3aed',
      headlinePosition: 'top', headlineOffsetY: 8, lineHeight: 120,
      subheadlineEnabled: true, subheadline: 'Designed with care',
      subheadlineFont: 'Inter', subheadlineSize: 36, subheadlineWeight: '400',
      subheadlineColor: '#8b5cf6', subheadlineOpacity: 70, subheadlineOffsetY: 0,
    },
  },
  {
    id: 'bold-gradient',
    name: 'Bold Gradient',
    category: 'bold',
    tags: ['pink', 'bold'],
    background: {
      type: 'gradient', solid: '#ec4899',
      gradient: { angle: 135, stops: [{ color: '#ec4899', position: 0 }, { color: '#8b5cf6', position: 100 }] },
      image: null, imageFit: 'cover', imageBlur: 0,
      overlayColor: '#000000', overlayOpacity: 0,
      noise: false, noiseIntensity: 10,
    },
    screenshot: {
      scale: 75, x: 50, y: 60, cornerRadius: 28, rotation: 0,
      shadow: { enabled: true, color: '#000000', blur: 50, opacity: 30, x: 0, y: 20 },
      border: { enabled: false, color: '#333', width: 4, opacity: 100 },
      effects: effects(), deviceFrame: df('3q-left'),
    },
    text: {
      headlineEnabled: true, headline: 'Stand Out',
      headlineFont: 'Inter', headlineSize: 88, headlineWeight: '800', headlineColor: '#ffffff',
      headlinePosition: 'top', headlineOffsetY: 6, lineHeight: 110,
      subheadlineEnabled: true, subheadline: 'Be bold, be you',
      subheadlineFont: 'Inter', subheadlineSize: 38, subheadlineWeight: '400',
      subheadlineColor: '#ffffff', subheadlineOpacity: 85, subheadlineOffsetY: 0,
    },
  },
  {
    id: 'ocean-deep',
    name: 'Ocean Deep',
    category: 'gradient',
    tags: ['teal', 'dark'],
    background: {
      type: 'gradient', solid: '#0f2027',
      gradient: { angle: 180, stops: [{ color: '#0f2027', position: 0 }, { color: '#203a43', position: 50 }, { color: '#2c5364', position: 100 }] },
      image: null, imageFit: 'cover', imageBlur: 0,
      overlayColor: '#000000', overlayOpacity: 0,
      noise: true, noiseIntensity: 8,
    },
    screenshot: {
      scale: 65, x: 50, y: 55, cornerRadius: 20, rotation: 0,
      shadow: { enabled: true, color: '#000000', blur: 70, opacity: 50, x: 0, y: 35 },
      border: { enabled: false, color: '#333', width: 4, opacity: 100 },
      effects: effects(), deviceFrame: df('iso-right'),
    },
    text: {
      headlineEnabled: true, headline: 'Dive Deep',
      headlineFont: 'Inter', headlineSize: 76, headlineWeight: '700', headlineColor: '#6dd5ed',
      headlinePosition: 'top', headlineOffsetY: 7, lineHeight: 120,
      subheadlineEnabled: true, subheadline: 'Explore the possibilities',
      subheadlineFont: 'Inter', subheadlineSize: 36, subheadlineWeight: '400',
      subheadlineColor: '#a0d2e0', subheadlineOpacity: 80, subheadlineOffsetY: 0,
    },
  },
  {
    id: 'isometric-showcase',
    name: 'Iso Showcase',
    category: 'device',
    tags: ['isometric', '3d'],
    background: {
      type: 'gradient', solid: '#312e81',
      gradient: { angle: 135, stops: [{ color: '#312e81', position: 0 }, { color: '#4338ca', position: 100 }] },
      image: null, imageFit: 'cover', imageBlur: 0,
      overlayColor: '#000000', overlayOpacity: 0,
      noise: true, noiseIntensity: 10,
    },
    screenshot: {
      scale: 75, x: 50, y: 55, cornerRadius: 24, rotation: 0,
      shadow: { enabled: true, color: '#000000', blur: 60, opacity: 40, x: 0, y: 30 },
      border: { enabled: false, color: '#333', width: 4, opacity: 100 },
      effects: effects(), deviceFrame: df('dramatic-left'),
    },
    text: {
      headlineEnabled: true, headline: 'App Preview',
      headlineFont: 'Inter', headlineSize: 76, headlineWeight: '700', headlineColor: '#ffffff',
      headlinePosition: 'top', headlineOffsetY: 5, lineHeight: 120,
      subheadlineEnabled: true, subheadline: 'See it in action',
      subheadlineFont: 'Inter', subheadlineSize: 36, subheadlineWeight: '400',
      subheadlineColor: '#c7d2fe', subheadlineOpacity: 80, subheadlineOffsetY: 0,
    },
  },
  {
    id: 'floating-device',
    name: 'Float Device',
    category: 'device',
    tags: ['float', 'light'],
    background: {
      type: 'solid', solid: '#f8fafc',
      gradient: { angle: 135, stops: [{ color: '#f8fafc', position: 0 }, { color: '#f8fafc', position: 100 }] },
      image: null, imageFit: 'cover', imageBlur: 0,
      overlayColor: '#000000', overlayOpacity: 0,
      noise: false, noiseIntensity: 10,
    },
    screenshot: {
      scale: 65, x: 50, y: 55, cornerRadius: 24, rotation: 0,
      shadow: { enabled: true, color: '#000000', blur: 50, opacity: 20, x: 0, y: 25 },
      border: { enabled: false, color: '#333', width: 4, opacity: 100 },
      effects: effects(), deviceFrame: df('float'),
    },
    text: {
      headlineEnabled: true, headline: 'Your App Name',
      headlineFont: 'Inter', headlineSize: 72, headlineWeight: '700', headlineColor: '#1a1a2e',
      headlinePosition: 'top', headlineOffsetY: 6, lineHeight: 120,
      subheadlineEnabled: true, subheadline: 'Available on the App Store',
      subheadlineFont: 'Inter', subheadlineSize: 34, subheadlineWeight: '400',
      subheadlineColor: '#6b7280', subheadlineOpacity: 100, subheadlineOffsetY: 0,
    },
  },
];
