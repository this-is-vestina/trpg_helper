/**
 * 海报 Canvas 2D 渲染器
 * - 坐标以 1080×1440 为基准
 * - renderPoster(): 调查员自介模板
 * - renderRecruitPoster(): 模组招募模板（Phase 3-A）
 * - 颜色用项目 tokens 硬编码
 */

import type { Character, CharacterStats, PosterTemplate } from '@/features/character/types'

// ===== 颜色硬编码（与 globals.css tokens 对齐）=====

const COLOR = {
  bgTop: '#f4ecde',
  bgBot: '#e8d9c0',
  accent: '#4fb3a4',
  accentSoft: '#dff0ec',
  highlight: '#e68a3c',
  highlightSoft: '#f7e1cc',
  warm: '#d4a574',
  warmSoft: '#f0e3d0',
  ink: '#2a2520',
  muted: '#8a7e6d',
  line: '#c8b89e',
  danger: '#c25450',
} as const

// ====================== 自介模板输入/渲染 ======================

export interface PosterRenderInput {
  template: PosterTemplate
  character: Character | null
  values: {
    slogan: string
    background: string
  }
}

export function renderPoster(canvas: HTMLCanvasElement, input: PosterRenderInput): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { template, character, values } = input
  canvas.width = template.size.w
  canvas.height = template.size.h

  drawSelfIntroBackground(ctx, template.size.w, template.size.h)
  drawSelfIntroHeader(ctx, template.size.w)
  drawIdentity(ctx, character)
  drawSlogan(ctx, values.slogan)
  drawModule(ctx, character)
  drawStatsGrid(ctx, character)
  drawDerived(ctx, character)
  drawSkills(ctx, character)
  drawSelfIntroBackground_(ctx, values.background)
  drawFooter(ctx, template.size.w, template.size.h)
}

// ====================== 招募模板输入/渲染 ======================

export interface RecruitPosterInput {
  template: PosterTemplate
  values: Record<string, string>
}

export function renderRecruitPoster(canvas: HTMLCanvasElement, input: RecruitPosterInput): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { template, values } = input
  canvas.width = template.size.w
  canvas.height = template.size.h

  drawRecruitBackground(ctx, template.size.w, template.size.h)
  drawRecruitHeader(ctx, template.size.w, values.status ?? '', values.moduleType ?? '')
  drawRecruitModuleName(ctx, template.size.w)
  drawRecruitSummary(ctx, values.summary ?? '')
  drawRecruitInfoList(ctx, [
    { label: '招募需求', value: values.requirements ?? '' },
    { label: '跑团时间', value: values.schedule ?? '' },
    { label: '平台', value: values.platform ?? '' },
    { label: '规则', value: values.rules ?? '' },
    { label: '收费', value: values.fee ?? '' },
  ])
  drawRecruitContact(ctx, values.contact ?? '')
  drawRecruitNotes(ctx, values.notes ?? '')
  drawFooter(ctx, template.size.w, template.size.h)
}

// ============================ 自介模板绘制 ============================

function drawSelfIntroBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const g = ctx.createLinearGradient(0, 0, 0, height)
  g.addColorStop(0, COLOR.bgTop)
  g.addColorStop(1, COLOR.bgBot)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = COLOR.accentSoft
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(140, 0)
  ctx.lineTo(0, 140)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = COLOR.warmSoft
  ctx.beginPath()
  ctx.moveTo(width, height)
  ctx.lineTo(width - 140, height)
  ctx.lineTo(width, height - 140)
  ctx.closePath()
  ctx.fill()
}

function drawSelfIntroHeader(ctx: CanvasRenderingContext2D, width: number) {
  ctx.strokeStyle = COLOR.line
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(60, 60)
  ctx.lineTo(width - 60, 60)
  ctx.stroke()

  ctx.fillStyle = COLOR.muted
  ctx.font = `500 22px serif`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillText('TRPG · INVESTIGATOR PROFILE', 60, 96)

  ctx.fillStyle = COLOR.accent
  ctx.fillRect(width - 100, 80, 40, 6)
  ctx.fillStyle = COLOR.warm
  ctx.fillRect(width - 50, 80, 6, 40)
}

function drawIdentity(ctx: CanvasRenderingContext2D, c: Character | null) {
  const name = c?.info.name.trim() || '未命名调查员'
  const player = c?.info.player.trim()
  const occupation = c?.info.occupation.trim()
  const occupationNo = c?.info.occupationNo

  ctx.fillStyle = COLOR.ink
  ctx.font = `700 56px serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(truncate(name, 14), 60, 140)

  ctx.fillStyle = COLOR.muted
  ctx.font = `400 24px sans-serif`
  ctx.fillText(
    [player && `PL · ${player}`, occupation && occupation, occupationNo && `№ ${occupationNo}`]
      .filter(Boolean)
      .join('  ·  ') || '— 暂无身份信息 —',
    60,
    220,
  )

  const meta: string[] = []
  if (c?.info.age) meta.push(`${c.info.age} 岁`)
  if (c?.info.gender) meta.push(c.info.gender)
  if (c?.info.residence) meta.push(c.info.residence)
  if (c?.info.era) meta.push(c.info.era)
  if (meta.length > 0) {
    ctx.fillStyle = COLOR.warm
    ctx.font = `500 18px sans-serif`
    ctx.fillText(meta.join('  ·  '), 60, 258)
  }
}

function drawSlogan(ctx: CanvasRenderingContext2D, slogan: string) {
  if (!slogan) return
  const text = slogan.trim()
  const y = 308
  const padX = 24
  const padY = 18
  const boxW = 1080 - 60 * 2
  const lineH = 26
  const lines = wrapText(ctx, text, boxW - padX * 2, `italic 500 22px serif`)
  const boxH = padY * 2 + lineH * lines.length

  ctx.fillStyle = COLOR.warmSoft
  ctx.fillRect(60, y, boxW, boxH)
  ctx.fillStyle = COLOR.warm
  ctx.fillRect(60, y, 6, boxH)

  ctx.fillStyle = COLOR.ink
  ctx.font = `italic 500 22px serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  lines.forEach((line, i) => {
    ctx.fillText(line, 60 + padX, y + padY + i * lineH)
  })
}

function drawModule(ctx: CanvasRenderingContext2D, c: Character | null) {
  if (!c?.info.module) return
  ctx.fillStyle = COLOR.accent
  ctx.font = `600 22px sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  const hoLabel = c.info.hoSlot ? ` · Ho ${c.info.hoSlot}` : ''
  ctx.fillText(`「${c.info.module}」${hoLabel}`, 60, 540)
}

function drawStatsGrid(ctx: CanvasRenderingContext2D, c: Character | null) {
  ctx.fillStyle = COLOR.muted
  ctx.font = `600 18px sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('— 核心属性 —', 60, 620)

  const gridX = 60
  const gridY = 660
  const cellW = (1080 - 60 * 2 - 16 * 2) / 3
  const cellH = 100

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
    const x = gridX + col * (cellW + 16)
    const y = gridY + row * (cellH + 12)
    const v = c?.stats[key] ?? 0

    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.fillRect(x, y, cellW, cellH)
    ctx.fillStyle = COLOR.accent
    ctx.fillRect(x, y, 4, cellH)
    ctx.fillStyle = COLOR.muted
    ctx.font = `500 18px sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(label, x + 16, y + 14)
    ctx.fillStyle = COLOR.ink
    ctx.font = `700 44px monospace`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(v), x + cellW - 16, y + cellH / 2 + 6)
  })
}

function drawDerived(ctx: CanvasRenderingContext2D, c: Character | null) {
  ctx.fillStyle = COLOR.muted
  ctx.font = `600 18px sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('— 衍生值 —', 60, 1010)

  const items = [
    { label: 'HP', v: c?.derived.hp ?? 0, color: COLOR.danger },
    { label: 'SAN', v: c?.derived.san ?? 0, color: COLOR.accent },
    { label: 'MP', v: c?.derived.mp ?? 0, color: COLOR.highlight },
    { label: 'MOV', v: c?.derived.mov ?? 0, color: COLOR.warm },
    { label: 'Build', v: c?.derived.build ?? 0, color: COLOR.muted },
  ]
  const startX = 60
  const cellW = (1080 - 60 * 2 - 16 * 4) / 5
  const cellH = 80
  const y = 1050

  items.forEach((it, i) => {
    const x = startX + i * (cellW + 16)
    ctx.fillStyle = COLOR.accentSoft
    ctx.fillRect(x, y, cellW, cellH)
    ctx.fillStyle = it.color
    ctx.fillRect(x, y, cellW, 4)

    ctx.fillStyle = COLOR.muted
    ctx.font = `500 16px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(it.label, x + cellW / 2, y + 14)

    ctx.fillStyle = COLOR.ink
    ctx.font = `700 32px monospace`
    ctx.textBaseline = 'middle'
    ctx.fillText(String(it.v), x + cellW / 2, y + 50)
  })
}

function drawSkills(ctx: CanvasRenderingContext2D, c: Character | null) {
  if (!c) return
  ctx.fillStyle = COLOR.muted
  ctx.font = `600 18px sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('— 技能 —', 60, 1180)

  const skills = [...c.skills]
    .map((s) => ({ name: s.name, total: s.initial + s.growth + s.occupation + s.interest }))
    .filter((s) => s.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 14)

  const startY = 1220
  const rowH = 30
  const colW = (1080 - 60 * 2 - 32) / 2
  if (skills.length === 0) {
    ctx.fillStyle = COLOR.muted
    ctx.font = `400 16px sans-serif`
    ctx.textAlign = 'left'
    ctx.fillText('（未填写技能）', 60, startY + 8)
    return
  }

  skills.forEach((s, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 60 + col * (colW + 32)
    const y = startY + row * rowH

    ctx.fillStyle = COLOR.ink
    ctx.font = `500 18px sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(truncate(s.name, 12), x, y)

    ctx.fillStyle = COLOR.accent
    ctx.font = `600 18px monospace`
    ctx.textAlign = 'right'
    ctx.fillText(String(s.total), x + colW, y)

    ctx.strokeStyle = COLOR.line
    ctx.lineWidth = 0.5
    ctx.setLineDash([2, 4])
    ctx.beginPath()
    ctx.moveTo(x, y + 12)
    ctx.lineTo(x + colW, y + 12)
    ctx.stroke()
    ctx.setLineDash([])
  })
}

function drawSelfIntroBackground_(ctx: CanvasRenderingContext2D, bg: string) {
  const text = bg.trim()
  if (!text) return
  ctx.fillStyle = COLOR.muted
  ctx.font = `600 18px sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('— 背景 —', 60, 1380)

  ctx.fillStyle = COLOR.ink
  ctx.font = `400 18px sans-serif`
  ctx.fillText(truncate(text, 56), 60, 1410)
}

// ============================ 招募模板绘制 ============================

function drawRecruitBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const g = ctx.createLinearGradient(0, 0, 0, height)
  g.addColorStop(0, COLOR.bgTop)
  g.addColorStop(1, COLOR.bgBot)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, width, height)

  // 顶部 accent 装饰条
  ctx.fillStyle = COLOR.accent
  ctx.fillRect(0, 0, width, 8)
  // 右上角装饰三角
  ctx.fillStyle = COLOR.accentSoft
  ctx.beginPath()
  ctx.moveTo(width, 0)
  ctx.lineTo(width - 180, 0)
  ctx.lineTo(width, 180)
  ctx.closePath()
  ctx.fill()
}

function drawRecruitHeader(ctx: CanvasRenderingContext2D, width: number, status: string, moduleType: string) {
  // 顶部装饰线
  ctx.strokeStyle = COLOR.line
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(60, 70)
  ctx.lineTo(width - 60, 70)
  ctx.stroke()

  // 顶部 RECRUITING 标签
  ctx.fillStyle = COLOR.accent
  ctx.font = `700 28px serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('RECRUITING · 模组招募', 60, 110)

  // 右上：状态 tag
  if (status) {
    const tagText = status
    ctx.font = `600 18px sans-serif`
    const tagW = ctx.measureText(tagText).width + 32
    const tagX = width - 60 - tagW
    const tagY = 90
    const tagH = 36
    ctx.fillStyle = COLOR.accent
    ctx.fillRect(tagX, tagY, tagW, tagH)
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.fillText(tagText, tagX + tagW / 2, tagY + tagH / 2 + 1)
  }

  // 类型 tag（左侧偏小）
  if (moduleType) {
    const tagText = truncate(moduleType, 18)
    ctx.font = `500 16px sans-serif`
    const tagW = ctx.measureText(tagText).width + 24
    const tagX = 60
    const tagY = 155
    const tagH = 30
    ctx.fillStyle = COLOR.warmSoft
    ctx.fillRect(tagX, tagY, tagW, tagH)
    ctx.strokeStyle = COLOR.warm
    ctx.lineWidth = 1
    ctx.strokeRect(tagX, tagY, tagW, tagH)
    ctx.fillStyle = COLOR.warm
    ctx.textAlign = 'center'
    ctx.fillText(tagText, tagX + tagW / 2, tagY + tagH / 2 + 1)
  }
}

function drawRecruitModuleName(ctx: CanvasRenderingContext2D, width: number) {
  const y = 220
  ctx.fillStyle = COLOR.muted
  ctx.font = `500 16px sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('— 模组简介 —', 60, y)

  ctx.strokeStyle = COLOR.accent
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(60, y + 14)
  ctx.lineTo(width - 60, y + 14)
  ctx.stroke()
}

function drawRecruitSummary(ctx: CanvasRenderingContext2D, text: string) {
  if (!text.trim()) return
  const y = 260
  const padX = 24
  const padY = 22
  const boxW = 1080 - 60 * 2
  const lineH = 28
  const lines = wrapText(ctx, text.trim(), boxW - padX * 2, `400 20px serif`)
  const boxH = padY * 2 + lineH * Math.min(lines.length, 6)
  const drawLines = lines.slice(0, 6)

  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillRect(60, y, boxW, boxH)
  ctx.fillStyle = COLOR.accent
  ctx.fillRect(60, y, 6, boxH)

  ctx.fillStyle = COLOR.ink
  ctx.font = `400 20px serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  drawLines.forEach((line, i) => {
    ctx.fillText(line, 60 + padX, y + padY + i * lineH)
  })
}

interface RecruitInfoItem {
  label: string
  value: string
}

function drawRecruitInfoList(ctx: CanvasRenderingContext2D, items: RecruitInfoItem[]) {
  const startY = 540
  const rowH = 64
  const boxW = 1080 - 60 * 2
  const labelW = 160

  const visibleItems = items.filter((it) => it.value.trim())

  if (visibleItems.length === 0) return

  ctx.fillStyle = COLOR.muted
  ctx.font = `600 18px sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('— 关键信息 —', 60, startY - 30)

  visibleItems.forEach((item, i) => {
    const y = startY + i * (rowH + 8)
    // 卡片背景
    ctx.fillStyle = COLOR.accentSoft
    ctx.fillRect(60, y, boxW, rowH)
    // 左侧 label 背景
    ctx.fillStyle = COLOR.accent
    ctx.fillRect(60, y, labelW, rowH)

    // label
    ctx.fillStyle = '#ffffff'
    ctx.font = `600 16px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(item.label, 60 + labelW / 2, y + rowH / 2 + 1)

    // value（自动换行）
    ctx.fillStyle = COLOR.ink
    ctx.font = `400 18px sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    const valueText = item.value.trim()
    const valLines = wrapText(ctx, valueText, boxW - labelW - 32, `400 18px sans-serif`).slice(0, 2)
    valLines.forEach((line, li) => {
      ctx.fillText(line, 60 + labelW + 16, y + rowH / 2 + (li - (valLines.length - 1) / 2) * 22)
    })
  })
}

function drawRecruitContact(ctx: CanvasRenderingContext2D, text: string) {
  if (!text.trim()) return
  const y = 1080
  const padX = 24
  const padY = 18
  const boxW = 1080 - 60 * 2
  const lineH = 26
  const lines = wrapText(ctx, text.trim(), boxW - padX * 2 - 80, `500 20px sans-serif`)

  ctx.fillStyle = COLOR.warmSoft
  ctx.fillRect(60, y, boxW, Math.max(50, padY * 2 + lineH * lines.length))
  ctx.fillStyle = COLOR.warm
  ctx.fillRect(60, y, 6, Math.max(50, padY * 2 + lineH * lines.length))

  // label
  ctx.fillStyle = COLOR.warm
  ctx.font = `700 16px sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('联系方式', 80, y + 26)

  ctx.fillStyle = COLOR.ink
  ctx.font = `500 20px sans-serif`
  ctx.textBaseline = 'middle'
  lines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, 220, y + 26 + i * lineH)
  })
}

function drawRecruitNotes(ctx: CanvasRenderingContext2D, text: string) {
  if (!text.trim()) return
  const y = 1220
  const padX = 20
  const padY = 18
  const boxW = 1080 - 60 * 2
  const lineH = 24
  const lines = wrapText(ctx, text.trim(), boxW - padX * 2, `italic 400 18px serif`).slice(0, 5)
  const boxH = padY * 2 + lineH * lines.length

  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.fillRect(60, y, boxW, boxH)
  ctx.strokeStyle = COLOR.line
  ctx.lineWidth = 1
  ctx.strokeRect(60, y, boxW, boxH)

  ctx.fillStyle = COLOR.muted
  ctx.font = `600 14px sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('备注', 60 + padX, y + padY - 4)

  ctx.fillStyle = COLOR.ink
  ctx.font = `italic 400 18px serif`
  ctx.textBaseline = 'top'
  lines.forEach((line, i) => {
    ctx.fillText(line, 60 + padX, y + padY + 20 + i * lineH)
  })
}

// ============================ 共用绘制 ============================

function drawFooter(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.strokeStyle = COLOR.line
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(60, height - 50)
  ctx.lineTo(width - 60, height - 50)
  ctx.stroke()

  ctx.fillStyle = COLOR.muted
  ctx.font = `400 14px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Made with TRPG Helper · 本地生成 · 数据不上传', width / 2, height - 28)
}

// ============================ 文本辅助 ============================

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