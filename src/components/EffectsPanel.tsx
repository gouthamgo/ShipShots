'use client';

import { useAppStore } from '@/stores/app-store';

// Toggle Component
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className={`toggle-track ${checked ? 'active' : ''}`} onClick={() => onChange(!checked)}>
      <div className="toggle-thumb" />
    </div>
  );
}

// Slider Row Component
function SliderRow({ label, value, min, max, step, unit, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="slider-row">
      <div className="slider-row-head">
        <span className="slider-label">{label}</span>
        <span className="slider-value">
          {value}{unit || ''}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step || 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

// Color Picker Row
function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-[--text-secondary] font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer"
        />
        <span className="text-[10px] text-[--text-tertiary] font-mono">{value}</span>
      </div>
    </div>
  );
}

// Default effects fallback
const DEFAULT_EFFECTS = {
  glow: { enabled: false, color: '#8b5cf6', intensity: 50, spread: 20 },
  reflection: { enabled: false, opacity: 30, offset: 20, fade: 50 },
  perspective: { rotateX: 0, rotateY: 0 },
};

// Glow Effect Section
function GlowSection() {
  const { screenshots, selectedIndex, updateGlow } = useAppStore();
  const currentScreenshot = screenshots[selectedIndex];
  const effects = currentScreenshot?.screenshot.effects || DEFAULT_EFFECTS;

  if (!effects) return null;

  return (
    <div className="space-y-4">
      <div className="inspector-card flex items-center justify-between">
        <div>
          <span className="text-xs text-[--text-primary] font-medium">Enable Glow</span>
          <p className="text-[10px] text-[--text-tertiary] mt-0.5">Add a glowing effect around the screenshot</p>
        </div>
        <Toggle
          checked={effects.glow.enabled}
          onChange={(v) => updateGlow({ enabled: v })}
        />
      </div>

      {effects.glow.enabled && (
        <div className="space-y-4 animate-fade-in">
          <ColorRow
            label="Glow Color"
            value={effects.glow.color}
            onChange={(v) => updateGlow({ color: v })}
          />
          <SliderRow
            label="Intensity"
            value={effects.glow.intensity}
            min={0}
            max={100}
            unit="%"
            onChange={(v) => updateGlow({ intensity: v })}
          />
          <SliderRow
            label="Spread"
            value={effects.glow.spread}
            min={0}
            max={100}
            unit="px"
            onChange={(v) => updateGlow({ spread: v })}
          />
        </div>
      )}
    </div>
  );
}

// Reflection Effect Section
function ReflectionSection() {
  const { screenshots, selectedIndex, updateReflection } = useAppStore();
  const currentScreenshot = screenshots[selectedIndex];
  const effects = currentScreenshot?.screenshot.effects || DEFAULT_EFFECTS;

  if (!effects) return null;

  return (
    <div className="space-y-4">
      <div className="inspector-card flex items-center justify-between">
        <div>
          <span className="text-xs text-[--text-primary] font-medium">Enable Reflection</span>
          <p className="text-[10px] text-[--text-tertiary] mt-0.5">Add a mirror reflection below</p>
        </div>
        <Toggle
          checked={effects.reflection.enabled}
          onChange={(v) => updateReflection({ enabled: v })}
        />
      </div>

      {effects.reflection.enabled && (
        <div className="space-y-4 animate-fade-in">
          <SliderRow
            label="Opacity"
            value={effects.reflection.opacity}
            min={0}
            max={100}
            unit="%"
            onChange={(v) => updateReflection({ opacity: v })}
          />
          <SliderRow
            label="Offset"
            value={effects.reflection.offset}
            min={0}
            max={100}
            unit="px"
            onChange={(v) => updateReflection({ offset: v })}
          />
          <SliderRow
            label="Fade"
            value={effects.reflection.fade}
            min={0}
            max={100}
            unit="%"
            onChange={(v) => updateReflection({ fade: v })}
          />
        </div>
      )}
    </div>
  );
}

// Perspective Effect Section
function PerspectiveSection() {
  const { screenshots, selectedIndex, updatePerspective } = useAppStore();
  const currentScreenshot = screenshots[selectedIndex];
  const effects = currentScreenshot?.screenshot.effects || DEFAULT_EFFECTS;

  if (!effects) return null;

  return (
    <div className="space-y-4">
      <div className="inspector-card">
        <span className="text-xs text-[--text-primary] font-medium">3D Perspective</span>
        <p className="text-[10px] text-[--text-tertiary] mt-0.5 mb-4">Rotate the screenshot in 3D space</p>
        
        <div className="space-y-4">
          <SliderRow
            label="Rotate X"
            value={effects.perspective.rotateX}
            min={-30}
            max={30}
            unit="°"
            onChange={(v) => updatePerspective({ rotateX: v })}
          />
          <SliderRow
            label="Rotate Y"
            value={effects.perspective.rotateY}
            min={-30}
            max={30}
            unit="°"
            onChange={(v) => updatePerspective({ rotateY: v })}
          />
        </div>
      </div>

      {/* Quick presets */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => updatePerspective({ rotateX: 0, rotateY: 0 })}
          className="effect-preset-btn"
        >
          Flat
        </button>
        <button
          onClick={() => updatePerspective({ rotateX: -10, rotateY: 5 })}
          className="effect-preset-btn"
        >
          Tilt Up
        </button>
        <button
          onClick={() => updatePerspective({ rotateX: 10, rotateY: -5 })}
          className="effect-preset-btn"
        >
          Tilt Down
        </button>
      </div>
    </div>
  );
}

// Main Effects Panel Component
export function EffectsPanel() {
  const { screenshots, selectedIndex } = useAppStore();
  const currentScreenshot = screenshots[selectedIndex];

  if (!currentScreenshot) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[--bg-tertiary] border border-[--border] flex items-center justify-center">
          <svg className="w-6 h-6 text-[--text-tertiary]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-[--text-secondary] mb-1">No screenshot selected</p>
        <p className="text-xs text-[--text-tertiary]">Upload a screenshot to add effects</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Glow Section */}
      <div>
        <h4 className="effects-group-title">
          Glow Effect
        </h4>
        <GlowSection />
      </div>

      {/* Reflection Section */}
      <div>
        <h4 className="effects-group-title">
          Reflection
        </h4>
        <ReflectionSection />
      </div>

      {/* Perspective Section */}
      <div>
        <h4 className="effects-group-title">
          3D Perspective
        </h4>
        <PerspectiveSection />
      </div>
    </div>
  );
}

export default EffectsPanel;
