/**
 * Builds a tiny canvas-based airplane icon atlas for deck.gl's IconLayer.
 * The airplane silhouette points UPWARD (North) so deck.gl rotation angle = -heading.
 */

const ICON_SIZE = 64;

function drawAirplane(ctx: CanvasRenderingContext2D, size: number) {
  const s = size / 64; // scale factor
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = 'white';

  // Fuselage
  ctx.beginPath();
  ctx.moveTo(0, -26 * s);
  ctx.bezierCurveTo(5 * s, -18 * s, 7 * s, 0, 7 * s, 10 * s);
  ctx.lineTo(7 * s, 16 * s);
  ctx.bezierCurveTo(7 * s, 20 * s, 4 * s, 22 * s, 0, 22 * s);
  ctx.bezierCurveTo(-4 * s, 22 * s, -7 * s, 20 * s, -7 * s, 16 * s);
  ctx.lineTo(-7 * s, 10 * s);
  ctx.bezierCurveTo(-7 * s, 0, -5 * s, -18 * s, 0, -26 * s);
  ctx.fill();

  // Right wing
  ctx.beginPath();
  ctx.moveTo(5 * s, -6 * s);
  ctx.lineTo(30 * s, 6 * s);
  ctx.lineTo(24 * s, 12 * s);
  ctx.lineTo(7 * s, 6 * s);
  ctx.fill();

  // Left wing
  ctx.beginPath();
  ctx.moveTo(-5 * s, -6 * s);
  ctx.lineTo(-30 * s, 6 * s);
  ctx.lineTo(-24 * s, 12 * s);
  ctx.lineTo(-7 * s, 6 * s);
  ctx.fill();

  // Right stabiliser
  ctx.beginPath();
  ctx.moveTo(4 * s, 14 * s);
  ctx.lineTo(16 * s, 22 * s);
  ctx.lineTo(12 * s, 25 * s);
  ctx.lineTo(4 * s, 18 * s);
  ctx.fill();

  // Left stabiliser
  ctx.beginPath();
  ctx.moveTo(-4 * s, 14 * s);
  ctx.lineTo(-16 * s, 22 * s);
  ctx.lineTo(-12 * s, 25 * s);
  ctx.lineTo(-4 * s, 18 * s);
  ctx.fill();

  ctx.restore();
}

let cachedAtlas: string | null = null;

export const ICON_MAPPING = {
  airplane: {
    x: 0,
    y: 0,
    width: ICON_SIZE,
    height: ICON_SIZE,
    anchorX: ICON_SIZE / 2,
    anchorY: ICON_SIZE / 2,
    mask: true,
  },
} as const;

/** Returns a base64 PNG data URL to use as the deck.gl iconAtlas. Cached after first call. */
export function getAirplaneAtlas(): string {
  if (cachedAtlas) return cachedAtlas;

  const canvas = document.createElement('canvas');
  canvas.width = ICON_SIZE;
  canvas.height = ICON_SIZE;
  const ctx = canvas.getContext('2d')!;
  drawAirplane(ctx, ICON_SIZE);
  cachedAtlas = canvas.toDataURL('image/png');
  return cachedAtlas;
}
