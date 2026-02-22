import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AppState,
  BackgroundConfig,
  DeviceFrameConfig,
  DEVICE_SIZES,
  EffectsConfig,
  Screenshot,
  ScreenshotConfig,
  Template,
  TextConfig,
} from '@/types';

// ─── History ───
type HistoryEntry = Pick<Screenshot, 'id' | 'background' | 'screenshot' | 'text'>[];
const undoStack: HistoryEntry[] = [];
const redoStack: HistoryEntry[] = [];
const MAX_HISTORY = 50;
import {
  DEFAULT_BACKGROUND,
  DEFAULT_EFFECTS,
  DEFAULT_SCREENSHOT,
  DEFAULT_TEXT,
} from '@/lib/presets';
import {
  deleteScreenshotImage,
  saveScreenshotImage,
} from '@/lib/storage/image-store';

export interface AppStore extends AppState {
  canUndo: boolean;
  canRedo: boolean;
  addScreenshot: (imageData: string) => void;
  hydrateScreenshotImage: (id: string, imageData: string) => void;
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
  applyPositionPreset: (preset: {
    scale: number;
    x: number;
    y: number;
    rotation: number;
  }) => void;
  applyGradientPreset: (
    stops: { color: string; position: number }[],
    angle: number
  ) => void;
  applyTemplate: (template: Template) => void;
  applyToAll: () => void;
  reorderScreenshots: (fromIndex: number, toIndex: number) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
};

const withDefaultEffects = (effects?: EffectsConfig): EffectsConfig => ({
  ...DEFAULT_EFFECTS,
  ...effects,
  glow: { ...DEFAULT_EFFECTS.glow, ...effects?.glow },
  reflection: { ...DEFAULT_EFFECTS.reflection, ...effects?.reflection },
  perspective: { ...DEFAULT_EFFECTS.perspective, ...effects?.perspective },
});

const withDefaultDeviceFrame = (
  frame?: Partial<DeviceFrameConfig>
): DeviceFrameConfig => ({
  enabled: frame?.enabled ?? true,
  presetId: frame?.presetId ?? 'front',
  frameColor: frame?.frameColor ?? '#1a1a1a',
});

export function migratePersistedState(persistedState: unknown) {
  if (!persistedState || typeof persistedState !== 'object') {
    return persistedState;
  }

  const state = structuredClone(persistedState) as Partial<AppState>;
  if (Array.isArray(state.screenshots)) {
    state.screenshots = state.screenshots.map((shot) => {
      const nextShot = structuredClone(shot);

      nextShot.imageId = nextShot.imageId || nextShot.id;
      nextShot.screenshot.effects = withDefaultEffects(nextShot.screenshot.effects);
      nextShot.screenshot.deviceFrame = withDefaultDeviceFrame(
        nextShot.screenshot.deviceFrame
      );

      if (
        nextShot.screenshot.deviceFrame.enabled !== false &&
        nextShot.screenshot.scale < 60
      ) {
        nextShot.screenshot.scale = 82;
        nextShot.screenshot.x = 50;
        nextShot.screenshot.y = Math.max(nextShot.screenshot.y, 55);
      }

      return nextShot;
    });
  }

  if (state.defaults?.screenshot) {
    state.defaults.screenshot.effects = withDefaultEffects(
      state.defaults.screenshot.effects
    );
    state.defaults.screenshot.deviceFrame = withDefaultDeviceFrame(
      state.defaults.screenshot.deviceFrame
    );
    if (state.defaults.screenshot.scale < 82) {
      state.defaults.screenshot.scale = 82;
      state.defaults.screenshot.x = 50;
      state.defaults.screenshot.y = Math.max(state.defaults.screenshot.y, 55);
    }
  }

  if (!state.defaults) {
    state.defaults = {
      background: structuredClone(DEFAULT_BACKGROUND),
      screenshot: structuredClone(DEFAULT_SCREENSHOT),
      text: structuredClone(DEFAULT_TEXT),
    };
  }

  if (!DEVICE_SIZES.some((device) => device.id === state.outputDevice)) {
    state.outputDevice = DEVICE_SIZES[0].id;
  }

  if (typeof state.selectedIndex !== 'number' || state.selectedIndex < 0) {
    state.selectedIndex = 0;
  }

  return state;
}

function updateSelectedScreenshot(
  screenshots: Screenshot[],
  selectedIndex: number,
  updater: (shot: Screenshot) => Screenshot
): Screenshot[] {
  if (!screenshots[selectedIndex]) return screenshots;
  const next = [...screenshots];
  next[selectedIndex] = updater(next[selectedIndex]);
  return next;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      projectName: 'My Screenshots',
      screenshots: [],
      selectedIndex: 0,
      outputDevice: 'iphone-6.9',
      canUndo: false,
      canRedo: false,
      defaults: {
        background: structuredClone(DEFAULT_BACKGROUND),
        screenshot: structuredClone(DEFAULT_SCREENSHOT),
        text: structuredClone(DEFAULT_TEXT),
      },

      addScreenshot: (imageData: string) => {
        const { screenshots, defaults } = get();
        const id = generateId();
        const seededScreenshot = structuredClone(defaults.screenshot);
        seededScreenshot.scale = Math.max(seededScreenshot.scale, 82);
        seededScreenshot.x = 50;
        seededScreenshot.y = Math.max(seededScreenshot.y, 55);
        seededScreenshot.rotation = 0;

        const newScreenshot: Screenshot = {
          id,
          imageId: id,
          imageData,
          background: structuredClone(defaults.background),
          screenshot: {
            ...seededScreenshot,
            effects: withDefaultEffects(seededScreenshot.effects),
            deviceFrame: withDefaultDeviceFrame(seededScreenshot.deviceFrame),
          },
          text: structuredClone(defaults.text),
        };

        set({
          screenshots: [...screenshots, newScreenshot],
          selectedIndex: screenshots.length,
        });

        void saveScreenshotImage(id, imageData);
      },

      hydrateScreenshotImage: (id: string, imageData: string) => {
        const { screenshots } = get();
        const index = screenshots.findIndex((shot) => shot.id === id);
        if (index < 0) return;
        if (screenshots[index].imageData === imageData) return;

        const next = [...screenshots];
        next[index] = { ...next[index], imageData };
        set({ screenshots: next });
      },

      removeScreenshot: (id: string) => {
        const { screenshots, selectedIndex } = get();
        const nextScreenshots = screenshots.filter((shot) => shot.id !== id);
        const nextIndex = Math.min(selectedIndex, nextScreenshots.length - 1);
        set({
          screenshots: nextScreenshots,
          selectedIndex: Math.max(0, nextIndex),
        });
        void deleteScreenshotImage(id);
      },

      selectScreenshot: (index: number) => set({ selectedIndex: index }),
      setOutputDevice: (deviceId: string) => set({ outputDevice: deviceId }),

      updateBackground: (config) => {
        const { screenshots, selectedIndex } = get();
        if (!screenshots.length) return;
        set({
          screenshots: updateSelectedScreenshot(screenshots, selectedIndex, (shot) => ({
            ...shot,
            background: { ...shot.background, ...config },
          })),
        });
      },

      updateScreenshot: (config) => {
        const { screenshots, selectedIndex } = get();
        if (!screenshots.length) return;
        set({
          screenshots: updateSelectedScreenshot(screenshots, selectedIndex, (shot) => ({
            ...shot,
            screenshot: { ...shot.screenshot, ...config },
          })),
        });
      },

      updateShadow: (config) => {
        const { screenshots, selectedIndex } = get();
        if (!screenshots.length) return;
        set({
          screenshots: updateSelectedScreenshot(screenshots, selectedIndex, (shot) => ({
            ...shot,
            screenshot: {
              ...shot.screenshot,
              shadow: { ...shot.screenshot.shadow, ...config },
            },
          })),
        });
      },

      updateBorder: (config) => {
        const { screenshots, selectedIndex } = get();
        if (!screenshots.length) return;
        set({
          screenshots: updateSelectedScreenshot(screenshots, selectedIndex, (shot) => ({
            ...shot,
            screenshot: {
              ...shot.screenshot,
              border: { ...shot.screenshot.border, ...config },
            },
          })),
        });
      },

      updateEffects: (config) => {
        const { screenshots, selectedIndex } = get();
        if (!screenshots.length) return;
        set({
          screenshots: updateSelectedScreenshot(screenshots, selectedIndex, (shot) => ({
            ...shot,
            screenshot: {
              ...shot.screenshot,
              effects: {
                ...withDefaultEffects(shot.screenshot.effects),
                ...config,
              },
            },
          })),
        });
      },

      updateGlow: (config) => {
        const { screenshots, selectedIndex } = get();
        if (!screenshots.length) return;
        set({
          screenshots: updateSelectedScreenshot(screenshots, selectedIndex, (shot) => {
            const effects = withDefaultEffects(shot.screenshot.effects);
            return {
              ...shot,
              screenshot: {
                ...shot.screenshot,
                effects: { ...effects, glow: { ...effects.glow, ...config } },
              },
            };
          }),
        });
      },

      updateReflection: (config) => {
        const { screenshots, selectedIndex } = get();
        if (!screenshots.length) return;
        set({
          screenshots: updateSelectedScreenshot(screenshots, selectedIndex, (shot) => {
            const effects = withDefaultEffects(shot.screenshot.effects);
            return {
              ...shot,
              screenshot: {
                ...shot.screenshot,
                effects: {
                  ...effects,
                  reflection: { ...effects.reflection, ...config },
                },
              },
            };
          }),
        });
      },

      updatePerspective: (config) => {
        const { screenshots, selectedIndex } = get();
        if (!screenshots.length) return;
        set({
          screenshots: updateSelectedScreenshot(screenshots, selectedIndex, (shot) => {
            const effects = withDefaultEffects(shot.screenshot.effects);
            return {
              ...shot,
              screenshot: {
                ...shot.screenshot,
                effects: {
                  ...effects,
                  perspective: { ...effects.perspective, ...config },
                },
              },
            };
          }),
        });
      },

      updateDeviceFrame: (config) => {
        const { screenshots, selectedIndex } = get();
        if (!screenshots.length) return;
        get().pushHistory();
        set({
          screenshots: updateSelectedScreenshot(screenshots, selectedIndex, (shot) => ({
            ...shot,
            screenshot: {
              ...shot.screenshot,
              deviceFrame: withDefaultDeviceFrame({
                ...shot.screenshot.deviceFrame,
                ...config,
              }),
            },
          })),
        });
      },

      updateText: (config) => {
        const { screenshots, selectedIndex } = get();
        if (!screenshots.length) return;
        set({
          screenshots: updateSelectedScreenshot(screenshots, selectedIndex, (shot) => ({
            ...shot,
            text: { ...shot.text, ...config },
          })),
        });
      },

      pushHistory: () => {
        const { screenshots } = get();
        const entry: HistoryEntry = screenshots.map(({ id, background, screenshot, text }) => ({
          id, background, screenshot, text,
        }));
        undoStack.push(entry);
        if (undoStack.length > MAX_HISTORY) undoStack.shift();
        redoStack.length = 0;
        set({ canUndo: true, canRedo: false });
      },

      undo: () => {
        if (!undoStack.length) return;
        const { screenshots } = get();
        const current: HistoryEntry = screenshots.map(({ id, background, screenshot, text }) => ({
          id, background, screenshot, text,
        }));
        redoStack.push(current);
        const entry = undoStack.pop()!;
        const next = screenshots.map((shot) => {
          const saved = entry.find((e) => e.id === shot.id);
          if (!saved) return shot;
          return { ...shot, background: saved.background, screenshot: saved.screenshot, text: saved.text };
        });
        set({ screenshots: next, canUndo: undoStack.length > 0, canRedo: true });
      },

      redo: () => {
        if (!redoStack.length) return;
        const { screenshots } = get();
        const current: HistoryEntry = screenshots.map(({ id, background, screenshot, text }) => ({
          id, background, screenshot, text,
        }));
        undoStack.push(current);
        const entry = redoStack.pop()!;
        const next = screenshots.map((shot) => {
          const saved = entry.find((e) => e.id === shot.id);
          if (!saved) return shot;
          return { ...shot, background: saved.background, screenshot: saved.screenshot, text: saved.text };
        });
        set({ screenshots: next, canUndo: true, canRedo: redoStack.length > 0 });
      },

      applyPositionPreset: (preset) => {
        const { screenshots } = get();
        if (!screenshots.length) return;
        get().pushHistory();
        get().updateScreenshot(preset);
      },

      applyGradientPreset: (stops, angle) => {
        const { screenshots } = get();
        if (!screenshots.length) return;
        get().pushHistory();
        get().updateBackground({ type: 'gradient', gradient: { angle, stops } });
      },

      applyTemplate: (template) => {
        const { screenshots, selectedIndex } = get();
        if (!screenshots.length) return;
        get().pushHistory();
        set({
          screenshots: updateSelectedScreenshot(screenshots, selectedIndex, (shot) => ({
            ...shot,
            background: structuredClone(template.background),
            screenshot: {
              ...structuredClone(template.screenshot),
              effects: withDefaultEffects(template.screenshot.effects),
              deviceFrame: withDefaultDeviceFrame(template.screenshot.deviceFrame),
            },
            text: structuredClone(template.text),
          })),
        });
      },

      applyToAll: () => {
        const { screenshots, selectedIndex } = get();
        if (!screenshots.length) return;
        get().pushHistory();
        const source = screenshots[selectedIndex];
        set({
          screenshots: screenshots.map((shot) => ({
            ...shot,
            background: structuredClone(source.background),
            screenshot: structuredClone(source.screenshot),
            text: structuredClone(source.text),
          })),
        });
      },

      reorderScreenshots: (fromIndex, toIndex) => {
        const { screenshots, selectedIndex } = get();
        const next = [...screenshots];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);

        let nextSelected = selectedIndex;
        if (selectedIndex === fromIndex) nextSelected = toIndex;
        else if (fromIndex < selectedIndex && toIndex >= selectedIndex) nextSelected--;
        else if (fromIndex > selectedIndex && toIndex <= selectedIndex) nextSelected++;

        set({ screenshots: next, selectedIndex: nextSelected });
      },
    }),
    {
      name: 'screenforge-storage-v3',
      version: 4,
      migrate: migratePersistedState,
      partialize: (state) => ({
        projectName: state.projectName,
        screenshots: state.screenshots.map((shot) => ({
          ...shot,
          imageData: undefined,
        })),
        selectedIndex: state.selectedIndex,
        outputDevice: state.outputDevice,
        defaults: state.defaults,
      }),
    }
  )
);

export const selectCurrentScreenshot = (state: AppStore) =>
  state.screenshots[state.selectedIndex] ?? null;
