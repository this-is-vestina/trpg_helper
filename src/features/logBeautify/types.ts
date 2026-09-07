/**
 * 跑团 log 美化模块（占位 — Backlog 预留）
 *
 * 设计目标（未来实施时实现）：
 * 1. 接收跑团产生的纯文本 / 简易结构 log（IM 风格：时间 + 发送者 + 内容）
 * 2. 解析为结构化数据（dialog / action / dice / ooc）
 * 3. 套用模板生成可阅读的 HTML / PDF / 截图
 *
 * MVP 不实现，但接口与目录已预留（PROJECT_DESIGN.md §2 + §4）
 */

/** log 中一条消息 */
export interface LogEntry {
  /** ISO 字符串或时间戳 */
  time: string
  /** 发送者（"KP" / 玩家名 / "OOC"） */
  sender: string
  /** "in-character" / "out-of-character" / "dice" / "action" / "system" */
  kind: 'ic' | 'ooc' | 'dice' | 'action' | 'system'
  /** 原始文本 */
  content: string
}

/** 解析输入（支持多种来源，未来可扩展） */
export type LogInput = string | File | LogEntry[]

/** 解析输出（结构化） */
export interface ParsedLog {
  entries: LogEntry[]
  meta: {
    /** 团名 / 模组名（如果能从 log 中识别） */
    module?: string
    /** KP 识别结果 */
    keeper?: string
    /** 玩家列表 */
    players?: string[]
  }
}

/** 渲染输出（MVP 阶段先用 HTML，v1 再加 PDF / 截图） */
export interface BeautifiedLog {
  format: 'html' | 'pdf' | 'image'
  content: string
  generatedAt: number
}
