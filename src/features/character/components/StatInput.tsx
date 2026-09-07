/**
 * 单条 stat 数字输入（含 label + 值）
 * 纯受控组件，无状态
 */
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface StatInputProps {
  /** 字段 key（来自 CharacterStats 的 key） */
  statKey: keyof import('../types').CharacterStats
  label: string
  value: number
  onChange: (v: number) => void
  /** 半宽网格（用于 9 维属性） */
  fullWidth?: boolean
}

const STAT_HINTS: Record<keyof import('../types').CharacterStats, string> = {
  str: '力量（举重、近战伤害）',
  dex: '敏捷（先攻、闪避、远程）',
  pow: '意志（理智、魔法、抵抗力）',
  con: '体质（HP、抗毒）',
  app: '外貌（第一印象、魅惑）',
  edu: '教育（母语外的语言上限）',
  siz: '体型（HP、体格、伤害加值）',
  int: '智力 / 灵感（点 Idea 次数）',
  luck: '幸运（点 Luck 次数）',
}

export function StatInput({ statKey, label, value, onChange, fullWidth }: StatInputProps) {
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <Label htmlFor={`stat-${statKey}`} className="font-mono text-xs uppercase">
        {label}
      </Label>
      <Input
        id={`stat-${statKey}`}
        type="number"
        min={0}
        max={99}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value)
          onChange(Number.isFinite(n) ? n : 0)
        }}
        className="mt-1 font-mono"
        title={STAT_HINTS[statKey]}
      />
    </div>
  )
}
