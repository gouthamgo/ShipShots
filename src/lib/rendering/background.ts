import { BackgroundConfig } from '@/types';
import { clamp } from '@/lib/rendering/geometry';

let noisePatternCache: { pattern: CanvasPattern; intensity: number } | null = null;

export function drawPlaceholder(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = '#f1f3f5';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#e2e5e9';
  ctx.lineWidth = 1;

  for (let x = 0; x < width; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y < height; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bg: BackgroundConfig
) {
  if (bg.type === 'solid') {
    ctx.fillStyle = bg.solid;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (bg.type === 'gradient') {
    const { angle, stops } = bg.gradient;
    const rad = ((angle - 90) * Math.PI) / 180;
    const diag = Math.sqrt(width ** 2 + height ** 2);
    const x1 = width / 2 - (Math.cos(rad) * diag) / 2;
    const y1 = height / 2 - (Math.sin(rad) * diag) / 2;
    const x2 = width / 2 + (Math.cos(rad) * diag) / 2;
    const y2 = height / 2 + (Math.sin(rad) * diag) / 2;
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);

    stops.forEach((stop) => {
      gradient.addColorStop(clamp(stop.position / 100, 0, 1), stop.color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  ctx.fillStyle = bg.solid;
  ctx.fillRect(0, 0, width, height);
}

export function drawNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number
) {
  if (!noisePatternCache || noisePatternCache.intensity !== intensity) {
    const size = 150;
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = size;
    noiseCanvas.height = size;
    const noiseCtx = noiseCanvas.getContext('2d');
    if (!noiseCtx) return;

    const imageData = noiseCtx.createImageData(size, size);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = Math.min(255, Math.round(intensity * 2.5));
    }

    noiseCtx.putImageData(imageData, 0, 0);
    const pattern = ctx.createPattern(noiseCanvas, 'repeat');
    if (pattern) {
      noisePatternCache = { pattern, intensity };
    }
  }

  if (!noisePatternCache) return;
  ctx.fillStyle = noisePatternCache.pattern;
  ctx.fillRect(0, 0, width, height);
}
