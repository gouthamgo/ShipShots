import { DeviceSize, TextConfig } from '@/types';

let _resolvedFonts: Record<string, string> | null = null;

function getResolvedFonts(): Record<string, string> {
  if (_resolvedFonts !== null) return _resolvedFonts;
  if (typeof document === 'undefined' || !document.body) return {};
  const s = getComputedStyle(document.body);
  _resolvedFonts = {
    Inter: s.getPropertyValue('--font-inter').trim(),
    'DM Sans': s.getPropertyValue('--font-dm-sans').trim(),
    'Space Grotesk': s.getPropertyValue('--font-space-grotesk').trim(),
  };
  return _resolvedFonts;
}

function resolveFontFamily(font: string): string {
  if (font === 'system') {
    return '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  }
  const resolved = getResolvedFonts();
  if (resolved[font]) {
    return `${resolved[font]}, sans-serif`;
  }
  return `"${font}", sans-serif`;
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  text: TextConfig,
  device: DeviceSize
) {
  ctx.textAlign = 'center';

  if (!text.headlineEnabled || !text.headline) return;

  const headlineFontFamily = resolveFontFamily(text.headlineFont);
  ctx.font = `${text.headlineWeight} ${text.headlineSize}px ${headlineFontFamily}`;
  ctx.fillStyle = text.headlineColor;
  ctx.textBaseline = text.headlinePosition === 'top' ? 'top' : 'bottom';

  const y =
    text.headlinePosition === 'top'
      ? (text.headlineOffsetY / 100) * device.height
      : device.height - (text.headlineOffsetY / 100) * device.height;

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
  lines.forEach((line, index) => {
    ctx.fillText(line, device.width / 2, y + index * lineSpacing);
  });

  if (!text.subheadlineEnabled || !text.subheadline) return;

  ctx.save();
  const subheadlineFontFamily = resolveFontFamily(text.subheadlineFont);
  ctx.font = `${text.subheadlineWeight} ${text.subheadlineSize}px ${subheadlineFontFamily}`;
  ctx.fillStyle = text.subheadlineColor;
  ctx.globalAlpha = text.subheadlineOpacity / 100;
  ctx.textBaseline = 'top';

  const subY = y + lines.length * lineSpacing + text.headlineSize * 0.5 + text.subheadlineOffsetY;
  ctx.fillText(text.subheadline, device.width / 2, subY);
  ctx.restore();
}
