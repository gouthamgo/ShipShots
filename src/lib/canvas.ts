'use client';

import { BackgroundConfig, DeviceSize, Screenshot, TextConfig, DEVICE_SIZES } from '@/types';
import { ISOMETRIC_PRESETS } from '@/lib/presets';

// ═══════════════════════════════════════
// ─── Image Cache ───
// ═══════════════════════════════════════

const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return Promise.resolve(cached);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { imageCache.set(src, img); resolve(img); };
    img.onerror = reject;
    img.src = src;
  });
}

let noisePatternCache: { pattern: CanvasPattern; intensity: number } | null = null;

// ═══════════════════════════════════════
// ─── Phone Frame Proportions ───
// ═══════════════════════════════════════
// All values relative to phone width

const PHONE = {
  aspect: 2.17,           // height / width
  bodyRadius: 0.115,
  bezel: 0.032,
  screenRadius: 0.098,
  dynamicIsland: {
    width: 0.29,
    height: 0.043,
    top: 0.02,
    radius: 0.0215,
  },
  homeIndicator: {
    width: 0.34,
    height: 0.012,
    bottom: 0.018,
  },
};

// ═══════════════════════════════════════
// ─── Drawing Helpers ───
// ═══════════════════════════════════════

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function adjustColor(hex: string, amount: number): string {
  // Handle short hex or invalid
  if (!hex || hex.length < 7) return hex || '#000000';
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ═══════════════════════════════════════
// ─── Main Render ───
// ═══════════════════════════════════════

export async function renderToCanvas(
  canvas: HTMLCanvasElement,
  screenshot: Screenshot | null,
  deviceId: string
): Promise<void> {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;
  
  // Enable high quality image rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const device = DEVICE_SIZES.find(d => d.id === deviceId) || DEVICE_SIZES[0];
  canvas.width = device.width;
  canvas.height = device.height;

  if (!screenshot) {
    drawPlaceholder(ctx, canvas);
    return;
  }

  // 1. Background
  drawBackground(ctx, canvas, screenshot.background);

  // 2. Noise
  if (screenshot.background.noise) {
    drawNoise(ctx, canvas, screenshot.background.noiseIntensity);
  }

  // 3. Screenshot / Phone
  const df = screenshot.screenshot.deviceFrame;
  const frameEnabled = df?.enabled !== false;

  if (frameEnabled) {
    await drawPhoneIsometric(ctx, canvas, screenshot, device);
  } else {
    await drawSimpleScreenshot(ctx, canvas, screenshot, device);
  }

  // 4. Text
  drawText(ctx, canvas, screenshot.text, device);
}

// ═══════════════════════════════════════
// ─── Background ───
// ═══════════════════════════════════════

function drawPlaceholder(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  ctx.fillStyle = '#f1f3f5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#e2e5e9';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 60) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bg: BackgroundConfig) {
  if (bg.type === 'solid') {
    ctx.fillStyle = bg.solid;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (bg.type === 'gradient') {
    const { angle, stops } = bg.gradient;
    const rad = (angle - 90) * Math.PI / 180;
    const diag = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
    const x1 = canvas.width / 2 - Math.cos(rad) * diag / 2;
    const y1 = canvas.height / 2 - Math.sin(rad) * diag / 2;
    const x2 = canvas.width / 2 + Math.cos(rad) * diag / 2;
    const y2 = canvas.height / 2 + Math.sin(rad) * diag / 2;
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    stops.forEach((stop) => {
      gradient.addColorStop(Math.max(0, Math.min(1, stop.position / 100)), stop.color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function drawNoise(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, intensity: number) {
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
      data[i] = v; data[i + 1] = v; data[i + 2] = v;
      data[i + 3] = intensity * 2.5;
    }
    noiseCtx.putImageData(imageData, 0, 0);
    const pattern = ctx.createPattern(noiseCanvas, 'repeat');
    if (pattern) noisePatternCache = { pattern, intensity };
  }
  if (noisePatternCache) {
    ctx.fillStyle = noisePatternCache.pattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// ═══════════════════════════════════════
// ─── 3D Isometric Phone Rendering ───
// ═══════════════════════════════════════

async function drawPhoneIsometric(
  ctx: CanvasRenderingContext2D,
  _canvas: HTMLCanvasElement,
  screenshot: Screenshot,
  device: DeviceSize
) {
  const config = screenshot.screenshot;
  const frame = {
    presetId: config.deviceFrame?.presetId || 'front',
    frameColor: config.deviceFrame?.frameColor || '#1a1a1a',
  };

  const preset = ISOMETRIC_PRESETS.find(p => p.id === frame.presetId) || ISOMETRIC_PRESETS[0];

  let img: HTMLImageElement;
  try { img = await loadImage(screenshot.imageData); } catch { return; }

  // Calculate phone size
  const scale = config.scale / 100;
  const phoneWidth = device.width * 0.72 * scale;
  const phoneHeight = phoneWidth * PHONE.aspect;

  const centerX = (config.x / 100) * device.width;
  const centerY = (config.y / 100) * device.height;

  ctx.save();

  // Position & rotation
  ctx.translate(centerX, centerY);
  if (config.rotation) {
    ctx.rotate(config.rotation * Math.PI / 180);
  }

  // Apply isometric transform
  const { a, b, c, d } = preset.transform;
  ctx.transform(a, b, c, d, 0, 0);

  ctx.translate(-centerX, -centerY);

  const x = centerX - phoneWidth / 2;
  const y = centerY - phoneHeight / 2;
  const bodyR = phoneWidth * PHONE.bodyRadius;

  // ── 3D Side Edge (depth effect) ──
  if (preset.edgeThickness > 0 && preset.edgeDirection !== 'none') {
    const edgeW = phoneWidth * preset.edgeThickness;
    const edgeColor = adjustColor(frame.frameColor, -40);

    ctx.fillStyle = edgeColor;
    if (preset.edgeDirection === 'right') {
      drawRoundedRect(ctx, x + edgeW, y + edgeW * 0.35, phoneWidth, phoneHeight, bodyR);
    } else {
      drawRoundedRect(ctx, x - edgeW, y + edgeW * 0.35, phoneWidth, phoneHeight, bodyR);
    }
    ctx.fill();

    // Add subtle gradient on the edge for realism
    const edgeGrad = ctx.createLinearGradient(
      preset.edgeDirection === 'right' ? x + phoneWidth : x - edgeW,
      y,
      preset.edgeDirection === 'right' ? x + phoneWidth + edgeW : x,
      y
    );
    edgeGrad.addColorStop(0, 'rgba(255,255,255,0.06)');
    edgeGrad.addColorStop(1, 'rgba(0,0,0,0.15)');
    ctx.fillStyle = edgeGrad;
    if (preset.edgeDirection === 'right') {
      drawRoundedRect(ctx, x + edgeW, y + edgeW * 0.35, phoneWidth, phoneHeight, bodyR);
    } else {
      drawRoundedRect(ctx, x - edgeW, y + edgeW * 0.35, phoneWidth, phoneHeight, bodyR);
    }
    ctx.fill();
  }

  // ── Shadow ──
  if (config.shadow.enabled) {
    ctx.save();
    const alpha = Math.round((config.shadow.opacity / 100) * 255).toString(16).padStart(2, '0');
    ctx.shadowColor = config.shadow.color + alpha;
    ctx.shadowBlur = config.shadow.blur;
    ctx.shadowOffsetX = config.shadow.x;
    ctx.shadowOffsetY = config.shadow.y;
    drawRoundedRect(ctx, x, y, phoneWidth, phoneHeight, bodyR);
    ctx.fillStyle = 'rgba(0,0,0,0.01)';
    ctx.fill();
    ctx.restore();
  }

  // ── Phone Body ──
  ctx.fillStyle = frame.frameColor;
  drawRoundedRect(ctx, x, y, phoneWidth, phoneHeight, bodyR);
  ctx.fill();

  // Body edge highlight
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, x + 1, y + 1, phoneWidth - 2, phoneHeight - 2, bodyR - 1);
  ctx.stroke();
  ctx.restore();

  // ── Screen Area ──
  const bezel = phoneWidth * PHONE.bezel;
  const screenX = x + bezel;
  const screenY = y + bezel;
  const screenW = phoneWidth - bezel * 2;
  const screenH = phoneHeight - bezel * 2;
  const screenR = phoneWidth * PHONE.screenRadius;

  // Screen background (black, visible if image doesn't cover)
  ctx.fillStyle = '#000000';
  drawRoundedRect(ctx, screenX, screenY, screenW, screenH, screenR);
  ctx.fill();

  // Clip and draw screenshot
  ctx.save();
  drawRoundedRect(ctx, screenX, screenY, screenW, screenH, screenR);
  ctx.clip();

  const imgAspect = img.naturalWidth / img.naturalHeight;
  const screenAspect = screenW / screenH;
  let dw: number, dh: number, dx: number, dy: number;

  if (imgAspect > screenAspect) {
    dh = screenH;
    dw = dh * imgAspect;
    dx = screenX + (screenW - dw) / 2;
    dy = screenY;
  } else {
    dw = screenW;
    dh = dw / imgAspect;
    dx = screenX;
    dy = screenY + (screenH - dh) / 2;
  }

  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();

  // ── Dynamic Island ──
  const di = PHONE.dynamicIsland;
  const diW = phoneWidth * di.width;
  const diH = phoneWidth * di.height;
  const diX = centerX - diW / 2;
  const diY = screenY + phoneWidth * di.top;
  const diR = phoneWidth * di.radius;

  ctx.fillStyle = '#000000';
  drawRoundedRect(ctx, diX, diY, diW, diH, diR);
  ctx.fill();

  // Subtle camera lens dot
  const lensDot = phoneWidth * 0.012;
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(diX + diW * 0.72, diY + diH / 2, lensDot, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(diX + diW * 0.72, diY + diH / 2, lensDot * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // ── Home Indicator ──
  const hi = PHONE.homeIndicator;
  const hiW = phoneWidth * hi.width;
  const hiH = phoneWidth * hi.height;
  const hiX = centerX - hiW / 2;
  const hiY = screenY + screenH - phoneWidth * hi.bottom - hiH;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  drawRoundedRect(ctx, hiX, hiY, hiW, hiH, hiH / 2);
  ctx.fill();

  // ── Subtle screen edge ──
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, screenX, screenY, screenW, screenH, screenR);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

// ═══════════════════════════════════════
// ─── Simple Screenshot (no frame) ───
// ═══════════════════════════════════════

async function drawSimpleScreenshot(
  ctx: CanvasRenderingContext2D,
  _canvas: HTMLCanvasElement,
  screenshot: Screenshot,
  device: DeviceSize
) {
  const config = screenshot.screenshot;

  let img: HTMLImageElement;
  try { img = await loadImage(screenshot.imageData); } catch { return; }

  const scale = config.scale / 100;
  const centerX = (config.x / 100) * device.width;
  const centerY = (config.y / 100) * device.height;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(config.rotation * Math.PI / 180);

  const { perspective } = config.effects;
  if (perspective.rotateX !== 0 || perspective.rotateY !== 0) {
    const scaleX = Math.cos(perspective.rotateY * Math.PI / 180);
    const scaleY = Math.cos(perspective.rotateX * Math.PI / 180);
    ctx.scale(scaleX, scaleY);
  }

  ctx.translate(-centerX, -centerY);

  const imgWidth = img.naturalWidth * scale;
  const imgHeight = img.naturalHeight * scale;
  const x = centerX - imgWidth / 2;
  const y = centerY - imgHeight / 2;

  if (config.shadow.enabled) {
    const alpha = Math.round((config.shadow.opacity / 100) * 255).toString(16).padStart(2, '0');
    ctx.shadowColor = config.shadow.color + alpha;
    ctx.shadowBlur = config.shadow.blur;
    ctx.shadowOffsetX = config.shadow.x;
    ctx.shadowOffsetY = config.shadow.y;
  }

  const r = config.cornerRadius;
  drawRoundedRect(ctx, x, y, imgWidth, imgHeight, r);

  if (config.shadow.enabled) {
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  ctx.clip();
  ctx.drawImage(img, x, y, imgWidth, imgHeight);

  if (config.border.enabled && config.border.width > 0) {
    ctx.restore();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(config.rotation * Math.PI / 180);
    if (perspective.rotateX !== 0 || perspective.rotateY !== 0) {
      ctx.scale(
        Math.cos(perspective.rotateY * Math.PI / 180),
        Math.cos(perspective.rotateX * Math.PI / 180)
      );
    }
    ctx.translate(-centerX, -centerY);

    const alpha = Math.round((config.border.opacity / 100) * 255).toString(16).padStart(2, '0');
    ctx.strokeStyle = config.border.color + alpha;
    ctx.lineWidth = config.border.width;
    drawRoundedRect(ctx, x, y, imgWidth, imgHeight, r);
    ctx.stroke();
  }

  ctx.restore();
}

// ═══════════════════════════════════════
// ─── Text Rendering ───
// ═══════════════════════════════════════

function drawText(ctx: CanvasRenderingContext2D, _canvas: HTMLCanvasElement, text: TextConfig, device: DeviceSize) {
  ctx.textAlign = 'center';

  if (text.headlineEnabled && text.headline) {
    const fontFamily = text.headlineFont === 'system'
      ? '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      : `"${text.headlineFont}", sans-serif`;

    ctx.font = `${text.headlineWeight} ${text.headlineSize}px ${fontFamily}`;
    ctx.fillStyle = text.headlineColor;
    ctx.textBaseline = text.headlinePosition === 'top' ? 'top' : 'bottom';

    let y: number;
    if (text.headlinePosition === 'top') {
      y = (text.headlineOffsetY / 100) * device.height;
    } else {
      y = device.height - (text.headlineOffsetY / 100) * device.height;
    }

    const maxWidth = device.width * 0.85;
    const words = text.headline.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineSpacing = text.headlineSize * (text.lineHeight / 100);
    lines.forEach((line: string, i: number) => {
      ctx.fillText(line, device.width / 2, y + i * lineSpacing);
    });

    if (text.subheadlineEnabled && text.subheadline) {
      const subFontFamily = text.subheadlineFont === 'system'
        ? '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        : `"${text.subheadlineFont}", sans-serif`;

      ctx.font = `${text.subheadlineWeight} ${text.subheadlineSize}px ${subFontFamily}`;
      ctx.fillStyle = text.subheadlineColor;
      ctx.globalAlpha = text.subheadlineOpacity / 100;
      ctx.textBaseline = 'top';

      const subY = y + lines.length * lineSpacing + text.headlineSize * 0.5 + text.subheadlineOffsetY;
      ctx.fillText(text.subheadline, device.width / 2, subY);
      ctx.globalAlpha = 1;
    }
  }
}

// ═══════════════════════════════════════
// ─── Export ───
// ═══════════════════════════════════════

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
    if (blob) zip.file(`screenshot-${i + 1}.png`, blob);
  }

  return zip.generateAsync({ type: 'blob' });
}
