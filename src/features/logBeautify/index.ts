/**
 * logBeautify 入口（占位）
 * MVP 阶段所有函数抛 "未实现"，确保上层能 import 不会缺文件
 * v1 起开始接入实现
 */

import type { LogInput, ParsedLog, BeautifiedLog } from './types'

export function parseLog(_input: LogInput): Promise<ParsedLog> {
  return Promise.reject(new Error('logBeautify.parseLog: not implemented (Backlog)'))
}

export function beautify(_parsed: ParsedLog): Promise<BeautifiedLog> {
  return Promise.reject(new Error('logBeautify.beautify: not implemented (Backlog)'))
}

export type { LogEntry, LogInput, ParsedLog, BeautifiedLog } from './types'
