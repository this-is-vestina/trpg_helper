/**
 * 衍生属性计算器（COC7 规则）
 * 对应 PROJECT_DESIGN.md §5.5
 * Phase 1 接口占位，Phase 2 完整实现（HP/SAN/MP/MOV/Build/DB 查表）
 */

import type { CharacterStats, CharacterDerived } from './types'

export interface DerivedCalculator {
  compute(stats: CharacterStats, info: { age: number }): CharacterDerived
}

// ===== 占位（Phase 2 实现 COC7 公式 + 查表）=====

export const coc7DerivedCalc: DerivedCalculator = {
  compute(stats, _info) {
    return {
      hp: Math.floor((stats.con + stats.siz) / 10),
      san: stats.pow,
      mp: Math.floor(stats.pow / 5),
      mov: 8, // 占位
      build: 0, // 占位
      db: '0', // 占位
    }
  },
}
