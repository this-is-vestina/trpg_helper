/**
 * 角色卡全局状态（Zustand）
 * - state: 角色列表 / 加载态 / 错误
 * - actions: 异步方法包装 repo + 同步到 hoSlot store（单向）
 *
 * 跨 feature 依赖说明（PROJECT_DESIGN §4 破例）：
 *   character → hoSlot 是允许的单向依赖（character 是源，hoSlot 是派生视图）
 *   hoSlot 不会反向 import character store
 */

import { create } from 'zustand'
import type { Character } from './types'
import { indexedDbCharacterRepo } from './indexedDbRepo'
import { createBlankCharacter, cloneCharacter } from './defaults'
import { downloadJson } from '@/lib/download'
import { useHoSlotStore, type CharacterSnapshot } from '@/features/hoSlot'

function toSnapshot(c: Character): CharacterSnapshot {
  return { id: c.id, info: c.info, tags: c.tags }
}

interface CharacterState {
  characters: Character[]
  isLoading: boolean
  error: string | null

  loadAll: () => Promise<void>
  getById: (id: string) => Character | undefined
  create: () => Promise<Character>
  duplicate: (id: string) => Promise<Character | null>
  update: (id: string, patch: Partial<Character>) => Promise<void>
  remove: (id: string) => Promise<void>
  exportAll: () => Promise<void>
  importAll: (json: string) => Promise<void>
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: [],
  isLoading: false,
  error: null,

  async loadAll() {
    set({ isLoading: true, error: null })
    try {
      const characters = await indexedDbCharacterRepo.list()
      set({ characters, isLoading: false })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), isLoading: false })
    }
  },

  getById(id) {
    return get().characters.find((c) => c.id === id)
  },

  async create() {
    const c = createBlankCharacter()
    await indexedDbCharacterRepo.save(c)
    set((s) => ({ characters: [c, ...s.characters] }))
    return c
  },

  async duplicate(id) {
    const src = get().characters.find((c) => c.id === id)
    if (!src) return null
    const dup = cloneCharacter(src)
    await indexedDbCharacterRepo.save(dup)
    set((s) => ({ characters: [dup, ...s.characters] }))
    // 同步到 hoSlot（duplicate 是新 characterId，自动建 entry）
    await useHoSlotStore.getState().ensureFromCharacter(toSnapshot(dup))
    return dup
  },

  async update(id, patch) {
    const list = get().characters
    const idx = list.findIndex((c) => c.id === id)
    const now = Date.now()
    // upsert 语义：idx === -1 时把 patch 当作完整 Character 插入
    // PROJECT_DESIGN §5.1: save = upsert by id
    const merged: Character =
      idx === -1
        ? {
            ...(patch as Character),
            id,
            createdAt: (patch as Character).createdAt ?? now,
            updatedAt: now,
          }
        : {
            ...list[idx],
            ...patch,
            updatedAt: now,
          }
    await indexedDbCharacterRepo.save(merged)
    set((s) => {
      const next = s.characters.slice()
      if (idx === -1) {
        next.unshift(merged)
      } else {
        next[idx] = merged
      }
      return { characters: next.sort((a, b) => b.updatedAt - a.updatedAt) }
    })
    // 同步到 hoSlot（新建和编辑都走这里）
    await useHoSlotStore.getState().syncFromCharacter(toSnapshot(merged))
  },

  async remove(id) {
    await indexedDbCharacterRepo.delete(id)
    set((s) => ({ characters: s.characters.filter((c) => c.id !== id) }))
    // 按需求：删除角色不删 ho 位 entry（保留为孤儿， UI 显示"该角色已删除"）
  },

  async exportAll() {
    const json = await indexedDbCharacterRepo.exportAll()
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    downloadJson(json, `trpg-helper-characters-${ts}.json`)
  },

  async importAll(json) {
    set({ isLoading: true, error: null })
    try {
      await indexedDbCharacterRepo.importAll(json)
      await get().loadAll()
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), isLoading: false })
      throw e
    }
  },
}))