/**
 * Ho 位 Zustand store
 * - loadAll / getByCharacterId
 * - ensureFromCharacter（角色卡 create 时 → 自动建 entry，要求填了模组）
 * - syncFromCharacter（角色卡 update 时 → 同步 4 个字段，**不删除** 已有 entry）
 * - updateEntry / removeEntry（hoSlot 页面内部操作，不反向影响 character）
 */

import { create } from 'zustand'
import { indexedDbHoSlotRepo } from './indexedDbRepo'
import { newId } from '@/lib/id'
import { MODULE_STATUS_VALUES, type ModuleStatus } from '@/features/character/types'
import type { HoSlotEntry } from './types'

/** character → hoSlot 同步所需的最少字段 */
export interface CharacterSnapshot {
  id: string
  info: { name: string; module?: string; hoSlot?: number }
  tags: string[]
}

function pickStatus(tags: string[]): ModuleStatus {
  return MODULE_STATUS_VALUES.find((s) => tags.includes(s)) ?? 'satellite'
}

interface HoSlotState {
  entries: HoSlotEntry[]
  isLoading: boolean
  error: string | null

  loadAll: () => Promise<void>
  getByCharacterId: (characterId: string) => HoSlotEntry | undefined

  /** 角色卡 create 时调用：有模组才建 entry */
  ensureFromCharacter: (character: CharacterSnapshot) => Promise<void>
  /** 角色卡 update 时调用：同步字段，不删 entry */
  syncFromCharacter: (character: CharacterSnapshot) => Promise<void>

  /** hoSlot 页面内部操作（不影响 character） */
  updateEntry: (id: string, patch: Partial<HoSlotEntry>) => Promise<void>
  removeEntry: (id: string) => Promise<void>
}

export const useHoSlotStore = create<HoSlotState>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,

  async loadAll() {
    set({ isLoading: true, error: null })
    try {
      const entries = await indexedDbHoSlotRepo.list()
      set({ entries, isLoading: false })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), isLoading: false })
    }
  },

  getByCharacterId(characterId) {
    return get().entries.find((e) => e.characterId === characterId)
  },

  async ensureFromCharacter(character) {
    const existing = get().entries.find((e) => e.characterId === character.id)
    if (existing) return get().syncFromCharacter(character)

    // 没填模组就不建 entry（用户没明确表态要进 Ho 位管理）
    const module = character.info.module?.trim() ?? ''
    if (!module) return

    const now = Date.now()
    const entry: HoSlotEntry = {
      id: newId(12),
      characterId: character.id,
      name: character.info.name,
      module,
      hoSlot: character.info.hoSlot ?? 0,
      status: pickStatus(character.tags),
      createdAt: now,
      updatedAt: now,
    }
    await indexedDbHoSlotRepo.save(entry)
    set((s) => ({ entries: [...s.entries, entry] }))
  },

  async syncFromCharacter(character) {
    const idx = get().entries.findIndex((e) => e.characterId === character.id)
    if (idx === -1) return get().ensureFromCharacter(character)

    const existing = get().entries[idx]
    const module = character.info.module?.trim() ?? ''

    const updated: HoSlotEntry = {
      ...existing,
      name: character.info.name,
      module, // 即使清空也同步（保留 entry，让 hoSlot 表不丢条目）
      hoSlot: character.info.hoSlot ?? 0,
      status: pickStatus(character.tags),
      updatedAt: Date.now(),
    }
    await indexedDbHoSlotRepo.save(updated)
    set((s) => {
      const next = s.entries.slice()
      next[idx] = updated
      return { entries: next }
    })
  },

  async updateEntry(id, patch) {
    const idx = get().entries.findIndex((e) => e.id === id)
    if (idx === -1) return
    const updated: HoSlotEntry = {
      ...get().entries[idx],
      ...patch,
      updatedAt: Date.now(),
    }
    await indexedDbHoSlotRepo.save(updated)
    set((s) => {
      const next = s.entries.slice()
      next[idx] = updated
      return { entries: next }
    })
  },

  async removeEntry(id) {
    await indexedDbHoSlotRepo.delete(id)
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }))
  },
}))