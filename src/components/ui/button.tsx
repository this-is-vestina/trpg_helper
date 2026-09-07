import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // 基础：居中、过渡、禁用态、focus 环
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: 'bg-accent text-white hover:bg-accent/90',
        destructive: 'bg-danger text-white hover:bg-danger/90',
        outline:
          'border border-line bg-transparent text-ink hover:bg-accent-soft hover:border-accent/50',
        secondary: 'bg-surface text-ink hover:bg-accent-soft',
        ghost: 'text-ink hover:bg-accent-soft',
        link: 'text-accent underline-offset-4 hover:underline',
        // 莱茵生命 "主操作" 变体 — 橙色高亮
        highlight: 'bg-highlight text-white hover:bg-highlight/90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-sm px-3 text-xs',
        lg: 'h-12 rounded-md px-6 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { buttonVariants }
