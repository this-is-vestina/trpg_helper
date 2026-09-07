/**
 * .st 格式别名映射
 * - STAT_ALIASES: 属性（中/英/简称） → CharacterStats / derived 字段
 * - SKILL_ALIASES: 技能别名 → 标准技能名（来自 SKILL_LIBRARY）
 *
 * 解析 .st 时用 .toLowerCase() 查 key，所以别名表中"键"统一存原始形式
 * 大小写不敏感由 lookup 时 lower 处理。
 */

import type { CharacterStats } from './types'
import { SKILL_LIBRARY } from './skillLibrary'

/** 属性别名：
 *  - 9 维核心属性 → CharacterStats 的 key
 *  - san / mp / hp → 衍生字段（.st 格式里它们独立出现，不从 STR/CON/POW 自动算）
 */
export type StatAliasTarget = keyof CharacterStats | 'san' | 'mp' | 'hp'

export const STAT_ALIASES: Record<string, StatAliasTarget> = {
  // STR
  力量: 'str',
  str: 'str',
  // DEX
  敏捷: 'dex',
  dex: 'dex',
  // POW
  意志: 'pow',
  pow: 'pow',
  // CON
  体质: 'con',
  con: 'con',
  // APP
  外貌: 'app',
  app: 'app',
  // EDU
  教育: 'edu',
  edu: 'edu',
  // SIZ
  体型: 'siz',
  siz: 'siz',
  // INT
  智力: 'int',
  灵感: 'int',
  int: 'int',
  // Luck
  幸运: 'luck',
  运气: 'luck',
  luck: 'luck',
  // SAN（衍生，但 .st 格式里独立填）
  san: 'san',
  san值: 'san',
  理智: 'san',
  理智值: 'san',
  // MP
  mp: 'mp',
  魔法: 'mp',
  魔法值: 'mp',
  // HP
  hp: 'hp',
  体力: 'hp',
  生命: 'hp',
}

/**
 * 技能别名表（从 SKILL_LIBRARY 自动构建）：
 *  - 标准中文名 / aliases[] → 标准名
 *  - 英文名（含空格也接受无空格首字母缩写形式，例如 "Accounting" / "FirearmsHandgun"）
 */
export const SKILL_ALIASES: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const s of SKILL_LIBRARY) {
    map[s.name] = s.name
    for (const a of s.aliases) {
      map[a] = s.name
    }
    // 英文原名（含空格时也能匹配——用户可能打 "Library Use" 或 "LibraryUse"）
    map[s.en] = s.name
    const enSpaceless = s.en.replace(/[()\s]/g, '').toLowerCase()
    if (enSpaceless) map[enSpaceless] = s.name
    // 别名也做去空格版本（防 "Firearms (Handgun)" 这种）
    for (const a of s.aliases) {
      const noSpace = a.replace(/\s+/g, '')
      if (noSpace && !map[noSpace]) map[noSpace] = s.name
    }
  }
  return map
})()

/**
 * 大小写不敏感地查别名表。
 * 返回 null 表示未命中，调用方继续尝试其他查找路径。
 */
export function lookupStatAlias(raw: string): StatAliasTarget | null {
  const key = raw.toLowerCase()
  // 直接 hit
  if (STAT_ALIASES[raw]) return STAT_ALIASES[raw]
  if (STAT_ALIASES[key]) return STAT_ALIASES[key]
  // 去掉空格 / 括号再试
  const cleaned = raw.replace(/[()\s]/g, '')
  if (STAT_ALIASES[cleaned]) return STAT_ALIASES[cleaned]
  if (STAT_ALIASES[cleaned.toLowerCase()]) return STAT_ALIASES[cleaned.toLowerCase()]
  return null
}

export function lookupSkillAlias(raw: string): string | null {
  if (SKILL_ALIASES[raw]) return SKILL_ALIASES[raw]
  const key = raw.toLowerCase()
  if (SKILL_ALIASES[key]) return SKILL_ALIASES[key]
  const noSpace = raw.replace(/[()\s]/g, '')
  if (SKILL_ALIASES[noSpace]) return SKILL_ALIASES[noSpace]
  if (SKILL_ALIASES[noSpace.toLowerCase()]) return SKILL_ALIASES[noSpace.toLowerCase()]
  return null
}