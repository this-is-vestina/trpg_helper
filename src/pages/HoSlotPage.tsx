/**
 * Ho 位管理页面（看板风格）
 * - 横向 5 个 lane：Ho 1 / Ho 2 / Ho 3 / Ho 4 / 无 Ho
 * - 每个 lane 下挂 entry 卡片（按 hoSlot 分组）
 * - 单向同步：character 卡改动 → 自动更新 entry；hoSlot 内部改动不反向影响 character
 * - 删除角色卡：entry 保留，UI 显示警告
 */

import { useEffect, useMemo } from 'react'
import { Trash2, ExternalLink, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { useHoSlotStore, HO_SLOT_LANES, HO_SLOT_NONE_LANE, laneLabel } from '@/features/hoSlot'
import { useCharacterStore } from '@/features/character'
import { MODULE_STATUS_LABELS, type ModuleStatus } from '@/features/character/types'
import { cn } from '@/lib/utils'
import type { HoSlotEntry } from '@/features/hoSlot'

export function HoSlotPage() {
  const entries = useHoSlotStore((s) => s.entries)
  const isLoading = useHoSlotStore((s) => s.isLoading)
  const loadAll = useHoSlotStore((s) => s.loadAll)
  const removeEntry = useHoSlotStore((s) => s.removeEntry)

  // 用 characterStore 拿当前所有角色，标记 entry 是否孤儿
  // 注意：selector 必须返回稳定引用；new Set(...) 会每次新建，导致无限重渲染
  const characters = useCharacterStore((s) => s.characters)
  const characterIds = useMemo(
    () => new Set(characters.map((c) => c.id)),
    [characters],
  )
  const loadCharacters = useCharacterStore((s) => s.loadAll)

  useEffect(() => {
    loadCharacters()
    loadAll()
  }, [loadCharacters, loadAll])

  // 按 lane 分组
  const grouped = useMemo(() => {
    const g = new Map<number, HoSlotEntry[]>()
    for (const l of HO_SLOT_LANES) g.set(l, [])
    g.set(HO_SLOT_NONE_LANE, [])
    for (const e of entries) {
      const lane = e.hoSlot >= 1 && e.hoSlot <= 4 ? e.hoSlot : HO_SLOT_NONE_LANE
      g.get(lane)?.push(e)
    }
    // 每组内按状态优先级排：进行中 > 卫星中 > 暂停中 > 已结团 > 已散桌
    const order: Record<ModuleStatus, number> = {
      ongoing: 0,
      satellite: 1,
      paused: 2,
      finished: 3,
      disbanded: 4,
    }
    for (const [, list] of g) {
      list.sort((a, b) => order[a.status] - order[b.status] || a.createdAt - b.createdAt)
    }
    return g
  }, [entries])

  const lanesToShow = [...HO_SLOT_LANES, HO_SLOT_NONE_LANE]

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ho 位管理</h1>
          <p className="mt-1 text-sm text-muted">
            单向同步：角色卡改动会自动更新条目；删除角色卡不影响此处条目。
          </p>
        </div>
        <div className="text-xs text-muted">
          共 {entries.length} 个条目
        </div>
      </header>

      {isLoading && entries.length === 0 ? (
        <p className="text-sm text-muted">加载中…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {lanesToShow.map((lane) => (
            <Lane
              key={lane}
              lane={lane}
              entries={grouped.get(lane) ?? []}
              characterIds={characterIds}
              onRemove={removeEntry}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Lane({
  lane,
  entries,
  characterIds,
  onRemove,
}: {
  lane: number
  entries: HoSlotEntry[]
  characterIds: Set<string>
  onRemove: (id: string) => void
}) {
  const isNone = lane === HO_SLOT_NONE_LANE
  return (
    <Card className={cn(isNone && 'border-dashed')}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted">
            {laneLabel(lane)}
          </CardTitle>
          <Badge variant="outline" className="font-mono">
            {entries.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {entries.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted">暂无条目</p>
        ) : (
          entries.map((e) => (
            <EntryCard
              key={e.id}
              entry={e}
              isOrphan={!characterIds.has(e.characterId)}
              onRemove={() => onRemove(e.id)}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

function EntryCard({
  entry,
  isOrphan,
  onRemove,
}: {
  entry: HoSlotEntry
  isOrphan: boolean
  onRemove: () => void
}) {
  return (
    <div
      className={cn(
        'group rounded-sm border p-2.5 text-xs transition-colors',
        isOrphan
          ? 'border-warning/40 bg-highlight-soft'
          : 'border-line bg-surface hover:border-accent/50',
      )}
    >
      <div className="mb-1.5 flex items-center justify-between gap-1">
        <Badge
          variant="outline"
          className="border-highlight/40 bg-highlight-soft px-1.5 py-0 text-[10px] text-highlight"
        >
          {MODULE_STATUS_LABELS[entry.status]}
        </Badge>
        <button
          type="button"
          onClick={onRemove}
          className="text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
          aria-label="删除条目"
          title="从 Ho 位表删除（不影响角色卡）"
        >
          <Trash2 className="size-3" />
        </button>
      </div>

      <div className="truncate font-semibold text-ink">
        {entry.name || '未命名'}
      </div>
      <div className="mt-0.5 truncate text-muted">{entry.module || '—'}</div>

      {isOrphan && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-highlight">
          <AlertTriangle className="size-3" />
          对应角色卡已删除
        </div>
      )}

      {!isOrphan && (
        <Link
          to={`/characters/${entry.characterId}`}
          className="mt-1.5 flex items-center gap-1 text-[10px] text-accent hover:underline"
        >
          <ExternalLink className="size-3" />
          打开角色卡
        </Link>
      )}

      {entry.note && (
        <div className="mt-1.5 border-t border-line pt-1.5 text-[10px] text-muted">
          {entry.note}
        </div>
      )}
    </div>
  )
}