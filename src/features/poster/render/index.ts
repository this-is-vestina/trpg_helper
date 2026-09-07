/**
 * 海报渲染抽象（PosterRenderer）
 * 对应 PROJECT_DESIGN.md §5.2
 * MVP 实现：Canvas 2D API 自绘
 */

import type { PosterTemplate } from '@/features/character/types'

export interface PosterRenderer {
  /**
   * 渲染海报
   * @param template 模板定义（含 artSpec / size / fields）
   * @param values 字段填充值
   * @returns PNG Blob
   */
  render(template: PosterTemplate, values: Record<string, string>): Promise<Blob>
}

// ===== 占位（Phase 2 实现 Canvas 2D 绘制）=====

export const canvasRenderer: PosterRenderer = {
  async render(_template, _values) {
    throw new Error('canvasRenderer.render: not implemented (Phase 2)')
  },
}
