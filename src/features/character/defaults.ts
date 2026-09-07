/**
 * 角色卡默认值与工厂方法
 */

import { newId } from '@/lib/id'
import type { Character, CharacterStats, CharacterDerived } from './types'
import { coc7DerivedCalc } from './derivedCalc'

/** 9 维核心属性默认值（COC7 调查员 1d6+6 之类规则的合理起点） */
export const DEFAULT_STATS: CharacterStats = {
  str: 50,
  dex: 50,
  pow: 50,
  con: 50,
  app: 50,
  edu: 50,
  siz: 50,
  int: 50,
  luck: 50,
}

export const DEFAULT_INFO = {
  name: '',
  player: '',
  occupation: '',
  occupationNo: 0,
  age: 25,
  gender: '',
  residence: '',
  birthplace: '',
  era: '现代',
} as const

/**
 * 创建一个全新的空白角色卡
 * - 衍生属性从核心属性自动计算（用户可手动覆盖）
 * - 时间戳初始化
 */
export function createBlankCharacter(): Character {
  const now = Date.now()
  const stats: CharacterStats = { ...DEFAULT_STATS }
  const derived: CharacterDerived = coc7DerivedCalc.compute(stats, { age: DEFAULT_INFO.age })

  return {
    id: newId(12),
    info: { ...DEFAULT_INFO },
    stats,
    derived,
    skills: [],
    background: '',
    inventory: '',
    companions: '',
    notes: '',
    tags: [],
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * 从现有角色派生副本（新建副本时用）
 * - 新 id、新时间戳
 * - 衍生属性重算
 */
export function cloneCharacter(source: Character): Character {
  const now = Date.now()
  return {
    ...source,
    id: newId(12),
    info: { ...source.info },
    stats: { ...source.stats },
    derived: coc7DerivedCalc.compute(source.stats, { age: source.info.age }),
    skills: source.skills.map((s) => ({ ...s })),
    tags: [...source.tags],
    createdAt: now,
    updatedAt: now,
  }
}
