import { NavLink, Outlet } from 'react-router-dom'
import { Users, ImagePlus, ScrollText, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * AppShell —— 全局布局
 * - 顶部细线 header（莱茵生命风：直角 / 描边 / 极小圆角）
 * - 左侧 64px 侧栏（图标导航）
 * - 主内容区
 */
export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-line bg-surface px-6">
      <div className="flex items-center gap-3">
        <div className="size-7 rounded-sm bg-accent" />
        <div className="leading-tight">
          <div className="text-sm font-semibold text-ink">TRPG Helper</div>
          <div className="text-xs text-muted">跑团助手 · v0.1</div>
        </div>
      </div>
      <div className="text-xs text-muted font-mono">数据完全本地 · IndexedDB</div>
    </header>
  )
}

const navItems = [
  { to: '/', label: '首页', icon: ScrollText, end: true },
  { to: '/characters', label: '角色卡', icon: Users, end: false },
  { to: '/ho-slots', label: 'Ho 位', icon: LayoutGrid, end: false },
  { to: '/posters', label: '海报', icon: ImagePlus, end: false },
]

function Sidebar() {
  return (
    <aside className="flex w-16 flex-col items-stretch border-r border-line bg-surface py-4">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'group flex flex-col items-center gap-1 py-3 text-xs transition-colors',
              isActive
                ? 'bg-accent-soft text-accent'
                : 'text-muted hover:bg-accent-soft hover:text-ink',
            )
          }
        >
          <Icon className="size-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </aside>
  )
}
