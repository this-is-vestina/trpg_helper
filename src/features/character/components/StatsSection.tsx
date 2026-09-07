/**
 * 9 维属性 + 6 个衍生属性
 * 9 维改变 → 自动重算 derived（COC7 公式：HP=(CON+SIZ)/10, SAN=POW, MP=POW/5）
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { StatInput } from './StatInput'
import { coc7DerivedCalc } from '../derivedCalc'
import type { CharacterStats, CharacterDerived } from '../types'

const STAT_LABELS: { key: keyof CharacterStats; label: string }[] = [
  { key: 'str', label: 'STR' },
  { key: 'dex', label: 'DEX' },
  { key: 'pow', label: 'POW' },
  { key: 'con', label: 'CON' },
  { key: 'app', label: 'APP' },
  { key: 'edu', label: 'EDU' },
  { key: 'siz', label: 'SIZ' },
  { key: 'int', label: 'INT' },
  { key: 'luck', label: 'LUCK' },
]

export function StatsSection({
  stats,
  age,
  onStatsChange,
}: {
  stats: CharacterStats
  age: number
  onStatsChange: (next: CharacterStats) => void
}) {
  // 衍生属性随 stats 实时计算
  const derived: CharacterDerived = coc7DerivedCalc.compute(stats, { age })

  return (
    <Card>
      <CardHeader>
        <CardTitle>属性</CardTitle>
        <CardDescription>
          调整 9 维属性，下方衍生值（HP / SAN / MP / MOV / 体格 / 伤害加值）会按 COC7 规则自动重算。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {STAT_LABELS.map(({ key, label }) => (
            <StatInput
              key={key}
              statKey={key}
              label={label}
              value={stats[key]}
              onChange={(v) => onStatsChange({ ...stats, [key]: v })}
            />
          ))}
        </div>

        <Separator />

        <DerivedDisplay derived={derived} />
      </CardContent>
    </Card>
  )
}

function DerivedDisplay({ derived }: { derived: CharacterDerived }) {
  const items: { key: keyof CharacterDerived; label: string; full: string }[] = [
    { key: 'hp', label: 'HP', full: '生命值' },
    { key: 'san', label: 'SAN', full: '理智值' },
    { key: 'mp', label: 'MP', full: '魔法值' },
    { key: 'mov', label: 'MOV', full: '移动力' },
    { key: 'build', label: '体格', full: 'Build' },
    { key: 'db', label: 'DB', full: '伤害加值' },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
      {items.map(({ key, label, full }) => (
        <div
          key={key}
          className="flex items-center justify-between rounded-sm border border-line bg-bg px-3 py-2"
        >
          <div>
            <div className="font-mono text-xs text-muted">{label}</div>
            <div className="text-[10px] text-muted">{full}</div>
          </div>
          <div className="font-mono text-lg font-semibold text-accent">
            {String(derived[key])}
          </div>
        </div>
      ))}
    </div>
  )
}
