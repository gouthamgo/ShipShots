'use client';

import { useState } from 'react';
import { selectCurrentScreenshot, useAppStore } from '@/stores/app-store';
import { ISOMETRIC_PRESETS, TEMPLATES } from '@/lib/presets';
import { IsometricPreset, Template } from '@/types';

function SectionChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="11" height="11" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: 'var(--text-tertiary)', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
    >
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );
}

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
  const screenshotCount = useAppStore((state) => state.screenshots.length);
  const currentScreenshot = useAppStore(selectCurrentScreenshot);
  const updateDeviceFrame = useAppStore((state) => state.updateDeviceFrame);
  const applyTemplate = useAppStore((state) => state.applyTemplate);
  const currentPresetId = currentScreenshot?.screenshot?.deviceFrame?.presetId || 'front';
  const frameEnabled = currentScreenshot?.screenshot?.deviceFrame?.enabled !== false;

  const [devicesOpen, setDevicesOpen] = useState(true);
  const [templatesOpen, setTemplatesOpen] = useState(true);

  return (
    <section className="template-sidebar">

      {screenshotCount === 0 && (
        <div className="mx-3 mt-2 px-3 py-2 rounded-lg border border-[--border] bg-[--bg-tertiary] text-[10px] text-[--text-tertiary] text-center">
          Upload a screenshot to apply
        </div>
      )}

      {/* ── Devices section ── */}
      <div className="border-b border-[--border-subtle]">
        <button
          className="w-full flex items-center justify-between px-4 py-2.5"
          onClick={() => setDevicesOpen((o) => !o)}
          aria-expanded={devicesOpen}
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[--text-tertiary]">Devices</span>
            {screenshotCount > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); updateDeviceFrame({ enabled: !frameEnabled }); }}
                className={`text-[10px] font-medium px-2 py-0.5 rounded transition-all ${
                  frameEnabled
                    ? 'bg-[--accent] text-white'
                    : 'bg-[--bg-tertiary] text-[--text-tertiary] border border-[--border]'
                }`}
              >
                {frameEnabled ? 'ON' : 'OFF'}
              </button>
            )}
          </div>
          <SectionChevron open={devicesOpen} />
        </button>

        {devicesOpen && (
          <div className={`device-preset-grid ${(!frameEnabled || screenshotCount === 0) ? 'opacity-40 pointer-events-none' : ''}`}>
            {ISOMETRIC_PRESETS.map((preset) => (
              <DevicePresetCard
                key={preset.id}
                preset={preset}
                selected={currentPresetId === preset.id}
                onClick={() => {
                  if (screenshotCount > 0) {
                    updateDeviceFrame({ enabled: true, presetId: preset.id });
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Templates section ── */}
      <div>
        <button
          className="w-full flex items-center justify-between px-4 py-2.5"
          onClick={() => setTemplatesOpen((o) => !o)}
          aria-expanded={templatesOpen}
        >
          <span className="text-[10px] font-bold tracking-widest uppercase text-[--text-tertiary]">Templates</span>
          <SectionChevron open={templatesOpen} />
        </button>

        {templatesOpen && (
          <div className={`template-quick-grid ${screenshotCount === 0 ? 'opacity-40 pointer-events-none' : ''}`}>
            {TEMPLATES.map((template) => (
              <TemplateQuickCard
                key={template.id}
                template={template}
                onClick={() => {
                  if (screenshotCount > 0) {
                    applyTemplate(template);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

    </section>
  );
}

export default TemplateGallery;
