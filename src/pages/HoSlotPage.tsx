/**
 * Ho 位管理页面（看板风格 + 可编辑）
 *
 * - lane 自定义：可重命名 label / 新增 / 删除（删除时 entries 归到「无 Ho」）
 * - entry 操作：手动添加（无 characterId）/ 状态 tag 点击循环切换
 * - 单向同步：character → entry（character 删除保留 entry 为孤儿，UI 警告）
 * - entry 可点开 inline 编辑 name / module / note（简化版）
 * - 生成 PNG：截图式导出（与显示一致），详见 @/features/hoSlot/poster
 */

import { useEffect, useMemo, useState } from 'react'
import {
  Trash2,
  ExternalLink,
  AlertTriangle,
  Plus,
  Pencil,
  Check,
  X,
  ImageDown,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Link } from 'react-router-dom'
import {
  useHoSlotStore,
  HO_SLOT_MAX_KEY,
  HO_SLOT_NONE_LANE,
  laneColor,
  exportHoBoardAsPng,
  type HoSlotEntry,
  type HoSlotLane,
  type LaneColor,
} from '@/features/hoSlot'
import { useCharacterStore } from '@/features/character'
import { MODULE_STATUS_LABELS, type ModuleStatus } from '@/features/character/types'
import { cn } from '@/lib/utils'

// ============================================================
// 页面组件
// ============================================================

export function HoSlotPage() {
  const lanes = useHoSlotStore((s) => s.lanes)
  const entries = useHoSlotStore((s) => s.entries)
  const isLoading = useHoSlotStore((s) => s.isLoading)
  const loadEntries = useHoSlotStore((s) => s.loadAll)
  const loadLanes = useHoSlotStore((s) => s.loadLanes)
  const addLane = useHoSlotStore((s) => s.addLane)
  const renameLane = useHoSlotStore((s) => s.renameLane)
  const removeLane = useHoSlotStore((s) => s.removeLane)
  const addManualEntry = useHoSlotStore((s) => s.addManualEntry)
  const cycleStatus = useHoSlotStore((s) => s.cycleStatus)
  const updateEntry = useHoSlotStore((s) => s.updateEntry)
  const removeEntry = useHoSlotStore((s) => s.removeEntry)

  const characters = useCharacterStore((s) => s.characters)
  const loadCharacters = useCharacterStore((s) => s.loadAll)

  // 稳定 Set（修复 zustand selector 无限重渲染 bug）
  const characterIds = useMemo(
    () => new Set(characters.map((c) => c.id)),
    [characters],
  )

  useEffect(() => {
    loadCharacters()
    loadEntries()
    loadLanes()
  }, [loadCharacters, loadEntries, loadLanes])

  // 按 lane 分组
  const grouped = useMemo(() => {
    const g = new Map<number, HoSlotEntry[]>()
    for (const l of lanes) g.set(l.key, [])
    for (const e of entries) {
      const lane = lanes.find((l) => l.key === e.hoSlot)?.key ?? HO_SLOT_NONE_LANE
      if (!g.has(lane)) g.set(lane, [])
      g.get(lane)!.push(e)
    }
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
  }, [lanes, entries])

  const canAddLane = lanes.length <= HO_SLOT_MAX_KEY

  // PL 姓名（持久化到 localStorage）
  const [plName, setPlName] = useState(() => {
    try {
      return localStorage.getItem('ho_slot_pl_name') ?? ''
    } catch {
      return ''
    }
  })
  useEffect(() => {
    try {
      if (plName) localStorage.setItem('ho_slot_pl_name', plName)
      else localStorage.removeItem('ho_slot_pl_name')
    } catch {
      /* ignore */
    }
  }, [plName])

  const [isGenerating, setIsGenerating] = useState(false)

  async function handleGeneratePng() {
    setIsGenerating(true)
    try {
      await exportHoBoardAsPng({
        lanes,
        entriesByLane: grouped,
        plName,
      })
    } finally {
      // 给 setTimeout 一点点时间显示状态（避免极快闪烁）
      setTimeout(() => setIsGenerating(false), 200)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Ho 位管理</h1>
            <p className="mt-1 text-sm text-muted">
              单向同步：角色卡改动自动更新条目；删除角色卡不影响条目。点击状态 tag 循环切换。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted">共 {entries.length} 个条目</div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGeneratePng}
              disabled={isGenerating || entries.length === 0}
              title={entries.length === 0 ? '没有条目可生成' : '把 Ho 位看板导出为 PNG'}
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : <ImageDown />}
              生成 PNG
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addLane()}
              disabled={!canAddLane}
              title={canAddLane ? '新增 Ho 位 lane' : `最多 ${HO_SLOT_MAX_KEY} 个 Ho 位`}
            >
              <Plus />
              新增 Ho 位
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-ink">PL:</span>
          <Input
            value={plName}
            onChange={(e) => setPlName(e.target.value)}
            placeholder="你的姓名"
            className="h-7 w-48"
          />
        </div>
      </header>

      {isLoading && entries.length === 0 ? (
        <p className="text-sm text-muted">加载中…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {lanes.map((lane) => (
            <LaneColumn
              key={lane.key}
              lane={lane}
              entries={grouped.get(lane.key) ?? []}
              characterIds={characterIds}
              canDelete={lane.key !== HO_SLOT_NONE_LANE}
              onRename={(label) => renameLane(lane.key, label)}
              onDelete={() => {
                const cnt = grouped.get(lane.key)?.length ?? 0
                const msg =
                  cnt === 0
                    ? `确认删除「${lane.label}」？`
                    : `确认删除「${lane.label}」？该 lane 下的 ${cnt} 个条目会自动归到「无 Ho」。`
                if (confirm(msg)) removeLane(lane.key)
              }}
              onCycleStatus={cycleStatus}
              onUpdateEntry={updateEntry}
              onRemoveEntry={removeEntry}
              onAddEntry={(input) => addManualEntry({ ...input, hoSlot: lane.key })}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface LaneColumnProps {
  lane: HoSlotLane
  entries: HoSlotEntry[]
  characterIds: Set<string>
  canDelete: boolean
  onRename: (label: string) => void | Promise<void>
  onDelete: () => void
  onCycleStatus: (id: string) => void | Promise<void>
  onUpdateEntry: (id: string, patch: Partial<HoSlotEntry>) => void | Promise<void>
  onRemoveEntry: (id: string) => void | Promise<void>
  onAddEntry: (input: { name: string; module: string; status?: ModuleStatus; note?: string }) => void | Promise<unknown>
}

function LaneColumn({
  lane,
  entries,
  characterIds,
  canDelete,
  onRename,
  onDelete,
  onCycleStatus,
  onUpdateEntry,
  onRemoveEntry,
  onAddEntry,
}: LaneColumnProps) {
  const isNone = lane.key === HO_SLOT_NONE_LANE
  const [renaming, setRenaming] = useState(false)
  const [labelDraft, setLabelDraft] = useState(lane.label)
  const [adding, setAdding] = useState(false)

  function commitRename() {
    if (labelDraft.trim() && labelDraft !== lane.label) onRename(labelDraft)
    setRenaming(false)
  }

  const titleColor = laneColor(lane.key)

  return (
    <Card className={cn(isNone && 'border-dashed')}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-1">
          {renaming ? (
            <div className="flex flex-1 items-center gap-1">
              <Input
                autoFocus
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename()
                  if (e.key === 'Escape') {
                    setLabelDraft(lane.label)
                    setRenaming(false)
                  }
                }}
                className="h-7 px-2 text-xs"
              />
              <button
                type="button"
                onClick={commitRename}
                className="text-accent hover:text-accent/80"
                aria-label="确认重命名"
              >
                <Check className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setLabelDraft(lane.label)
                  setRenaming(false)
                }}
                className="text-muted hover:text-ink"
                aria-label="取消"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <CardTitle
              className="flex flex-1 cursor-pointer items-center gap-1 self-start rounded-md px-2 py-1 text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-80"
              style={{ color: titleColor.fg, backgroundColor: titleColor.bg }}
              onClick={() => {
                setLabelDraft(lane.label)
                setRenaming(true)
              }}
              title="点击重命名"
            >
              <span>{lane.label}</span>
              <Pencil className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </CardTitle>
          )}
          <div className="flex items-center gap-1">
            <Badge
              variant="outline"
              className="font-mono"
              style={{ color: titleColor.fg, borderColor: `${titleColor.fg}40` }}
            >
              {entries.length}
            </Badge>
            {canDelete && !renaming && (
              <button
                type="button"
                onClick={onDelete}
                className="text-muted opacity-60 transition-opacity hover:text-danger hover:opacity-100"
                aria-label="删除 lane"
                title="删除 lane（其下条目归到无 Ho）"
              >
                <Trash2 className="size-3" />
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {entries.length === 0 && !adding && (
          <p className="py-6 text-center text-xs text-muted">暂无条目</p>
        )}
        {entries.map((e) => (
          <EntryCard
            key={e.id}
            entry={e}
            isOrphan={!!e.characterId && !characterIds.has(e.characterId)}
            laneColor={titleColor}
            onCycleStatus={() => onCycleStatus(e.id)}
            onUpdate={(patch) => onUpdateEntry(e.id, patch)}
            onRemove={() => onRemoveEntry(e.id)}
          />
        ))}
        {adding ? (
          <AddEntryForm
            onCancel={() => setAdding(false)}
            onSubmit={async (input) => {
              await onAddEntry(input)
              setAdding(false)
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center justify-center gap-1 rounded-sm border border-dashed border-line bg-bg/50 py-1.5 text-xs text-muted transition-colors hover:border-accent/50 hover:text-accent"
          >
            <Plus className="size-3" />
            添加条目
          </button>
        )}
      </CardContent>
    </Card>
  )
}

interface EntryCardProps {
  entry: HoSlotEntry
  isOrphan: boolean
  laneColor: LaneColor
  onCycleStatus: () => void
  onUpdate: (patch: Partial<HoSlotEntry>) => void | Promise<void>
  onRemove: () => void
}

function EntryCard({ entry, isOrphan, laneColor, onCycleStatus, onUpdate, onRemove }: EntryCardProps) {
  const [editing, setEditing] = useState(false)
  const [nameDraft, setNameDraft] = useState(entry.name)
  const [moduleDraft, setModuleDraft] = useState(entry.module)

  function commitEdit() {
    const patch: Partial<HoSlotEntry> = {}
    if (nameDraft.trim() !== entry.name) patch.name = nameDraft.trim()
    if (moduleDraft !== entry.module) patch.module = moduleDraft
    if (Object.keys(patch).length > 0) onUpdate(patch)
    setEditing(false)
  }

  return (
    <div
      className={cn(
        'group rounded-md border-2 p-2.5 text-xs transition-colors bg-surface',
        isOrphan
          ? 'border-warning/60'
          : 'hover:border-accent/60',
      )}
      style={
        isOrphan
          ? undefined
          : { borderColor: laneColor.bg }
      }
    >
      <div className="mb-1.5 flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={onCycleStatus}
          className="cursor-pointer transition-opacity hover:opacity-80"
          title="点击切换状态"
        >
          <Badge
            variant="outline"
            className={cn(
              'rounded-full border-transparent px-2 py-0 text-[10px] font-sans font-medium tracking-wide',
              // 全部走柔和色（low-saturation pastel）
              entry.status === 'ongoing' && 'bg-accent-soft text-accent',
              entry.status === 'satellite' && 'bg-blue-50 text-blue-600',
              entry.status === 'paused' && 'bg-stone-100 text-stone-500',
              entry.status === 'finished' && 'bg-warm-soft text-warm',
              entry.status === 'disbanded' && 'bg-red-50 text-red-500',
            )}
          >
            {MODULE_STATUS_LABELS[entry.status]}
          </Badge>
        </button>
        <div className="flex gap-1">
          {!editing && (
            <button
              type="button"
              onClick={() => {
                setNameDraft(entry.name)
                setModuleDraft(entry.module)
                setEditing(true)
              }}
              className="text-muted opacity-0 transition-opacity hover:text-ink group-hover:opacity-100"
              aria-label="编辑"
              title="编辑"
            >
              <Pencil className="size-3" />
            </button>
          )}
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
      </div>

      {editing ? (
        <div className="flex flex-col gap-1">
          <Input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            placeholder="角色名"
            className="h-6 px-1.5 text-xs"
          />
          <Input
            value={moduleDraft}
            onChange={(e) => setModuleDraft(e.target.value)}
            placeholder="模组名"
            className="h-6 px-1.5 text-xs"
          />
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-sm px-1.5 py-0.5 text-[10px] text-muted hover:text-ink"
            >
              取消
            </button>
            <button
              type="button"
              onClick={commitEdit}
              className="rounded-sm bg-accent px-1.5 py-0.5 text-[10px] text-white hover:bg-accent/80"
            >
              保存
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="truncate font-semibold text-ink">
            {entry.module || '未命名模组'}
          </div>
          <div className="mt-0.5 truncate text-muted">
            角色：{entry.name || '—'}
          </div>
        </>
      )}

      {isOrphan && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-highlight">
          <AlertTriangle className="size-3" />
          对应角色卡已删除
        </div>
      )}

      {!isOrphan && entry.characterId && (
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

interface AddEntryFormProps {
  onCancel: () => void
  onSubmit: (input: { name: string; module: string; status?: ModuleStatus; note?: string }) => void | Promise<unknown>
}

function AddEntryForm({ onCancel, onSubmit }: AddEntryFormProps) {
  const [name, setName] = useState('')
  const [module, setModule] = useState('')

  return (
    <div className="flex flex-col gap-1 rounded-sm border border-accent/40 bg-accent-soft p-2">
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="角色名 *"
        className="h-6 px-1.5 text-xs"
      />
      <Input
        value={module}
        onChange={(e) => setModule(e.target.value)}
        placeholder="模组名"
        className="h-6 px-1.5 text-xs"
      />
      <div className="flex justify-end gap-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-sm px-1.5 py-0.5 text-[10px] text-muted hover:text-ink"
        >
          取消
        </button>
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => onSubmit({ name, module })}
          className="rounded-sm bg-accent px-1.5 py-0.5 text-[10px] text-white hover:bg-accent/80 disabled:opacity-50"
        >
          添加
        </button>
      </div>
    </div>
  )
}