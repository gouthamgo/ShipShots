'use client';

import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { selectCurrentScreenshot, useAppStore } from '@/stores/app-store';
import { GRADIENT_PRESETS, POSITION_PRESETS, FONT_OPTIONS, WEIGHT_OPTIONS, FRAME_COLORS } from '@/lib/presets';
import { EffectsPanel } from '@/components/EffectsPanel';
import { Accordion, SliderRow, Toggle } from '@/components/ui/controls';

function BackgroundIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18" />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" />
    </svg>
  );
}

function EffectsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  );
}

function TabButton({ active, icon, label, onClick, disabled = false }: {
  active: boolean; icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`control-tab ${active ? 'active' : ''} ${disabled ? 'disabled' : ''} ${active ? 'text-[--accent]' : 'text-[--text-secondary]'}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface ControlPanelProps {
  viewMode: 'editor' | 'preview';
  openUploader: () => void;
}

export function ControlPanel({ viewMode, openUploader }: ControlPanelProps) {
  const [activeTab, setActiveTab] = useState<'background' | 'device' | 'text' | 'effects'>('background');

  const { screenshots, selectedIndex, updateBackground, applyGradientPreset, updateScreenshot, updateShadow, updateBorder, applyPositionPreset, updateText, updateDeviceFrame, pushHistory } =
    useAppStore(useShallow((state) => ({
      screenshots: state.screenshots,
      selectedIndex: state.selectedIndex,
      updateBackground: state.updateBackground,
      applyGradientPreset: state.applyGradientPreset,
      updateScreenshot: state.updateScreenshot,
      updateShadow: state.updateShadow,
      updateBorder: state.updateBorder,
      applyPositionPreset: state.applyPositionPreset,
      updateText: state.updateText,
      updateDeviceFrame: state.updateDeviceFrame,
      pushHistory: state.pushHistory,
    })));

  const currentScreenshot = useAppStore(selectCurrentScreenshot);
  const bg = currentScreenshot?.background;
  const config = currentScreenshot?.screenshot;
  const text = currentScreenshot?.text;
  const frame = config ? {
    presetId: config.deviceFrame?.presetId || 'front',
    frameColor: config.deviceFrame?.frameColor || '#1a1a1a',
    enabled: config.deviceFrame?.enabled !== false,
  } : null;

  return (
    <aside className={`control-panel w-80 flex flex-col shrink-0 border-l border-[--border] bg-[--bg-secondary] ${viewMode === 'preview' ? 'hidden' : ''}`}>
      <div className="control-tabs flex border-b border-[--border] overflow-x-auto">
        <TabButton active={activeTab === 'background'} icon={<BackgroundIcon />} label="Background" onClick={() => setActiveTab('background')} disabled={!currentScreenshot} />
        <TabButton active={activeTab === 'device'} icon={<DeviceIcon />} label="Device" onClick={() => setActiveTab('device')} disabled={!currentScreenshot} />
        <TabButton active={activeTab === 'text'} icon={<TextIcon />} label="Text" onClick={() => setActiveTab('text')} disabled={!currentScreenshot} />
        <TabButton active={activeTab === 'effects'} icon={<EffectsIcon />} label="Effects" onClick={() => setActiveTab('effects')} disabled={!currentScreenshot} />
      </div>

      <div className="inspector-scroll flex-1 overflow-y-auto p-4">
        {!currentScreenshot ? (
          <div className="inspector-empty-shell">
            <div className="inspector-empty">
              <div className="inspector-empty-icon">
                <svg className="w-7 h-7 text-[--text-tertiary]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
              </div>
              <p className="inspector-empty-title">Start by uploading a screenshot</p>
              <p className="inspector-empty-text">After upload, tune background, device frame, and text for App Store export.</p>
              <button className="inspector-empty-btn" onClick={openUploader}>Upload Screenshot</button>
            </div>
            <div className="inspector-empty-checklist">
              <p className="inspector-empty-checklist-title">Project Target</p>
              <p className="inspector-empty-checklist-note">Use the device selector in the header to set your export size.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="inspector-status-card">
              <div className="inspector-status-item">
                <div>
                  <span className="inspector-status-label">Shot</span>
                  <span className="inspector-status-value">{selectedIndex + 1}/{screenshots.length}</span>
                </div>
              </div>
              <div className="inspector-status-item">
                <div>
                  <span className="inspector-status-label">Scale</span>
                  <span className="inspector-status-value">{config?.scale ?? '--'}%</span>
                </div>
              </div>
              <div className="inspector-status-item">
                <div>
                  <span className="inspector-status-label">Frame</span>
                  <span className="inspector-status-value">{frame?.enabled ? 'On' : 'Off'}</span>
                </div>
              </div>
            </div>

            {/* ─── Background Tab ─── */}
            {activeTab === 'background' && bg && (
              <div className="inspector-stack">
                <Accordion title="Background Type">
                  <div className="inspector-segment">
                    {(['gradient', 'solid'] as const).map((t) => (
                      <button key={t} onClick={() => updateBackground({ type: t })}
                        className={`inspector-segment-btn ${bg.type === t ? 'active' : ''} ${bg.type === t ? 'text-white' : 'text-[--text-secondary]'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </Accordion>
                {bg.type === 'gradient' && (
                  <Accordion title="Gradient Presets">
                    <div className="grid grid-cols-5 gap-2">
                      {GRADIENT_PRESETS.map((p, i) => (
                        <button key={i}
                          onClick={() => applyGradientPreset([{ color: p.colors[0], position: 0 }, { color: p.colors[1], position: 100 }], p.angle)}
                          className="gradient-swatch"
                          style={{ background: `linear-gradient(${p.angle}deg, ${p.colors[0]}, ${p.colors[1]})` }}
                          title={p.name} />
                      ))}
                    </div>
                  </Accordion>
                )}
                {bg.type === 'gradient' && (
                  <Accordion title="Gradient Settings" defaultOpen={false}>
                    <SliderRow label="Angle" value={bg.gradient.angle} min={0} max={360} unit="°"
                      onChange={(v) => updateBackground({ gradient: { ...bg.gradient, angle: v } })} />
                    <div className="flex gap-3">
                      {bg.gradient.stops.map((stop, i) => (
                        <div key={i} className="flex-1">
                          <span className="text-[10px] text-[--text-tertiary] mb-1.5 block font-medium">Color {i + 1}</span>
                          <div className="flex items-center gap-2.5">
                            <input type="color" value={stop.color}
                              onChange={(e) => {
                                const newStops = [...bg.gradient.stops];
                                newStops[i] = { ...newStops[i], color: e.target.value };
                                updateBackground({ gradient: { ...bg.gradient, stops: newStops } });
                              }}
                              className="w-9 h-9 rounded-lg" />
                            <span className="text-[10px] text-[--text-tertiary] font-mono">{stop.color}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Accordion>
                )}
                {bg.type === 'solid' && (
                  <Accordion title="Solid Color">
                    <div className="inspector-card flex items-center gap-4">
                      <input type="color" value={bg.solid} onChange={(e) => updateBackground({ solid: e.target.value })} className="w-12 h-12 rounded-xl" />
                      <div>
                        <span className="text-sm text-[--text-primary] font-mono font-medium">{bg.solid}</span>
                        <p className="text-[10px] text-[--text-tertiary] mt-0.5">Click swatch to change</p>
                      </div>
                    </div>
                  </Accordion>
                )}
                <Accordion title="Noise Texture" defaultOpen={false}>
                  <div className="inspector-card flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[--text-primary] font-medium">Enable noise</span>
                      <p className="text-[10px] text-[--text-tertiary] mt-0.5">Adds subtle grain texture</p>
                    </div>
                    <Toggle checked={bg.noise} onChange={(v) => updateBackground({ noise: v })} />
                  </div>
                  {bg.noise && (
                    <SliderRow label="Intensity" value={bg.noiseIntensity} min={1} max={40}
                      onChange={(v) => updateBackground({ noiseIntensity: v })} />
                  )}
                </Accordion>
              </div>
            )}

            {/* ─── Device Tab ─── */}
            {activeTab === 'device' && config && frame && (
              <div className="inspector-stack">
                <Accordion title="Device Frame">
                  <div className="inspector-card flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xs text-[--text-primary] font-medium">3D Phone Frame</span>
                      <p className="text-[10px] text-[--text-tertiary] mt-0.5">Show iPhone device frame</p>
                    </div>
                    <Toggle checked={frame.enabled} onChange={(v) => updateDeviceFrame({ enabled: v })} />
                  </div>
                  {frame.enabled && (
                    <div className="space-y-3 animate-fade-in">
                      <div>
                        <span className="text-[10px] text-[--text-tertiary] mb-2 block font-medium">Frame Color</span>
                        <div className="flex gap-2">
                          {FRAME_COLORS.map((fc) => (
                            <button key={fc.id} onClick={() => updateDeviceFrame({ frameColor: fc.color })}
                              className={`frame-color-swatch ${frame.frameColor === fc.color ? 'active' : ''}`}
                              style={{ background: fc.color }} title={fc.name} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Accordion>

                <Accordion title="Position">
                  <div className="grid grid-cols-4 gap-2">
                    {POSITION_PRESETS.map((p, i) => (
                      <button key={i} onClick={() => applyPositionPreset(p)} className="position-preset-btn">
                        <span className="text-base opacity-50">{p.icon}</span>
                        <span className="font-medium">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </Accordion>

                <Accordion title="Size & Position">
                  <div onMouseUp={() => pushHistory()}>
                    <SliderRow label="Scale" value={config.scale} min={20} max={120} unit="%" onChange={(v) => updateScreenshot({ scale: v })} />
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <SliderRow label="X" value={config.x} min={0} max={100} unit="%" onChange={(v) => updateScreenshot({ x: v })} />
                      <SliderRow label="Y" value={config.y} min={0} max={100} unit="%" onChange={(v) => updateScreenshot({ y: v })} />
                    </div>
                    {!frame.enabled && (
                      <div className="mt-4">
                        <SliderRow label="Corner Radius" value={config.cornerRadius} min={0} max={60} unit="px" onChange={(v) => updateScreenshot({ cornerRadius: v })} />
                      </div>
                    )}
                    <div className="mt-4">
                      <SliderRow label="Rotation" value={config.rotation} min={-45} max={45} unit="°" onChange={(v) => updateScreenshot({ rotation: v })} />
                    </div>
                  </div>
                </Accordion>

                <Accordion title="Shadow" defaultOpen={false}>
                  <div className="inspector-card flex items-center justify-between mb-1">
                    <span className="text-xs text-[--text-primary] font-medium">Drop Shadow</span>
                    <Toggle checked={config.shadow.enabled} onChange={(v) => updateShadow({ enabled: v })} />
                  </div>
                  {config.shadow.enabled && (
                    <div onMouseUp={() => pushHistory()}>
                      <SliderRow label="Blur" value={config.shadow.blur} min={0} max={150} unit="px" onChange={(v) => updateShadow({ blur: v })} />
                      <div className="mt-4">
                        <SliderRow label="Opacity" value={config.shadow.opacity} min={0} max={100} unit="%" onChange={(v) => updateShadow({ opacity: v })} />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <SliderRow label="Offset X" value={config.shadow.x} min={-60} max={60} unit="px" onChange={(v) => updateShadow({ x: v })} />
                        <SliderRow label="Offset Y" value={config.shadow.y} min={-60} max={60} unit="px" onChange={(v) => updateShadow({ y: v })} />
                      </div>
                    </div>
                  )}
                </Accordion>

                {!frame.enabled && (
                  <Accordion title="Border" defaultOpen={false}>
                    <div className="inspector-card flex items-center justify-between mb-1">
                      <span className="text-xs text-[--text-primary] font-medium">Border</span>
                      <Toggle checked={config.border.enabled} onChange={(v) => updateBorder({ enabled: v })} />
                    </div>
                    {config.border.enabled && (
                      <div onMouseUp={() => pushHistory()}>
                        <SliderRow label="Width" value={config.border.width} min={0} max={30} unit="px" onChange={(v) => updateBorder({ width: v })} />
                        <div className="mt-4">
                          <SliderRow label="Opacity" value={config.border.opacity} min={0} max={100} unit="%" onChange={(v) => updateBorder({ opacity: v })} />
                        </div>
                      </div>
                    )}
                  </Accordion>
                )}
              </div>
            )}

            {/* ─── Text Tab ─── */}
            {activeTab === 'text' && text && (
              <div className="inspector-stack">
                <Accordion title="Headline">
                  <div className="inspector-card flex items-center justify-between mb-1">
                    <span className="text-xs text-[--text-primary] font-medium">Show headline</span>
                    <Toggle checked={text.headlineEnabled} onChange={(v) => updateText({ headlineEnabled: v })} />
                  </div>
                  {text.headlineEnabled && (
                    <div className="space-y-4 animate-fade-in">
                      <input type="text" value={text.headline}
                        onChange={(e) => updateText({ headline: e.target.value })}
                        onBlur={() => pushHistory()}
                        placeholder="Enter headline..." className="sf-input" />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] text-[--text-tertiary] mb-1.5 block font-medium">Font</span>
                          <select value={text.headlineFont} onChange={(e) => updateText({ headlineFont: e.target.value })} className="sf-select w-full">
                            {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <span className="text-[10px] text-[--text-tertiary] mb-1.5 block font-medium">Weight</span>
                          <select value={text.headlineWeight} onChange={(e) => updateText({ headlineWeight: e.target.value })} className="sf-select w-full">
                            {WEIGHT_OPTIONS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                          </select>
                        </div>
                      </div>
                      <div onMouseUp={() => pushHistory()}>
                        <SliderRow label="Size" value={text.headlineSize} min={24} max={160} unit="px" onChange={(v) => updateText({ headlineSize: v })} />
                      </div>
                      <div>
                        <span className="text-[10px] text-[--text-tertiary] mb-1.5 block font-medium">Color</span>
                        <input type="color" value={text.headlineColor} onChange={(e) => updateText({ headlineColor: e.target.value })} className="color-input-wide" />
                      </div>
                      <div>
                        <span className="text-[10px] text-[--text-tertiary] mb-1.5 block font-medium">Position</span>
                        <div className="inspector-segment">
                          {(['top', 'bottom'] as const).map(pos => (
                            <button key={pos} onClick={() => updateText({ headlinePosition: pos })}
                              className={`inspector-segment-btn ${text.headlinePosition === pos ? 'active' : ''} ${text.headlinePosition === pos ? 'text-white' : 'text-[--text-secondary]'}`}>
                              {pos}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div onMouseUp={() => pushHistory()}>
                        <SliderRow label="Offset Y" value={text.headlineOffsetY} min={2} max={40} unit="%" onChange={(v) => updateText({ headlineOffsetY: v })} />
                      </div>
                    </div>
                  )}
                </Accordion>
                <Accordion title="Subheadline" defaultOpen={false}>
                  <div className="inspector-card flex items-center justify-between mb-1">
                    <span className="text-xs text-[--text-primary] font-medium">Show subheadline</span>
                    <Toggle checked={text.subheadlineEnabled} onChange={(v) => updateText({ subheadlineEnabled: v })} />
                  </div>
                  {text.subheadlineEnabled && (
                    <div className="space-y-4 animate-fade-in">
                      <input type="text" value={text.subheadline}
                        onChange={(e) => updateText({ subheadline: e.target.value })}
                        onBlur={() => pushHistory()}
                        placeholder="Enter subheadline..." className="sf-input" />
                      <div onMouseUp={() => pushHistory()}>
                        <SliderRow label="Size" value={text.subheadlineSize} min={16} max={100} unit="px" onChange={(v) => updateText({ subheadlineSize: v })} />
                        <div className="mt-4">
                          <SliderRow label="Opacity" value={text.subheadlineOpacity} min={0} max={100} unit="%" onChange={(v) => updateText({ subheadlineOpacity: v })} />
                        </div>
                        <div className="mt-4">
                          <SliderRow label="Offset Y" value={text.subheadlineOffsetY} min={-100} max={100} unit="px" onChange={(v) => updateText({ subheadlineOffsetY: v })} />
                        </div>
                      </div>
                    </div>
                  )}
                </Accordion>
              </div>
            )}

            {/* ─── Effects Tab ─── */}
            {activeTab === 'effects' && <EffectsPanel />}
          </>
        )}
      </div>
    </aside>
  );
}
