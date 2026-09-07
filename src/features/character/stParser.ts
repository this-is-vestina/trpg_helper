/**
 * .st 格式双向解析（Phase 2-C 完整实现）
 * 对应 PROJECT_DESIGN.md §5.4
 *
 * .st 文本格式参考 dice! / TRPG 工具：
 *   ".st 力量50敏捷60意志50体质50外貌50教育50体型50智力50幸运50会计5人类学1侦查45..."
 *   - 以 `.st` 开头（可省略）
 *   - 用空格分隔 token
 *   - 每个 token = 名字 + 整数（末尾是数字，前面是名字）
 *   - 名字支持中 / 英 / 简称（见 aliasMap.ts）
 *
 * 设计：
 *   - parse() 返回 Partial<Character>，调用方用 createBlankCharacter() 做 base 再合并
 *   - sanitize() 缺失字段用默认值兜底（stats 全填 0 / skills 不留空）
 *   - serialize() 只输出 9 维 + 有值的技能
 */

import type { Character, CharacterDerived, CharacterStats } from './types'
import { coc7DerivedCalc } from './derivedCalc'
import { lookupSkillAlias, lookupStatAlias } from './aliasMap'

export interface StParser {
  /** .st 字符串 → Character 部分字段（未填的保持默认） */
  parse(st: string): Partial<Character>
  /** Character → .st 字符串（只输出有值的字段） */
  serialize(c: Character): string
}

interface ParseStats {
  stats: CharacterStats
  derived: CharacterDerived
  skills: { name: string; initial: number; growth: number; occupation: number; interest: number }[]
  // 跟踪哪些衍生字段被显式赋值过，避免自动计算覆盖用户输入
  derivedOverridden: Partial<Record<keyof CharacterDerived, boolean>>
}

/**
 * 把任意 input 拆成 token 序列，宽松匹配：
 *   - 去 `.st` 前缀
 *   - 按空白 split
 *   - 过滤空 token
 */
function tokenize(st: string): string[] {
  return st
    .replace(/^\s*\.st\s*/i, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

/**
 * 把 token 切成 name + value。
 * 取末尾的整数字段（允许负号）。
 * 返回 null 表示这个 token 不符合格式（如纯名字 / 纯数字）。
 */
function splitToken(token: string): { name: string; value: number } | null {
  const m = token.match(/^(.+?)(-?\d+)$/)
  if (!m) return null
  const name = m[1].trim()
  const value = Number(m[2])
  if (!name || Number.isNaN(value)) return null
  return { name, value }
}

export const defaultStParser: StParser = {
  parse(st: string): Partial<Character> {
    const tokens = tokenize(st)
    if (tokens.length === 0) return {}

    const result: ParseStats = {
      stats: {
        str: 0,
        dex: 0,
        pow: 0,
        con: 0,
        app: 0,
        edu: 0,
        siz: 0,
        int: 0,
        luck: 0,
      },
      derived: {
        hp: 0,
        san: 0,
        mp: 0,
        mov: 0,
        build: 0,
        db: '0',
      },
      skills: [],
      derivedOverridden: {},
    }

    for (const token of tokens) {
      const split = splitToken(token)
      if (!split) continue
      const { name, value } = split

      // 1. 试属性 alias
      const statKey = lookupStatAlias(name)
      if (statKey) {
        if (statKey === 'san' || statKey === 'mp' || statKey === 'hp') {
          result.derived[statKey] = value
          result.derivedOverridden[statKey] = true
        } else {
          result.stats[statKey] = value
        }
        continue
      }

      // 2. 试技能 alias
      const skillKey = lookupSkillAlias(name)
      if (skillKey) {
        const existing = result.skills.find((s) => s.name === skillKey)
        if (existing) {
          // 重复出现：累加到 initial（罕见情况，便于容错）
          existing.initial += value
        } else {
          result.skills.push({
            name: skillKey,
            initial: value,
            growth: 0,
            occupation: 0,
            interest: 0,
          })
        }
        continue
      }

      // 未命中：静默忽略（不抛错，方便用户粘贴含杂质的文本）
    }

    // 重算衍生值：
    //   - hp/san/mp：用户给了就用用户的，否则从 stats 自动算
    //   - mov/build/db：永远自动算
    const auto = coc7DerivedCalc.compute(result.stats, { age: 25 })
    const finalDerived: CharacterDerived = {
      hp: result.derivedOverridden.hp ? result.derived.hp : auto.hp,
      san: result.derivedOverridden.san ? result.derived.san : auto.san,
      mp: result.derivedOverridden.mp ? result.derived.mp : auto.mp,
      mov: auto.mov,
      build: auto.build,
      db: auto.db,
    }

    return {
      stats: result.stats,
      derived: finalDerived,
      skills: result.skills,
    }
  },

  serialize(c: Character): string {
    const tokens: string[] = []

    // 9 维核心属性（固定顺序、中文别名）
    const order: Array<[keyof CharacterStats, string]> = [
      ['str', '力量'],
      ['dex', '敏捷'],
      ['pow', '意志'],
      ['con', '体质'],
      ['app', '外貌'],
      ['edu', '教育'],
      ['siz', '体型'],
      ['int', '智力'],
      ['luck', '幸运'],
    ]
    for (const [key, label] of order) {
      const v = c.stats[key]
      if (v !== 0) tokens.push(`${label}${v}`)
    }

    // 技能（按 total = initial + growth + occupation + interest 算）
    for (const s of c.skills) {
      const total = s.initial + s.growth + s.occupation + s.interest
      if (total !== 0) tokens.push(`${s.name}${total}`)
    }

    if (tokens.length === 0) return '.st '
    return '.st ' + tokens.join(' ')
  },
}