import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * className 合并工具（shadcn 标准）
 * - clsx 处理条件拼接
 * - tailwind-merge 解决同属性工具类冲突（例：`px-2 px-4` → `px-4`）
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
