/**
 * 角色卡存储抽象（CharacterRepo）
 * 对应 PROJECT_DESIGN.md §5.1
 * MVP 阶段提供接口 + 占位；Phase 2 实现 IndexedDB 版本
 */

import type { Character } from './types'

export interface CharacterRepo {
  list(): Promise<Character[]>
  get(id: string): Promise<Character | null>
  /** upsert by id */
  save(c: Character): Promise<void>
  delete(id: string): Promise<void>
  /** JSON 导出（含所有角色卡 + 头像 base64） */
  exportAll(): Promise<string>
  /** 从 JSON 还原 */
  importAll(json: string): Promise<void>
}

// ===== MVP 占位实现（内存版，仅用于 Phase 1 跑通流程）=====
// 刷新页面会丢，Phase 2 替换为 IndexedDB 版本

const memory = new Map<string, Character>()

export const memoryCharacterRepo: CharacterRepo = {
  async list() {
    return Array.from(memory.values()).sort((a, b) => b.updatedAt - a.updatedAt)
  },
  async get(id) {
    return memory.get(id) ?? null
  },
  async save(c) {
    memory.set(c.id, c)
  },
  async delete(id) {
    memory.delete(id)
  },
  async exportAll() {
    return JSON.stringify({ version: 1, characters: Array.from(memory.values()) }, null, 2)
  },
  async importAll(json) {
    const data = JSON.parse(json) as { version: number; characters: Character[] }
    memory.clear()
    for (const c of data.characters) memory.set(c.id, c)
  },
}
