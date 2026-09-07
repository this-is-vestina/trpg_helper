/**
 * .st 格式双向解析
 * 对应 PROJECT_DESIGN.md §5.4
 * MVP 必做；Phase 2 完整实现
 */

import type { Character } from './types'

export interface StParser {
  /** .st 字符串 → Character（部分字段，未填的保持默认） */
  parse(st: string): Partial<Character>
  /** Character → .st 字符串（只输出有值的字段） */
  serialize(c: Character): string
}

// ===== 占位实现（Phase 1 仅抛错，Phase 2 完整实现）=====

export const defaultStParser: StParser = {
  parse(_st: string) {
    throw new Error('stParser.parse: not implemented (Phase 2)')
  },
  serialize(_c: Character) {
    throw new Error('stParser.serialize: not implemented (Phase 2)')
  },
}
