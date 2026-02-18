'use client';

import { drawBackground, drawNoise, drawPlaceholder } from '@/lib/rendering/background';
import { drawDeviceLayer } from '@/lib/rendering/device';
import { drawText } from '@/lib/rendering/text';
import { DEVICE_SIZES, Screenshot } from '@/types';

const renderSequence = new WeakMap<HTMLCanvasElement, number>();

function nextRenderId(canvas: HTMLCanvasElement): number {
  const nextId = (renderSequence.get(canvas) ?? 0) + 1;
  renderSequence.set(canvas, nextId);
  return nextId;
}

function isStaleRender(canvas: HTMLCanvasElement, renderId: number): boolean {
  return renderSequence.get(canvas) !== renderId;
}

export async function renderToCanvas(
  canvas: HTMLCanvasElement,
  screenshot: Screenshot | null,
  deviceId: string
): Promise<void> {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const renderId = nextRenderId(canvas);
  const shouldAbort = () => isStaleRender(canvas, renderId);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const device = DEVICE_SIZES.find((candidate) => candidate.id === deviceId) || DEVICE_SIZES[0];
  canvas.width = device.width;
  canvas.height = device.height;

  if (!screenshot) {
    drawPlaceholder(ctx, canvas.width, canvas.height);
    return;
  }

  drawBackground(ctx, canvas.width, canvas.height, screenshot.background);
  if (screenshot.background.noise) {
    drawNoise(ctx, canvas.width, canvas.height, screenshot.background.noiseIntensity);
  }

  await drawDeviceLayer(ctx, screenshot, device, shouldAbort);
  if (shouldAbort()) return;

  if (typeof document !== 'undefined') {
    await document.fonts.ready;
    if (shouldAbort()) return;
  }
  drawText(ctx, screenshot.text, device);
}

export async function exportImage(
  canvas: HTMLCanvasElement,
  screenshot: Screenshot,
  deviceId: string
): Promise<Blob | null> {
  await renderToCanvas(canvas, screenshot, deviceId);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
  });
}

export async function exportAllAsZip(
  screenshots: Screenshot[],
  deviceId: string
): Promise<Blob | null> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  const exportCanvas = document.createElement('canvas');

  for (let i = 0; i < screenshots.length; i++) {
    const blob = await exportImage(exportCanvas, screenshots[i], deviceId);
    if (blob) {
      zip.file(`screenshot-${i + 1}.png`, blob);
    }
  }

  return zip.generateAsync({ type: 'blob' });
}
