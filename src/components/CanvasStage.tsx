'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { DEVICE_SIZES } from '@/types';

const ZOOM_MIN = 0.7;
const ZOOM_MAX = 1.4;

interface CanvasStageProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  canvasScale: number;
  outputDevice: string;
  exporting: boolean;
  isDraggingPosition: boolean;
  viewMode: 'editor' | 'preview';
  onDrop: (e: React.DragEvent) => void;
  onCanvasMouseDown: (e: React.MouseEvent) => void;
  onCanvasMouseMove: (e: React.MouseEvent) => void;
  onCanvasMouseUp: () => void;
  openUploader: () => void;
}

export function CanvasStage({
  canvasRef, containerRef, canvasScale, outputDevice, exporting, isDraggingPosition, viewMode,
  onDrop, onCanvasMouseDown, onCanvasMouseMove, onCanvasMouseUp, openUploader,
}: CanvasStageProps) {
  const [previewZoom, setPreviewZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const screenshotCount = useAppStore((state) => state.screenshots.length);
  const currentDevice = DEVICE_SIZES.find((d) => d.id === outputDevice) || DEVICE_SIZES[0];

  const adjustPreviewZoom = useCallback((delta: number) => {
    setPreviewZoom((prev) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, prev + delta)));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    setIsDragging(false);
    onDrop(e);
  }, [onDrop]);

  return (
    <main
      ref={containerRef}
      className={`canvas-stage flex-1 canvas-bg relative overflow-hidden ${viewMode === 'preview' ? 'preview-mode' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {screenshotCount > 0 && (
        <div className="canvas-hud">
          <button onClick={() => adjustPreviewZoom(-0.05)} className="hud-btn" title="Zoom out">-</button>
          <span className="hud-value">{Math.round(canvasScale * previewZoom * 100)}%</span>
          <button onClick={() => adjustPreviewZoom(0.05)} className="hud-btn" title="Zoom in">+</button>
          <button onClick={() => setPreviewZoom(1)} className="hud-btn" title="Fit">↺</button>
        </div>
      )}

      {screenshotCount === 0 ? (
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
            <button onClick={openUploader} className="empty-stage-btn">Upload Screenshots</button>
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
              onMouseDown={onCanvasMouseDown}
              onMouseMove={onCanvasMouseMove}
              onMouseUp={onCanvasMouseUp}
              onMouseLeave={onCanvasMouseUp}
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
  );
}
