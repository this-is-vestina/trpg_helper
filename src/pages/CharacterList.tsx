import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Copy, Trash2, User, FileCode, Upload, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCharacterStore } from '@/features/character'
import { MODULE_STATUS_LABELS, MODULE_STATUS_VALUES, type ModuleStatus } from '@/features/character/types'
import { cn } from '@/lib/utils'

const TAG_VARIANT: Record<string, 'pl' | 'pc' | 'npc' | 'kp' | 'default' | 'warm' | 'outline'> = {
  PL: 'pl',
  PC: 'pc',
  NPC: 'npc',
  KP: 'kp',
}

/** 模块状态 tag 用 token 调色板直接配（Badge variant 不够用） */
const MODULE_STATUS_CLASS: Record<ModuleStatus, string> = {
  satellite: 'border-transparent bg-accent-soft text-accent',
  ongoing: 'border-transparent bg-highlight-soft text-highlight',
  paused: 'border-line bg-bg text-muted',
  finished: 'border-transparent bg-warm-soft text-warm',
  disbanded: 'border-transparent bg-danger/15 text-danger',
}

function isModuleStatus(t: string): t is ModuleStatus {
  return (MODULE_STATUS_VALUES as string[]).includes(t)
}

/**
 * 角色卡列表（接入 Zustand store）
 * - 进入页面自动 loadAll()
 * - 显示：头像 / 名字 / 玩家 / 职业 / 9 维关键值 / 标签 / 更新时间
 * - 操作：编辑（进 edit 页） / 复制（duplicate） / 删除
 */
export function CharacterList() {
  const characters = useCharacterStore((s) => s.characters)
  const isLoading = useCharacterStore((s) => s.isLoading)
  const error = useCharacterStore((s) => s.error)
  const loadAll = useCharacterStore((s) => s.loadAll)
  const duplicate = useCharacterStore((s) => s.duplicate)
  const remove = useCharacterStore((s) => s.remove)
  const exportAll = useCharacterStore((s) => s.exportAll)
  const importAll = useCharacterStore((s) => s.importAll)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importNotice, setImportNotice] = useState<string | null>(null)

  useEffect(() => {
    loadAll()
  }, [loadAll])

  async function handleImportFile(file: File) {
    setImportNotice(null)
    const text = await file.text()
    try {
      await importAll(text)
      setImportNotice(`导入成功，共 ${useCharacterStore.getState().characters.length} 张角色卡`)
    } catch {
      // 错误已由 store.error 显示
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">角色卡</h1>
          <p className="mt-1 text-sm text-muted">
            管理你的所有 COC7 调查员 · 共 {characters.length} 张
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleImportFile(f)
              e.target.value = ''
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Upload />
            导入 JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => exportAll()}
            disabled={characters.length === 0}
          >
            <Download />
            导出 JSON
          </Button>
          <Button asChild variant="outline">
            <Link to="/st-importer">
              <FileCode />
              .st 导入
            </Link>
          </Button>
          <Button asChild variant="highlight">
            <Link to="/characters/new">
              <Plus />
              新建角色卡
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-sm border border-danger bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      {importNotice && (
        <div className="rounded-sm border border-accent bg-accent-soft px-3 py-2 text-sm text-accent">
          {importNotice}
        </div>
      )}

      {isLoading && characters.length === 0 ? (
        <p className="text-sm text-muted">加载中…</p>
      ) : characters.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {characters.map((c) => (
            <CharacterCard
              key={c.id}
              c={c}
              onDuplicate={() => duplicate(c.id)}
              onDelete={() => {
                if (confirm(`确认删除「${c.info.name || '未命名'}」？此操作不可恢复。`)) {
                  remove(c.id)
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardHeader className="items-center text-center">
        <CardTitle>还没有角色卡</CardTitle>
        <CardDescription>
          点击右上角"新建角色卡"开始填写，或用「.st 导入」从 dice! 工具一键迁移。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-8">
        <Badge variant="warm">本地存储 · 数据不上传</Badge>
      </CardContent>
    </Card>
  )
}

function CharacterCard({
  c,
  onDuplicate,
  onDelete,
}: {
  c: import('@/features/character').Character
  onDuplicate: () => void
  onDelete: () => void
}) {
  return (
    <Card className="group transition-colors hover:border-accent/50">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Link
            to={`/characters/${c.id}`}
            className="size-14 shrink-0 overflow-hidden rounded-soft border-2 border-warm bg-bg"
          >
            {c.info.avatar ? (
              <img src={c.info.avatar} alt="" className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-muted">
                <User className="size-6" />
              </div>
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <Link
                to={`/characters/${c.id}`}
                className="block truncate text-base font-semibold text-ink hover:text-accent"
              >
                {c.info.name || '未命名'}
              </Link>
            </div>
            <div className="truncate text-xs text-muted">
              {c.info.player && `PL: ${c.info.player}`}
              {c.info.occupation && ` · ${c.info.occupation}`}
              {c.info.age ? ` · ${c.info.age}岁` : ''}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {c.info.module && (
                <Badge className="border-transparent bg-accent-soft px-1.5 py-0 text-[10px] text-accent">
                  {c.info.module}
                  {c.info.hoSlot ? ` · Ho ${c.info.hoSlot}` : ''}
                </Badge>
              )}
              {c.tags.map((t) => {
                if (isModuleStatus(t)) {
                  return (
                    <Badge
                      key={t}
                      className={cn(
                        'border px-1.5 py-0 text-[10px]',
                        MODULE_STATUS_CLASS[t],
                      )}
                    >
                      {MODULE_STATUS_LABELS[t]}
                    </Badge>
                  )
                }
                return (
                  <Badge
                    key={t}
                    variant={TAG_VARIANT[t] ?? 'outline'}
                    className={cn('px-1.5 py-0 text-[10px]')}
                  >
                    {t}
                  </Badge>
                )
              })}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="flex gap-3 font-mono text-[10px] text-muted">
          <span>HP {c.derived.hp}</span>
          <span>SAN {c.derived.san}</span>
          <span>MP {c.derived.mp}</span>
          <span>MOV {c.derived.mov}</span>
        </div>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button type="button" variant="ghost" size="icon" onClick={onDuplicate} title="复制">
            <Copy />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={onDelete} title="删除">
            <Trash2 className="text-danger" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}