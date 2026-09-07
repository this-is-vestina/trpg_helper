import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Badge —— 用于角色识别色（PL/PC/NPC/KP）
 * 不同 tag 用不同语义色，跟 PROJECT_DESIGN §6.1 角色识别色对齐
 */
const badgeVariants = cva(
  'inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold font-mono transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-accent-soft text-accent',
        pl: 'border-transparent bg-tag-pl/15 text-tag-pl',
        pc: 'border-transparent bg-tag-pc/15 text-tag-pc',
        npc: 'border-transparent bg-tag-npc/15 text-tag-npc',
        kp: 'border-transparent bg-tag-kp/15 text-tag-kp',
        outline: 'border-line text-ink',
        // 暖驼"暖版"标签
        warm: 'border-transparent bg-warm-soft text-warm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.ComponentProps<'span'>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { badgeVariants }
