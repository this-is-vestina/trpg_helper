/**
 * Ho 位 Zustand store
 * - lanes: 自定义 lane label（IndexedDB 持久化）
 * - entries: ho slot entry（角色卡同步 + 手动添加）
 *
 * 跨 feature 依赖：
 *   character → hoSlot 单向（character 是源，hoSlot 是派生视图）
 *
 * 设计：
 *   - 首次进入页面如果 lanes 为空，自动写入默认 lanes
 *   - lane 删除时，该 lane 内 entries 自动归到「无 Ho」（hoSlot=0）
 *   - entry 状态点击循环：ongoing → satellite → paused → finished → disbanded → ongoing
 *   - entry 可手动添加（无 characterId 关联）
 */

import { create } from 'zustand'
import { indexedDbHoSlotRepo } from './indexedDbRepo'
import { newId } from '@/lib/id'
import { MODULE_STATUS_VALUES, type ModuleStatus } from '@/features/character/types'
import type { HoSlotEntry, HoSlotLane } from './types'
import { HO_SLOT_DEFAULT_LANES, HO_SLOT_MAX_KEY, HO_SLOT_NONE_LANE } from './types'

/** character → hoSlot 同步所需的最少字段 */
export interface CharacterSnapshot {
  id: string
  info: { name: string; module?: string; hoSlot?: number }
  tags: string[]
}

/** 手动添加 entry 输入 */
export interface ManualEntryInput {
  name: string
  module: string
  hoSlot: number
  status?: ModuleStatus
  note?: string
}

function pickStatus(tags: string[]): ModuleStatus {
  return MODULE_STATUS_VALUES.find((s) => tags.includes(s)) ?? 'satellite'
}

/** 状态循环顺序：进行中 → 卫星中 → 暂停中 → 已结团 → 已散桌 → 进行中 */
const STATUS_CYCLE: ModuleStatus[] = ['ongoing', 'satellite', 'paused', 'finished', 'disbanded']

interface HoSlotState {
  lanes: HoSlotLane[]
  entries: HoSlotEntry[]
  isLoading: boolean
  error: string | null

  // ---- entry 操作 ----
  loadAll: () => Promise<void>
  getByCharacterId: (characterId: string) => HoSlotEntry | undefined

  /** 角色卡 create 时调用：有模组才建 entry */
  ensureFromCharacter: (character: CharacterSnapshot) => Promise<void>
  /** 角色卡 update 时调用：同步字段，不删 entry */
  syncFromCharacter: (character: CharacterSnapshot) => Promise<void>

  /** 手动添加 entry（无 characterId） */
  addManualEntry: (input: ManualEntryInput) => Promise<HoSlotEntry | null>

  /** 状态 tag 点击循环 */
  cycleStatus: (id: string) => Promise<void>

  /** hoSlot 页面内部操作（不影响 character） */
  updateEntry: (id: string, patch: Partial<HoSlotEntry>) => Promise<void>
  removeEntry: (id: string) => Promise<void>

  // ---- lane 操作 ----
  loadLanes: () => Promise<void>
  addLane: () => Promise<HoSlotLane | null>
  renameLane: (key: number, label: string) => Promise<void>
  removeLane: (key: number) => Promise<void>
}

export const useHoSlotStore = create<HoSlotState>((set, get) => ({
  lanes: [],
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
      module,
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

  async addManualEntry(input) {
    const name = input.name.trim()
    if (!name) return null
    const now = Date.now()
    const entry: HoSlotEntry = {
      id: newId(12),
      characterId: '',
      name,
      module: input.module.trim(),
      hoSlot: input.hoSlot,
      status: input.status ?? 'ongoing',
      note: input.note?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    }
    await indexedDbHoSlotRepo.save(entry)
    set((s) => ({ entries: [...s.entries, entry] }))
    return entry
  },

  async cycleStatus(id) {
    const idx = get().entries.findIndex((e) => e.id === id)
    if (idx === -1) return
    const current = get().entries[idx]
    const cur = STATUS_CYCLE.indexOf(current.status)
    const next = STATUS_CYCLE[(cur + 1) % STATUS_CYCLE.length]
    await get().updateEntry(id, { status: next })
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

  // ---- lanes ----

  async loadLanes() {
    try {
      const lanes = await indexedDbHoSlotRepo.listLanes()
      if (lanes.length === 0) {
        await indexedDbHoSlotRepo.saveLanes(HO_SLOT_DEFAULT_LANES)
        set({ lanes: HO_SLOT_DEFAULT_LANES })
        return
      }
      lanes.sort((a, b) => a.key - b.key)
      set({ lanes })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) })
    }
  },

  async addLane() {
    const lanes = get().lanes
    const usedKeys = new Set(lanes.map((l) => l.key))
    let nextKey = 1
    while (usedKeys.has(nextKey) && nextKey <= HO_SLOT_MAX_KEY) nextKey++
    if (nextKey > HO_SLOT_MAX_KEY) return null
    const newLane: HoSlotLane = { key: nextKey, label: `Ho ${nextKey}` }
    await indexedDbHoSlotRepo.saveLane(newLane)
    set((s) => ({ lanes: [...s.lanes, newLane].sort((a, b) => a.key - b.key) }))
    return newLane
  },

  async renameLane(key, label) {
    const trimmed = label.trim()
    if (!trimmed) return
    const lane = get().lanes.find((l) => l.key === key)
    if (!lane) return
    const updated: HoSlotLane = { ...lane, label: trimmed }
    await indexedDbHoSlotRepo.saveLane(updated)
    set((s) => ({
      lanes: s.lanes.map((l) => (l.key === key ? updated : l)),
    }))
  },

  async removeLane(key) {
    if (key === HO_SLOT_NONE_LANE) return
    const lane = get().lanes.find((l) => l.key === key)
    if (!lane) return

    await indexedDbHoSlotRepo.deleteLane(key)
    const movedEntries: HoSlotEntry[] = []
    for (const e of get().entries) {
      if (e.hoSlot === key) {
        const updated: HoSlotEntry = { ...e, hoSlot: HO_SLOT_NONE_LANE, updatedAt: Date.now() }
        await indexedDbHoSlotRepo.save(updated)
        movedEntries.push(updated)
      }
    }
    set((s) => ({
      lanes: s.lanes.filter((l) => l.key !== key),
      entries: s.entries.map((e) => {
        const moved = movedEntries.find((m) => m.id === e.id)
        return moved ?? e
      }),
    }))
  },
}))