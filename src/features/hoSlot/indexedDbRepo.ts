/**
 * Ho 位 entry + lane 的 IndexedDB 实现
 */

import {
  getDb,
  STORE_HO_SLOTS,
  STORE_HO_SLOT_LANES,
} from '@/features/character/characterDb'
import type { HoSlotEntry, HoSlotLane } from './types'

export const indexedDbHoSlotRepo = {
  // ===== entries =====
  async list(): Promise<HoSlotEntry[]> {
    const db = await getDb()
    return await db.getAll(STORE_HO_SLOTS)
  },

  async get(id: string): Promise<HoSlotEntry | null> {
    const db = await getDb()
    return (await db.get(STORE_HO_SLOTS, id)) ?? null
  },

  /** upsert by id */
  async save(entry: HoSlotEntry): Promise<void> {
    const db = await getDb()
    await db.put(STORE_HO_SLOTS, entry)
  },

  async delete(id: string): Promise<void> {
    const db = await getDb()
    await db.delete(STORE_HO_SLOTS, id)
  },

  // ===== lanes =====
  async listLanes(): Promise<HoSlotLane[]> {
    const db = await getDb()
    return await db.getAll(STORE_HO_SLOT_LANES)
  },

  async saveLane(lane: HoSlotLane): Promise<void> {
    const db = await getDb()
    await db.put(STORE_HO_SLOT_LANES, lane)
  },

  /** 一次性写入多条 lanes（首次初始化用） */
  async saveLanes(lanes: HoSlotLane[]): Promise<void> {
    const db = await getDb()
    const tx = db.transaction(STORE_HO_SLOT_LANES, 'readwrite')
    for (const lane of lanes) {
      await tx.objectStore(STORE_HO_SLOT_LANES).put(lane)
    }
    await tx.done
  },

  async deleteLane(key: number): Promise<void> {
    const db = await getDb()
    await db.delete(STORE_HO_SLOT_LANES, key)
  },
}