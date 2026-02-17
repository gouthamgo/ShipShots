import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Screenshot, BackgroundConfig, ScreenshotConfig, TextConfig, Template, EffectsConfig, DeviceFrameConfig, DEVICE_SIZES } from '@/types';
import { DEFAULT_BACKGROUND, DEFAULT_SCREENSHOT, DEFAULT_TEXT, DEFAULT_EFFECTS } from '@/lib/presets';

interface AppStore extends AppState {
  addScreenshot: (imageData: string) => void;
  removeScreenshot: (id: string) => void;
  selectScreenshot: (index: number) => void;
  setOutputDevice: (deviceId: string) => void;
  updateBackground: (config: Partial<BackgroundConfig>) => void;
  updateScreenshot: (config: Partial<ScreenshotConfig>) => void;
  updateText: (config: Partial<TextConfig>) => void;
  updateShadow: (config: Partial<ScreenshotConfig['shadow']>) => void;
  updateBorder: (config: Partial<ScreenshotConfig['border']>) => void;
  updateEffects: (config: Partial<EffectsConfig>) => void;
  updateGlow: (config: Partial<EffectsConfig['glow']>) => void;
  updateReflection: (config: Partial<EffectsConfig['reflection']>) => void;
  updatePerspective: (config: Partial<EffectsConfig['perspective']>) => void;
  updateDeviceFrame: (config: Partial<DeviceFrameConfig>) => void;

  applyPositionPreset: (preset: { scale: number; x: number; y: number; rotation: number }) => void;
  applyGradientPreset: (stops: { color: string; position: number }[], angle: number) => void;
  applyTemplate: (template: Template) => void;
  applyToAll: () => void;
  reorderScreenshots: (fromIndex: number, toIndex: number) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      projectName: 'My Screenshots',
      screenshots: [],
      selectedIndex: 0,
      outputDevice: 'iphone-6.9',

      defaults: {
        background: DEFAULT_BACKGROUND,
        screenshot: DEFAULT_SCREENSHOT,
        text: DEFAULT_TEXT,
      },

      addScreenshot: (imageData: string) => {
        const { screenshots, defaults } = get();
        const seededScreenshot = structuredClone(defaults.screenshot);
        seededScreenshot.scale = Math.max(seededScreenshot.scale, 82);
        seededScreenshot.x = 50;
        seededScreenshot.y = Math.max(seededScreenshot.y, 55);
        seededScreenshot.rotation = 0;

        const newScreenshot: Screenshot = {
          id: generateId(),
          imageData,
          background: structuredClone(defaults.background),
          screenshot: {
            ...seededScreenshot,
            effects: structuredClone(DEFAULT_EFFECTS),
          },
          text: structuredClone(defaults.text),
        };
        set({
          screenshots: [...screenshots, newScreenshot],
          selectedIndex: screenshots.length,
        });
      },

      removeScreenshot: (id: string) => {
        const { screenshots, selectedIndex } = get();
        const newScreenshots = screenshots.filter(s => s.id !== id);
        const newIndex = Math.min(selectedIndex, newScreenshots.length - 1);
        set({
          screenshots: newScreenshots,
          selectedIndex: Math.max(0, newIndex),
        });
      },

      selectScreenshot: (index: number) => {
        set({ selectedIndex: index });
      },

      setOutputDevice: (deviceId: string) => {
        set({ outputDevice: deviceId });
      },

      updateBackground: (config: Partial<BackgroundConfig>) => {
        const { screenshots, selectedIndex } = get();
        if (screenshots.length === 0) return;
        const newScreenshots = [...screenshots];
        newScreenshots[selectedIndex] = {
          ...newScreenshots[selectedIndex],
          background: { ...newScreenshots[selectedIndex].background, ...config },
        };
        set({ screenshots: newScreenshots });
      },

      updateScreenshot: (config: Partial<ScreenshotConfig>) => {
        const { screenshots, selectedIndex } = get();
        if (screenshots.length === 0) return;
        const newScreenshots = [...screenshots];
        newScreenshots[selectedIndex] = {
          ...newScreenshots[selectedIndex],
          screenshot: { ...newScreenshots[selectedIndex].screenshot, ...config },
        };
        set({ screenshots: newScreenshots });
      },

      updateShadow: (config) => {
        const { screenshots, selectedIndex } = get();
        if (screenshots.length === 0) return;
        const newScreenshots = [...screenshots];
        newScreenshots[selectedIndex] = {
          ...newScreenshots[selectedIndex],
          screenshot: {
            ...newScreenshots[selectedIndex].screenshot,
            shadow: { ...newScreenshots[selectedIndex].screenshot.shadow, ...config },
          },
        };
        set({ screenshots: newScreenshots });
      },

      updateBorder: (config) => {
        const { screenshots, selectedIndex } = get();
        if (screenshots.length === 0) return;
        const newScreenshots = [...screenshots];
        newScreenshots[selectedIndex] = {
          ...newScreenshots[selectedIndex],
          screenshot: {
            ...newScreenshots[selectedIndex].screenshot,
            border: { ...newScreenshots[selectedIndex].screenshot.border, ...config },
          },
        };
        set({ screenshots: newScreenshots });
      },

      updateEffects: (config: Partial<EffectsConfig>) => {
        const { screenshots, selectedIndex } = get();
        if (screenshots.length === 0) return;
        const currentEffects = screenshots[selectedIndex].screenshot.effects || DEFAULT_EFFECTS;
        const newScreenshots = [...screenshots];
        newScreenshots[selectedIndex] = {
          ...newScreenshots[selectedIndex],
          screenshot: {
            ...newScreenshots[selectedIndex].screenshot,
            effects: { ...currentEffects, ...config },
          },
        };
        set({ screenshots: newScreenshots });
      },

      updateGlow: (config) => {
        const { screenshots, selectedIndex } = get();
        if (screenshots.length === 0) return;
        const currentEffects = screenshots[selectedIndex].screenshot.effects || DEFAULT_EFFECTS;
        const newScreenshots = [...screenshots];
        newScreenshots[selectedIndex] = {
          ...newScreenshots[selectedIndex],
          screenshot: {
            ...newScreenshots[selectedIndex].screenshot,
            effects: { ...currentEffects, glow: { ...currentEffects.glow, ...config } },
          },
        };
        set({ screenshots: newScreenshots });
      },

      updateReflection: (config) => {
        const { screenshots, selectedIndex } = get();
        if (screenshots.length === 0) return;
        const currentEffects = screenshots[selectedIndex].screenshot.effects || DEFAULT_EFFECTS;
        const newScreenshots = [...screenshots];
        newScreenshots[selectedIndex] = {
          ...newScreenshots[selectedIndex],
          screenshot: {
            ...newScreenshots[selectedIndex].screenshot,
            effects: { ...currentEffects, reflection: { ...currentEffects.reflection, ...config } },
          },
        };
        set({ screenshots: newScreenshots });
      },

      updatePerspective: (config) => {
        const { screenshots, selectedIndex } = get();
        if (screenshots.length === 0) return;
        const currentEffects = screenshots[selectedIndex].screenshot.effects || DEFAULT_EFFECTS;
        const newScreenshots = [...screenshots];
        newScreenshots[selectedIndex] = {
          ...newScreenshots[selectedIndex],
          screenshot: {
            ...newScreenshots[selectedIndex].screenshot,
            effects: { ...currentEffects, perspective: { ...currentEffects.perspective, ...config } },
          },
        };
        set({ screenshots: newScreenshots });
      },

      updateDeviceFrame: (config: Partial<DeviceFrameConfig>) => {
        const { screenshots, selectedIndex } = get();
        if (screenshots.length === 0) return;
        const existing = screenshots[selectedIndex].screenshot.deviceFrame;
        const currentFrame: DeviceFrameConfig = {
          enabled: existing?.enabled ?? true,
          presetId: existing?.presetId ?? 'front',
          frameColor: existing?.frameColor ?? '#1a1a1a',
        };
        const newScreenshots = [...screenshots];
        newScreenshots[selectedIndex] = {
          ...newScreenshots[selectedIndex],
          screenshot: {
            ...newScreenshots[selectedIndex].screenshot,
            deviceFrame: { ...currentFrame, ...config },
          },
        };
        set({ screenshots: newScreenshots });
      },

      updateText: (config: Partial<TextConfig>) => {
        const { screenshots, selectedIndex } = get();
        if (screenshots.length === 0) return;
        const newScreenshots = [...screenshots];
        newScreenshots[selectedIndex] = {
          ...newScreenshots[selectedIndex],
          text: { ...newScreenshots[selectedIndex].text, ...config },
        };
        set({ screenshots: newScreenshots });
      },

      applyPositionPreset: (preset) => {
        const { updateScreenshot } = get();
        updateScreenshot(preset);
      },

      applyGradientPreset: (stops, angle) => {
        const { updateBackground } = get();
        updateBackground({ type: 'gradient', gradient: { angle, stops } });
      },

      applyTemplate: (template: Template) => {
        const { screenshots, selectedIndex } = get();
        if (screenshots.length === 0) return;
        const newScreenshots = [...screenshots];
        newScreenshots[selectedIndex] = {
          ...newScreenshots[selectedIndex],
          background: structuredClone(template.background),
          screenshot: structuredClone(template.screenshot),
          text: structuredClone(template.text),
        };
        set({ screenshots: newScreenshots });
      },

      applyToAll: () => {
        const { screenshots, selectedIndex } = get();
        if (screenshots.length === 0) return;
        const source = screenshots[selectedIndex];
        const newScreenshots = screenshots.map(s => ({
          ...s,
          background: structuredClone(source.background),
          screenshot: structuredClone(source.screenshot),
          text: structuredClone(source.text),
        }));
        set({ screenshots: newScreenshots });
      },

      reorderScreenshots: (fromIndex: number, toIndex: number) => {
        const { screenshots, selectedIndex } = get();
        const newScreenshots = [...screenshots];
        const [moved] = newScreenshots.splice(fromIndex, 1);
        newScreenshots.splice(toIndex, 0, moved);
        let newSelected = selectedIndex;
        if (selectedIndex === fromIndex) newSelected = toIndex;
        else if (fromIndex < selectedIndex && toIndex >= selectedIndex) newSelected--;
        else if (fromIndex > selectedIndex && toIndex <= selectedIndex) newSelected++;
        set({ screenshots: newScreenshots, selectedIndex: newSelected });
      },
    }),
    {
      name: 'screenforge-storage-v2',
      version: 3,
      migrate: (persistedState: unknown) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return persistedState;
        }

        const state = persistedState as AppState;
        if (Array.isArray(state.screenshots)) {
          state.screenshots = state.screenshots.map((shot) => {
            const nextShot = structuredClone(shot);
            if (nextShot.screenshot.deviceFrame?.enabled !== false && nextShot.screenshot.scale < 60) {
              nextShot.screenshot.scale = 82;
              nextShot.screenshot.x = 50;
              nextShot.screenshot.y = Math.max(nextShot.screenshot.y, 55);
            }
            return nextShot;
          });
        }

        if (state.defaults?.screenshot && state.defaults.screenshot.scale < 82) {
          state.defaults.screenshot.scale = 82;
          state.defaults.screenshot.x = 50;
          state.defaults.screenshot.y = Math.max(state.defaults.screenshot.y, 55);
        }

        if (!DEVICE_SIZES.some((d) => d.id === state.outputDevice)) {
          state.outputDevice = DEVICE_SIZES[0].id;
        }

        return state;
      },
    }
  )
);
