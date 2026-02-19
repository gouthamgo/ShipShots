export interface GradientStop {
  color: string;
  position: number;
}

export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'image';
  solid: string;
  gradient: {
    angle: number;
    stops: GradientStop[];
  };
  image: string | null;
  imageFit: 'cover' | 'contain' | 'stretch';
  imageBlur: number;
  overlayColor: string;
  overlayOpacity: number;
  noise: boolean;
  noiseIntensity: number;
}

export interface ShadowConfig {
  enabled: boolean;
  color: string;
  blur: number;
  opacity: number;
  x: number;
  y: number;
}

export interface BorderConfig {
  enabled: boolean;
  color: string;
  width: number;
  opacity: number;
}

export interface EffectsConfig {
  glow: {
    enabled: boolean;
    color: string;
    intensity: number;
    spread: number;
  };
  reflection: {
    enabled: boolean;
    opacity: number;
    offset: number;
    fade: number;
  };
  perspective: {
    rotateX: number;
    rotateY: number;
  };
}

export interface DeviceFrameConfig {
  enabled: boolean;
  presetId: string;
  frameColor: string;
}

export interface ScreenshotConfig {
  scale: number;
  x: number;
  y: number;
  cornerRadius: number;
  rotation: number;
  shadow: ShadowConfig;
  border: BorderConfig;
  effects: EffectsConfig;
  deviceFrame: DeviceFrameConfig;
}

export interface TextConfig {
  headlineEnabled: boolean;
  headline: string;
  headlineFont: string;
  headlineSize: number;
  headlineWeight: string;
  headlineColor: string;
  headlinePosition: 'top' | 'bottom';
  headlineOffsetY: number;
  lineHeight: number;

  subheadlineEnabled: boolean;
  subheadline: string;
  subheadlineFont: string;
  subheadlineSize: number;
  subheadlineWeight: string;
  subheadlineColor: string;
  subheadlineOpacity: number;
  subheadlineOffsetY: number;
}

export interface Screenshot {
  id: string;
  imageId: string;
  imageData?: string;
  background: BackgroundConfig;
  screenshot: ScreenshotConfig;
  text: TextConfig;
}

export interface DeviceSize {
  id: string;
  name: string;
  width: number;
  height: number;
  category: string;
}

export const DEVICE_SIZES: DeviceSize[] = [
  { id: 'iphone-6.9', name: 'iPhone 16/17 Pro Max (1320×2868)', width: 1320, height: 2868, category: 'iPhone 6.9"' },
  { id: 'iphone-6.9-1290', name: 'iPhone 16/17 6.9" (1290×2796)', width: 1290, height: 2796, category: 'iPhone 6.9"' },
  { id: 'iphone-6.9-1260', name: 'iPhone 17 6.9" (1260×2736)', width: 1260, height: 2736, category: 'iPhone 6.9"' },
  { id: 'iphone-6.3-1206', name: 'iPhone 16/17 Pro (1206×2622)', width: 1206, height: 2622, category: 'iPhone 6.3"' },
  { id: 'iphone-6.3-1179', name: 'iPhone 16/17 (1179×2556)', width: 1179, height: 2556, category: 'iPhone 6.3"' },
];

export interface IsometricPreset {
  id: string;
  name: string;
  transform: { a: number; b: number; c: number; d: number };
  edgeDirection: 'left' | 'right' | 'none';
  edgeThickness: number;
}

export type TemplateCategory = 'all' | 'minimal' | 'gradient' | 'bold' | 'device';

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  tags: string[];
  thumbnail?: string;
  background: BackgroundConfig;
  screenshot: ScreenshotConfig;
  text: TextConfig;
}

export interface AppState {
  projectName: string;
  screenshots: Screenshot[];
  selectedIndex: number;
  outputDevice: string;

  defaults: {
    background: BackgroundConfig;
    screenshot: ScreenshotConfig;
    text: TextConfig;
  };
}
