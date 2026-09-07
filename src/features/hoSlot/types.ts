/**
 * Ho 位管理（ho slot board）数据类型
 * Phase 2-B.2.b
 *
 * 设计：单向关联 — character → hoSlot
 *   角色卡 create：自动生成 entry（必须填了模组）
 *   角色卡 update：同步 entry 的 name / module / hoSlot / status
 *   角色卡 remove：不操作 entry（保留为孤儿）
 *   hoSlot 页面内 update：不动 character
 */

import type { ModuleStatus } from '@/features/character/types'

export interface HoSlotEntry {
  id: string
  /** 关联 character.id */
  characterId: string
  /** 同步自 character.info.name */
  name: string
  /** 同步自 character.info.module */
  module: string
  /** 同步自 character.info.hoSlot（0-4，0 = 无Ho） */
  hoSlot: number
  /** 同步自 character.tags 里挑出来的 ModuleStatus */
  status: ModuleStatus
  /** Ho 位管理页面专属备注（不影响 character） */
  note?: string
  createdAt: number
  updatedAt: number
}

/** 单个 Ho 位 lane（可自定义 label） */
export interface HoSlotLane {
  /** lane key：0=无 Ho；1..N 表示 Ho N */
  key: number
  /** 显示名（用户可改） */
  label: string
}

/** 默认 lane 列表：4 个 Ho + 无 Ho */
export const HO_SLOT_DEFAULT_LANES: HoSlotLane[] = [
  { key: 0, label: '无 Ho' },
  { key: 1, label: 'Ho 1' },
  { key: 2, label: 'Ho 2' },
  { key: 3, label: 'Ho 3' },
  { key: 4, label: 'Ho 4' },
]

/** 最多 8 个自定义 Ho lane（不含无 Ho） */
export const HO_SLOT_MAX_KEY = 8

/** 保留旧 API：默认 4 个 Ho 位 lane（向后兼容） */
export const HO_SLOT_LANES = [1, 2, 3, 4] as const
/** 无Ho lane（hoSlot=0 或未填的角色显示在这里） */
export const HO_SLOT_NONE_LANE = 0

/** 默认 lane 命名规则 */
export function defaultLaneLabel(key: number): string {
  return key === HO_SLOT_NONE_LANE ? '无 Ho' : `Ho ${key}`
}

/** 已废弃：用 lanes 自定义 label 替代 */
export function laneLabel(lane: number): string {
  return defaultLaneLabel(lane)
}

export const HO_SLOT_STORAGE_VERSION = 1