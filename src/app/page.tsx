'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { selectCurrentScreenshot, useAppStore } from '@/stores/app-store';
import { DEVICE_SIZES } from '@/types';
import { renderToCanvas, exportImage, exportAllAsZip } from '@/lib/canvas';
import { getScreenshotImage, saveScreenshotImage } from '@/lib/storage/image-store';
import { AppHeader } from '@/components/AppHeader';
import { WorkflowBar } from '@/components/WorkflowBar';
import { AssetRail } from '@/components/AssetRail';
import { CanvasStage } from '@/components/CanvasStage';
import { ControlPanel } from '@/components/ControlPanel';

const CANVAS_MAX_SCALE = 0.65;
const CANVAS_PADDING = 80;

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canvasScale, setCanvasScale] = useState(0.55);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [isDraggingPosition, setIsDraggingPosition] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, screenshotX: 0, screenshotY: 0 });
  const dragFrameRef = useRef<number | null>(null);
  const dragPendingRef = useRef<{ x: number; y: number } | null>(null);
  const syncedImageIdsRef = useRef<Set<string>>(new Set());

  const { screenshots, outputDevice, canUndo, canRedo, addScreenshot, hydrateScreenshotImage, setOutputDevice, updateScreenshot, pushHistory, undo, redo } =
    useAppStore(useShallow((state) => ({
      screenshots: state.screenshots,
      outputDevice: state.outputDevice,
      canUndo: state.canUndo,
      canRedo: state.canRedo,
      addScreenshot: state.addScreenshot,
      hydrateScreenshotImage: state.hydrateScreenshotImage,
      setOutputDevice: state.setOutputDevice,
      updateScreenshot: state.updateScreenshot,
      pushHistory: state.pushHistory,
      undo: state.undo,
      redo: state.redo,
    })));

  const currentScreenshot = useAppStore(selectCurrentScreenshot);
  const hasRenderableCurrentScreenshot = Boolean(currentScreenshot?.imageData);
  const currentDevice = DEVICE_SIZES.find((d) => d.id === outputDevice) || DEVICE_SIZES[0];
  const workflowStep = screenshots.length === 0 ? 1 : viewMode === 'editor' ? 2 : 3;

  useEffect(() => {
    if (!DEVICE_SIZES.some((d) => d.id === outputDevice)) setOutputDevice(DEVICE_SIZES[0].id);
  }, [outputDevice, setOutputDevice]);

  useEffect(() => {
    const activeIds = new Set(screenshots.map((s) => s.imageId));
    for (const id of syncedImageIdsRef.current) {
      if (!activeIds.has(id)) syncedImageIdsRef.current.delete(id);
    }
    screenshots.forEach((shot) => {
      if (!shot.imageData || syncedImageIdsRef.current.has(shot.imageId)) return;
      syncedImageIdsRef.current.add(shot.imageId);
      void saveScreenshotImage(shot.imageId, shot.imageData);
    });
  }, [screenshots]);

  useEffect(() => {
    const missingImages = screenshots.filter((s) => !s.imageData && Boolean(s.imageId));
    if (!missingImages.length) return;
    let cancelled = false;
    void Promise.all(
      missingImages.map(async (shot) => {
        const imageData = await getScreenshotImage(shot.imageId);
        if (!cancelled && imageData) hydrateScreenshotImage(shot.id, imageData);
      })
    );
    return () => { cancelled = true; };
  }, [screenshots, hydrateScreenshotImage]);

  useEffect(() => {
    return () => { if (dragFrameRef.current !== null) cancelAnimationFrame(dragFrameRef.current); };
  }, []);

  useEffect(() => {
    if (!exportError) return;
    const timeout = window.setTimeout(() => setExportError(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [exportError]);

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

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;
    const resize = () => {
      const device = DEVICE_SIZES.find((d) => d.id === outputDevice) || DEVICE_SIZES[0];
      const maxW = container.clientWidth - CANVAS_PADDING;
      const maxH = container.clientHeight - CANVAS_PADDING;
      setCanvasScale(Math.min(maxW / device.width, maxH / device.height, CANVAS_MAX_SCALE));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [outputDevice]);

  useEffect(() => {
    if (!canvasRef.current) return;
    renderToCanvas(canvasRef.current, currentScreenshot, outputDevice);
  }, [currentScreenshot, outputDevice]);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result;
          if (typeof result === 'string') addScreenshot(result);
        };
        reader.readAsDataURL(file);
      }
    });
  }, [addScreenshot]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (!currentScreenshot || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setIsDraggingPosition(true);
    dragStartRef.current = {
      x: (e.clientX - rect.left) / canvasScale,
      y: (e.clientY - rect.top) / canvasScale,
      screenshotX: currentScreenshot.screenshot.x,
      screenshotY: currentScreenshot.screenshot.y,
    };
  }, [currentScreenshot, canvasScale]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingPosition || !canvasRef.current || !currentScreenshot) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const device = DEVICE_SIZES.find((d) => d.id === outputDevice) || DEVICE_SIZES[0];
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;
    dragPendingRef.current = {
      x: Math.max(0, Math.min(100, dragStartRef.current.screenshotX + ((x - dragStartRef.current.x) / device.width) * 100)),
      y: Math.max(0, Math.min(100, dragStartRef.current.screenshotY + ((y - dragStartRef.current.y) / device.height) * 100)),
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
    if (isDraggingPosition && dragPendingRef.current) pushHistory();
    setIsDraggingPosition(false);
    if (dragFrameRef.current !== null) { cancelAnimationFrame(dragFrameRef.current); dragFrameRef.current = null; }
    if (dragPendingRef.current) { updateScreenshot(dragPendingRef.current); dragPendingRef.current = null; }
  }, [isDraggingPosition, pushHistory, updateScreenshot]);

  const triggerDownload = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }, []);

  const handleExportSingle = useCallback(async () => {
    if (!canvasRef.current || !currentScreenshot?.imageData) return;
    const device = DEVICE_SIZES.find((d) => d.id === outputDevice) || DEVICE_SIZES[0];
    setExporting(true); setExportError(null);
    try {
      const blob = await exportImage(canvasRef.current, currentScreenshot, outputDevice);
      if (!blob) throw new Error('PNG generation returned empty data');
      triggerDownload(blob, `screenforge-${device.width}x${device.height}-${Date.now()}.png`);
    } catch (err) {
      console.error('Export single failed', err);
      setExportError('Export failed. Try again or refresh this page.');
    } finally { setExporting(false); }
  }, [canvasRef, currentScreenshot, outputDevice, triggerDownload]);

  const handleExportAll = useCallback(async () => {
    if (!screenshots.length) return;
    const renderable = screenshots.filter((s) => Boolean(s.imageData));
    if (renderable.length !== screenshots.length) {
      setExportError('Some screenshots are still loading. Try again in a moment.');
      return;
    }
    const device = DEVICE_SIZES.find((d) => d.id === outputDevice) || DEVICE_SIZES[0];
    setExporting(true); setExportError(null);
    try {
      const blob = await exportAllAsZip(renderable, outputDevice);
      if (!blob) throw new Error('ZIP generation returned empty data');
      triggerDownload(blob, `screenforge-batch-${device.width}x${device.height}-${Date.now()}.zip`);
    } catch (err) {
      console.error('Export batch failed', err);
      setExportError('Batch export failed. Try again or export one screenshot.');
    } finally { setExporting(false); }
  }, [screenshots, outputDevice, triggerDownload]);

  const openUploader = useCallback(() => { fileInputRef.current?.click(); }, []);

  return (
    <div className="app-shell h-screen flex flex-col bg-[--bg-primary] text-[--text-primary] overflow-hidden">
      <AppHeader
        outputDevice={outputDevice}
        onSetOutputDevice={setOutputDevice}
        viewMode={viewMode}
        onSetViewMode={setViewMode}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        screenshotCount={screenshots.length}
        hasRenderableScreenshot={hasRenderableCurrentScreenshot}
        exporting={exporting}
        onExportSingle={handleExportSingle}
        onExportAll={handleExportAll}
      />
      <WorkflowBar
        workflowStep={workflowStep}
        deviceWidth={currentDevice.width}
        deviceHeight={currentDevice.height}
      />

      {exportError && (
        <div className="export-error-banner">
          <span>{exportError}</span>
          <button onClick={() => setExportError(null)} className="export-error-dismiss">Dismiss</button>
        </div>
      )}

      <div className={`workspace flex-1 flex overflow-hidden ${screenshots.length === 0 ? 'workspace-empty' : ''}`}>
        <AssetRail viewMode={viewMode} openUploader={openUploader} />
        <CanvasStage
          canvasRef={canvasRef}
          containerRef={canvasContainerRef}
          canvasScale={canvasScale}
          outputDevice={outputDevice}
          exporting={exporting}
          isDraggingPosition={isDraggingPosition}
          viewMode={viewMode}
          onDrop={handleDrop}
          onCanvasMouseDown={handleCanvasMouseDown}
          onCanvasMouseMove={handleCanvasMouseMove}
          onCanvasMouseUp={handleCanvasMouseUp}
          openUploader={openUploader}
        />
        <ControlPanel viewMode={viewMode} openUploader={openUploader} />
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
