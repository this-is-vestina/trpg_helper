/**
 * character feature 统一入口
 * 上层（pages / components / 其他 features）从这导入
 */

export * from './types'
export type { CharacterRepo } from './repo'
export { indexedDbCharacterRepo } from './indexedDbRepo'
export { memoryCharacterRepo } from './repo'
export { useCharacterStore } from './characterStore'
export { createBlankCharacter, cloneCharacter, DEFAULT_STATS, DEFAULT_INFO } from './defaults'
export { coc7DerivedCalc } from './derivedCalc'
export type { DerivedCalculator } from './derivedCalc'
export { defaultStParser } from './stParser'
export type { StParser } from './stParser'
