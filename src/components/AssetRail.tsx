'use client';

import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { selectCurrentScreenshot, useAppStore } from '@/stores/app-store';
import { DEVICE_SIZES } from '@/types';
import { TemplateGallery } from '@/components/TemplateGallery';

interface AssetRailProps {
  viewMode: 'editor' | 'preview';
  openUploader: () => void;
}

export function AssetRail({ viewMode, openUploader }: AssetRailProps) {
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [scenePresetsOpen, setScenePresetsOpen] = useState(false);

  const { screenshots, selectedIndex, outputDevice, selectScreenshot, applyToAll, updateScreenshot, removeScreenshot } =
    useAppStore(useShallow((state) => ({
      screenshots: state.screenshots,
      selectedIndex: state.selectedIndex,
      outputDevice: state.outputDevice,
      selectScreenshot: state.selectScreenshot,
      applyToAll: state.applyToAll,
      updateScreenshot: state.updateScreenshot,
      removeScreenshot: state.removeScreenshot,
    })));

  const currentScreenshot = useAppStore(selectCurrentScreenshot);
  const currentDevice = DEVICE_SIZES.find((d) => d.id === outputDevice) || DEVICE_SIZES[0];
  const config = currentScreenshot?.screenshot;
  const text = currentScreenshot?.text;
  const frame = config ? { enabled: config.deviceFrame?.enabled !== false } : null;

  const shotCountStatus = screenshots.length === 0 ? 'pending' : screenshots.length <= 10 ? 'pass' : 'warn';
  const textOverlayStatus = !text ? 'pending' : (text.headlineEnabled || text.subheadlineEnabled) ? 'pass' : 'warn';
  const deviceFrameStatus = !frame ? 'pending' : frame.enabled ? 'pass' : 'warn';
  const scaleStatus = !config ? 'pending' : config.scale >= 72 ? 'pass' : 'warn';
  const allStatuses = ['pass', shotCountStatus, textOverlayStatus, deviceFrameStatus, scaleStatus] as const;

  return (
    <aside className={`asset-rail ${viewMode === 'preview' ? 'hidden' : ''} ${screenshots.length === 0 ? 'asset-rail-empty' : ''}`}>
      <div className="asset-rail-head">
        <h2 className="asset-rail-title">Assets</h2>
        <span className="asset-rail-meta">{screenshots.length} {screenshots.length === 1 ? 'shot' : 'shots'}</span>
      </div>

      <div className="asset-upload-wrap">
        <button className="asset-upload-btn" onClick={openUploader}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Screenshots
        </button>
        <p className="asset-upload-hint">
          {screenshots.length === 0
            ? 'Upload one screenshot to unlock devices, templates, text, and effects.'
            : 'Drag screenshots onto the canvas to import quickly.'}
        </p>
      </div>

      <div className="asset-list-wrap">
        {screenshots.length === 0 ? (
          <div className="asset-empty-state">No screenshots loaded yet. Add your first app screen to start styling.</div>
        ) : (
          <div className="shot-thumb-strip">
            {screenshots.map((s, i) => (
              <button
                key={s.id}
                onClick={() => selectScreenshot(i)}
                className={`shot-thumb-card ${i === selectedIndex ? 'active' : ''}`}
              >
                <div className="shot-thumb-img-wrap">
                  {s.imageData
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={s.imageData} alt={`Shot ${i + 1}`} className="shot-thumb-img" />
                    : <div className="shot-thumb-placeholder" />}
                </div>
                <span className="shot-thumb-label">Shot {i + 1}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {screenshots.length === 0 && (
        <div className="asset-empty-guide">
          <p className="asset-empty-guide-title">Quick Setup</p>
          <ol className="asset-empty-guide-list">
            <li>Upload a clean iPhone screenshot.</li>
            <li>Pick device angle and background style.</li>
            <li>Export in iPhone 16/17 App Store size.</li>
          </ol>
        </div>
      )}

      <div className="compliance-card">
        <button
          className="w-full flex items-center justify-between"
          onClick={() => setChecklistOpen((o) => !o)}
          aria-expanded={checklistOpen}
        >
          <span className="compliance-card-title">App Store Checklist</span>
          <div className="flex items-center gap-2">
            {!checklistOpen && (
              <div className="flex items-center gap-1.5">
                {allStatuses.map((s, i) => (
                  <span key={i} className={`compliance-dot ${s}`} style={{ marginTop: 0 }} />
                ))}
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, marginLeft: 2 }}>
                  {allStatuses.filter(s => s === 'pass').length}/5
                </span>
              </div>
            )}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ color: 'var(--text-tertiary)', transition: 'transform 0.2s', transform: checklistOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {checklistOpen && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="compliance-item">
              <span className="compliance-dot pass" />
              <div>
                <p className="compliance-item-label">Resolution target</p>
                <p className="compliance-item-text">{currentDevice.width}×{currentDevice.height}</p>
              </div>
            </div>
            <div className="compliance-item">
              <span className={`compliance-dot ${shotCountStatus}`} />
              <div>
                <p className="compliance-item-label">Screenshot count</p>
                <p className="compliance-item-text">{screenshots.length}/10 uploaded</p>
              </div>
            </div>
            <div className="compliance-item">
              <span className={`compliance-dot ${textOverlayStatus}`} />
              <div>
                <p className="compliance-item-label">Text overlay</p>
                <p className="compliance-item-text">
                  {!text ? 'Upload first screenshot' : (text.headlineEnabled || text.subheadlineEnabled) ? 'Enabled' : 'No text enabled'}
                </p>
              </div>
            </div>
            <div className="compliance-item">
              <span className={`compliance-dot ${deviceFrameStatus}`} />
              <div>
                <p className="compliance-item-label">Device frame</p>
                <p className="compliance-item-text">
                  {!frame ? 'Upload first screenshot' : frame.enabled ? 'Frame on' : 'Frame off'}
                </p>
              </div>
            </div>
            <div className="compliance-item">
              <span className={`compliance-dot ${scaleStatus}`} />
              <div>
                <p className="compliance-item-label">Scale quality</p>
                <p className="compliance-item-text">
                  {config ? `Scale ${config.scale}%` : 'Upload first screenshot'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {screenshots.length > 0 && (
        <div className="asset-actions">
          {screenshots.length > 1 && (
            <button onClick={applyToAll} className="asset-apply-btn">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Apply style to all
            </button>
          )}
          {currentScreenshot && (
            <button onClick={() => updateScreenshot({ scale: 92, x: 50, y: 56, rotation: 0 })} className="asset-fit-btn">
              Fit current shot on canvas
            </button>
          )}
          {currentScreenshot && (
            <button onClick={() => removeScreenshot(currentScreenshot.id)} className="asset-remove-btn">
              Remove current shot
            </button>
          )}
        </div>
      )}

      <div className="asset-rail-divider" />
      <button
        className="w-full flex items-center justify-between px-3 py-2.5"
        onClick={() => setScenePresetsOpen((o) => !o)}
        aria-expanded={scenePresetsOpen}
      >
        <span className="text-[10px] font-bold tracking-widest uppercase text-[--text-tertiary]">Scene Presets</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ color: 'var(--text-tertiary)', transition: 'transform 0.2s', transform: scenePresetsOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {scenePresetsOpen && <TemplateGallery />}
    </aside>
  );
}
