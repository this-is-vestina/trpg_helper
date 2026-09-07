/**
 * 角色卡全局状态（Zustand）
 * - state: 角色列表 / 当前选中 / 加载态
 * - actions: 异步方法包装 repo
 *
 * 设计原则：
 * - store 不持有业务逻辑（仅调用 repo）
 * - UI 通过 selector 订阅，组件粒度细可避免不必要重渲染
 */

import { create } from 'zustand'
import type { Character } from './types'
import { indexedDbCharacterRepo } from './indexedDbRepo'
import { createBlankCharacter, cloneCharacter } from './defaults'
import { downloadJson } from '@/lib/download'

interface CharacterState {
  characters: Character[]
  isLoading: boolean
  error: string | null

  // Actions
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
    return dup
  },

  async update(id, patch) {
    const idx = get().characters.findIndex((c) => c.id === id)
    if (idx === -1) return
    const merged: Character = {
      ...get().characters[idx],
      ...patch,
      updatedAt: Date.now(),
    }
    await indexedDbCharacterRepo.save(merged)
    set((s) => {
      const next = s.characters.slice()
      next[idx] = merged
      return { characters: next.sort((a, b) => b.updatedAt - a.updatedAt) }
    })
  },

  async remove(id) {
    await indexedDbCharacterRepo.delete(id)
    set((s) => ({ characters: s.characters.filter((c) => c.id !== id) }))
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
