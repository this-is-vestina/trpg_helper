/**
 * 全局类型 — 重新导出 features/* 的契约类型
 * 上层（pages / components）只从这里 import，避免直接深入 features
 */

export type {
  Character,
  CharacterInfo,
  CharacterStats,
  CharacterDerived,
  CharacterSkill,
  PosterTemplate,
  PosterField,
  PosterDraft,
  PosterArtSpec,
  PosterLayer,
  PosterType,
} from '@/features/character/types'

export type { StParser } from '@/features/character/stParser'
export type { CharacterRepo } from '@/features/character/repo'
export type { DerivedCalculator } from '@/features/character/derivedCalc'
export type { PosterRenderer } from '@/features/poster/render'
