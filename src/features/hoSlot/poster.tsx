/**
 * Ho 位看板 —— PNG 导出（截图式）
 *
 * 独立模块：与 PosterStudio 的自介 / 招聘 / 应征海报解耦。
 * 渲染风格尽量贴近页面显示：
 *   - 白底
 *   - 顶部 "Ho 位管理" + 日期 + 可选 PL
 *   - lane grid（每个 lane 一张卡片，标题条用 lane 复古色，条目跟 lane 同色系）
 *   - 不带页面上的灰色提示行（"单向同步…"）
 *
 * 用法：
 *   await exportHoBoardAsPng({
 *     lanes, entriesByLane, plName,
 *   })
 */

import type { HoSlotLane, HoSlotEntry } from './types'
import { HO_SLOT_NONE_LANE } from './types'
import { MODULE_STATUS_LABELS, type ModuleStatus } from '@/features/character/types'

// ============================================================
// 复古调色板（与显示同步：fg 文字色 + bg 同色系柔和底色）
// ============================================================

export interface LaneColor {
  /** 标题文字色 / 状态徽章文字色 / 左侧条 */
  fg: string
  /** lane 标题条 + entry 卡底色 */
  bg: string
}

export const LANE_COLOR_PALETTE: LaneColor[] = [
  { fg: '#6b7280', bg: '#f1f2f4' }, // 0 无 Ho  灰
  { fg: '#1f3a2e', bg: '#e6f0ea' }, // 1 墨绿
  { fg: '#2a3a5e', bg: '#e7ecf3' }, // 2 深蓝
  { fg: '#8a6d3b', bg: '#f5ecd9' }, // 3 赭石
  { fg: '#a6483a', bg: '#f7e2dd' }, // 4 砖红
  { fg: '#5b3a6b', bg: '#ece6f1' }, // 5 紫罗兰
  { fg: '#2a5e5e', bg: '#dbecec' }, // 6 青
  { fg: '#6b4e3a', bg: '#efe6dc' }, // 7 深棕
  { fg: '#3a5e2a', bg: '#e2ecda' }, // 8 苔绿
]

export function laneColor(key: number): LaneColor {
  return LANE_COLOR_PALETTE[key] ?? LANE_COLOR_PALETTE[LANE_COLOR_PALETTE.length - 1]
}

// ============================================================
// 状态徽章调色板（柔和色调，与 HoSlotPage EntryCard 保持一致）
// ============================================================

const STATUS_PALETTE: Record<ModuleStatus, { bg: string; fg: string }> = {
  ongoing: { bg: '#e8f4f1', fg: '#4fb3a4' }, // accent-soft / accent
  satellite: { bg: '#eff6ff', fg: '#2563eb' }, // blue-50 / blue-600
  paused: { bg: '#f5f5f4', fg: '#78716c' }, // stone-100 / stone-500
  finished: { bg: '#faf6ee', fg: '#d4a574' }, // warm-soft / warm
  disbanded: { bg: '#fef2f2', fg: '#ef4444' }, // red-50 / red-500
}

// ============================================================
// 布局常量
// ============================================================

const POSTER_W = 1200
const PAD_X = 24
const PAD_Y = 24
const COL_GAP = 12
const HEADER_TITLE_H = 60
const PL_ROW_H = 28
const DIVIDER_GAP = 16

const LANE_TITLE_H = 40
const LANE_INNER_PAD = 8
const ENTRY_H = 72
const ENTRY_GAP = 6
const ENTRY_INNER_GAP = 12

const FONT_CJK =
  '"Source Han Sans SC", "Noto Sans SC", "PingFang SC", system-ui, sans-serif'
const FONT_MONO = '"JetBrains Mono", ui-monospace, "SF Mono", monospace'

// ============================================================
// 公共 API
// ============================================================

export interface HoBoardPosterInput {
  lanes: HoSlotLane[]
  /** key=lane.key，value=该 lane 下的 entries */
  entriesByLane: Map<number, HoSlotEntry[]>
  /** PL 姓名（可选） */
  plName: string
}

/** 同步渲染：返回 dataURL（方便预览） */
export function renderHoBoardPngDataUrl(input: HoBoardPosterInput): string {
  return drawToCanvas(input).toDataURL('image/png')
}

/** 同步渲染：返回 canvas（方便保存 / 自定义处理） */
export function renderHoBoardPngCanvas(input: HoBoardPosterInput): HTMLCanvasElement {
  return drawToCanvas(input)
}

/** 异步导出 PNG 并触发浏览器下载 */
export async function exportHoBoardAsPng(
  input: HoBoardPosterInput,
  filename?: string,
): Promise<void> {
  const canvas = drawToCanvas(input)
  const blob = await canvasToBlob(canvas)
  const name =
    filename ?? `ho-board-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.png`
  downloadBlob(blob, name)
}

// ============================================================
// 渲染
// ============================================================

function drawToCanvas(input: HoBoardPosterInput): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  const { lanes, entriesByLane, plName } = input

  // ---- 1. 量高度 ----
  const cols = Math.max(lanes.length, 1)
  const contentW = POSTER_W - PAD_X * 2
  const colW = (contentW - COL_GAP * (cols - 1)) / cols

  const laneHeights = lanes.map((lane) => {
    const entries = entriesByLane.get(lane.key) ?? []
    const rows = Math.max(entries.length, 1)
    const entriesBlockH =
      rows * ENTRY_H + (rows - 1) * ENTRY_GAP + ENTRY_INNER_GAP * 2
    return LANE_TITLE_H + LANE_INNER_PAD + entriesBlockH
  })
  const lanesH = lanes.length > 0 ? Math.max(...laneHeights) : 0

  const plSectionH = plName ? PL_ROW_H : 0
  const titleSectionH = HEADER_TITLE_H + plSectionH + DIVIDER_GAP
  const totalH = PAD_Y + titleSectionH + lanesH + PAD_Y

  canvas.width = POSTER_W
  canvas.height = totalH

  // ---- 2. 背景 ----
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, POSTER_W, totalH)

  // ---- 3. 顶部标题 ----
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#1f1f1f'
  ctx.font = `600 28px ${FONT_CJK}`
  ctx.textAlign = 'left'
  ctx.fillText('Ho 位管理', PAD_X, PAD_Y + 28)

  ctx.fillStyle = '#8a8a8a'
  ctx.font = `400 14px ${FONT_CJK}`
  ctx.textAlign = 'right'
  ctx.fillText(new Date().toLocaleDateString('zh-CN'), POSTER_W - PAD_X, PAD_Y + 28)

  // ---- 4. PL 行（可选） ----
  let y = PAD_Y + HEADER_TITLE_H
  if (plName) {
    ctx.fillStyle = '#1f1f1f'
    ctx.font = `500 14px ${FONT_CJK}`
    ctx.textAlign = 'left'
    ctx.fillText(`PL: ${plName}`, PAD_X, y - 4)
    y += PL_ROW_H
  }

  // ---- 5. 分隔线 ----
  y += DIVIDER_GAP - 12
  ctx.strokeStyle = '#e5e5e5'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PAD_X, y)
  ctx.lineTo(POSTER_W - PAD_X, y)
  ctx.stroke()
  y += 12

  // ---- 6. lane 卡片 ----
  lanes.forEach((lane, i) => {
    const x = PAD_X + i * (colW + COL_GAP)
    const entries = entriesByLane.get(lane.key) ?? []
    const h = laneHeights[i]
    drawLaneCard(ctx, x, y, colW, h, lane, entries)
  })

  // ---- 7. 空数据 fallback ----
  if (lanes.length === 0) {
    ctx.fillStyle = '#a6a7a8'
    ctx.font = `400 14px ${FONT_CJK}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('— 暂无 Ho 位 —', POSTER_W / 2, y + 60)
  }

  return canvas
}

function drawLaneCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  lane: HoSlotLane,
  entries: HoSlotEntry[],
) {
  const color = laneColor(lane.key)

  // 卡片白底 + 边框
  ctx.fillStyle = '#ffffff'
  roundRect(ctx, x, y, w, h, 6)
  ctx.fill()
  ctx.strokeStyle = '#e5e5e5'
  ctx.lineWidth = 1
  ctx.stroke()

  // 标题条（仅顶部圆角）
  ctx.fillStyle = color.bg
  roundRectTop(ctx, x, y, w, LANE_TITLE_H, 6)
  ctx.fill()
  // 标题条底部边线（lane fg 弱化）
  ctx.strokeStyle = `${color.fg}33`
  ctx.beginPath()
  ctx.moveTo(x, y + LANE_TITLE_H)
  ctx.lineTo(x + w, y + LANE_TITLE_H)
  ctx.stroke()

  // lane label
  ctx.fillStyle = color.fg
  ctx.font = `600 14px ${FONT_CJK}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(lane.label, x + 12, y + LANE_TITLE_H / 2)

  // 计数（小写 mono 字体靠右）
  ctx.font = `500 12px ${FONT_MONO}`
  ctx.textAlign = 'right'
  const cap = lane.key === HO_SLOT_NONE_LANE ? '∞' : '1'
  ctx.fillText(`${entries.length} / ${cap}`, x + w - 12, y + LANE_TITLE_H / 2)

  // 条目
  const ey0 = y + LANE_TITLE_H + LANE_INNER_PAD + ENTRY_INNER_GAP / 2
  if (entries.length === 0) {
    ctx.fillStyle = '#a6a7a8'
    ctx.font = `400 12px ${FONT_CJK}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('— 暂无条目 —', x + w / 2, ey0 + ENTRY_H / 2)
    return
  }

  entries.forEach((e, i) => {
    const ey = ey0 + i * (ENTRY_H + ENTRY_GAP)
    drawEntryCard(ctx, x + LANE_INNER_PAD, ey, w - LANE_INNER_PAD * 2, ENTRY_H, e, color)
  })
}

function drawEntryCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  e: HoSlotEntry,
  color: LaneColor,
) {
  // 卡片底 + 边框
  ctx.fillStyle = color.bg
  roundRect(ctx, x, y, w, h, 6)
  ctx.fill()
  ctx.strokeStyle = `${color.fg}33`
  ctx.lineWidth = 1
  ctx.stroke()

  // 左侧 3px lane 色条
  ctx.fillStyle = color.fg
  ctx.fillRect(x, y + 6, 3, h - 12)

  // status badge
  drawStatusBadge(ctx, x + 14, y + 14, e.status)

  // module（模组名，主标题）
  ctx.fillStyle = '#1f1f1f'
  ctx.font = `600 14px ${FONT_CJK}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(truncate(e.module || '未命名模组', 14), x + 76, y + h / 2 - 8)

  // name（角色名，前缀「角色：」）
  ctx.fillStyle = '#8a8a8a'
  ctx.font = `400 12px ${FONT_CJK}`
  ctx.fillText(truncate(`角色：${e.name || '—'}`, 24), x + 76, y + h / 2 + 12)
}

function drawStatusBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  status: ModuleStatus,
) {
  const label = MODULE_STATUS_LABELS[status]
  const c = STATUS_PALETTE[status]
  ctx.save()
  ctx.font = `500 11px ${FONT_CJK}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  const padX = 8
  const w = ctx.measureText(label).width + padX * 2
  const h = 20
  // 椭圆 pill（用 h/2 圆角）
  ctx.fillStyle = c.bg
  roundRect(ctx, x, y - h / 2, w, h, h / 2)
  ctx.fill()
  ctx.fillStyle = c.fg
  ctx.fillText(label, x + padX, y)
  ctx.restore()
}

// ============================================================
// canvas 工具
// ============================================================

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.lineTo(x + w - rr, y)
  ctx.arcTo(x + w, y, x + w, y + rr, rr)
  ctx.lineTo(x + w, y + h - rr)
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr)
  ctx.lineTo(x + rr, y + h)
  ctx.arcTo(x, y + h, x, y + h - rr, rr)
  ctx.lineTo(x, y + rr)
  ctx.arcTo(x, y, x + rr, y, rr)
  ctx.closePath()
}

/** 只在顶部两个角做圆角的矩形（用于卡片标题条） */
function roundRectTop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.lineTo(x + w - rr, y)
  ctx.arcTo(x + w, y, x + w, y + rr, rr)
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x, y + h)
  ctx.lineTo(x, y + rr)
  ctx.arcTo(x, y, x + rr, y, rr)
  ctx.closePath()
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return s.slice(0, max - 1) + '…'
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('canvas.toBlob 返回空'))
    }, 'image/png')
  })
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}