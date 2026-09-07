/**
 * 角色卡数据类型（COC7 调查员）
 * 对应 PROJECT_DESIGN.md §3.1
 * 契约层 — 一旦定稿，UI / 存储 / 解析都基于此结构
 */

// ===== COC7 调查员 =====

/** 9 维核心属性 */
export interface CharacterStats {
  str: number // 力量 STR
  dex: number // 敏捷 DEX
  pow: number // 意志 POW
  con: number // 体质 CON
  app: number // 外貌 APP
  edu: number // 教育 EDU
  siz: number // 体型 SIZ
  int: number // 智力 / 灵感 INT
  luck: number // 幸运 Luck
}

/** 衍生属性（自动计算但可手动覆盖） */
export interface CharacterDerived {
  hp: number // 生命值 HP = (CON+SIZ)/10 取整
  san: number // 理智 SAN = POW（可因剧情减少）
  mp: number // 魔法 MP = POW/5 取整
  mov: number // 移动力 MOV
  build: number // 体格 Build
  /** 伤害加值 DB（"-2" / "0" / "+1D4" 等文字形式） */
  db: string
}

/** 调查员基础信息 */
export interface CharacterInfo {
  name: string // 调查员姓名（必填）
  player: string // 玩家姓名（必填）
  occupation: string // 职业
  occupationNo: number // 职业序号
  age: number
  gender: string // "男" / "女" / "其他"
  residence: string // 住地
  birthplace: string // 故乡
  era: string // 时代
  /** 头像 dataURL（IndexedDB 存储，建议 < 500KB） */
  avatar?: string
  /** 出生模组名（可选，会同步到 Ho 位管理） */
  module?: string
  /** Ho 位（1-4，0 或 undefined 表示未填） */
  hoSlot?: number
}

/** 模组状态（存为 Character.tags 里的字符串，互斥单选） */
export type ModuleStatus =
  | 'satellite' // 卫星中
  | 'ongoing' // 进行中
  | 'paused' // 暂停中
  | 'finished' // 已结团
  | 'disbanded' // 已散桌

export const MODULE_STATUS_VALUES: ModuleStatus[] = [
  'satellite',
  'ongoing',
  'paused',
  'finished',
  'disbanded',
]

export const MODULE_STATUS_LABELS: Record<ModuleStatus, string> = {
  satellite: '卫星中',
  ongoing: '进行中',
  paused: '暂停中',
  finished: '已结团',
  disbanded: '已散桌',
}

/** 单条技能 */
export interface CharacterSkill {
  name: string // 技能名（中文 / 英文别名同存）
  initial: number // 初始值
  growth: number // 成长值
  occupation: number // 本职加点
  interest: number // 兴趣加点
  // total = initial + growth + occupation + interest
}

/** 角色卡（顶层） */
export interface Character {
  id: string
  info: CharacterInfo
  stats: CharacterStats
  derived: CharacterDerived
  /** 只存用户实际分配了值的技能（空技能不存） */
  skills: CharacterSkill[]
  background: string // 背景故事
  inventory: string // 背包物品
  companions: string // 调查员同伴
  notes: string // 其他备注
  tags: string[] // 标签 "PL" / "PC" / "NPC" 等
  createdAt: number
  updatedAt: number
}

// ===== 海报相关类型（也属于 character 域，因为 .st / 导出都涉及）=====

export type PosterType = 'self-intro' | 'recruit' | 'apply'

export interface PosterField {
  key: string
  label: string
  maxLength?: number
  placeholder?: string
  multiline?: boolean
}

export interface PosterArtSpec {
  background: { type: 'color' | 'gradient'; value: string }
  layers: PosterLayer[]
  fonts: { heading: string; body: string; mono: string }
}

export interface PosterLayer {
  type: 'rect' | 'text' | 'image' | 'line' | 'badge'
  x: number
  y: number
  w?: number
  h?: number
  style?: Record<string, string>
  fieldKey?: string
  text?: string
  font?: 'heading' | 'body' | 'mono'
  align?: 'left' | 'center' | 'right'
}

export interface PosterTemplate {
  id: string
  type: PosterType
  name: string
  thumbnail: string
  size: { w: number; h: number }
  fields: PosterField[]
  artSpec: PosterArtSpec
}

export interface PosterDraft {
  id: string
  templateId: string
  values: Record<string, string>
  thumbnail?: string
  updatedAt: number
}

/** 存储版本号（数据迁移用） */
export const STORAGE_VERSION = 1
