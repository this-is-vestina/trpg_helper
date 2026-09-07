/**
 * IndexedDB 初始化（基于 idb 库）
 * - db 名：trpg-helper
 * - store：characters / ho-slots
 * - 升级路径：
 *   v1：建 characters store
 *   v2：建 ho-slots store（Phase 2-B.2.b）
 *   后续 v3+ 在 upgrade 回调里继续分支
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Character } from './types'

const DB_NAME = 'trpg-helper'
const DB_VERSION = 2
const STORE_CHARACTERS = 'characters'
const STORE_HO_SLOTS = 'ho-slots'

interface TrpgHelperDb extends DBSchema {
  characters: {
    key: string
    value: Character
    indexes: { 'by-updatedAt': number }
  }
  'ho-slots': {
    key: string
    value: import('@/features/hoSlot').HoSlotEntry
    indexes: { 'by-characterId': string; 'by-hoSlot': number }
  }
}

let dbPromise: Promise<IDBPDatabase<TrpgHelperDb>> | null = null

export function getDb(): Promise<IDBPDatabase<TrpgHelperDb>> {
  if (!dbPromise) {
    dbPromise = openDB<TrpgHelperDb>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore(STORE_CHARACTERS, { keyPath: 'id' })
          store.createIndex('by-updatedAt', 'updatedAt')
        }
        if (oldVersion < 2) {
          const hoStore = db.createObjectStore(STORE_HO_SLOTS, { keyPath: 'id' })
          hoStore.createIndex('by-characterId', 'characterId', { unique: true })
          hoStore.createIndex('by-hoSlot', 'hoSlot')
        }
      },
      blocked() {
        console.warn('[trpg-helper] IndexedDB blocked by another tab')
      },
      blocking() {
        dbPromise?.then((db) => db.close())
        dbPromise = null
      },
      terminated() {
        dbPromise = null
      },
    })
  }
  return dbPromise
}

export { STORE_CHARACTERS, STORE_HO_SLOTS }