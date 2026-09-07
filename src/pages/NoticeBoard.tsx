/**
 * 公告栏 —— 常用跑团工具 / 资料索引
 *
 * - 静态内容：数据在下方 TOOL_LINKS 常量里，仅代码层可修改（不在应用内编辑）
 * - 风格与整体一致：信纸风 · 极简
 */

import { Bell, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ToolLink {
  name: string
  url: string
}

/** 常用跑团工具网站（按使用频率 / 类别排序） */
const TOOL_LINKS: ToolLink[] = [
  { name: '魔都', url: 'http://cnmods.net/web' },
  { name: '骰声回响', url: 'https://register.dicecho.com' },
  { name: '备团工具', url: 'https://trpgmaster.cn/notes' },
  { name: 'Ho 位整理表', url: 'https://summerpupp.github.io/HOrganizer/' },
  { name: 'Log 整理工具', url: 'https://trpg-log-tool-ruycfyr2scmgnappbmrbovs.streamlit.app/' },
  { name: 'RP 切片工具', url: 'https://3909443360meow-ui.github.io/RPCARD/' },
  { name: 'KP 工具', url: 'https://www.coze.cn/store/agent/7544685881077268499?from=store_search_suggestion' },
  { name: '公骰登记列表', url: 'https://jcnb1taoolhj.feishu.cn/sheets/CcPzsZ9oOhBdcetPdYYcqJ1EnMb' },
  { name: '常见骰子问题解答', url: 'https://jcnb1taoolhj.feishu.cn/docx/KwWDdhqCZoyvDgxNng9cdJYknhd' },
  { name: '常见售后模组评价汇总', url: 'https://kdocs.cn/l/cr1NrXjErEM4' },
  { name: '秘密团 HO 位评价整合', url: 'https://jcnb1taoolhj.feishu.cn/sheets/O3jCs9dbXhuKyYtcCoBcQNeVnnf' },
  { name: '跑团相性问卷调查表', url: 'https://jcnb1taoolhj.feishu.cn/share/base/form/shrcnNDw5dHZTI74a5TUNmYP69g' },
  { name: '万能群资料整理', url: 'https://jcnb1taoolhj.feishu.cn/sheets/CLEpsAREMhm8lStvNyMc35c8n5d' },
]

export function NoticeBoard() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">公告栏</h1>
        <p className="mt-1 text-sm text-muted">
          常用跑团工具与资料索引。内容为静态维护，改动需提交代码。
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="size-4 text-accent" />
            常见跑团工具网站
          </CardTitle>
          <CardDescription>点击在新标签页打开 · 均为第三方站点</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col">
            {TOOL_LINKS.map((tool, i) => (
              <li key={tool.url}>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    'group flex items-center gap-3 border-b border-line py-2.5 text-sm transition-colors',
                    'hover:text-accent',
                    i === TOOL_LINKS.length - 1 && 'border-b-0',
                  )}
                >
                  <span className="w-5 shrink-0 text-right font-mono text-xs tabular-nums text-muted/70">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-medium text-ink group-hover:text-accent">{tool.name}</span>
                  <span className="hidden flex-1 truncate text-xs text-muted/50 sm:block">
                    {hostOf(tool.url)}
                  </span>
                  <ExternalLink className="size-3.5 shrink-0 text-muted/50 transition-colors group-hover:text-accent" />
                </a>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <aside className="flex items-center gap-2 border-l-2 border-accent bg-surface px-4 py-3 text-xs text-muted">
        以上内容如有侵权，或希望添加的内容，请联系作者。
      </aside>
    </div>
  )
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
