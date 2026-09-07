/**
 * 海报模板定义
 * MVP：1 套「调查员自介」（self-intro）
 * Phase 3：再加「招募」「应征」模板 + 模板切换 UI
 *
 * 渲染坐标以 1080×1440 为画布基准；
 * 实际显示时 CSS 按比例缩放，PNG 导出按原始分辨率。
 */

import type { PosterTemplate } from '@/features/character/types'

/** 「调查员自介」模板 */
export const SELF_INTRO_TEMPLATE: PosterTemplate = {
  id: 'self-intro-v1',
  type: 'self-intro',
  name: '调查员自介',
  thumbnail: '',
  size: { w: 1080, h: 1440 },
  fields: [
    {
      key: 'slogan',
      label: '一句话自我介绍',
      multiline: true,
      maxLength: 80,
      placeholder: '在深渊的边缘，记录每一缕微光。',
    },
    {
      key: 'background',
      label: '背景故事摘要（可选）',
      multiline: true,
      maxLength: 200,
      placeholder: '前调查员、退役军人、神秘学研究者……',
    },
  ],
  artSpec: {
    background: { type: 'gradient', value: '#f4ecde,#e8d9c0' },
    layers: [],
    fonts: {
      heading: '"Source Han Serif SC", "Noto Serif SC", serif',
      body: '"Source Han Sans SC", "Noto Sans SC", system-ui, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
    },
  },
}

/** 当前内置模板清单（MVP 仅 1 个） */
export const POSTER_TEMPLATES: PosterTemplate[] = [SELF_INTRO_TEMPLATE]

export function getTemplateById(id: string): PosterTemplate | undefined {
  return POSTER_TEMPLATES.find((t) => t.id === id)
}