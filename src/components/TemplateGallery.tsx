'use client';

import { useAppStore } from '@/stores/app-store';
import { ISOMETRIC_PRESETS, TEMPLATES } from '@/lib/presets';
import { IsometricPreset, Template } from '@/types';

// ─── Device Angle Preview Card ───
function DevicePresetCard({
  preset,
  selected,
  onClick,
}: {
  preset: IsometricPreset;
  selected: boolean;
  onClick: () => void;
}) {
  const { a, b, c, d } = preset.transform;
  const transform = `matrix(${a}, ${b}, ${c}, ${d}, 0, 0)`;

  return (
    <button
      onClick={onClick}
      className={`device-preset-card ${selected ? 'selected' : ''}`}
      title={preset.name}
    >
      <div className="device-preview-wrapper">
        <div className="device-preview-phone" style={{ transform }}>
          <div className="device-preview-screen">
            <div className="device-preview-gradient" />
          </div>
          <div className="device-preview-notch" />
          <div className="device-preview-home" />
        </div>
      </div>
      <span className="device-preset-name">{preset.name}</span>
    </button>
  );
}

// ─── Template Quick Card ───
function TemplateQuickCard({
  template,
  onClick,
}: {
  template: Template;
  onClick: () => void;
}) {
  const bgStyle =
    template.background.type === 'gradient'
      ? {
          background: `linear-gradient(${template.background.gradient.angle}deg, ${template.background.gradient.stops
            .map((s) => `${s.color} ${s.position}%`)
            .join(', ')})`,
        }
      : { background: template.background.solid };

  return (
    <button className="template-quick-card" onClick={onClick} style={bgStyle} title={template.name}>
      <span className="template-quick-name">{template.name}</span>
    </button>
  );
}

// ─── Main Sidebar Component ───
export function TemplateGallery() {
  const { screenshots, selectedIndex, updateDeviceFrame, applyTemplate } = useAppStore();
  const currentScreenshot = screenshots[selectedIndex];
  const currentPresetId = currentScreenshot?.screenshot?.deviceFrame?.presetId || 'front';
  const frameEnabled = currentScreenshot?.screenshot?.deviceFrame?.enabled !== false;

  if (screenshots.length === 0) {
    return (
      <section className="template-sidebar">
        <div className="px-4 py-3 border-b border-[--border]">
          <h2 className="text-xs font-semibold text-[--text-primary] tracking-wide uppercase">Scene Presets</h2>
          <p className="text-[10px] text-[--text-tertiary] mt-0.5">Upload a screenshot to unlock device angles and templates</p>
        </div>

        <div className="template-empty-wrap">
          <div className="template-empty-card">
            <div className="template-empty-icon">◇</div>
            <p className="template-empty-title">No Active Screenshot</p>
            <p className="template-empty-copy">Presets appear here after your first upload, so you can apply styles in one click.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="template-sidebar">
      {/* Device Angles Section */}
      <div className="px-4 py-3 border-b border-[--border]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold text-[--text-primary] tracking-wide uppercase">
              Devices
            </h2>
            <p className="text-[10px] text-[--text-tertiary] mt-0.5">3D angle presets</p>
          </div>
          {screenshots.length > 0 && (
            <button
              onClick={() => updateDeviceFrame({ enabled: !frameEnabled })}
              className={`text-[10px] font-medium px-2.5 py-1 rounded-lg transition-all ${
                frameEnabled
                  ? 'bg-[--accent] text-white'
                  : 'bg-[--bg-tertiary] text-[--text-tertiary] border border-[--border]'
              }`}
            >
              {frameEnabled ? 'ON' : 'OFF'}
            </button>
          )}
        </div>
      </div>

      {/* Device Preset Grid */}
      <div className={`device-preset-grid ${!frameEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
        {ISOMETRIC_PRESETS.map((preset) => (
          <DevicePresetCard
            key={preset.id}
            preset={preset}
            selected={currentPresetId === preset.id}
            onClick={() => {
              if (screenshots.length > 0) {
                updateDeviceFrame({ enabled: true, presetId: preset.id });
              }
            }}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="mx-4 my-1 border-t border-[--border]" />

      {/* Templates Section */}
      <div className="px-4 py-2">
        <h3 className="text-[10px] font-semibold text-[--text-tertiary] tracking-wide uppercase mb-2">
          Templates
        </h3>
      </div>
      <div className="template-quick-grid">
        {TEMPLATES.map((template) => (
          <TemplateQuickCard
            key={template.id}
            template={template}
            onClick={() => {
              if (screenshots.length > 0) {
                applyTemplate(template);
              }
            }}
          />
        ))}
      </div>

    </section>
  );
}

export default TemplateGallery;
