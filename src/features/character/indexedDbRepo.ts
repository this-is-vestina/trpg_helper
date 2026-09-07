/**
 * IndexedDB 版 CharacterRepo 实现
 * - 所有操作走 Promise，UI 需 loading 态
 * - list() 按 updatedAt 倒序
 */

import type { Character } from './types'
import { STORAGE_VERSION } from './types'
import type { CharacterRepo } from './repo'
import { getDb, STORE_CHARACTERS } from './characterDb'

export const indexedDbCharacterRepo: CharacterRepo = {
  async list() {
    const db = await getDb()
    const all = await db.getAll(STORE_CHARACTERS)
    return all.sort((a, b) => b.updatedAt - a.updatedAt)
  },

  async get(id) {
    const db = await getDb()
    return (await db.get(STORE_CHARACTERS, id)) ?? null
  },

  async save(c) {
    const db = await getDb()
    await db.put(STORE_CHARACTERS, c)
  },

  async delete(id) {
    const db = await getDb()
    await db.delete(STORE_CHARACTERS, id)
  },

  async exportAll() {
    const characters = await this.list()
    return JSON.stringify(
      { version: STORAGE_VERSION, exportedAt: Date.now(), characters },
      null,
      2,
    )
  },

  async importAll(json) {
    let data: unknown
    try {
      data = JSON.parse(json)
    } catch {
      throw new Error('导入失败：JSON 解析失败，请检查文件格式')
    }
    if (
      typeof data !== 'object' ||
      data === null ||
      !('characters' in data) ||
      !Array.isArray((data as { characters: unknown }).characters)
    ) {
      throw new Error('导入失败：JSON 结构不合法（缺少 characters 数组）')
    }
    const payload = data as { version?: number; characters: Character[] }
    // 版本检查：拒绝来自更新版本的 JSON
    if (
      typeof payload.version === 'number' &&
      payload.version > STORAGE_VERSION
    ) {
      throw new Error(
        `JSON 版本 v${payload.version} 高于当前应用支持版本 v${STORAGE_VERSION}。请升级应用后再导入。`,
      )
    }
    // 未来 v2 升级时加迁移逻辑
    const db = await getDb()
    const tx = db.transaction(STORE_CHARACTERS, 'readwrite')
    await tx.objectStore(STORE_CHARACTERS).clear()
    for (const c of payload.characters) {
      await tx.objectStore(STORE_CHARACTERS).put(c)
    }
    await tx.done
  },
}
