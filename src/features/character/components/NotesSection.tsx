/**
 * 标签 + 多行文本（背景 / 背包 / 同伴 / 备注）
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const TAG_OPTIONS = [
  { value: 'PL', label: 'PL', description: '玩家本人', variant: 'pl' as const },
  { value: 'PC', label: 'PC', description: '玩家角色', variant: 'pc' as const },
  { value: 'NPC', label: 'NPC', description: '非玩家角色', variant: 'npc' as const },
  { value: 'KP', label: 'KP', description: '守密人', variant: 'kp' as const },
]

export function NotesSection({
  tags,
  background,
  inventory,
  companions,
  notes,
  onTagsChange,
  onBackgroundChange,
  onInventoryChange,
  onCompanionsChange,
  onNotesChange,
}: {
  tags: string[]
  background: string
  inventory: string
  companions: string
  notes: string
  onTagsChange: (next: string[]) => void
  onBackgroundChange: (v: string) => void
  onInventoryChange: (v: string) => void
  onCompanionsChange: (v: string) => void
  onNotesChange: (v: string) => void
}) {
  function toggleTag(value: string) {
    onTagsChange(tags.includes(value) ? tags.filter((t) => t !== value) : [...tags, value])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>标签 & 文本</CardTitle>
        <CardDescription>多选标签；下方 4 个文本块可写背景故事 / 背包 / 同伴 / 杂项备注。</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div>
          <Label className="text-xs">标签</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {TAG_OPTIONS.map((t) => {
              const active = tags.includes(t.value)
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => toggleTag(t.value)}
                  className={cn(
                    'group flex items-center gap-2 rounded-sm border px-3 py-1.5 text-xs transition-colors',
                    active
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-line bg-surface text-muted hover:border-accent/50 hover:text-ink',
                  )}
                  title={t.description}
                >
                  <Badge variant={t.variant} className="px-1.5 py-0">
                    {t.label}
                  </Badge>
                  <span>{t.description}</span>
                </button>
              )
            })}
          </div>
        </div>

        <TextBlock
          id="background"
          label="背景故事"
          value={background}
          onChange={onBackgroundChange}
          placeholder="调查员的过往、为何卷入模组……"
          rows={5}
        />
        <TextBlock
          id="inventory"
          label="背包 / 装备"
          value={inventory}
          onChange={onInventoryChange}
          placeholder="手电 / 笔记本 / 左轮 / ……"
          rows={3}
        />
        <TextBlock
          id="companions"
          label="调查员同伴"
          value={companions}
          onChange={onCompanionsChange}
          placeholder="NPC / 同行调查员 / 宠物"
          rows={3}
        />
        <TextBlock
          id="notes"
          label="杂项备注"
          value={notes}
          onChange={onNotesChange}
          placeholder="SAN 损失记录 / 重要剧情点 / ……"
          rows={4}
        />
      </CardContent>
    </Card>
  )
}

function TextBlock({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="mt-1.5"
      />
    </div>
  )
}
