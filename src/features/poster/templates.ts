/**
 * 海报模板定义
 * - 信纸风格：单栏纵向布局，无固定位置
 * - 字段不再写死 maxLength（用户自由写，渲染时自动换行 + 自适应高度）
 */

import type { PosterTemplate } from '@/features/character/types'

/** 「角色卡」模板（MVP 自介，信纸风格） */
export const SELF_INTRO_TEMPLATE: PosterTemplate = {
  id: 'self-intro-v1',
  type: 'self-intro',
  name: '角色卡',
  thumbnail: '',
  size: { w: 1080, h: 1440 }, // 高度只是占位；渲染时按内容重算
  fields: [
    {
      key: 'slogan',
      label: '一句话自我介绍',
      multiline: true,
      placeholder: '在深渊的边缘，记录每一缕微光。',
    },
    {
      key: 'background',
      label: '背景故事摘要（可选）',
      multiline: true,
      placeholder: '前调查员、退役军人、神秘学研究者……',
    },
  ],
  artSpec: {
    background: { type: 'gradient', value: '#f8f4ec,#efe6d5' },
    layers: [],
    fonts: {
      heading: '"Didot", "Bodoni MT", "Playfair Display", serif',
      body: '"Source Han Serif SC", "Noto Serif SC", "Noto Sans SC", serif',
      mono: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
    },
  },
}

/** 「模组招募」模板（信纸风格） */
export const RECRUIT_TEMPLATE: PosterTemplate = {
  id: 'recruit-v1',
  type: 'recruit',
  name: '模组招募',
  thumbnail: '',
  size: { w: 1080, h: 1440 },
  fields: [
    { key: 'moduleType', label: '模组类型', placeholder: '原创 / 改编 / 推理 / 恐怖 / 短团 / 长团' },
    { key: 'status', label: '招募状态', placeholder: '招募中 / 即将开团' },
    {
      key: 'summary',
      label: '模组简介',
      multiline: true,
      placeholder: '剧情简介 / 氛围基调 / PL 玩家将经历什么',
    },
    { key: 'openTime', label: '开团时间', placeholder: '10月1日 / 满员即开' },
    {
      key: 'selfIntro',
      label: '自我介绍（KP）',
      multiline: true,
      placeholder: '我是 XX，带团 XX 年，风格偏硬核/轻松……',
    },
    {
      key: 'requirements',
      label: 'PL 招募需求',
      multiline: true,
      placeholder: '人数 / 职业偏好 / 年龄段 / 是否需要预制卡',
    },
    { key: 'schedule', label: '跑团时间', placeholder: '每周六 20:00-23:00 · 北京时间' },
    { key: 'platform', label: '平台', placeholder: 'QQ 团房 / Discord / 线下' },
    {
      key: 'rules',
      label: '规则',
      multiline: true,
      placeholder: 'COC7 第七版 + 房规（投 1-5 大成功 / 96-100 大失败）',
    },
    { key: 'fee', label: '收费情况', placeholder: '无偿 / AA / 收费 XX 元' },
    { key: 'contact', label: '联系方式', placeholder: 'QQ: 123456 / Discord: name#1234' },
    {
      key: 'notes',
      label: '其他备注（可选）',
      multiline: true,
      placeholder: '对 PL 的额外要求 / 警告内容',
    },
  ],
  artSpec: {
    background: { type: 'gradient', value: '#f8f4ec,#efe6d5' },
    layers: [],
    fonts: {
      heading: '"Didot", "Bodoni MT", "Playfair Display", serif',
      body: '"Source Han Serif SC", "Noto Serif SC", "Noto Sans SC", serif',
      mono: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
    },
  },
}

/** 当前内置模板清单 */
export const POSTER_TEMPLATES: PosterTemplate[] = [SELF_INTRO_TEMPLATE, RECRUIT_TEMPLATE]

export function getTemplateById(id: string): PosterTemplate | undefined {
  return POSTER_TEMPLATES.find((t) => t.id === id)
}