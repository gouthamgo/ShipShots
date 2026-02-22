'use client';

import { DEVICE_SIZES } from '@/types';

interface AppHeaderProps {
  outputDevice: string;
  onSetOutputDevice: (id: string) => void;
  viewMode: 'editor' | 'preview';
  onSetViewMode: (mode: 'editor' | 'preview') => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  screenshotCount: number;
  hasRenderableScreenshot: boolean;
  exporting: boolean;
  onExportSingle: () => void;
  onExportAll: () => void;
}

export function AppHeader({
  outputDevice, onSetOutputDevice,
  viewMode, onSetViewMode,
  canUndo, canRedo, onUndo, onRedo,
  screenshotCount, hasRenderableScreenshot, exporting,
  onExportSingle, onExportAll,
}: AppHeaderProps) {
  return (
    <header className="app-header h-14 flex items-center justify-between px-5 shrink-0 border-b border-[--border] bg-[--bg-secondary]">
      <div className="flex items-center gap-3 shrink-0">
        <div className="brand-badge">S</div>
        <div>
          <h1 className="text-sm font-bold tracking-tight">ScreenForge</h1>
          <span className="text-[10px] text-[--text-tertiary]">v2.0</span>
        </div>
      </div>

      <div className="header-center hidden md:flex">
        <div className="device-select-wrap hidden lg:flex">
          <select
            className="device-select"
            value={outputDevice}
            onChange={(e) => onSetOutputDevice(e.target.value)}
          >
            {DEVICE_SIZES.map((device) => (
              <option key={device.id} value={device.id}>{device.name}</option>
            ))}
          </select>
        </div>

        <div className="mode-switch hidden md:flex">
          <button className={`mode-btn ${viewMode === 'editor' ? 'active' : ''}`} onClick={() => onSetViewMode('editor')}>
            Editor
          </button>
          <button className={`mode-btn ${viewMode === 'preview' ? 'active' : ''}`} onClick={() => onSetViewMode('preview')}>
            Preview
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button onClick={onUndo} disabled={!canUndo} className="undo-btn" title="Undo (⌘Z)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" /><path d="M3 13C5.333 8.333 9 6 14 6c4 0 7 2 9 6" />
          </svg>
        </button>
        <button onClick={onRedo} disabled={!canRedo} className="undo-btn" title="Redo (⌘⇧Z)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7v6h-6" /><path d="M21 13C18.667 8.333 15 6 10 6c-4 0-7 2-9 6" />
          </svg>
        </button>

        {screenshotCount > 1 ? (
          <button onClick={onExportAll} disabled={exporting} className="btn-export-all header-export-btn disabled:opacity-50">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Export
          </button>
        ) : (
          <button onClick={onExportSingle} disabled={!hasRenderableScreenshot || exporting} className="btn-export-all header-export-btn disabled:opacity-50 disabled:pointer-events-none">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        )}
      </div>
    </header>
  );
}
