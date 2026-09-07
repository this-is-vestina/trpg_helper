/**
 * 海报 Canvas 2D 渲染器（信纸风格）
 *
 * 设计：
 * - 单栏纵向 flow layout：每个 section 高度按内容自动算，下一个 section 用上一个的 y
 * - canvas 高度动态（根据内容总和设置）
 * - 配色可入参（palette），字体按 headingFont / bodyFont / monoFont 三套独立传入
 * - 所有字号固定，不随格子大小缩放
 * - 卡片底色统一 70% 半透明（globalAlpha）
 * - 大字标题：不斜体，字符之间用空格分隔
 * - 左下角固定植物图鉴装饰（半透明，PNG 图片资源）
 */

import type { Character, CharacterStats, PosterTemplate } from '@/features/character/types'
import {
  getPaletteById,
  getHeadingFont,
  getCjkFont,
  type PosterPalette,
} from './theme'

// ===== 信纸风格布局常量 =====
const MARGIN = 80
const CONTENT_W = 1080 - MARGIN * 2
const LINE_GAP = 8

/** 卡片底色统一半透明度（与背景融合） */
const CARD_ALPHA = 0.7

export interface PosterTheme {
  palette: PosterPalette
  /** 西文 / 标题字体 font value */
  headingFont: string
  /** 中文 / 正文字体 font value */
  bodyFont: string
  /** 等宽字体 font value */
  monoFont: string
}

function defaultTheme(): PosterTheme {
  return {
    palette: getPaletteById('paper-blue'),
    headingFont: getHeadingFont('didot').value,
    bodyFont: getCjkFont('songti').value,
    monoFont: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
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
  plantImage?: HTMLImageElement | null
}

export interface RecruitPosterInput {
  template: PosterTemplate
  values: Record<string, string>
  theme?: PosterTheme
  plantImage?: HTMLImageElement | null
}

// ====================== 入口 ======================

export function renderPoster(
  canvas: HTMLCanvasElement,
  input: PosterRenderInput,
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { template, character, values, theme = defaultTheme(), plantImage = null } =
    input

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

  const totalHeight = Math.max(y + MARGIN + 320, 800)

  // 2. 实际绘制
  canvas.width = template.size.w
  canvas.height = totalHeight
  drawBackground(ctx, template.size.w, totalHeight, theme)

  let cy = MARGIN
  cy = drawSelfIntroHeader(ctx, cy, character, theme)
  cy = drawSelfIntroSlogan(ctx, cy, values.slogan, theme)
  cy = drawSelfIntroModule(ctx, cy, character, theme)
  cy = drawSelfIntroStats(ctx, cy, character, theme)
  cy = drawSelfIntroDerived(ctx, cy, character, theme)
  cy = drawSelfIntroSkills(ctx, cy, character, theme)
  cy = drawSelfIntroBackground(ctx, cy, values.background, theme)
  cy = drawFooter(ctx, cy, theme)

  // 左下角固定植物图鉴（半透明，跟随最终高度）
  drawPlantDecoration(ctx, template.size.w, totalHeight, plantImage)
}

export function renderRecruitPoster(
  canvas: HTMLCanvasElement,
  input: RecruitPosterInput,
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { template, values, theme = defaultTheme(), plantImage = null } = input

  // 先测量
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = template.size.w
  tempCanvas.height = 4096
  const tempCtx = tempCanvas.getContext('2d')!
  let y = MARGIN
  y = measureRecruitHeader(tempCtx, y, values, theme)
  y = measureRecruitSummary(tempCtx, y, values.summary ?? '', theme)
  y = measureRecruitSelfIntro(tempCtx, y, values.selfIntro ?? '', theme)
  y = measureRecruitInfoList(
    tempCtx,
    y,
    [
      { label: '开团时间', value: values.openTime ?? '' },
      { label: '招募需求', value: values.requirements ?? '' },
      { label: '跑团时间', value: values.schedule ?? '' },
      { label: '平台', value: values.platform ?? '' },
      { label: '规则', value: values.rules ?? '' },
      { label: '收费', value: values.fee ?? '' },
    ],
    theme,
  )
  y = measureRecruitContact(tempCtx, y, values.contact ?? '', theme)
  y = measureRecruitNotes(tempCtx, y, values.notes ?? '', theme)
  y = measureFooter(tempCtx, y, theme)

  const totalHeight = Math.max(y + MARGIN + 320, 800)

  canvas.width = template.size.w
  canvas.height = totalHeight
  drawBackground(ctx, template.size.w, totalHeight, theme)

  let cy = MARGIN
  cy = drawRecruitHeader(ctx, cy, values, theme)
  cy = drawRecruitSummary(ctx, cy, values.summary ?? '', theme)
  cy = drawRecruitSelfIntro(ctx, cy, values.selfIntro ?? '', theme)
  cy = drawRecruitInfoList(
    ctx,
    cy,
    [
      { label: '开团时间', value: values.openTime ?? '' },
      { label: '招募需求', value: values.requirements ?? '' },
      { label: '跑团时间', value: values.schedule ?? '' },
      { label: '平台', value: values.platform ?? '' },
      { label: '规则', value: values.rules ?? '' },
      { label: '收费', value: values.fee ?? '' },
    ],
    theme,
  )
  cy = drawRecruitContact(ctx, cy, values.contact ?? '', theme)
  cy = drawRecruitNotes(ctx, cy, values.notes ?? '', theme)
  cy = drawFooter(ctx, cy, theme)

  drawPlantDecoration(ctx, template.size.w, totalHeight, plantImage)
}

// ====================== 共用绘制 ======================

function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  theme: PosterTheme,
) {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, theme.palette.bgTop)
  g.addColorStop(1, theme.palette.bgBot)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

/** 右下角固定植物图鉴装饰（半透明 PNG / SVG） */
function drawPlantDecoration(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  img: HTMLImageElement | null,
) {
  if (!img || !img.naturalWidth) return
  // 固定显示宽度为海报宽度的 ~26%，按原比例缩放
  const targetW = w * 0.26
  const ratio = img.naturalHeight / img.naturalWidth
  const drawW = targetW
  const drawH = targetW * ratio
  // 固定在右下角（距右 56px、距底 40px，离页脚更近）
  const x = w - drawW - 56
  const y = h - drawH - 40

  ctx.save()
  ctx.globalAlpha = 0.4
  ctx.drawImage(img, x, y, drawW, drawH)
  ctx.restore()
}

function drawSectionDivider(
  ctx: CanvasRenderingContext2D,
  y: number,
  theme: PosterTheme,
) {
  ctx.strokeStyle = theme.palette.line
  ctx.lineWidth = 0.5
  ctx.setLineDash([2, 3])
  ctx.beginPath()
  ctx.moveTo(MARGIN, y)
  ctx.lineTo(MARGIN + CONTENT_W, y)
  ctx.stroke()
  ctx.setLineDash([])
}

function drawSectionTitle(
  ctx: CanvasRenderingContext2D,
  y: number,
  title: string,
  theme: PosterTheme,
) {
  ctx.fillStyle = theme.palette.muted
  ctx.font = `500 16px ${theme.bodyFont}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(`— ${title} —`, MARGIN, y)
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  y: number,
  theme: PosterTheme,
): number {
  const gap = 40
  const lineY = y + gap
  drawSectionDivider(ctx, lineY, theme)

  ctx.fillStyle = theme.palette.muted
  ctx.font = `400 14px ${theme.bodyFont}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(
    'Made with TRPG Helper · 本地生成 · 数据不上传',
    MARGIN + CONTENT_W / 2,
    lineY + 24,
  )
  return lineY + 40
}

function measureFooter(
  _ctx: CanvasRenderingContext2D,
  y: number,
  _theme: PosterTheme,
): number {
  return y + 40 + 40
}

// ====================== 自介模板 ======================

function drawSelfIntroHeader(
  ctx: CanvasRenderingContext2D,
  y: number,
  c: Character | null,
  theme: PosterTheme,
): number {
  const name = c?.info.name.trim() || '未命名调查员'
  const player = c?.info.player.trim()
  const occupation = c?.info.occupation.trim()
  const era = c?.info.era.trim()

  // 大字标题：不斜体、字间空格、字体大小固定
  ctx.fillStyle = theme.palette.ink
  ctx.font = `700 64px ${theme.headingFont}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(spaceChars(truncate(name, 14)), MARGIN + CONTENT_W / 2, y)
  let cy = y + 90

  // 副标题：PL · 职业 · 时代
  const meta: string[] = []
  if (player) meta.push(`PL · ${player}`)
  if (occupation) meta.push(occupation)
  if (era) meta.push(era)
  if (c?.info.age) meta.push(`${c.info.age} 岁`)

  if (meta.length > 0) {
    ctx.fillStyle = theme.palette.muted
    ctx.font = `400 20px ${theme.bodyFont}`
    ctx.fillText(meta.join('  ·  '), MARGIN + CONTENT_W / 2, cy)
    cy += 30
  }

  cy += 30
  drawSectionDivider(ctx, cy, theme)
  return cy + 30
}

function measureSelfIntroHeader(
  _ctx: CanvasRenderingContext2D,
  y: number,
  c: Character | null,
  _theme: PosterTheme,
): number {
  let cy = y + 90
  const player = c?.info.player.trim()
  const occupation = c?.info.occupation.trim()
  if (player || occupation) cy += 30
  cy += 30 + 30
  return cy
}

function drawSelfIntroSlogan(
  ctx: CanvasRenderingContext2D,
  y: number,
  slogan: string,
  theme: PosterTheme,
): number {
  if (!slogan.trim()) return y
  const text = slogan.trim()
  const bodyFont = `400 22px ${theme.bodyFont}`
  ctx.font = bodyFont
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const lines = wrapText(ctx, text, CONTENT_W - 40, bodyFont)
  const lineH = 30
  const pad = 20
  const boxH = pad * 2 + lineH * lines.length

  drawSemiTransparentBox(ctx, theme.palette.card, MARGIN, y, CONTENT_W, boxH)
  ctx.fillStyle = theme.palette.warm
  ctx.fillRect(MARGIN, y, 4, boxH)

  ctx.fillStyle = theme.palette.ink
  lines.forEach((line, i) => {
    ctx.fillText(line, MARGIN + 20, y + pad + i * lineH)
  })
  return y + boxH + LINE_GAP + 10
}

function measureSelfIntroSlogan(
  ctx: CanvasRenderingContext2D,
  y: number,
  slogan: string,
  theme: PosterTheme,
): number {
  if (!slogan.trim()) return y
  const bodyFont = `400 22px ${theme.bodyFont}`
  ctx.font = bodyFont
  const lines = wrapText(ctx, slogan.trim(), CONTENT_W - 40, bodyFont)
  return y + 40 + 30 * lines.length + LINE_GAP + 10
}

function drawSelfIntroModule(
  ctx: CanvasRenderingContext2D,
  y: number,
  c: Character | null,
  theme: PosterTheme,
): number {
  if (!c?.info.module) return y
  ctx.fillStyle = theme.palette.accent
  ctx.font = `600 22px ${theme.bodyFont}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const hoLabel = c.info.hoSlot ? ` · Ho ${c.info.hoSlot}` : ''
  ctx.fillText(`「${c.info.module}」${hoLabel}`, MARGIN + CONTENT_W / 2, y)
  return y + 30 + LINE_GAP + 10
}

function measureSelfIntroModule(
  _ctx: CanvasRenderingContext2D,
  y: number,
  c: Character | null,
  _theme: PosterTheme,
): number {
  if (!c?.info.module) return y
  return y + 30 + LINE_GAP + 10
}

function drawSelfIntroStats(
  ctx: CanvasRenderingContext2D,
  y: number,
  c: Character | null,
  theme: PosterTheme,
): number {
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

    drawSemiTransparentBox(ctx, theme.palette.card, x, yy, cellW, cellH)
    ctx.fillStyle = theme.palette.accent
    ctx.fillRect(x, yy, 3, cellH)

    ctx.fillStyle = theme.palette.muted
    ctx.font = `500 16px ${theme.bodyFont}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(label, x + 12, yy + 12)

    ctx.fillStyle = theme.palette.ink
    ctx.font = `700 36px ${theme.monoFont}`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(v), x + cellW - 12, yy + cellH / 2 + 6)
  })
  return gridY + 3 * (cellH + 12) + LINE_GAP + 10
}

function measureSelfIntroStats(
  _ctx: CanvasRenderingContext2D,
  y: number,
  _c: Character | null,
  _theme: PosterTheme,
): number {
  return y + 30 + 3 * (88 + 12) + LINE_GAP + 10
}

function drawSelfIntroDerived(
  ctx: CanvasRenderingContext2D,
  y: number,
  c: Character | null,
  theme: PosterTheme,
): number {
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
    drawSemiTransparentBox(ctx, theme.palette.accentSoft, x, cy, cellW, cellH)
    ctx.fillStyle = theme.palette.accent
    ctx.fillRect(x, cy, cellW, 3)

    ctx.fillStyle = theme.palette.muted
    ctx.font = `500 13px ${theme.bodyFont}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(it.label, x + cellW / 2, cy + 12)

    ctx.fillStyle = theme.palette.ink
    ctx.font = `700 26px ${theme.monoFont}`
    ctx.textBaseline = 'middle'
    ctx.fillText(String(it.v), x + cellW / 2, cy + 40)
  })
  return cy + cellH + LINE_GAP + 10
}

function measureSelfIntroDerived(
  _ctx: CanvasRenderingContext2D,
  y: number,
  _c: Character | null,
  _theme: PosterTheme,
): number {
  return y + 30 + 68 + LINE_GAP + 10
}

function drawSelfIntroSkills(
  ctx: CanvasRenderingContext2D,
  y: number,
  c: Character | null,
  theme: PosterTheme,
): number {
  if (!c || c.skills.length === 0) return y
  drawSectionTitle(ctx, y, '技能', theme)
  let cy = y + 30

  const skills = [...c.skills]
    .map((s) => ({
      name: s.name,
      total: s.initial + s.growth + s.occupation + s.interest,
    }))
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
    ctx.font = `500 16px ${theme.bodyFont}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(truncate(s.name, 12), x, yy)

    ctx.fillStyle = theme.palette.accent
    ctx.font = `600 16px ${theme.monoFont}`
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

function measureSelfIntroSkills(
  _ctx: CanvasRenderingContext2D,
  y: number,
  c: Character | null,
  _theme: PosterTheme,
): number {
  if (!c || c.skills.length === 0) return y
  const count = Math.min(
    c.skills.filter(
      (s) => s.initial + s.growth + s.occupation + s.interest > 0,
    ).length,
    14,
  )
  return y + 30 + Math.ceil(count / 2) * 28 + LINE_GAP + 10
}

function drawSelfIntroBackground(
  ctx: CanvasRenderingContext2D,
  y: number,
  bg: string,
  theme: PosterTheme,
): number {
  const text = bg.trim()
  if (!text) return y
  drawSectionTitle(ctx, y, '背景', theme)
  let cy = y + 30

  ctx.fillStyle = theme.palette.ink
  const bodyFont = `400 18px ${theme.bodyFont}`
  ctx.font = bodyFont
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const lines = wrapText(ctx, text, CONTENT_W, bodyFont)
  const lineH = 26
  lines.forEach((line, i) => {
    ctx.fillText(line, MARGIN, cy + i * lineH)
  })
  return cy + lineH * lines.length + LINE_GAP + 10
}

function measureSelfIntroBackground(
  ctx: CanvasRenderingContext2D,
  y: number,
  bg: string,
  theme: PosterTheme,
): number {
  const text = bg.trim()
  if (!text) return y
  const bodyFont = `400 18px ${theme.bodyFont}`
  ctx.font = bodyFont
  const lines = wrapText(ctx, text, CONTENT_W, bodyFont)
  return y + 30 + 26 * lines.length + LINE_GAP + 10
}

// ====================== 招募模板 ======================

function drawRecruitHeader(
  ctx: CanvasRenderingContext2D,
  y: number,
  values: Record<string, string>,
  theme: PosterTheme,
): number {
  const moduleType = values.moduleType ?? ''
  const status = values.status ?? ''

  // 大字标题：不斜体、字间空格、字体大小固定
  ctx.fillStyle = theme.palette.ink
  ctx.font = `700 64px ${theme.headingFont}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(spaceChars('模组招募'), MARGIN + CONTENT_W / 2, y)
  let cy = y + 90

  // 副标题：类型 + 状态
  const meta: string[] = []
  if (moduleType) meta.push(moduleType)
  if (status) meta.push(status)
  if (meta.length > 0) {
    ctx.fillStyle = theme.palette.muted
    ctx.font = `400 20px ${theme.bodyFont}`
    ctx.fillText(meta.join('  ·  '), MARGIN + CONTENT_W / 2, cy)
    cy += 30
  }
  cy += 30
  drawSectionDivider(ctx, cy, theme)
  return cy + 30
}

function measureRecruitHeader(
  _ctx: CanvasRenderingContext2D,
  y: number,
  values: Record<string, string>,
  _theme: PosterTheme,
): number {
  let cy = y + 90
  if (values.moduleType || values.status) cy += 30
  cy += 30 + 30
  return cy
}

function drawRecruitSummary(
  ctx: CanvasRenderingContext2D,
  y: number,
  text: string,
  theme: PosterTheme,
): number {
  if (!text.trim()) return y
  drawSectionTitle(ctx, y, '模组简介', theme)
  let cy = y + 30

  const bodyFont = `400 20px ${theme.bodyFont}`
  ctx.font = bodyFont
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const lines = wrapText(ctx, text.trim(), CONTENT_W - 40, bodyFont)
  const lineH = 30
  const pad = 18
  const boxH = pad * 2 + lineH * lines.length

  drawSemiTransparentBox(ctx, theme.palette.card, MARGIN, cy, CONTENT_W, boxH)
  ctx.fillStyle = theme.palette.accent
  ctx.fillRect(MARGIN, cy, 4, boxH)

  ctx.fillStyle = theme.palette.ink
  lines.forEach((line, i) => {
    ctx.fillText(line, MARGIN + 18, cy + pad + i * lineH)
  })
  return cy + boxH + LINE_GAP + 10
}

function measureRecruitSummary(
  ctx: CanvasRenderingContext2D,
  y: number,
  text: string,
  theme: PosterTheme,
): number {
  if (!text.trim()) return y
  const bodyFont = `400 20px ${theme.bodyFont}`
  ctx.font = bodyFont
  const lines = wrapText(ctx, text.trim(), CONTENT_W - 40, bodyFont)
  return y + 30 + 36 + 30 * lines.length + LINE_GAP + 10
}

function drawRecruitSelfIntro(
  ctx: CanvasRenderingContext2D,
  y: number,
  text: string,
  theme: PosterTheme,
): number {
  if (!text.trim()) return y
  drawSectionTitle(ctx, y, 'KP 自我介绍', theme)
  let cy = y + 30

  const bodyFont = `400 18px ${theme.bodyFont}`
  ctx.font = bodyFont
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const lines = wrapText(ctx, text.trim(), CONTENT_W - 40, bodyFont)
  const lineH = 26
  const pad = 16
  const boxH = pad * 2 + lineH * lines.length

  drawSemiTransparentBox(ctx, 'rgba(255,255,255,0.4)', MARGIN, cy, CONTENT_W, boxH)
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

function measureRecruitSelfIntro(
  ctx: CanvasRenderingContext2D,
  y: number,
  text: string,
  theme: PosterTheme,
): number {
  if (!text.trim()) return y
  const bodyFont = `400 18px ${theme.bodyFont}`
  ctx.font = bodyFont
  const lines = wrapText(ctx, text.trim(), CONTENT_W - 40, bodyFont)
  return y + 30 + 32 + 26 * lines.length + LINE_GAP + 10
}

interface RecruitInfoItem {
  label: string
  value: string
}

function drawRecruitInfoList(
  ctx: CanvasRenderingContext2D,
  y: number,
  items: RecruitInfoItem[],
  theme: PosterTheme,
): number {
  const visible = items.filter((it) => it.value.trim())
  if (visible.length === 0) return y
  drawSectionTitle(ctx, y, '关键信息', theme)
  let cy = y + 30

  const labelW = 130
  const rowH = 52
  visible.forEach((item, i) => {
    const yy = cy + i * (rowH + 6)
    drawSemiTransparentBox(ctx, theme.palette.accentSoft, MARGIN, yy, CONTENT_W, rowH)
    // label 区单独不透明（标签条要清晰）
    ctx.fillStyle = theme.palette.accent
    ctx.fillRect(MARGIN, yy, labelW, rowH)

    ctx.fillStyle = '#ffffff'
    ctx.font = `600 14px ${theme.bodyFont}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(item.label, MARGIN + labelW / 2, yy + rowH / 2 + 1)

    ctx.fillStyle = theme.palette.ink
    const bodyFont = `400 16px ${theme.bodyFont}`
    ctx.font = bodyFont
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    const valLines = wrapText(ctx, item.value.trim(), CONTENT_W - labelW - 32, bodyFont).slice(0, 2)
    valLines.forEach((line, li) => {
      ctx.fillText(
        line,
        MARGIN + labelW + 16,
        yy + rowH / 2 + (li - (valLines.length - 1) / 2) * 20,
      )
    })
  })
  return cy + visible.length * (rowH + 6) + LINE_GAP + 10
}

function measureRecruitInfoList(
  _ctx: CanvasRenderingContext2D,
  y: number,
  items: RecruitInfoItem[],
  _theme: PosterTheme,
): number {
  const visible = items.filter((it) => it.value.trim())
  if (visible.length === 0) return y
  return y + 30 + visible.length * (52 + 6) + LINE_GAP + 10
}

function drawRecruitContact(
  ctx: CanvasRenderingContext2D,
  y: number,
  text: string,
  theme: PosterTheme,
): number {
  if (!text.trim()) return y
  const bodyFont = `500 18px ${theme.bodyFont}`
  ctx.font = bodyFont
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const lines = wrapText(ctx, text.trim(), CONTENT_W - 200, bodyFont)
  const lineH = 24
  const pad = 18
  const boxH = pad * 2 + lineH * lines.length

  drawSemiTransparentBox(ctx, theme.palette.warmSoft, MARGIN, y, CONTENT_W, boxH)
  ctx.fillStyle = theme.palette.warm
  ctx.fillRect(MARGIN, y, 4, boxH)

  ctx.fillStyle = theme.palette.warm
  ctx.font = `700 14px ${theme.bodyFont}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('联系方式', MARGIN + 16, y + pad + 12)

  ctx.fillStyle = theme.palette.ink
  ctx.font = bodyFont
  lines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, MARGIN + 130, y + pad + 12 + i * lineH)
  })
  return y + boxH + LINE_GAP + 10
}

function measureRecruitContact(
  ctx: CanvasRenderingContext2D,
  y: number,
  text: string,
  theme: PosterTheme,
): number {
  if (!text.trim()) return y
  const bodyFont = `500 18px ${theme.bodyFont}`
  ctx.font = bodyFont
  const lines = wrapText(ctx, text.trim(), CONTENT_W - 200, bodyFont)
  return y + 36 + 24 * lines.length + LINE_GAP + 10
}

function drawRecruitNotes(
  ctx: CanvasRenderingContext2D,
  y: number,
  text: string,
  theme: PosterTheme,
): number {
  if (!text.trim()) return y
  drawSectionTitle(ctx, y, '备注', theme)
  let cy = y + 30

  ctx.fillStyle = theme.palette.ink
  const bodyFont = `400 17px ${theme.bodyFont}`
  ctx.font = bodyFont
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const lines = wrapText(ctx, text.trim(), CONTENT_W, bodyFont)
  const lineH = 24
  lines.forEach((line, i) => {
    ctx.fillText(line, MARGIN, cy + i * lineH)
  })
  return cy + lineH * lines.length + LINE_GAP + 10
}

function measureRecruitNotes(
  ctx: CanvasRenderingContext2D,
  y: number,
  text: string,
  theme: PosterTheme,
): number {
  if (!text.trim()) return y
  const bodyFont = `400 17px ${theme.bodyFont}`
  ctx.font = bodyFont
  const lines = wrapText(ctx, text.trim(), CONTENT_W, bodyFont)
  return y + 30 + 24 * lines.length + LINE_GAP + 10
}

// ====================== 应征模板 ======================

export interface ApplicationPosterInput {
  template: PosterTemplate
  values: Record<string, string>
  theme?: PosterTheme
  plantImage?: HTMLImageElement | null
}

export function renderApplicationPoster(
  canvas: HTMLCanvasElement,
  input: ApplicationPosterInput,
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { template, values, theme = defaultTheme(), plantImage = null } = input

  // 测量
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = template.size.w
  tempCanvas.height = 4096
  const tempCtx = tempCanvas.getContext('2d')!
  let y = MARGIN
  y = measureApplicationHeader(tempCtx, y, values, theme)
  y = measureApplicationInfo(tempCtx, y, values, theme)
  y = measureApplicationSlogan(tempCtx, y, values.slogan ?? '', theme)
  y = measureApplicationParagraph(
    tempCtx,
    y,
    '申请陈述',
    values.pitch ?? '',
    theme,
  )
  y = measureApplicationParagraph(
    tempCtx,
    y,
    '跑团经历',
    values.experience ?? '',
    theme,
  )
  y = measureApplicationInfo2(tempCtx, y, values, theme)
  y = measureApplicationParagraph(
    tempCtx,
    y,
    '模组偏好',
    values.preference ?? '',
    theme,
  )
  y = measureApplicationParagraph(
    tempCtx,
    y,
    '备注',
    values.notes ?? '',
    theme,
  )
  y = measureFooter(tempCtx, y, theme)

  const totalHeight = Math.max(y + MARGIN + 320, 800)

  canvas.width = template.size.w
  canvas.height = totalHeight
  drawBackground(ctx, template.size.w, totalHeight, theme)

  let cy = MARGIN
  cy = drawApplicationHeader(ctx, cy, values, theme)
  cy = drawApplicationInfo(ctx, cy, values, theme)
  cy = drawApplicationSlogan(ctx, cy, values.slogan ?? '', theme)
  cy = drawApplicationParagraph(ctx, cy, '申请陈述', values.pitch ?? '', theme)
  cy = drawApplicationParagraph(ctx, cy, '跑团经历', values.experience ?? '', theme)
  cy = drawApplicationInfo2(ctx, cy, values, theme)
  cy = drawApplicationParagraph(ctx, cy, '模组偏好', values.preference ?? '', theme)
  cy = drawApplicationParagraph(ctx, cy, '备注', values.notes ?? '', theme)
  cy = drawFooter(ctx, cy, theme)

  drawPlantDecoration(ctx, template.size.w, totalHeight, plantImage)
}

function drawApplicationHeader(
  ctx: CanvasRenderingContext2D,
  y: number,
  values: Record<string, string>,
  theme: PosterTheme,
): number {
  const name = values.name?.trim() ?? ''
  const player = values.player?.trim() ?? ''

  // 大字标题：不斜体、字间空格、字体大小固定
  ctx.fillStyle = theme.palette.ink
  ctx.font = `700 64px ${theme.headingFont}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(spaceChars('应征申请'), MARGIN + CONTENT_W / 2, y)
  let cy = y + 90

  // 副标题：角色名 · PL
  const meta: string[] = []
  if (name) meta.push(name)
  if (player) meta.push(`PL · ${player}`)
  if (meta.length > 0) {
    ctx.fillStyle = theme.palette.muted
    ctx.font = `400 20px ${theme.bodyFont}`
    ctx.fillText(spaceChars(meta.join('  ·  ')), MARGIN + CONTENT_W / 2, cy)
    cy += 30
  }
  cy += 30
  drawSectionDivider(ctx, cy, theme)
  return cy + 30
}

function measureApplicationHeader(
  _ctx: CanvasRenderingContext2D,
  y: number,
  values: Record<string, string>,
  _theme: PosterTheme,
): number {
  let cy = y + 90
  if (values.name || values.player) cy += 30
  cy += 30 + 30
  return cy
}

/** 第一组基础信息卡：角色 / PL / 联系方式 */
function drawApplicationInfo(
  ctx: CanvasRenderingContext2D,
  y: number,
  values: Record<string, string>,
  theme: PosterTheme,
): number {
  return drawApplicationInfoCards(
    ctx,
    y,
    [
      { label: '角色名', value: values.name ?? '' },
      { label: 'PL', value: values.player ?? '' },
      { label: '联系方式', value: values.contact ?? '' },
    ],
    theme,
  )
}

/** 第二组基础信息卡：可用时间 / 模组偏好概览（可选） */
function drawApplicationInfo2(
  ctx: CanvasRenderingContext2D,
  y: number,
  values: Record<string, string>,
  theme: PosterTheme,
): number {
  return drawApplicationInfoCards(
    ctx,
    y,
    [{ label: '可用时间', value: values.schedule ?? '' }],
    theme,
  )
}

function drawApplicationInfoCards(
  ctx: CanvasRenderingContext2D,
  y: number,
  items: { label: string; value: string }[],
  theme: PosterTheme,
): number {
  const visible = items.filter((it) => it.value.trim())
  if (visible.length === 0) return y

  const cellH = 76
  const gap = 14
  const cellW = (CONTENT_W - gap * (visible.length - 1)) / visible.length

  visible.forEach((it, i) => {
    const x = MARGIN + i * (cellW + gap)
    drawSemiTransparentBox(ctx, theme.palette.accentSoft, x, y, cellW, cellH)
    ctx.fillStyle = theme.palette.accent
    ctx.fillRect(x, y, cellW, 3)

    ctx.fillStyle = theme.palette.muted
    ctx.font = `500 13px ${theme.bodyFont}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(it.label, x + cellW / 2, y + 14)

    ctx.fillStyle = theme.palette.ink
    ctx.font = `600 22px ${theme.headingFont}`
    ctx.textBaseline = 'middle'
    const truncated = truncate(it.value.trim(), 14)
    ctx.fillText(spaceChars(truncated), x + cellW / 2, y + cellH / 2 + 10)
  })

  return y + cellH + LINE_GAP + 10
}

function measureApplicationInfo(
  _ctx: CanvasRenderingContext2D,
  y: number,
  values: Record<string, string>,
  _theme: PosterTheme,
): number {
  const visible = [values.name ?? '', values.player ?? '', values.contact ?? '']
    .filter((v) => v.trim())
  if (visible.length === 0) return y
  return y + 76 + LINE_GAP + 10
}

function measureApplicationInfo2(
  _ctx: CanvasRenderingContext2D,
  y: number,
  values: Record<string, string>,
  _theme: PosterTheme,
): number {
  const visible = [values.schedule ?? ''].filter((v) => v.trim())
  if (visible.length === 0) return y
  return y + 76 + LINE_GAP + 10
}

function drawApplicationSlogan(
  ctx: CanvasRenderingContext2D,
  y: number,
  slogan: string,
  theme: PosterTheme,
): number {
  if (!slogan.trim()) return y
  const text = slogan.trim()
  const bodyFont = `400 22px ${theme.bodyFont}`
  ctx.font = bodyFont
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  const lines = wrapText(ctx, text, CONTENT_W - 40, bodyFont)
  const lineH = 32
  const pad = 22
  const boxH = pad * 2 + lineH * lines.length

  drawSemiTransparentBox(ctx, theme.palette.card, MARGIN, y, CONTENT_W, boxH)
  ctx.fillStyle = theme.palette.warm
  ctx.fillRect(MARGIN, y, 4, boxH)
  ctx.fillRect(MARGIN + CONTENT_W - 4, y, 4, boxH)

  ctx.fillStyle = theme.palette.ink
  lines.forEach((line, i) => {
    ctx.fillText(line, MARGIN + CONTENT_W / 2, y + pad + i * lineH)
  })
  return y + boxH + LINE_GAP + 10
}

function measureApplicationSlogan(
  ctx: CanvasRenderingContext2D,
  y: number,
  slogan: string,
  theme: PosterTheme,
): number {
  if (!slogan.trim()) return y
  const bodyFont = `400 22px ${theme.bodyFont}`
  ctx.font = bodyFont
  const lines = wrapText(ctx, slogan.trim(), CONTENT_W - 40, bodyFont)
  return y + 44 + 32 * lines.length + LINE_GAP + 10
}

function drawApplicationParagraph(
  ctx: CanvasRenderingContext2D,
  y: number,
  title: string,
  text: string,
  theme: PosterTheme,
): number {
  const t = text.trim()
  if (!t) return y
  drawSectionTitle(ctx, y, title, theme)
  let cy = y + 30

  const bodyFont = `400 18px ${theme.bodyFont}`
  ctx.fillStyle = theme.palette.ink
  ctx.font = bodyFont
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const lines = wrapText(ctx, t, CONTENT_W, bodyFont)
  const lineH = 28
  lines.forEach((line, i) => {
    ctx.fillText(line, MARGIN, cy + i * lineH)
  })
  return cy + lineH * lines.length + LINE_GAP + 10
}

function measureApplicationParagraph(
  ctx: CanvasRenderingContext2D,
  y: number,
  _title: string,
  text: string,
  theme: PosterTheme,
): number {
  const t = text.trim()
  if (!t) return y
  const bodyFont = `400 18px ${theme.bodyFont}`
  ctx.font = bodyFont
  const lines = wrapText(ctx, t, CONTENT_W, bodyFont)
  return y + 30 + 28 * lines.length + LINE_GAP + 10
}

// ====================== 辅助 ======================

/** 半透明矩形（CARD_ALPHA 全局生效） */
function drawSemiTransparentBox(
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.save()
  ctx.globalAlpha = CARD_ALPHA
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
  ctx.restore()
}

/** 字符之间插入空格（CJK 与 ASCII 都适用） */
function spaceChars(text: string): string {
  if (!text) return ''
  // 全角空格作为分隔（避免与 ASCII 空格冲突），视觉上比半角间距明显
  return text.split('').join(' ')
}

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

export function downloadCanvasAsPng(
  canvas: HTMLCanvasElement,
  filename: string,
): void {
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