import type { Feature } from './genome-types'

// ─── Layout constants (px) ───────────────────────────────────────────────────
export const MINIMAP_H = 32
export const RULER_H = 28
export const GENE_TRACK_H = 80
export const HEADER_H = MINIMAP_H + RULER_H      // top of gene track
export const TOTAL_FIXED_H = HEADER_H + GENE_TRACK_H

const GENE_H = 14
const ARROW_W = 10
const FWD_Y_OFFSET = 20   // center of + lane within gene track
const REV_Y_OFFSET = 58   // center of − lane within gene track

// ─── Colours ─────────────────────────────────────────────────────────────────
const FWD_COLOR = '#5b8dd9'
const REV_COLOR = '#e07b54'
const FWD_HOVER = '#3a6db5'
const REV_HOVER = '#c4623f'

// ─── Coordinate helpers ───────────────────────────────────────────────────────
function toX(pos: number, viewStart: number, viewEnd: number, W: number): number {
  return ((pos - viewStart) / (viewEnd - viewStart)) * W
}

function formatPos(pos: number): string {
  if (pos >= 1_000_000) return `${(pos / 1_000_000).toFixed(2)} Mb`
  if (pos >= 1_000) return `${(pos / 1_000).toFixed(1)} kb`
  return `${pos} bp`
}

function getRulerStep(viewRange: number): number {
  const mag = Math.floor(Math.log10(viewRange))
  const base = Math.pow(10, mag)
  for (const mult of [0.1, 0.2, 0.5, 1, 2, 5]) {
    if (viewRange / (base * mult) <= 8) return base * mult
  }
  return base * 5
}

// ─── Minimap ──────────────────────────────────────────────────────────────────
function drawMinimap(
  ctx: CanvasRenderingContext2D,
  W: number,
  viewStart: number,
  viewEnd: number,
  contigLength: number,
  features: Feature[],
) {
  const pad = 10

  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, W, MINIMAP_H)

  // Contig backbone
  const barY = MINIMAP_H * 0.38
  const barH = MINIMAP_H * 0.28
  ctx.fillStyle = '#cbd5e1'
  ctx.fillRect(pad, barY, W - pad * 2, barH)

  // Gene density marks
  ctx.fillStyle = '#94a3b8'
  const scaleW = W - pad * 2
  for (const f of features) {
    const x1 = toX(f.start, 0, contigLength, scaleW) + pad
    const x2 = toX(f.end, 0, contigLength, scaleW) + pad
    ctx.fillRect(x1, barY, Math.max(1, x2 - x1), barH)
  }

  // Viewport highlight
  const vx1 = toX(viewStart, 0, contigLength, scaleW) + pad
  const vx2 = toX(viewEnd, 0, contigLength, scaleW) + pad
  ctx.fillStyle = 'rgba(59,130,246,0.12)'
  ctx.fillRect(vx1, 0, vx2 - vx1, MINIMAP_H)
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 1
  ctx.strokeRect(vx1 + 0.5, 0.5, vx2 - vx1 - 1, MINIMAP_H - 1)

  // Bottom border
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, MINIMAP_H - 0.5)
  ctx.lineTo(W, MINIMAP_H - 0.5)
  ctx.stroke()
}

// ─── Ruler ────────────────────────────────────────────────────────────────────
function drawRuler(
  ctx: CanvasRenderingContext2D,
  W: number,
  viewStart: number,
  viewEnd: number,
) {
  const y0 = MINIMAP_H
  const viewRange = viewEnd - viewStart
  const step = getRulerStep(viewRange)
  const firstTick = Math.ceil(viewStart / step) * step

  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, y0, W, RULER_H)

  ctx.font = '10px system-ui,sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let pos = firstTick; pos <= viewEnd; pos += step) {
    const x = toX(pos, viewStart, viewEnd, W)

    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x + 0.5, y0 + RULER_H * 0.6)
    ctx.lineTo(x + 0.5, y0 + RULER_H)
    ctx.stroke()

    ctx.fillStyle = '#64748b'
    ctx.fillText(formatPos(pos), x, y0 + RULER_H * 0.32)
  }

  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, y0 + RULER_H - 0.5)
  ctx.lineTo(W, y0 + RULER_H - 0.5)
  ctx.stroke()
}

// ─── Gene track ───────────────────────────────────────────────────────────────
function drawGeneTrack(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  viewStart: number,
  viewEnd: number,
  features: Feature[],
  hoveredId: string | null,
) {
  const trackY = HEADER_H

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, trackY, W, H - trackY)

  const fwdY = trackY + FWD_Y_OFFSET
  const revY = trackY + REV_Y_OFFSET

  // Mid divider
  const midY = trackY + GENE_TRACK_H / 2
  ctx.strokeStyle = '#f1f5f9'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, midY)
  ctx.lineTo(W, midY)
  ctx.stroke()

  // Strand labels
  ctx.font = '9px system-ui,sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText('+', 4, fwdY)
  ctx.fillText('−', 4, revY)

  const viewRange = viewEnd - viewStart

  for (const f of features) {
    if (f.end < viewStart || f.start > viewEnd) continue

    const x1 = Math.max(0, toX(f.start, viewStart, viewEnd, W))
    const x2 = Math.min(W, toX(f.end, viewStart, viewEnd, W))
    const gw = x2 - x1
    if (gw < 0.5) continue

    const isHovered = f.id === hoveredId
    const isFwd = f.strand === '+'
    const cy = isFwd ? fwdY : revY
    ctx.fillStyle = isHovered
      ? (isFwd ? FWD_HOVER : REV_HOVER)
      : (isFwd ? FWD_COLOR : REV_COLOR)

    if (gw < 4) {
      ctx.fillRect(x1, cy - GENE_H / 2, Math.max(1, gw), GENE_H)
    } else {
      const aw = Math.min(ARROW_W, gw * 0.35)
      ctx.beginPath()
      if (isFwd) {
        ctx.moveTo(x1, cy - GENE_H / 2)
        ctx.lineTo(x2 - aw, cy - GENE_H / 2)
        ctx.lineTo(x2, cy)
        ctx.lineTo(x2 - aw, cy + GENE_H / 2)
        ctx.lineTo(x1, cy + GENE_H / 2)
      } else {
        ctx.moveTo(x1 + aw, cy - GENE_H / 2)
        ctx.lineTo(x2, cy - GENE_H / 2)
        ctx.lineTo(x2, cy + GENE_H / 2)
        ctx.lineTo(x1 + aw, cy + GENE_H / 2)
        ctx.lineTo(x1, cy)
      }
      ctx.closePath()
      ctx.fill()
    }

    // Label — only when wide enough and zoomed in enough
    if (gw > 50 && viewRange < 500_000) {
      ctx.save()
      ctx.fillStyle = '#ffffff'
      ctx.font = '9px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.beginPath()
      ctx.rect(x1, cy - GENE_H / 2, gw, GENE_H)
      ctx.clip()
      ctx.fillText(f.name, (x1 + x2) / 2, cy)
      ctx.restore()
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  viewStart: number,
  viewEnd: number,
  contigLength: number,
  features: Feature[],
  hoveredId: string | null,
) {
  ctx.clearRect(0, 0, W, H)
  drawMinimap(ctx, W, viewStart, viewEnd, contigLength, features)
  drawRuler(ctx, W, viewStart, viewEnd)
  drawGeneTrack(ctx, W, H, viewStart, viewEnd, features, hoveredId)
}

export function hitTestFeature(
  px: number,
  py: number,
  W: number,
  viewStart: number,
  viewEnd: number,
  features: Feature[],
): Feature | null {
  const trackY = HEADER_H
  if (py < trackY || py > trackY + GENE_TRACK_H) return null
  const fwdY = trackY + FWD_Y_OFFSET
  const revY = trackY + REV_Y_OFFSET
  const slop = GENE_H / 2 + 3

  for (const f of features) {
    if (f.end < viewStart || f.start > viewEnd) continue
    const x1 = toX(f.start, viewStart, viewEnd, W)
    const x2 = toX(f.end, viewStart, viewEnd, W)
    const cy = f.strand === '+' ? fwdY : revY
    if (px >= x1 - 1 && px <= x2 + 1 && Math.abs(py - cy) <= slop) return f
  }
  return null
}

export function hitTestMinimap(
  px: number,
  py: number,
  W: number,
  contigLength: number,
): number | null {
  if (py > MINIMAP_H) return null
  const pad = 10
  return Math.round(((px - pad) / (W - pad * 2)) * contigLength)
}
