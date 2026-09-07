/**
 * 海报主题预设（方案 2：配色 + 字体可选）
 * - 配色：5 套信纸风格调色板
 * - 字体：4 套 heading/body/mono 组合
 *
 * 用户使用流程：
 *   1. 选模板（自介 / 招募）
 *   2. 选主题（配色）
 *   3. 选字体
 *   4. 渲染时传 theme 进 renderPoster / renderRecruitPoster
 */

export interface PosterPalette {
  id: string
  name: string
  /** 卡片主色 / 标题色 */
  ink: string
  /** 次要文字色 */
  muted: string
  /** 强调色（标题背景 tag 等） */
  accent: string
  /** 强调色柔背景 */
  accentSoft: string
  /** 第二强调色（warm） */
  warm: string
  warmSoft: string
  /** 高亮色 */
  highlight: string
  highlightSoft: string
  /** 危险色 */
  danger: string
  /** 背景渐变顶部 */
  bgTop: string
  /** 背景渐变底部 */
  bgBot: string
  /** 分隔线 */
  line: string
  /** 卡片底色 */
  card: string
}

export interface PosterFont {
  id: string
  name: string
  heading: string
  body: string
  mono: string
}

/** 配色预设：信纸风 */
export const POSTER_PALETTES: PosterPalette[] = [
  {
    id: 'paper-blue',
    name: '纸白蓝墨（默认）',
    ink: '#2a3a5e',
    muted: '#6b7a94',
    accent: '#2a3a5e',
    accentSoft: '#dfe6f0',
    warm: '#8a6d3b',
    warmSoft: '#f0e6d2',
    highlight: '#c25450',
    highlightSoft: '#f4dcda',
    danger: '#c25450',
    bgTop: '#f8f4ec',
    bgBot: '#efe6d5',
    line: '#d4c5a8',
    card: '#fdfaf4',
  },
  {
    id: 'paper-brown',
    name: '米白深棕',
    ink: '#3a2f1f',
    muted: '#7a6e5c',
    accent: '#3a2f1f',
    accentSoft: '#e6ddc8',
    warm: '#8a6d3b',
    warmSoft: '#f0e6d2',
    highlight: '#c25450',
    highlightSoft: '#f4dcda',
    danger: '#c25450',
    bgTop: '#f4ecde',
    bgBot: '#e8d9c0',
    line: '#c8b89e',
    card: '#faf5e8',
  },
  {
    id: 'paper-grey',
    name: '灰白黑',
    ink: '#1f1f1f',
    muted: '#666666',
    accent: '#1f1f1f',
    accentSoft: '#e0e0e0',
    warm: '#666666',
    warmSoft: '#ececec',
    highlight: '#999999',
    highlightSoft: '#f0f0f0',
    danger: '#666666',
    bgTop: '#f5f5f5',
    bgBot: '#e8e8e8',
    line: '#cccccc',
    card: '#fafafa',
  },
  {
    id: 'paper-green',
    name: '雪白墨绿',
    ink: '#1f3a2e',
    muted: '#4d6b5e',
    accent: '#1f3a2e',
    accentSoft: '#d4e0d8',
    warm: '#7a5e3b',
    warmSoft: '#ede2c8',
    highlight: '#c25450',
    highlightSoft: '#f4dcda',
    danger: '#c25450',
    bgTop: '#f4f6f4',
    bgBot: '#dde5df',
    line: '#b8c8be',
    card: '#fafcfa',
  },
  {
    id: 'paper-red',
    name: '纸白砖红',
    ink: '#5e2a2a',
    muted: '#946b6b',
    accent: '#5e2a2a',
    accentSoft: '#f0dcda',
    warm: '#8a6d3b',
    warmSoft: '#f0e6d2',
    highlight: '#c25450',
    highlightSoft: '#f4dcda',
    danger: '#c25450',
    bgTop: '#f8f4ec',
    bgBot: '#efe6d5',
    line: '#d4c5a8',
    card: '#fdfaf4',
  },
]

/** 字体预设 */
export const POSTER_FONTS: PosterFont[] = [
  {
    id: 'didot-source-serif',
    name: 'Didot + 思源宋体（推荐）',
    heading: '"Didot", "Bodoni MT", "Playfair Display", serif',
    body: '"Source Han Serif SC", "Noto Serif SC", serif',
    mono: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
  },
  {
    id: 'playfair-source-serif',
    name: 'Playfair + 思源宋体',
    heading: '"Playfair Display", "Didot", serif',
    body: '"Source Han Serif SC", "Noto Serif SC", serif',
    mono: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
  },
  {
    id: 'georgia-source-serif',
    name: 'Georgia + 思源宋体',
    heading: 'Georgia, "Times New Roman", serif',
    body: '"Source Han Serif SC", "Noto Serif SC", serif',
    mono: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
  },
  {
    id: 'courier-sans',
    name: 'Courier New + 等线',
    heading: '"Courier New", Courier, monospace',
    body: '"Microsoft YaHei", "PingFang SC", sans-serif',
    mono: '"Courier New", Courier, monospace',
  },
]

export function getPaletteById(id: string): PosterPalette {
  return POSTER_PALETTES.find((p) => p.id === id) ?? POSTER_PALETTES[0]
}

export function getFontById(id: string): PosterFont {
  return POSTER_FONTS.find((f) => f.id === id) ?? POSTER_FONTS[0]
}