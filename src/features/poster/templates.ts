/**
 * 海报模板定义
 * MVP：1 套「调查员自介」（self-intro）
 * Phase 3：再加「招募」「应征」模板 + 模板切换 UI
 *
 * 渲染坐标以 1080×1440 为画布基准；
 * 实际显示时 CSS 按比例缩放，PNG 导出按原始分辨率。
 */

import type { PosterTemplate } from '@/features/character/types'

/** 「角色卡」模板（MVP 自介） */
export const SELF_INTRO_TEMPLATE: PosterTemplate = {
  id: 'self-intro-v1',
  type: 'self-intro',
  name: '角色卡',
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

/** 「模组招募」模板（Phase 3-A） */
export const RECRUIT_TEMPLATE: PosterTemplate = {
  id: 'recruit-v1',
  type: 'recruit',
  name: '模组招募',
  thumbnail: '',
  size: { w: 1080, h: 1440 },
  fields: [
    { key: 'moduleType', label: '模组类型', maxLength: 30, placeholder: '原创 / 改编 / 推理 / 恐怖 / 短团 / 长团' },
    { key: 'status', label: '招募状态', maxLength: 20, placeholder: '招募中 / 即将开团' },
    {
      key: 'summary',
      label: '模组简介',
      multiline: true,
      maxLength: 240,
      placeholder: '剧情简介 / 氛围基调 / PL 玩家将经历什么',
    },
    { key: 'openTime', label: '开团时间', maxLength: 40, placeholder: '10月1日 / 满员即开' },
    {
      key: 'selfIntro',
      label: '自我介绍（KP）',
      multiline: true,
      maxLength: 120,
      placeholder: '我是 XX，带团 XX 年，风格偏硬核/轻松……',
    },
    {
      key: 'requirements',
      label: 'PL 招募需求',
      multiline: true,
      maxLength: 180,
      placeholder: '人数 / 职业偏好 / 年龄段 / 是否需要预制卡',
    },
    { key: 'schedule', label: '跑团时间', maxLength: 60, placeholder: '每周六 20:00-23:00 · 北京时间' },
    { key: 'platform', label: '平台', maxLength: 30, placeholder: 'QQ 团房 / Discord / 线下' },
    {
      key: 'rules',
      label: '规则',
      multiline: true,
      maxLength: 160,
      placeholder: 'COC7 第七版 + 房规（投 1-5 大成功 / 96-100 大失败）',
    },
    { key: 'fee', label: '收费情况', maxLength: 30, placeholder: '无偿 / AA / 收费 XX 元' },
    { key: 'contact', label: '联系方式', maxLength: 60, placeholder: 'QQ: 123456 / Discord: name#1234' },
    {
      key: 'notes',
      label: '其他备注（可选）',
      multiline: true,
      maxLength: 160,
      placeholder: '对 PL 的额外要求 / 警告内容',
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

/** 当前内置模板清单 */
export const POSTER_TEMPLATES: PosterTemplate[] = [SELF_INTRO_TEMPLATE, RECRUIT_TEMPLATE]

export function getTemplateById(id: string): PosterTemplate | undefined {
  return POSTER_TEMPLATES.find((t) => t.id === id)
}