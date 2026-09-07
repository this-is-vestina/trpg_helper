/**
 * uuid 生成（nanoid）
 * 优势：URL 安全、长度可控、纯 JS 无需后端
 */
import { nanoid } from 'nanoid'

export function newId(size = 12): string {
  return nanoid(size)
}
