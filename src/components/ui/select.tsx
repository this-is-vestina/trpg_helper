/**
 * 原生 Select 组件（不引入 Radix Select，避免复杂度）
 * 用 button + 弹出列表实现轻量下拉。
 *
 * 单一对外组件 SelectPopover：
 *   <SelectPopover value onValueChange>
 *     <SelectItem value="x">文字</SelectItem>
 *     <SelectItem value="y">文字 2</SelectItem>
 *   </SelectPopover>
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SelectPopoverProps {
  value: string
  onValueChange: (v: string) => void
  children: React.ReactNode
  className?: string
  placeholder?: string
}

export interface SelectItemProps {
  value: string
  children: React.ReactNode
}

/** 触发器 + 下拉菜单容器 */
export function SelectPopover({ value, onValueChange, children, className, placeholder }: SelectPopoverProps) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  // 解析 children → 取 SelectItem 的 value/label
  const items: Array<{ value: string; label: string }> = []
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return
    if ((child.type as React.ElementType) === SelectItem) {
      const props = child.props as SelectItemProps
      const label = typeof props.children === 'string' ? props.children : String(props.value)
      items.push({ value: props.value, label })
    }
  })

  const current = items.find((i) => i.value === value)
  const display = current?.label ?? ''

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-sm border border-line bg-surface px-3 py-2 text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
          display ? 'text-ink' : 'text-muted',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{display || placeholder || ''}</span>
        <span aria-hidden className={cn('ml-2 shrink-0 text-muted transition-transform', open && 'rotate-180')}>
          ▾
        </span>
      </button>
      {open && items.length > 0 && (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1 max-h-64 overflow-auto rounded-sm border border-line bg-surface py-1 shadow-lg"
        >
          {items.map((it) => (
            <button
              key={it.value}
              type="button"
              role="option"
              aria-selected={it.value === value}
              onClick={() => {
                onValueChange(it.value)
                setOpen(false)
              }}
              className={cn(
                'block w-full truncate px-3 py-1.5 text-left text-sm hover:bg-accent-soft',
                it.value === value && 'bg-accent-soft text-accent',
              )}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** 选项：放在 SelectPopover 内 */
export function SelectItem(_props: SelectItemProps) {
  // 占位组件，逻辑由 SelectPopover 解析 children 完成
  return null
}