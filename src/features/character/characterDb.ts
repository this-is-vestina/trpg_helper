/**
 * IndexedDB 初始化（基于 idb 库）
 * - db 名：trpg-helper
 * - store 名：characters（keyPath: 'id'）
 * - 升级策略：v1 直接建表；后续 v2/v3 在 upgrade 回调里分支处理
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Character } from './types'

const DB_NAME = 'trpg-helper'
const DB_VERSION = 1
const STORE_CHARACTERS = 'characters'

interface TrpgHelperDb extends DBSchema {
  characters: {
    key: string
    value: Character
    indexes: { 'by-updatedAt': number }
  }
}

let dbPromise: Promise<IDBPDatabase<TrpgHelperDb>> | null = null

/**
 * 打开数据库（单例模式，避免重复连接）
 * 浏览器关闭后数据保留；用户清缓存会丢
 */
export function getDb(): Promise<IDBPDatabase<TrpgHelperDb>> {
  if (!dbPromise) {
    dbPromise = openDB<TrpgHelperDb>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore(STORE_CHARACTERS, { keyPath: 'id' })
          // 按更新时间倒序用
          store.createIndex('by-updatedAt', 'updatedAt')
        }
        // 未来 v2/v3 在这里加：
        // if (oldVersion < 2) { ... }
      },
      blocked() {
        console.warn('[trpg-helper] IndexedDB blocked by another tab')
      },
      blocking() {
        // 当前 tab 正在阻塞其他 tab，关闭连接
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

export { STORE_CHARACTERS }
