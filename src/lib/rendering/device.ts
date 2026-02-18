import { DEFAULT_EFFECTS, ISOMETRIC_PRESETS } from '@/lib/presets';
import { adjustColor, clamp, colorWithAlpha, drawRoundedRect } from '@/lib/rendering/geometry';
import { loadImage } from '@/lib/rendering/image-cache';
import { DeviceSize, EffectsConfig, IsometricPreset, Screenshot, ScreenshotConfig } from '@/types';

const PHONE = {
  aspect: 2.17,
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

interface SimpleMetrics {
  centerX: number;
  centerY: number;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

interface FramedMetrics {
  centerX: number;
  centerY: number;
  x: number;
  y: number;
  phoneWidth: number;
  phoneHeight: number;
  bodyRadius: number;
}

interface SubjectRenderOptions {
  includeShadow: boolean;
  includeBorder: boolean;
  includeGlow: boolean;
}

type ShouldAbort = (() => boolean) | undefined;

function resolveEffects(config: ScreenshotConfig): EffectsConfig {
  return {
    ...DEFAULT_EFFECTS,
    ...config.effects,
    glow: { ...DEFAULT_EFFECTS.glow, ...config.effects?.glow },
    reflection: { ...DEFAULT_EFFECTS.reflection, ...config.effects?.reflection },
    perspective: { ...DEFAULT_EFFECTS.perspective, ...config.effects?.perspective },
  };
}

function applyPerspectiveTransform(
  ctx: CanvasRenderingContext2D,
  effects: EffectsConfig
) {
  const rotateX = effects.perspective.rotateX;
  const rotateY = effects.perspective.rotateY;
  if (rotateX === 0 && rotateY === 0) return;

  const scaleX = clamp(Math.cos((rotateY * Math.PI) / 180), 0.65, 1.25);
  const scaleY = clamp(Math.cos((rotateX * Math.PI) / 180), 0.65, 1.25);
  ctx.scale(scaleX, scaleY);
}

function getSimpleMetrics(config: ScreenshotConfig, device: DeviceSize, img: HTMLImageElement): SimpleMetrics {
  const scale = config.scale / 100;
  const centerX = (config.x / 100) * device.width;
  const centerY = (config.y / 100) * device.height;
  const width = img.naturalWidth * scale;
  const height = img.naturalHeight * scale;
  return {
    centerX,
    centerY,
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
    radius: config.cornerRadius,
  };
}

function getFramedMetrics(config: ScreenshotConfig, device: DeviceSize): FramedMetrics {
  const scale = config.scale / 100;
  const phoneWidth = device.width * 0.72 * scale;
  const phoneHeight = phoneWidth * PHONE.aspect;
  const centerX = (config.x / 100) * device.width;
  const centerY = (config.y / 100) * device.height;

  return {
    centerX,
    centerY,
    phoneWidth,
    phoneHeight,
    x: centerX - phoneWidth / 2,
    y: centerY - phoneHeight / 2,
    bodyRadius: phoneWidth * PHONE.bodyRadius,
  };
}

function applySimpleTransform(
  ctx: CanvasRenderingContext2D,
  metrics: SimpleMetrics,
  config: ScreenshotConfig,
  effects: EffectsConfig
) {
  ctx.translate(metrics.centerX, metrics.centerY);
  ctx.rotate((config.rotation * Math.PI) / 180);
  applyPerspectiveTransform(ctx, effects);
  ctx.translate(-metrics.centerX, -metrics.centerY);
}

function drawSimpleSubject(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  config: ScreenshotConfig,
  effects: EffectsConfig,
  metrics: SimpleMetrics,
  options: SubjectRenderOptions
) {
  ctx.save();
  applySimpleTransform(ctx, metrics, config, effects);

  if (options.includeGlow && effects.glow.enabled) {
    ctx.save();
    ctx.shadowColor = colorWithAlpha(effects.glow.color, clamp(effects.glow.intensity, 0, 100));
    ctx.shadowBlur = Math.max(12, effects.glow.spread * 2);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    drawRoundedRect(ctx, metrics.x, metrics.y, metrics.width, metrics.height, metrics.radius);
    ctx.fillStyle = 'rgba(0,0,0,0.02)';
    ctx.fill();
    ctx.restore();
  }

  if (options.includeShadow && config.shadow.enabled) {
    ctx.shadowColor = colorWithAlpha(config.shadow.color, clamp(config.shadow.opacity, 0, 100));
    ctx.shadowBlur = config.shadow.blur;
    ctx.shadowOffsetX = config.shadow.x;
    ctx.shadowOffsetY = config.shadow.y;
  }

  drawRoundedRect(ctx, metrics.x, metrics.y, metrics.width, metrics.height, metrics.radius);
  if (options.includeShadow && config.shadow.enabled) {
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  ctx.clip();
  ctx.drawImage(img, metrics.x, metrics.y, metrics.width, metrics.height);
  ctx.restore();

  if (options.includeBorder && config.border.enabled && config.border.width > 0) {
    ctx.save();
    applySimpleTransform(ctx, metrics, config, effects);
    ctx.strokeStyle = colorWithAlpha(config.border.color, clamp(config.border.opacity, 0, 100));
    ctx.lineWidth = config.border.width;
    drawRoundedRect(ctx, metrics.x, metrics.y, metrics.width, metrics.height, metrics.radius);
    ctx.stroke();
    ctx.restore();
  }
}

function drawSimpleReflection(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  config: ScreenshotConfig,
  effects: EffectsConfig,
  metrics: SimpleMetrics,
  device: DeviceSize
) {
  if (!effects.reflection.enabled) return;

  const reflectionCanvas = document.createElement('canvas');
  reflectionCanvas.width = device.width;
  reflectionCanvas.height = device.height;
  const reflectionCtx = reflectionCanvas.getContext('2d');
  if (!reflectionCtx) return;

  const top = metrics.y + metrics.height + effects.reflection.offset;
  reflectionCtx.save();
  reflectionCtx.translate(0, top * 2);
  reflectionCtx.scale(1, -1);
  drawSimpleSubject(reflectionCtx, img, config, effects, metrics, {
    includeShadow: false,
    includeBorder: false,
    includeGlow: false,
  });
  reflectionCtx.restore();

  const fadeHeight = Math.max(
    metrics.height * clamp(effects.reflection.fade, 10, 100) * 0.01,
    48
  );
  reflectionCtx.globalCompositeOperation = 'destination-in';
  const gradient = reflectionCtx.createLinearGradient(0, top, 0, top + fadeHeight);
  gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  reflectionCtx.fillStyle = gradient;
  reflectionCtx.fillRect(metrics.x - metrics.width * 0.2, top, metrics.width * 1.4, fadeHeight);
  reflectionCtx.globalCompositeOperation = 'source-over';

  ctx.save();
  ctx.globalAlpha = clamp(effects.reflection.opacity, 0, 100) / 100;
  ctx.drawImage(reflectionCanvas, 0, 0);
  ctx.restore();
}

function applyFramedTransform(
  ctx: CanvasRenderingContext2D,
  metrics: FramedMetrics,
  config: ScreenshotConfig,
  effects: EffectsConfig,
  preset: IsometricPreset
) {
  ctx.translate(metrics.centerX, metrics.centerY);
  ctx.rotate((config.rotation * Math.PI) / 180);
  applyPerspectiveTransform(ctx, effects);
  const { a, b, c, d } = preset.transform;
  ctx.transform(a, b, c, d, 0, 0);
  ctx.translate(-metrics.centerX, -metrics.centerY);
}

function drawPhoneCore(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  metrics: FramedMetrics,
  config: ScreenshotConfig,
  effects: EffectsConfig,
  preset: IsometricPreset,
  frameColor: string,
  options: SubjectRenderOptions
) {
  const { x, y, phoneWidth, phoneHeight, centerX, bodyRadius } = metrics;

  if (options.includeGlow && effects.glow.enabled) {
    ctx.save();
    ctx.shadowColor = colorWithAlpha(effects.glow.color, clamp(effects.glow.intensity, 0, 100));
    ctx.shadowBlur = Math.max(12, effects.glow.spread * 2.4);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    drawRoundedRect(ctx, x, y, phoneWidth, phoneHeight, bodyRadius);
    ctx.fillStyle = 'rgba(0,0,0,0.02)';
    ctx.fill();
    ctx.restore();
  }

  if (preset.edgeThickness > 0 && preset.edgeDirection !== 'none') {
    const edgeWidth = phoneWidth * preset.edgeThickness;
    const edgeColor = adjustColor(frameColor, -40);
    ctx.fillStyle = edgeColor;
    if (preset.edgeDirection === 'right') {
      drawRoundedRect(ctx, x + edgeWidth, y + edgeWidth * 0.35, phoneWidth, phoneHeight, bodyRadius);
    } else {
      drawRoundedRect(ctx, x - edgeWidth, y + edgeWidth * 0.35, phoneWidth, phoneHeight, bodyRadius);
    }
    ctx.fill();

    const edgeGradient = ctx.createLinearGradient(
      preset.edgeDirection === 'right' ? x + phoneWidth : x - edgeWidth,
      y,
      preset.edgeDirection === 'right' ? x + phoneWidth + edgeWidth : x,
      y
    );
    edgeGradient.addColorStop(0, 'rgba(255,255,255,0.06)');
    edgeGradient.addColorStop(1, 'rgba(0,0,0,0.15)');
    ctx.fillStyle = edgeGradient;
    if (preset.edgeDirection === 'right') {
      drawRoundedRect(ctx, x + edgeWidth, y + edgeWidth * 0.35, phoneWidth, phoneHeight, bodyRadius);
    } else {
      drawRoundedRect(ctx, x - edgeWidth, y + edgeWidth * 0.35, phoneWidth, phoneHeight, bodyRadius);
    }
    ctx.fill();
  }

  if (options.includeShadow && config.shadow.enabled) {
    ctx.save();
    ctx.shadowColor = colorWithAlpha(config.shadow.color, clamp(config.shadow.opacity, 0, 100));
    ctx.shadowBlur = config.shadow.blur;
    ctx.shadowOffsetX = config.shadow.x;
    ctx.shadowOffsetY = config.shadow.y;
    drawRoundedRect(ctx, x, y, phoneWidth, phoneHeight, bodyRadius);
    ctx.fillStyle = 'rgba(0,0,0,0.01)';
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = frameColor;
  drawRoundedRect(ctx, x, y, phoneWidth, phoneHeight, bodyRadius);
  ctx.fill();

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, x + 1, y + 1, phoneWidth - 2, phoneHeight - 2, bodyRadius - 1);
  ctx.stroke();
  ctx.restore();

  const bezel = phoneWidth * PHONE.bezel;
  const screenX = x + bezel;
  const screenY = y + bezel;
  const screenW = phoneWidth - bezel * 2;
  const screenH = phoneHeight - bezel * 2;
  const screenR = phoneWidth * PHONE.screenRadius;

  ctx.fillStyle = '#000000';
  drawRoundedRect(ctx, screenX, screenY, screenW, screenH, screenR);
  ctx.fill();

  ctx.save();
  drawRoundedRect(ctx, screenX, screenY, screenW, screenH, screenR);
  ctx.clip();

  const imgAspect = img.naturalWidth / img.naturalHeight;
  const screenAspect = screenW / screenH;
  let drawWidth: number;
  let drawHeight: number;
  let drawX: number;
  let drawY: number;

  if (imgAspect > screenAspect) {
    drawHeight = screenH;
    drawWidth = drawHeight * imgAspect;
    drawX = screenX + (screenW - drawWidth) / 2;
    drawY = screenY;
  } else {
    drawWidth = screenW;
    drawHeight = drawWidth / imgAspect;
    drawX = screenX;
    drawY = screenY + (screenH - drawHeight) / 2;
  }

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();

  const dynamicIslandWidth = phoneWidth * PHONE.dynamicIsland.width;
  const dynamicIslandHeight = phoneWidth * PHONE.dynamicIsland.height;
  const dynamicIslandX = centerX - dynamicIslandWidth / 2;
  const dynamicIslandY = screenY + phoneWidth * PHONE.dynamicIsland.top;
  const dynamicIslandRadius = phoneWidth * PHONE.dynamicIsland.radius;
  ctx.fillStyle = '#000000';
  drawRoundedRect(
    ctx,
    dynamicIslandX,
    dynamicIslandY,
    dynamicIslandWidth,
    dynamicIslandHeight,
    dynamicIslandRadius
  );
  ctx.fill();

  const lensDot = phoneWidth * 0.012;
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(dynamicIslandX + dynamicIslandWidth * 0.72, dynamicIslandY + dynamicIslandHeight / 2, lensDot, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(
    dynamicIslandX + dynamicIslandWidth * 0.72,
    dynamicIslandY + dynamicIslandHeight / 2,
    lensDot * 0.5,
    0,
    Math.PI * 2
  );
  ctx.fill();

  const homeIndicatorWidth = phoneWidth * PHONE.homeIndicator.width;
  const homeIndicatorHeight = phoneWidth * PHONE.homeIndicator.height;
  const homeIndicatorX = centerX - homeIndicatorWidth / 2;
  const homeIndicatorY =
    screenY + screenH - phoneWidth * PHONE.homeIndicator.bottom - homeIndicatorHeight;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  drawRoundedRect(
    ctx,
    homeIndicatorX,
    homeIndicatorY,
    homeIndicatorWidth,
    homeIndicatorHeight,
    homeIndicatorHeight / 2
  );
  ctx.fill();

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, screenX, screenY, screenW, screenH, screenR);
  ctx.stroke();
  ctx.restore();
}

function drawFramedSubject(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  config: ScreenshotConfig,
  effects: EffectsConfig,
  metrics: FramedMetrics,
  preset: IsometricPreset,
  frameColor: string,
  options: SubjectRenderOptions
) {
  ctx.save();
  applyFramedTransform(ctx, metrics, config, effects, preset);
  drawPhoneCore(ctx, img, metrics, config, effects, preset, frameColor, options);
  ctx.restore();
}

function drawFramedReflection(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  config: ScreenshotConfig,
  effects: EffectsConfig,
  metrics: FramedMetrics,
  preset: IsometricPreset,
  frameColor: string,
  device: DeviceSize
) {
  if (!effects.reflection.enabled) return;

  const reflectionCanvas = document.createElement('canvas');
  reflectionCanvas.width = device.width;
  reflectionCanvas.height = device.height;
  const reflectionCtx = reflectionCanvas.getContext('2d');
  if (!reflectionCtx) return;

  const top = metrics.y + metrics.phoneHeight + effects.reflection.offset;
  reflectionCtx.save();
  reflectionCtx.translate(0, top * 2);
  reflectionCtx.scale(1, -1);
  drawFramedSubject(reflectionCtx, img, config, effects, metrics, preset, frameColor, {
    includeShadow: false,
    includeBorder: false,
    includeGlow: false,
  });
  reflectionCtx.restore();

  const fadeHeight = Math.max(
    metrics.phoneHeight * clamp(effects.reflection.fade, 10, 100) * 0.01,
    60
  );
  reflectionCtx.globalCompositeOperation = 'destination-in';
  const gradient = reflectionCtx.createLinearGradient(0, top, 0, top + fadeHeight);
  gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  reflectionCtx.fillStyle = gradient;
  reflectionCtx.fillRect(metrics.x - metrics.phoneWidth * 0.25, top, metrics.phoneWidth * 1.5, fadeHeight);
  reflectionCtx.globalCompositeOperation = 'source-over';

  ctx.save();
  ctx.globalAlpha = clamp(effects.reflection.opacity, 0, 100) / 100;
  ctx.drawImage(reflectionCanvas, 0, 0);
  ctx.restore();
}

export async function drawDeviceLayer(
  ctx: CanvasRenderingContext2D,
  screenshot: Screenshot,
  device: DeviceSize,
  shouldAbort?: ShouldAbort
) {
  if (!screenshot.imageData) return;

  let img: HTMLImageElement;
  try {
    img = await loadImage(screenshot.imageData);
  } catch {
    return;
  }

  if (shouldAbort?.()) return;

  const config = screenshot.screenshot;
  const effects = resolveEffects(config);
  const frame = {
    enabled: config.deviceFrame?.enabled !== false,
    presetId: config.deviceFrame?.presetId || 'front',
    frameColor: config.deviceFrame?.frameColor || '#1a1a1a',
  };

  if (frame.enabled) {
    const metrics = getFramedMetrics(config, device);
    const preset = ISOMETRIC_PRESETS.find((candidate) => candidate.id === frame.presetId) || ISOMETRIC_PRESETS[0];
    drawFramedReflection(ctx, img, config, effects, metrics, preset, frame.frameColor, device);
    drawFramedSubject(ctx, img, config, effects, metrics, preset, frame.frameColor, {
      includeShadow: true,
      includeBorder: false,
      includeGlow: true,
    });
    return;
  }

  const metrics = getSimpleMetrics(config, device, img);
  drawSimpleReflection(ctx, img, config, effects, metrics, device);
  drawSimpleSubject(ctx, img, config, effects, metrics, {
    includeShadow: true,
    includeBorder: true,
    includeGlow: true,
  });
}
