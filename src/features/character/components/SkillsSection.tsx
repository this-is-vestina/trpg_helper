/**
 * 技能编辑器（折叠展开 + 列表 + 增删改 + 快速添加候选）
 * - 每行：技能名（可手输）+ initial/growth/occupation/interest + total + 删除
 * - 顶部"添加技能"按钮：弹出候选列表（按类别分组）
 */
import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { CharacterSkill } from '../types'
import { SKILL_LIBRARY, SKILL_CATEGORY_LABELS, groupByCategory } from '../skillLibrary'

export function SkillsSection({
  skills,
  onChange,
}: {
  skills: CharacterSkill[]
  onChange: (next: CharacterSkill[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [filter, setFilter] = useState('')

  const grouped = useMemo(() => groupByCategory(), [])
  const filteredNames = useMemo(() => {
    if (!filter.trim()) return null
    const q = filter.toLowerCase()
    return new Set(
      SKILL_LIBRARY.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.aliases.some((a) => a.toLowerCase().includes(q)) ||
          s.en.toLowerCase().includes(q),
      ).map((s) => s.name),
    )
  }, [filter])

  function add(name: string) {
    if (skills.some((s) => s.name === name)) return
    onChange([
      ...skills,
      { name, initial: 0, growth: 0, occupation: 0, interest: 0 },
    ])
  }

  function remove(idx: number) {
    onChange(skills.filter((_, i) => i !== idx))
  }

  function patch(idx: number, p: Partial<CharacterSkill>) {
    onChange(skills.map((s, i) => (i === idx ? { ...s, ...p } : s)))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="text-muted hover:text-ink"
              aria-label={open ? '折叠' : '展开'}
            >
              {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            </button>
            <CardTitle>技能</CardTitle>
            <Badge variant="outline">{skills.length} 项</Badge>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setPickerOpen(!pickerOpen)
              setFilter('')
            }}
          >
            <Plus />
            添加技能
          </Button>
        </div>
        <CardDescription>
          4 个数字（初始 / 成长 / 本职 / 兴趣）求和 = 技能总值。点击名字可手输自定义技能。
        </CardDescription>
      </CardHeader>

      {open && (
        <CardContent className="flex flex-col gap-3">
          {pickerOpen && (
            <div className="rounded-md border border-line bg-bg p-3">
              <Input
                placeholder="搜索技能（中 / 英 / 别名）"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="mb-3"
              />
              <div className="max-h-72 overflow-y-auto">
                {Object.entries(grouped).map(([cat, entries]) => {
                  const list = filteredNames
                    ? entries.filter((e) => filteredNames.has(e.name))
                    : entries
                  if (list.length === 0) return null
                  return (
                    <div key={cat} className="mb-3">
                      <div className="mb-1.5 text-xs font-semibold text-muted">
                        {SKILL_CATEGORY_LABELS[cat as keyof typeof SKILL_CATEGORY_LABELS]}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {list.map((e) => (
                          <button
                            key={e.name}
                            type="button"
                            onClick={() => add(e.name)}
                            disabled={skills.some((s) => s.name === e.name)}
                            className="rounded-sm border border-line bg-surface px-2 py-1 text-xs hover:border-accent hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {e.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <Separator />

          {skills.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted">暂无技能，点上方"添加技能"。</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="grid grid-cols-12 gap-2 px-1 text-[10px] uppercase text-muted">
                <div className="col-span-4">技能</div>
                <div className="col-span-2 text-center">初始</div>
                <div className="col-span-2 text-center">成长</div>
                <div className="col-span-2 text-center">本职</div>
                <div className="col-span-1 text-center">兴趣</div>
                <div className="col-span-1 text-right">总值</div>
              </div>
              {skills.map((s, idx) => {
                const total = s.initial + s.growth + s.occupation + s.interest
                return (
                  <div
                    key={`${s.name}-${idx}`}
                    className="grid grid-cols-12 items-center gap-2 rounded-sm border border-line bg-bg px-2 py-1.5"
                  >
                    <Input
                      className="col-span-4 h-8 text-sm"
                      value={s.name}
                      onChange={(e) => patch(idx, { name: e.target.value })}
                    />
                    <NumCell value={s.initial} onChange={(v) => patch(idx, { initial: v })} />
                    <NumCell value={s.growth} onChange={(v) => patch(idx, { growth: v })} />
                    <NumCell
                      value={s.occupation}
                      onChange={(v) => patch(idx, { occupation: v })}
                    />
                    <NumCell
                      value={s.interest}
                      onChange={(v) => patch(idx, { interest: v })}
                    />
                    <div className="col-span-1 flex items-center justify-end gap-1">
                      <span className="font-mono text-sm font-semibold text-accent">
                        {total}
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="text-muted hover:text-danger"
                        aria-label="删除"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

function NumCell({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Input
      type="number"
      min={0}
      max={99}
      value={value}
      onChange={(e) => {
        const n = Number(e.target.value)
        onChange(Number.isFinite(n) ? n : 0)
      }}
      className="col-span-2 h-8 text-center font-mono text-sm"
    />
  )
}
