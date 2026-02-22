'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { selectCurrentScreenshot, useAppStore } from '@/stores/app-store';
import { DEVICE_SIZES } from '@/types';
import { GRADIENT_PRESETS, POSITION_PRESETS, FONT_OPTIONS, WEIGHT_OPTIONS, FRAME_COLORS } from '@/lib/presets';
import { renderToCanvas, exportImage, exportAllAsZip } from '@/lib/canvas';
import { TemplateGallery } from '@/components/TemplateGallery';
import { EffectsPanel } from '@/components/EffectsPanel';
import { Accordion, SliderRow, Toggle } from '@/components/ui/controls';
import { getScreenshotImage, saveScreenshotImage } from '@/lib/storage/image-store';

const CANVAS_MAX_SCALE = 0.65;
const ZOOM_MIN = 0.7;
const ZOOM_MAX = 1.4;
const CANVAS_PADDING = 80;

// ─── Tab Button ───
function TabButton({ active, icon, label, onClick, disabled = false }: {
  active: boolean; icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`control-tab ${active ? 'active' : ''} ${disabled ? 'disabled' : ''} ${
        active
          ? 'text-[--accent]'
          : 'text-[--text-secondary]'
      }`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ─── Tab Icons ───
function BackgroundIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12" y2="18" />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7V4h16v3" />
      <path d="M9 20h6" />
      <path d="M12 4v16" />
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

// ─── Workflow Step ───
function WorkflowStep({ index, label, state }: {
  index: number;
  label: string;
  state: 'done' | 'active' | 'idle';
}) {
  return (
    <div className={`workflow-step ${state}`}>
      <div className="workflow-step-dot">
        {state === 'done' ? (
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          index
        )}
      </div>
      <span className="workflow-step-label">{label}</span>
    </div>
  );
}

// ═══════════════════════════════════════
// ─── Main Page ───
// ═══════════════════════════════════════
export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canvasScale, setCanvasScale] = useState(0.55);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'background' | 'device' | 'text' | 'effects'>('background');
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [scenePresetsOpen, setScenePresetsOpen] = useState(false);

  const [isDraggingPosition, setIsDraggingPosition] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, screenshotX: 0, screenshotY: 0 });
  const dragFrameRef = useRef<number | null>(null);
  const dragPendingRef = useRef<{ x: number; y: number } | null>(null);
  const syncedImageIdsRef = useRef<Set<string>>(new Set());

  const {
    screenshots, selectedIndex, outputDevice,
    canUndo, canRedo,
    addScreenshot, hydrateScreenshotImage, removeScreenshot, selectScreenshot,
    setOutputDevice,
    applyToAll,
    updateBackground, applyGradientPreset,
    updateScreenshot, updateShadow, updateBorder,
    applyPositionPreset, updateText, updateDeviceFrame,
    pushHistory, undo, redo,
  } = useAppStore(useShallow((state) => ({
    screenshots: state.screenshots,
    selectedIndex: state.selectedIndex,
    outputDevice: state.outputDevice,
    canUndo: state.canUndo,
    canRedo: state.canRedo,
    addScreenshot: state.addScreenshot,
    hydrateScreenshotImage: state.hydrateScreenshotImage,
    removeScreenshot: state.removeScreenshot,
    selectScreenshot: state.selectScreenshot,
    setOutputDevice: state.setOutputDevice,
    applyToAll: state.applyToAll,
    updateBackground: state.updateBackground,
    applyGradientPreset: state.applyGradientPreset,
    updateScreenshot: state.updateScreenshot,
    updateShadow: state.updateShadow,
    updateBorder: state.updateBorder,
    applyPositionPreset: state.applyPositionPreset,
    updateText: state.updateText,
    updateDeviceFrame: state.updateDeviceFrame,
    pushHistory: state.pushHistory,
    undo: state.undo,
    redo: state.redo,
  })));
  const currentScreenshot = useAppStore(selectCurrentScreenshot);
  const hasRenderableCurrentScreenshot = Boolean(currentScreenshot?.imageData);
  const bg = currentScreenshot?.background;
  const config = currentScreenshot?.screenshot;
  const text = currentScreenshot?.text;
  const frame = config ? {
    presetId: config.deviceFrame?.presetId || 'front',
    frameColor: config.deviceFrame?.frameColor || '#1a1a1a',
    enabled: config.deviceFrame?.enabled !== false,
  } : null;
  const currentDevice = DEVICE_SIZES.find((device) => device.id === outputDevice) || DEVICE_SIZES[0];
  const workflowStep = screenshots.length === 0 ? 1 : viewMode === 'editor' ? 2 : 3;

  // Compliance checks
  const shotCountStatus = screenshots.length === 0 ? 'pending' : screenshots.length <= 10 ? 'pass' : 'warn';
  const textOverlayStatus = !text ? 'pending' : (text.headlineEnabled || text.subheadlineEnabled) ? 'pass' : 'warn';
  const deviceFrameStatus = !frame ? 'pending' : frame.enabled ? 'pass' : 'warn';
  const scaleStatus = !config ? 'pending' : config.scale >= 72 ? 'pass' : 'warn';

  useEffect(() => {
    if (!DEVICE_SIZES.some((device) => device.id === outputDevice)) {
      setOutputDevice(DEVICE_SIZES[0].id);
    }
  }, [outputDevice, setOutputDevice]);

  useEffect(() => {
    screenshots.forEach((shot) => {
      if (!shot.imageData) return;
      if (syncedImageIdsRef.current.has(shot.imageId)) return;
      syncedImageIdsRef.current.add(shot.imageId);
      void saveScreenshotImage(shot.imageId, shot.imageData);
    });
  }, [screenshots]);

  useEffect(() => {
    const missingImages = screenshots.filter(
      (shot) => !shot.imageData && Boolean(shot.imageId)
    );
    if (!missingImages.length) return;

    let cancelled = false;
    void Promise.all(
      missingImages.map(async (shot) => {
        const imageData = await getScreenshotImage(shot.imageId);
        if (!cancelled && imageData) {
          hydrateScreenshotImage(shot.id, imageData);
        }
      })
    );

    return () => {
      cancelled = true;
    };
  }, [screenshots, hydrateScreenshotImage]);

  useEffect(() => {
    return () => {
      if (dragFrameRef.current !== null) {
        cancelAnimationFrame(dragFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!exportError) return;
    const timeout = window.setTimeout(() => setExportError(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [exportError]);

  // Keyboard shortcut for undo/redo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  // Responsive canvas scaling
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;
    const resize = () => {
      const device = DEVICE_SIZES.find(d => d.id === outputDevice) || DEVICE_SIZES[0];
      const padding = CANVAS_PADDING;
      const maxW = container.clientWidth - padding;
      const maxH = container.clientHeight - padding;
      const scaleW = maxW / device.width;
      const scaleH = maxH / device.height;
      setCanvasScale(Math.min(scaleW, scaleH, CANVAS_MAX_SCALE));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [outputDevice]);

  // Render canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    renderToCanvas(canvasRef.current, currentScreenshot, outputDevice);
  }, [currentScreenshot, outputDevice]);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result;
          if (typeof result === 'string') {
            addScreenshot(result);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }, [addScreenshot]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (!currentScreenshot || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;
    setIsDraggingPosition(true);
    dragStartRef.current = {
      x, y,
      screenshotX: currentScreenshot.screenshot.x,
      screenshotY: currentScreenshot.screenshot.y,
    };
  }, [currentScreenshot, canvasScale]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingPosition || !canvasRef.current || !currentScreenshot) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const device = DEVICE_SIZES.find(d => d.id === outputDevice) || DEVICE_SIZES[0];
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;
    const deltaX = x - dragStartRef.current.x;
    const deltaY = y - dragStartRef.current.y;
    const newX = dragStartRef.current.screenshotX + (deltaX / device.width) * 100;
    const newY = dragStartRef.current.screenshotY + (deltaY / device.height) * 100;
    dragPendingRef.current = {
      x: Math.max(0, Math.min(100, newX)),
      y: Math.max(0, Math.min(100, newY))
    };

    if (dragFrameRef.current !== null) return;
    dragFrameRef.current = requestAnimationFrame(() => {
      dragFrameRef.current = null;
      if (!dragPendingRef.current) return;
      updateScreenshot(dragPendingRef.current);
      dragPendingRef.current = null;
    });
  }, [isDraggingPosition, currentScreenshot, canvasScale, outputDevice, updateScreenshot]);

  const handleCanvasMouseUp = useCallback(() => {
    if (isDraggingPosition && dragPendingRef.current) {
      pushHistory();
    }
    setIsDraggingPosition(false);
    if (dragFrameRef.current !== null) {
      cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }
    if (dragPendingRef.current) {
      updateScreenshot(dragPendingRef.current);
      dragPendingRef.current = null;
    }
  }, [isDraggingPosition, pushHistory, updateScreenshot]);

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportSingle = async () => {
    if (!canvasRef.current || !currentScreenshot || !currentScreenshot.imageData) return;
    const device = DEVICE_SIZES.find((d) => d.id === outputDevice) || DEVICE_SIZES[0];
    setExporting(true);
    setExportError(null);
    try {
      const blob = await exportImage(canvasRef.current, currentScreenshot, outputDevice);
      if (!blob) throw new Error('PNG generation returned empty data');
      triggerDownload(blob, `screenforge-${device.width}x${device.height}-${Date.now()}.png`);
    } catch (error) {
      console.error('Export single failed', error);
      setExportError('Export failed. Try again or refresh this page.');
    } finally { setExporting(false); }
  };

  const handleExportAll = async () => {
    if (screenshots.length === 0) return;
    const renderableScreenshots = screenshots.filter((shot) => Boolean(shot.imageData));
    if (renderableScreenshots.length !== screenshots.length) {
      setExportError('Some screenshots are still loading from local storage. Try again in a moment.');
      return;
    }

    const device = DEVICE_SIZES.find((d) => d.id === outputDevice) || DEVICE_SIZES[0];
    setExporting(true);
    setExportError(null);
    try {
      const blob = await exportAllAsZip(renderableScreenshots, outputDevice);
      if (!blob) throw new Error('ZIP generation returned empty data');
      triggerDownload(blob, `screenforge-batch-${device.width}x${device.height}-${Date.now()}.zip`);
    } catch (error) {
      console.error('Export batch failed', error);
      setExportError('Batch export failed. Try again or export one screenshot.');
    } finally { setExporting(false); }
  };

  const openUploader = () => {
    fileInputRef.current?.click();
  };

  const adjustPreviewZoom = (delta: number) => {
    setPreviewZoom((prev) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, prev + delta)));
  };

  return (
    <div className="app-shell h-screen flex flex-col bg-[--bg-primary] text-[--text-primary] overflow-hidden">
      {/* ─── HEADER ─── */}
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
              onChange={(e) => setOutputDevice(e.target.value)}
            >
              {DEVICE_SIZES.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mode-switch hidden md:flex">
            <button
              className={`mode-btn ${viewMode === 'editor' ? 'active' : ''}`}
              onClick={() => setViewMode('editor')}
            >
              Editor
            </button>
            <button
              className={`mode-btn ${viewMode === 'preview' ? 'active' : ''}`}
              onClick={() => setViewMode('preview')}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Undo / Redo */}
          <button
            onClick={undo}
            disabled={!canUndo}
            className="undo-btn"
            title="Undo (⌘Z)"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6" />
              <path d="M3 13C5.333 8.333 9 6 14 6c4 0 7 2 9 6" />
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="undo-btn"
            title="Redo (⌘⇧Z)"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 7v6h-6" />
              <path d="M21 13C18.667 8.333 15 6 10 6c-4 0-7 2-9 6" />
            </svg>
          </button>

          {screenshots.length > 1 ? (
            <button
              onClick={handleExportAll}
              disabled={exporting}
              className="btn-export-all header-export-btn disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Export
            </button>
          ) : (
            <button
              onClick={handleExportSingle}
              disabled={!hasRenderableCurrentScreenshot || exporting}
              className="btn-export-all header-export-btn disabled:opacity-50 disabled:pointer-events-none"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          )}
        </div>
      </header>

      <div className="workflow-bar">
        <div className="workflow-steps">
          <WorkflowStep index={1} label="Upload" state={workflowStep > 1 ? 'done' : 'active'} />
          <div className="workflow-step-link" />
          <WorkflowStep index={2} label="Style" state={workflowStep > 2 ? 'done' : workflowStep === 2 ? 'active' : 'idle'} />
          <div className="workflow-step-link" />
          <WorkflowStep index={3} label="Export" state={workflowStep === 3 ? 'active' : 'idle'} />
        </div>

        <div className="workflow-bar-meta">
          <span className="workflow-meta-chip">Target {currentDevice.width}×{currentDevice.height}</span>
        </div>
      </div>

      {exportError && (
        <div className="export-error-banner">
          <span>{exportError}</span>
          <button onClick={() => setExportError(null)} className="export-error-dismiss">Dismiss</button>
        </div>
      )}

      {/* ─── MAIN BODY ─── */}
      <div className={`workspace flex-1 flex overflow-hidden ${screenshots.length === 0 ? 'workspace-empty' : ''}`}>
        {/* ─── LEFT: Assets + Scene Presets ─── */}
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
                    {(['pass', shotCountStatus, textOverlayStatus, deviceFrameStatus, scaleStatus] as const).map((s, i) => (
                      <span key={i} className={`compliance-dot ${s}`} style={{ marginTop: 0 }} />
                    ))}
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, marginLeft: 2 }}>
                      {['pass', shotCountStatus, textOverlayStatus, deviceFrameStatus, scaleStatus].filter(s => s === 'pass').length}/5
                    </span>
                  </div>
                )}
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ color: 'var(--text-tertiary)', transition: 'transform 0.2s', transform: checklistOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
                >
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
                <button
                  onClick={() => updateScreenshot({ scale: 92, x: 50, y: 56, rotation: 0 })}
                  className="asset-fit-btn"
                >
                  Fit current shot on canvas
                </button>
              )}
              {currentScreenshot && (
                <button
                  onClick={() => removeScreenshot(currentScreenshot.id)}
                  className="asset-remove-btn"
                >
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
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ color: 'var(--text-tertiary)', transition: 'transform 0.2s', transform: scenePresetsOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {scenePresetsOpen && <TemplateGallery />}
        </aside>

        {/* ─── CENTER: Canvas ─── */}
        <main
          ref={canvasContainerRef}
          className={`canvas-stage flex-1 canvas-bg relative overflow-hidden ${viewMode === 'preview' ? 'preview-mode' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {screenshots.length > 0 && (
            <div className="canvas-hud">
              <button onClick={() => adjustPreviewZoom(-0.05)} className="hud-btn" title="Zoom out">-</button>
              <span className="hud-value">{Math.round(canvasScale * previewZoom * 100)}%</span>
              <button onClick={() => adjustPreviewZoom(0.05)} className="hud-btn" title="Zoom in">+</button>
              <button onClick={() => setPreviewZoom(1)} className="hud-btn" title="Fit">↺</button>
            </div>
          )}

          {screenshots.length === 0 ? (
            <div className="empty-stage absolute inset-0 z-10">
              <div className="empty-stage-card animate-fade-in">
                <div className="empty-stage-icon">
                  <svg className="w-16 h-16 text-[--accent]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="empty-stage-kicker">ScreenForge Studio</p>
                <h3 className="empty-stage-title">Build polished iPhone App Store screenshots</h3>
                <p className="empty-stage-subtitle">
                  Upload your app screens and instantly style them for iPhone 16/17 dimensions with device framing, text overlays, and effects.
                </p>
                <div className="empty-stage-steps">
                  <div className="empty-stage-step">1. Upload screenshot</div>
                  <div className="empty-stage-step">2. Style in editor</div>
                  <div className="empty-stage-step">3. Export App Store size</div>
                </div>
                <button
                  onClick={openUploader}
                  className="empty-stage-btn"
                >
                  Upload Screenshots
                </button>
                <p className="empty-stage-hint">Tip: drag and drop one or multiple screenshots anywhere on the canvas.</p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div
                className="transition-transform duration-300 ease-out pointer-events-auto"
                style={{ transform: `scale(${canvasScale * previewZoom})`, transformOrigin: 'center' }}
              >
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    boxShadow: '0 25px 60px -15px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)',
                    cursor: isDraggingPosition ? 'grabbing' : 'grab',
                  }}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                >
                  <div className="canvas-safe-zone" />
                  <canvas ref={canvasRef} className="block" width={currentDevice.width} height={currentDevice.height} />
                </div>
              </div>
            </div>
          )}

          {isDragging && (
            <div className="absolute inset-0 bg-[--accent]/8 backdrop-blur-md border-2 border-dashed border-[--accent] flex items-center justify-center z-50 transition-all">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-[--accent]/15 border border-[--accent]/30 flex items-center justify-center">
                  <svg className="w-10 h-10 text-[--accent]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-[--accent]">Drop screenshots here</p>
              </div>
            </div>
          )}

          {exporting && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
              <div className="glass-panel rounded-3xl px-10 py-8 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-[--accent] border-t-transparent animate-spin" />
                <p className="text-sm font-semibold">Exporting...</p>
              </div>
            </div>
          )}
        </main>

        {/* ─── RIGHT: Controls ─── */}
        <aside className={`control-panel w-80 flex flex-col shrink-0 border-l border-[--border] bg-[--bg-secondary] ${viewMode === 'preview' ? 'hidden' : ''}`}>
          <div className="control-tabs flex border-b border-[--border] overflow-x-auto">
            <TabButton active={activeTab === 'background'} icon={<BackgroundIcon />} label="Background" onClick={() => setActiveTab('background')} disabled={!currentScreenshot} />
            <TabButton active={activeTab === 'device'} icon={<DeviceIcon />} label="Device" onClick={() => setActiveTab('device')} disabled={!currentScreenshot} />
            <TabButton active={activeTab === 'text'} icon={<TextIcon />} label="Text" onClick={() => setActiveTab('text')} disabled={!currentScreenshot} />
            <TabButton
              active={activeTab === 'effects'}
              icon={<EffectsIcon />}
              label="Effects"
              onClick={() => setActiveTab('effects')}
              disabled={!currentScreenshot}
            />
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
                  <select
                    className="sf-select w-full"
                    value={outputDevice}
                    onChange={(e) => setOutputDevice(e.target.value)}
                  >
                    {DEVICE_SIZES.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.name}
                      </option>
                    ))}
                  </select>
                  <p className="inspector-empty-checklist-note">Choose your export size now so every screenshot is framed correctly.</p>
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
                        {['gradient', 'solid'].map((t) => (
                          <button key={t} onClick={() => updateBackground({ type: t as 'gradient' | 'solid' })}
                            className={`inspector-segment-btn ${bg.type === t ? 'active' : ''} ${
                              bg.type === t ? 'text-white' : 'text-[--text-secondary]'
                            }`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </Accordion>
                    {bg.type === 'gradient' && (
                      <Accordion title="Gradient Presets">
                        <div className="grid grid-cols-5 gap-2">
                          {GRADIENT_PRESETS.map((p, i) => (
                            <button key={i} onClick={() => applyGradientPreset(
                              [{ color: p.colors[0], position: 0 }, { color: p.colors[1], position: 100 }], p.angle
                            )}
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
                          <input type="color" value={bg.solid}
                            onChange={(e) => updateBackground({ solid: e.target.value })}
                            className="w-12 h-12 rounded-xl" />
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
                    {/* Frame Settings */}
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
                                <button
                                  key={fc.id}
                                  onClick={() => updateDeviceFrame({ frameColor: fc.color })}
                                  className={`frame-color-swatch ${frame.frameColor === fc.color ? 'active' : ''}`}
                                  style={{ background: fc.color }}
                                  title={fc.name}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </Accordion>

                    {/* Position */}
                    <Accordion title="Position">
                      <div className="grid grid-cols-4 gap-2">
                        {POSITION_PRESETS.map((p, i) => (
                          <button key={i} onClick={() => applyPositionPreset(p)}
                            className="position-preset-btn">
                            <span className="text-base opacity-50">{p.icon}</span>
                            <span className="font-medium">{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </Accordion>

                    <Accordion title="Size & Position">
                      <div onMouseUp={() => pushHistory()}>
                        <SliderRow label="Scale" value={config.scale} min={20} max={120} unit="%"
                          onChange={(v) => updateScreenshot({ scale: v })} />
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <SliderRow label="X" value={config.x} min={0} max={100} unit="%"
                            onChange={(v) => updateScreenshot({ x: v })} />
                          <SliderRow label="Y" value={config.y} min={0} max={100} unit="%"
                            onChange={(v) => updateScreenshot({ y: v })} />
                        </div>
                        {!frame.enabled && (
                          <div className="mt-4">
                            <SliderRow label="Corner Radius" value={config.cornerRadius} min={0} max={60} unit="px"
                              onChange={(v) => updateScreenshot({ cornerRadius: v })} />
                          </div>
                        )}
                        <div className="mt-4">
                          <SliderRow label="Rotation" value={config.rotation} min={-45} max={45} unit="°"
                            onChange={(v) => updateScreenshot({ rotation: v })} />
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
                          <SliderRow label="Blur" value={config.shadow.blur} min={0} max={150} unit="px"
                            onChange={(v) => updateShadow({ blur: v })} />
                          <div className="mt-4">
                            <SliderRow label="Opacity" value={config.shadow.opacity} min={0} max={100} unit="%"
                              onChange={(v) => updateShadow({ opacity: v })} />
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <SliderRow label="Offset X" value={config.shadow.x} min={-60} max={60} unit="px"
                              onChange={(v) => updateShadow({ x: v })} />
                            <SliderRow label="Offset Y" value={config.shadow.y} min={-60} max={60} unit="px"
                              onChange={(v) => updateShadow({ y: v })} />
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
                            <SliderRow label="Width" value={config.border.width} min={0} max={30} unit="px"
                              onChange={(v) => updateBorder({ width: v })} />
                            <div className="mt-4">
                              <SliderRow label="Opacity" value={config.border.opacity} min={0} max={100} unit="%"
                                onChange={(v) => updateBorder({ opacity: v })} />
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
                              <select value={text.headlineFont}
                                onChange={(e) => updateText({ headlineFont: e.target.value })}
                                className="sf-select w-full">
                                {FONT_OPTIONS.map(f => (
                                  <option key={f.value} value={f.value}>{f.label}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <span className="text-[10px] text-[--text-tertiary] mb-1.5 block font-medium">Weight</span>
                              <select value={text.headlineWeight}
                                onChange={(e) => updateText({ headlineWeight: e.target.value })}
                                className="sf-select w-full">
                                {WEIGHT_OPTIONS.map(w => (
                                  <option key={w.value} value={w.value}>{w.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div onMouseUp={() => pushHistory()}>
                            <SliderRow label="Size" value={text.headlineSize} min={24} max={160} unit="px"
                              onChange={(v) => updateText({ headlineSize: v })} />
                          </div>
                          <div>
                            <span className="text-[10px] text-[--text-tertiary] mb-1.5 block font-medium">Color</span>
                            <input type="color" value={text.headlineColor}
                              onChange={(e) => updateText({ headlineColor: e.target.value })}
                              className="color-input-wide" />
                          </div>
                          <div>
                            <span className="text-[10px] text-[--text-tertiary] mb-1.5 block font-medium">Position</span>
                            <div className="inspector-segment">
                              {(['top', 'bottom'] as const).map(pos => (
                                <button key={pos} onClick={() => updateText({ headlinePosition: pos })}
                                  className={`inspector-segment-btn ${text.headlinePosition === pos ? 'active' : ''} ${
                                    text.headlinePosition === pos ? 'text-white' : 'text-[--text-secondary]'
                                  }`}>
                                  {pos}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div onMouseUp={() => pushHistory()}>
                            <SliderRow label="Offset Y" value={text.headlineOffsetY} min={2} max={40} unit="%"
                              onChange={(v) => updateText({ headlineOffsetY: v })} />
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
                            <SliderRow label="Size" value={text.subheadlineSize} min={16} max={100} unit="px"
                              onChange={(v) => updateText({ subheadlineSize: v })} />
                            <div className="mt-4">
                              <SliderRow label="Opacity" value={text.subheadlineOpacity} min={0} max={100} unit="%"
                                onChange={(v) => updateText({ subheadlineOpacity: v })} />
                            </div>
                            <div className="mt-4">
                              <SliderRow label="Offset Y" value={text.subheadlineOffsetY} min={-100} max={100} unit="px"
                                onChange={(v) => updateText({ subheadlineOffsetY: v })} />
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
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => { handleFileUpload(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}
