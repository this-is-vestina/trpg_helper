/**
 * 海报主题预设（方案 2：配色 + 字体可选）
 * - 配色：5 套信纸风格调色板
 * - 字体：西文（heading）和中文（body）独立选择
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

export interface PosterFontOption {
  id: string
  name: string
  value: string
}

/** 西文字体（标题 / 数字 / 英文小字） */
export const POSTER_HEADING_FONTS: PosterFontOption[] = [
  { id: 'didot', name: 'Didot（推荐）', value: '"Didot", "Bodoni MT", "Playfair Display", serif' },
  { id: 'playfair', name: 'Playfair Display', value: '"Playfair Display", "Didot", serif' },
  { id: 'georgia', name: 'Georgia', value: 'Georgia, "Times New Roman", serif' },
  { id: 'courier', name: 'Courier New', value: '"Courier New", Courier, monospace' },
  { id: 'times', name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
]

/** 中文字体（正文 / 标题中文） */
export const POSTER_CJK_FONTS: PosterFontOption[] = [
  { id: 'songti', name: '思源宋体（推荐）', value: '"Source Han Serif SC", "Noto Serif SC", "Songti SC", serif' },
  { id: 'heiti', name: '思源黑体', value: '"Source Han Sans SC", "Noto Sans SC", "PingFang SC", sans-serif' },
  { id: 'kaiti', name: '楷体', value: '"Kaiti SC", "STKaiti", "FangSong", serif' },
  { id: 'fangsong', name: '仿宋', value: '"FangSong", "STFangsong", serif' },
]

export function getHeadingFont(id: string): PosterFontOption {
  return POSTER_HEADING_FONTS.find((f) => f.id === id) ?? POSTER_HEADING_FONTS[0]
}

export function getCjkFont(id: string): PosterFontOption {
  return POSTER_CJK_FONTS.find((f) => f.id === id) ?? POSTER_CJK_FONTS[0]
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

export function getPaletteById(id: string): PosterPalette {
  return POSTER_PALETTES.find((p) => p.id === id) ?? POSTER_PALETTES[0]
}