/**
 * 海报 Canvas 2D 渲染器（信纸风格）
 *
 * 设计：
 * - 单栏纵向 flow layout：每个 section 高度按内容自动算，下一个 section 用上一个的 y
 * - canvas 高度动态（根据内容总和设置）
 * - 配色 / 字体可入参（theme），默认信纸风
 * - 右侧简单植物图鉴装饰（camélia 分支）
 */

import type { Character, CharacterStats, PosterTemplate } from '@/features/character/types'
import { getPaletteById, getFontById, type PosterPalette, type PosterFont } from './theme'

// ===== 信纸风格布局常量 =====
const MARGIN = 80
const CONTENT_W = 1080 - MARGIN * 2
const LINE_GAP = 8

export interface PosterTheme {
  palette: PosterPalette
  fonts: PosterFont
}

function defaultTheme(): PosterTheme {
  return {
    palette: getPaletteById('paper-blue'),
    fonts: getFontById('didot-source-serif'),
  }
}

export interface PosterRenderInput {
  template: PosterTemplate
  character: Character | null
  values: {
    slogan: string
    background: string
  }
  theme?: PosterTheme
}

export interface RecruitPosterInput {
  template: PosterTemplate
  values: Record<string, string>
  theme?: PosterTheme
}

// ====================== 入口 ======================

export function renderPoster(canvas: HTMLCanvasElement, input: PosterRenderInput): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { template, character, values, theme = defaultTheme() } = input

  // 1. 用 offscreen canvas 先计算总高度
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = template.size.w
  tempCanvas.height = 4096
  const tempCtx = tempCanvas.getContext('2d')!
  let y = MARGIN
  y = measureSelfIntroHeader(tempCtx, y, character, theme)
  y = measureSelfIntroSlogan(tempCtx, y, values.slogan, theme)
  y = measureSelfIntroModule(tempCtx, y, character, theme)
  y = measureSelfIntroStats(tempCtx, y, character, theme)
  y = measureSelfIntroDerived(tempCtx, y, character, theme)
  y = measureSelfIntroSkills(tempCtx, y, character, theme)
  y = measureSelfIntroBackground(tempCtx, y, values.background, theme)
  y = measureFooter(tempCtx, y, theme)

  const totalHeight = Math.max(y + MARGIN, 800)

  // 2. 实际绘制
  canvas.width = template.size.w
  canvas.height = totalHeight
  drawBackground(ctx, template.size.w, totalHeight, theme)
  drawBotanicalDecoration(ctx, template.size.w, totalHeight, theme)

  let cy = MARGIN
  cy = drawSelfIntroHeader(ctx, cy, character, theme)
  cy = drawSelfIntroSlogan(ctx, cy, values.slogan, theme)
  cy = drawSelfIntroModule(ctx, cy, character, theme)
  cy = drawSelfIntroStats(ctx, cy, character, theme)
  cy = drawSelfIntroDerived(ctx, cy, character, theme)
  cy = drawSelfIntroSkills(ctx, cy, character, theme)
  cy = drawSelfIntroBackground(ctx, cy, values.background, theme)
  cy = drawFooter(ctx, cy, theme)
}

export function renderRecruitPoster(canvas: HTMLCanvasElement, input: RecruitPosterInput): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { template, values, theme = defaultTheme() } = input

  // 先测量
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = template.size.w
  tempCanvas.height = 4096
  const tempCtx = tempCanvas.getContext('2d')!
  let y = MARGIN
  y = measureRecruitHeader(tempCtx, y, values, theme)
  y = measureRecruitSummary(tempCtx, y, values.summary ?? '', theme)
  y = measureRecruitSelfIntro(tempCtx, y, values.selfIntro ?? '', theme)
  y = measureRecruitInfoList(tempCtx, y, [
    { label: '开团时间', value: values.openTime ?? '' },
    { label: '招募需求', value: values.requirements ?? '' },
    { label: '跑团时间', value: values.schedule ?? '' },
    { label: '平台', value: values.platform ?? '' },
    { label: '规则', value: values.rules ?? '' },
    { label: '收费', value: values.fee ?? '' },
  ], theme)
  y = measureRecruitContact(tempCtx, y, values.contact ?? '', theme)
  y = measureRecruitNotes(tempCtx, y, values.notes ?? '', theme)
  y = measureFooter(tempCtx, y, theme)

  const totalHeight = Math.max(y + MARGIN, 800)

  canvas.width = template.size.w
  canvas.height = totalHeight
  drawBackground(ctx, template.size.w, totalHeight, theme)
  drawBotanicalDecoration(ctx, template.size.w, totalHeight, theme)

  let cy = MARGIN
  cy = drawRecruitHeader(ctx, cy, values, theme)
  cy = drawRecruitSummary(ctx, cy, values.summary ?? '', theme)
  cy = drawRecruitSelfIntro(ctx, cy, values.selfIntro ?? '', theme)
  cy = drawRecruitInfoList(ctx, cy, [
    { label: '开团时间', value: values.openTime ?? '' },
    { label: '招募需求', value: values.requirements ?? '' },
    { label: '跑团时间', value: values.schedule ?? '' },
    { label: '平台', value: values.platform ?? '' },
    { label: '规则', value: values.rules ?? '' },
    { label: '收费', value: values.fee ?? '' },
  ], theme)
  cy = drawRecruitContact(ctx, cy, values.contact ?? '', theme)
  cy = drawRecruitNotes(ctx, cy, values.notes ?? '', theme)
  cy = drawFooter(ctx, cy, theme)
}

// ====================== 共用绘制 ======================

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, theme: PosterTheme) {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, theme.palette.bgTop)
  g.addColorStop(1, theme.palette.bgBot)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

/** 右侧简单植物图鉴装饰（camélia 分支：曲线 + 小花点） */
function drawBotanicalDecoration(ctx: CanvasRenderingContext2D, w: number, h: number, theme: PosterTheme) {
  ctx.save()
  ctx.strokeStyle = theme.palette.muted
  ctx.fillStyle = theme.palette.muted
  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.5

  const startX = w - 140
  const startY = h - 80

  // 主分支：曲线
  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.bezierCurveTo(startX + 30, startY - 100, startX - 20, startY - 200, startX + 10, startY - 320)
  ctx.stroke()

  // 侧枝 1
  ctx.beginPath()
  ctx.moveTo(startX + 5, startY - 120)
  ctx.quadraticCurveTo(startX + 40, startY - 160, startX + 60, startY - 180)
  ctx.stroke()

  // 侧枝 2
  ctx.beginPath()
  ctx.moveTo(startX + 8, startY - 240)
  ctx.quadraticCurveTo(startX - 30, startY - 280, startX - 50, startY - 300)
  ctx.stroke()

  // 花点（主分支上 4 个）
  const dots = [
    [startX + 5, startY - 80],
    [startX + 12, startY - 160],
    [startX + 8, startY - 240],
    [startX + 10, startY - 310],
    [startX + 60, startY - 180],
    [startX - 50, startY - 300],
  ]
  for (const [x, y] of dots) {
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function drawSectionDivider(ctx: CanvasRenderingContext2D, y: number, theme: PosterTheme) {
  ctx.strokeStyle = theme.palette.line
  ctx.lineWidth = 0.5
  ctx.setLineDash([2, 3])
  ctx.beginPath()
  ctx.moveTo(MARGIN, y)
  ctx.lineTo(MARGIN + CONTENT_W, y)
  ctx.stroke()
  ctx.setLineDash([])
}

function drawSectionTitle(ctx: CanvasRenderingContext2D, y: number, title: string, theme: PosterTheme) {
  ctx.fillStyle = theme.palette.muted
  ctx.font = `500 16px ${theme.fonts.body}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(`— ${title} —`, MARGIN, y)
}

function drawFooter(ctx: CanvasRenderingContext2D, y: number, theme: PosterTheme): number {
  const gap = 40
  const lineY = y + gap
  drawSectionDivider(ctx, lineY, theme)

  ctx.fillStyle = theme.palette.muted
  ctx.font = `400 14px ${theme.fonts.body}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Made with TRPG Helper · 本地生成 · 数据不上传', MARGIN + CONTENT_W / 2, lineY + 24)
  return lineY + 40
}

function measureFooter(_ctx: CanvasRenderingContext2D, y: number, _theme: PosterTheme): number {
  return y + 40 + 40
}

// ====================== 自介模板 ======================

function drawSelfIntroHeader(ctx: CanvasRenderingContext2D, y: number, c: Character | null, theme: PosterTheme): number {
  const name = c?.info.name.trim() || '未命名调查员'
  const player = c?.info.player.trim()
  const occupation = c?.info.occupation.trim()
  const era = c?.info.era.trim()

  // 大字标题
  ctx.fillStyle = theme.palette.ink
  ctx.font = `italic 700 64px ${theme.fonts.heading}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(truncate(name, 14), MARGIN + CONTENT_W / 2, y)
  let cy = y + 90

  // 副标题：PL · 职业 · 时代
  const meta: string[] = []
  if (player) meta.push(`PL · ${player}`)
  if (occupation) meta.push(occupation)
  if (era) meta.push(era)
  if (c?.info.age) meta.push(`${c.info.age} 岁`)

  if (meta.length > 0) {
    ctx.fillStyle = theme.palette.muted
    ctx.font = `400 20px ${theme.fonts.body}`
    ctx.fillText(meta.join('  ·  '), MARGIN + CONTENT_W / 2, cy)
    cy += 30
  }

  cy += 30
  drawSectionDivider(ctx, cy, theme)
  return cy + 30
}

function measureSelfIntroHeader(_ctx: CanvasRenderingContext2D, y: number, c: Character | null, _theme: PosterTheme): number {
  let cy = y + 90
  const player = c?.info.player.trim()
  const occupation = c?.info.occupation.trim()
  if (player || occupation) cy += 30
  cy += 30 + 30
  return cy
}

function drawSelfIntroSlogan(ctx: CanvasRenderingContext2D, y: number, slogan: string, theme: PosterTheme): number {
  if (!slogan.trim()) return y
  const text = slogan.trim()
  ctx.font = `italic 400 22px ${theme.fonts.body}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const lines = wrapText(ctx, text, CONTENT_W - 40, `italic 400 22px ${theme.fonts.body}`)
  const lineH = 30
  const pad = 20
  const boxH = pad * 2 + lineH * lines.length

  ctx.fillStyle = theme.palette.card
  ctx.fillRect(MARGIN, y, CONTENT_W, boxH)
  ctx.fillStyle = theme.palette.warm
  ctx.fillRect(MARGIN, y, 4, boxH)

  ctx.fillStyle = theme.palette.ink
  lines.forEach((line, i) => {
    ctx.fillText(line, MARGIN + 20, y + pad + i * lineH)
  })
  return y + boxH + LINE_GAP + 10
}

function measureSelfIntroSlogan(ctx: CanvasRenderingContext2D, y: number, slogan: string, theme: PosterTheme): number {
  if (!slogan.trim()) return y
  ctx.font = `italic 400 22px ${theme.fonts.body}`
  const lines = wrapText(ctx, slogan.trim(), CONTENT_W - 40, `italic 400 22px ${theme.fonts.body}`)
  return y + 40 + 30 * lines.length + LINE_GAP + 10
}

function drawSelfIntroModule(ctx: CanvasRenderingContext2D, y: number, c: Character | null, theme: PosterTheme): number {
  if (!c?.info.module) return y
  ctx.fillStyle = theme.palette.accent
  ctx.font = `600 22px ${theme.fonts.body}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const hoLabel = c.info.hoSlot ? ` · Ho ${c.info.hoSlot}` : ''
  ctx.fillText(`「${c.info.module}」${hoLabel}`, MARGIN + CONTENT_W / 2, y)
  return y + 30 + LINE_GAP + 10
}

function measureSelfIntroModule(_ctx: CanvasRenderingContext2D, y: number, c: Character | null, _theme: PosterTheme): number {
  if (!c?.info.module) return y
  return y + 30 + LINE_GAP + 10
}

function drawSelfIntroStats(ctx: CanvasRenderingContext2D, y: number, c: Character | null, theme: PosterTheme): number {
  drawSectionTitle(ctx, y, '核心属性', theme)
  let cy = y + 30

  const gridY = cy
  const cellW = (CONTENT_W - 24) / 3
  const cellH = 88
  const stats: Array<[keyof CharacterStats, string]> = [
    ['str', 'STR 力量'],
    ['dex', 'DEX 敏捷'],
    ['pow', 'POW 意志'],
    ['con', 'CON 体质'],
    ['app', 'APP 外貌'],
    ['edu', 'EDU 教育'],
    ['siz', 'SIZ 体型'],
    ['int', 'INT 智力'],
    ['luck', 'LUCK 幸运'],
  ]

  stats.forEach(([key, label], idx) => {
    const col = idx % 3
    const row = Math.floor(idx / 3)
    const x = MARGIN + col * (cellW + 12)
    const yy = gridY + row * (cellH + 12)
    const v = c?.stats[key] ?? 0

    ctx.fillStyle = theme.palette.card
    ctx.fillRect(x, yy, cellW, cellH)
    ctx.fillStyle = theme.palette.accent
    ctx.fillRect(x, yy, 3, cellH)

    ctx.fillStyle = theme.palette.muted
    ctx.font = `500 16px ${theme.fonts.body}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(label, x + 12, yy + 12)

    ctx.fillStyle = theme.palette.ink
    ctx.font = `700 36px ${theme.fonts.mono}`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(v), x + cellW - 12, yy + cellH / 2 + 6)
  })
  return gridY + 3 * (cellH + 12) + LINE_GAP + 10
}

function measureSelfIntroStats(_ctx: CanvasRenderingContext2D, y: number, _c: Character | null, _theme: PosterTheme): number {
  return y + 30 + 3 * (88 + 12) + LINE_GAP + 10
}

function drawSelfIntroDerived(ctx: CanvasRenderingContext2D, y: number, c: Character | null, theme: PosterTheme): number {
  drawSectionTitle(ctx, y, '衍生值', theme)
  let cy = y + 30

  const items = [
    { label: 'HP', v: c?.derived.hp ?? 0 },
    { label: 'SAN', v: c?.derived.san ?? 0 },
    { label: 'MP', v: c?.derived.mp ?? 0 },
    { label: 'MOV', v: c?.derived.mov ?? 0 },
    { label: 'Build', v: c?.derived.build ?? 0 },
  ]
  const cellW = (CONTENT_W - 16 * 4) / 5
  const cellH = 68

  items.forEach((it, i) => {
    const x = MARGIN + i * (cellW + 16)
    ctx.fillStyle = theme.palette.accentSoft
    ctx.fillRect(x, cy, cellW, cellH)
    ctx.fillStyle = theme.palette.accent
    ctx.fillRect(x, cy, cellW, 3)

    ctx.fillStyle = theme.palette.muted
    ctx.font = `500 13px ${theme.fonts.body}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(it.label, x + cellW / 2, cy + 12)

    ctx.fillStyle = theme.palette.ink
    ctx.font = `700 26px ${theme.fonts.mono}`
    ctx.textBaseline = 'middle'
    ctx.fillText(String(it.v), x + cellW / 2, cy + 40)
  })
  return cy + cellH + LINE_GAP + 10
}

function measureSelfIntroDerived(_ctx: CanvasRenderingContext2D, y: number, _c: Character | null, _theme: PosterTheme): number {
  return y + 30 + 68 + LINE_GAP + 10
}

function drawSelfIntroSkills(ctx: CanvasRenderingContext2D, y: number, c: Character | null, theme: PosterTheme): number {
  if (!c || c.skills.length === 0) return y
  drawSectionTitle(ctx, y, '技能', theme)
  let cy = y + 30

  const skills = [...c.skills]
    .map((s) => ({ name: s.name, total: s.initial + s.growth + s.occupation + s.interest }))
    .filter((s) => s.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 14)

  const rowH = 28
  const colW = (CONTENT_W - 32) / 2
  skills.forEach((s, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = MARGIN + col * (colW + 32)
    const yy = cy + row * rowH

    ctx.fillStyle = theme.palette.ink
    ctx.font = `500 16px ${theme.fonts.body}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(truncate(s.name, 12), x, yy)

    ctx.fillStyle = theme.palette.accent
    ctx.font = `600 16px ${theme.fonts.mono}`
    ctx.textAlign = 'right'
    ctx.fillText(String(s.total), x + colW, yy)

    ctx.strokeStyle = theme.palette.line
    ctx.lineWidth = 0.5
    ctx.setLineDash([1, 3])
    ctx.beginPath()
    ctx.moveTo(x, yy + 10)
    ctx.lineTo(x + colW, yy + 10)
    ctx.stroke()
    ctx.setLineDash([])
  })

  return cy + Math.ceil(skills.length / 2) * rowH + LINE_GAP + 10
}

function measureSelfIntroSkills(_ctx: CanvasRenderingContext2D, y: number, c: Character | null, _theme: PosterTheme): number {
  if (!c || c.skills.length === 0) return y
  const count = Math.min(c.skills.filter((s) => (s.initial + s.growth + s.occupation + s.interest) > 0).length, 14)
  return y + 30 + Math.ceil(count / 2) * 28 + LINE_GAP + 10
}

function drawSelfIntroBackground(ctx: CanvasRenderingContext2D, y: number, bg: string, theme: PosterTheme): number {
  const text = bg.trim()
  if (!text) return y
  drawSectionTitle(ctx, y, '背景', theme)
  let cy = y + 30

  ctx.fillStyle = theme.palette.ink
  ctx.font = `400 18px ${theme.fonts.body}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const lines = wrapText(ctx, text, CONTENT_W, `400 18px ${theme.fonts.body}`)
  const lineH = 26
  lines.forEach((line, i) => {
    ctx.fillText(line, MARGIN, cy + i * lineH)
  })
  return cy + lineH * lines.length + LINE_GAP + 10
}

function measureSelfIntroBackground(ctx: CanvasRenderingContext2D, y: number, bg: string, theme: PosterTheme): number {
  const text = bg.trim()
  if (!text) return y
  ctx.font = `400 18px ${theme.fonts.body}`
  const lines = wrapText(ctx, text, CONTENT_W, `400 18px ${theme.fonts.body}`)
  return y + 30 + 26 * lines.length + LINE_GAP + 10
}

// ====================== 招募模板 ======================

function drawRecruitHeader(ctx: CanvasRenderingContext2D, y: number, values: Record<string, string>, theme: PosterTheme): number {
  const moduleType = values.moduleType ?? ''
  const status = values.status ?? ''

  // 大字标题
  ctx.fillStyle = theme.palette.ink
  ctx.font = `italic 700 64px ${theme.fonts.heading}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('模组招募', MARGIN + CONTENT_W / 2, y)
  let cy = y + 90

  // 副标题：类型 + 状态
  const meta: string[] = []
  if (moduleType) meta.push(moduleType)
  if (status) meta.push(status)
  if (meta.length > 0) {
    ctx.fillStyle = theme.palette.muted
    ctx.font = `400 20px ${theme.fonts.body}`
    ctx.fillText(meta.join('  ·  '), MARGIN + CONTENT_W / 2, cy)
    cy += 30
  }
  cy += 30
  drawSectionDivider(ctx, cy, theme)
  return cy + 30
}

function measureRecruitHeader(_ctx: CanvasRenderingContext2D, y: number, values: Record<string, string>, _theme: PosterTheme): number {
  let cy = y + 90
  if (values.moduleType || values.status) cy += 30
  cy += 30 + 30
  return cy
}

function drawRecruitSummary(ctx: CanvasRenderingContext2D, y: number, text: string, theme: PosterTheme): number {
  if (!text.trim()) return y
  drawSectionTitle(ctx, y, '模组简介', theme)
  let cy = y + 30

  ctx.font = `400 20px ${theme.fonts.body}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const lines = wrapText(ctx, text.trim(), CONTENT_W - 40, `400 20px ${theme.fonts.body}`)
  const lineH = 30
  const pad = 18
  const boxH = pad * 2 + lineH * lines.length

  ctx.fillStyle = theme.palette.card
  ctx.fillRect(MARGIN, cy, CONTENT_W, boxH)
  ctx.fillStyle = theme.palette.accent
  ctx.fillRect(MARGIN, cy, 4, boxH)

  ctx.fillStyle = theme.palette.ink
  lines.forEach((line, i) => {
    ctx.fillText(line, MARGIN + 18, cy + pad + i * lineH)
  })
  return cy + boxH + LINE_GAP + 10
}

function measureRecruitSummary(ctx: CanvasRenderingContext2D, y: number, text: string, theme: PosterTheme): number {
  if (!text.trim()) return y
  ctx.font = `400 20px ${theme.fonts.body}`
  const lines = wrapText(ctx, text.trim(), CONTENT_W - 40, `400 20px ${theme.fonts.body}`)
  return y + 30 + 36 + 30 * lines.length + LINE_GAP + 10
}

function drawRecruitSelfIntro(ctx: CanvasRenderingContext2D, y: number, text: string, theme: PosterTheme): number {
  if (!text.trim()) return y
  drawSectionTitle(ctx, y, 'KP 自我介绍', theme)
  let cy = y + 30

  ctx.font = `italic 400 18px ${theme.fonts.body}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const lines = wrapText(ctx, text.trim(), CONTENT_W - 40, `italic 400 18px ${theme.fonts.body}`)
  const lineH = 26
  const pad = 16
  const boxH = pad * 2 + lineH * lines.length

  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fillRect(MARGIN, cy, CONTENT_W, boxH)
  ctx.strokeStyle = theme.palette.warm
  ctx.lineWidth = 1
  ctx.setLineDash([3, 3])
  ctx.strokeRect(MARGIN, cy, CONTENT_W, boxH)
  ctx.setLineDash([])

  ctx.fillStyle = theme.palette.ink
  lines.forEach((line, i) => {
    ctx.fillText(line, MARGIN + 18, cy + pad + i * lineH)
  })
  return cy + boxH + LINE_GAP + 10
}

function measureRecruitSelfIntro(ctx: CanvasRenderingContext2D, y: number, text: string, theme: PosterTheme): number {
  if (!text.trim()) return y
  ctx.font = `italic 400 18px ${theme.fonts.body}`
  const lines = wrapText(ctx, text.trim(), CONTENT_W - 40, `italic 400 18px ${theme.fonts.body}`)
  return y + 30 + 32 + 26 * lines.length + LINE_GAP + 10
}

interface RecruitInfoItem {
  label: string
  value: string
}

function drawRecruitInfoList(ctx: CanvasRenderingContext2D, y: number, items: RecruitInfoItem[], theme: PosterTheme): number {
  const visible = items.filter((it) => it.value.trim())
  if (visible.length === 0) return y
  drawSectionTitle(ctx, y, '关键信息', theme)
  let cy = y + 30

  const labelW = 130
  const rowH = 52
  visible.forEach((item, i) => {
    const yy = cy + i * (rowH + 6)
    ctx.fillStyle = theme.palette.accentSoft
    ctx.fillRect(MARGIN, yy, CONTENT_W, rowH)
    ctx.fillStyle = theme.palette.accent
    ctx.fillRect(MARGIN, yy, labelW, rowH)

    ctx.fillStyle = '#ffffff'
    ctx.font = `600 14px ${theme.fonts.body}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(item.label, MARGIN + labelW / 2, yy + rowH / 2 + 1)

    ctx.fillStyle = theme.palette.ink
    ctx.font = `400 16px ${theme.fonts.body}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    const valLines = wrapText(ctx, item.value.trim(), CONTENT_W - labelW - 32, `400 16px ${theme.fonts.body}`).slice(0, 2)
    valLines.forEach((line, li) => {
      ctx.fillText(line, MARGIN + labelW + 16, yy + rowH / 2 + (li - (valLines.length - 1) / 2) * 20)
    })
  })
  return cy + visible.length * (rowH + 6) + LINE_GAP + 10
}

function measureRecruitInfoList(_ctx: CanvasRenderingContext2D, y: number, items: RecruitInfoItem[], _theme: PosterTheme): number {
  const visible = items.filter((it) => it.value.trim())
  if (visible.length === 0) return y
  return y + 30 + visible.length * (52 + 6) + LINE_GAP + 10
}

function drawRecruitContact(ctx: CanvasRenderingContext2D, y: number, text: string, theme: PosterTheme): number {
  if (!text.trim()) return y
  ctx.font = `500 18px ${theme.fonts.body}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const lines = wrapText(ctx, text.trim(), CONTENT_W - 200, `500 18px ${theme.fonts.body}`)
  const lineH = 24
  const pad = 18
  const boxH = pad * 2 + lineH * lines.length

  ctx.fillStyle = theme.palette.warmSoft
  ctx.fillRect(MARGIN, y, CONTENT_W, boxH)
  ctx.fillStyle = theme.palette.warm
  ctx.fillRect(MARGIN, y, 4, boxH)

  ctx.fillStyle = theme.palette.warm
  ctx.font = `700 14px ${theme.fonts.body}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('联系方式', MARGIN + 16, y + pad + 12)

  ctx.fillStyle = theme.palette.ink
  ctx.font = `500 18px ${theme.fonts.body}`
  lines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, MARGIN + 130, y + pad + 12 + i * lineH)
  })
  return y + boxH + LINE_GAP + 10
}

function measureRecruitContact(ctx: CanvasRenderingContext2D, y: number, text: string, theme: PosterTheme): number {
  if (!text.trim()) return y
  ctx.font = `500 18px ${theme.fonts.body}`
  const lines = wrapText(ctx, text.trim(), CONTENT_W - 200, `500 18px ${theme.fonts.body}`)
  return y + 36 + 24 * lines.length + LINE_GAP + 10
}

function drawRecruitNotes(ctx: CanvasRenderingContext2D, y: number, text: string, theme: PosterTheme): number {
  if (!text.trim()) return y
  drawSectionTitle(ctx, y, '备注', theme)
  let cy = y + 30

  ctx.fillStyle = theme.palette.ink
  ctx.font = `italic 400 17px ${theme.fonts.body}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const lines = wrapText(ctx, text.trim(), CONTENT_W, `italic 400 17px ${theme.fonts.body}`)
  const lineH = 24
  lines.forEach((line, i) => {
    ctx.fillText(line, MARGIN, cy + i * lineH)
  })
  return cy + lineH * lines.length + LINE_GAP + 10
}

function measureRecruitNotes(ctx: CanvasRenderingContext2D, y: number, text: string, theme: PosterTheme): number {
  if (!text.trim()) return y
  ctx.font = `italic 400 17px ${theme.fonts.body}`
  const lines = wrapText(ctx, text.trim(), CONTENT_W, `italic 400 17px ${theme.fonts.body}`)
  return y + 30 + 24 * lines.length + LINE_GAP + 10
}

// ====================== 辅助 ======================

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return s.slice(0, max - 1) + '…'
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  font: string,
): string[] {
  ctx.font = font
  const lines: string[] = []
  let line = ''
  for (const ch of text) {
    const test = line + ch
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = ch
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string): void {
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}