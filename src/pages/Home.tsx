import { Link } from 'react-router-dom'
import { Users, FileCode, ImagePlus, ChevronRight, type LucideIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

/**
 * 首页 —— 项目仪表盘
 * 展示当前阶段进度 + 三个入口
 */
export function Home() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">欢迎回来</h1>
        <p className="mt-1 text-sm text-muted">
          跑团助手 · 数据完全保存在你的浏览器本地，刷新页面不丢、清缓存会丢。
        </p>
      </header>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-ink">阶段进度</h2>
          <Badge variant="default">Phase 1 · 地基</Badge>
        </div>
        <Card>
          <CardContent className="grid grid-cols-1 gap-3 p-6 md:grid-cols-4">
            <PhaseStep n={1} label="Vite + React + Tailwind" done />
            <PhaseStep n={2} label="路由 + 设计 tokens" done />
            <PhaseStep n={3} label="角色卡 CRUD + .st 解析" />
            <PhaseStep n={4} label="海报生成 + 部署" />
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-ink">快速入口</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <QuickCard
            to="/characters"
            icon={Users}
            title="角色卡"
            desc="管理 COC7 调查员，支持 .st 快捷导入导出"
            cta="打开列表"
          />
          <QuickCard
            to="/posters"
            icon={ImagePlus}
            title="海报工作台"
            desc="生成可下载的自介 / 招聘 / 应征图"
            cta="去生成"
          />
          <QuickCard
            to="/characters/new"
            icon={FileCode}
            title="新建角色卡"
            desc="从空白卡开始填写"
            cta="开始填写"
            variant="highlight"
          />
        </div>
      </section>

      <Separator />

      <section className="text-xs text-muted">
        <p>
          详细架构与数据模型见{' '}
          <a
            href="https://github.com/"
            className="text-accent hover:underline"
            rel="noreferrer"
            target="_blank"
          >
            PROJECT_DESIGN.md
          </a>
          。
        </p>
      </section>
    </div>
  )
}

function PhaseStep({ n, label, done }: { n: number; label: string; done?: boolean }) {
  return (
    <div
      className={
        done
          ? 'flex items-center gap-2 rounded-sm border border-accent/30 bg-accent-soft px-3 py-2 text-sm text-ink'
          : 'flex items-center gap-2 rounded-sm border border-line bg-surface px-3 py-2 text-sm text-muted'
      }
    >
      <span
        className={
          done
            ? 'flex size-6 items-center justify-center rounded-sm bg-accent text-xs font-mono text-white'
            : 'flex size-6 items-center justify-center rounded-sm border border-line bg-surface text-xs font-mono'
        }
      >
        {n}
      </span>
      <span className="truncate">{label}</span>
    </div>
  )
}

function QuickCard({
  to,
  icon: Icon,
  title,
  desc,
  cta,
  variant,
}: {
  to: string
  icon: LucideIcon
  title: string
  desc: string
  cta: string
  variant?: 'highlight'
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-accent" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant={variant === 'highlight' ? 'highlight' : 'outline'} size="sm">
          <Link to={to}>
            {cta}
            <ChevronRight />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
