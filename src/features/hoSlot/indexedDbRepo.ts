/**
 * Ho 位 entry 的 IndexedDB 实现
 */

import { getDb, STORE_HO_SLOTS } from '@/features/character/characterDb'
import type { HoSlotEntry } from './types'

export const indexedDbHoSlotRepo = {
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
}