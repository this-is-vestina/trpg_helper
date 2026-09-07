/**
 * .st 快捷导入页（Phase 2-C）
 * - 粘贴 .st 文本
 * - 解析 → 预览（基础信息 / 9 维属性 / 衍生 / 技能）
 * - 点"导入为新角色卡" → 写入 store + 跳转编辑页
 *
 * 支持的格式：
 *   ".st 力量50敏捷60意志50体质50外貌50教育50体型50智力50幸运50会计5人类学1侦查45..."
 *   也接受省略 .st 前缀的裸文本
 */

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Wand2, Save, RotateCcw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useCharacterStore, createBlankCharacter } from '@/features/character'
import { defaultStParser } from '@/features/character'
import type { Character, CharacterSkill } from '@/features/character'

const SAMPLE_ST = '.st 力量50敏捷60意志50体质50外貌50教育60体型55智力70幸运50会计5侦查45图书馆使用40心理学30说服30闪避30手枪40急救30'

interface PreviewState {
  parsed: Partial<Character> | null
  tokenCount: number
  warning: string | null
}

export function StImporter() {
  const navigate = useNavigate()
  const updateAction = useCharacterStore((s) => s.update)

  const [text, setText] = useState('')
  const [preview, setPreview] = useState<PreviewState>({ parsed: null, tokenCount: 0, warning: null })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function handleParse() {
    const trimmed = text.trim()
    if (!trimmed) {
      setPreview({ parsed: null, tokenCount: 0, warning: '文本为空' })
      return
    }
    try {
      const parsed = defaultStParser.parse(trimmed)
      const tokens = trimmed.replace(/^\s*\.st\s*/i, '').trim().split(/\s+/).filter(Boolean)
      const nonEmpty = !!(parsed.stats || parsed.derived || parsed.skills?.length)
      setPreview({
        parsed,
        tokenCount: tokens.length,
        warning: nonEmpty ? null : '没有解析到任何字段——确认文本以 .st 开头？',
      })
    } catch (e) {
      setPreview({ parsed: null, tokenCount: 0, warning: e instanceof Error ? e.message : String(e) })
    }
  }

  function handleReset() {
    setText('')
    setPreview({ parsed: null, tokenCount: 0, warning: null })
    setSaveError(null)
  }

  async function handleImport() {
    if (!preview.parsed) return
    setSaving(true)
    setSaveError(null)
    try {
      const blank = createBlankCharacter()
      const merged: Character = {
        ...blank,
        stats: preview.parsed.stats ?? blank.stats,
        derived: preview.parsed.derived ?? blank.derived,
        skills: preview.parsed.skills ?? blank.skills,
      }
      await updateAction(merged.id, {
        ...merged,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      navigate(`/characters/${merged.id}`, { replace: true })
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <button type="button" onClick={() => navigate(-1)} aria-label="返回">
            <ArrowLeft />
          </button>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">.st 快捷导入</h1>
          <p className="mt-1 text-sm text-muted">
            从 dice! / TRPG 工具复制 .st 文本粘贴到这里，自动解析为新角色卡。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 左侧：输入 + 解析 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wand2 className="size-4 text-accent" />
              1. 粘贴文本
            </CardTitle>
            <CardDescription>
              以 .st 开头的单行文本。支持中 / 英 / 简称（如：会计 / Accounting / 心理学）。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={SAMPLE_ST}
              rows={6}
              className="font-mono text-xs"
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setText(SAMPLE_ST)}>
                <Sparkles />
                填入示例
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={!text}>
                <RotateCcw />
                清空
              </Button>
              <div className="ml-auto">
                <Button type="button" variant="highlight" onClick={handleParse} disabled={!text.trim()}>
                  <Wand2 />
                  解析
                </Button>
              </div>
            </div>
            {preview.warning && (
              <div className="rounded-sm border border-warning bg-highlight-soft px-3 py-2 text-xs text-highlight">
                {preview.warning}
              </div>
            )}
            {preview.tokenCount > 0 && !preview.warning && (
              <p className="text-xs text-muted">共 {preview.tokenCount} 个 token</p>
            )}
          </CardContent>
        </Card>

        {/* 右侧：预览 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">3. 预览</CardTitle>
            <CardDescription>
              解析后会在此显示字段映射。点"导入为新角色卡"进入编辑页填写其余信息。
            </CardDescription>
          </CardHeader>
          <CardContent>
            {preview.parsed ? (
              <PreviewPanel parsed={preview.parsed} />
            ) : (
              <p className="py-12 text-center text-sm text-muted">先粘贴并解析文本</p>
            )}
          </CardContent>
        </Card>
      </div>

      {saveError && (
        <div className="rounded-sm border border-danger bg-danger/10 px-3 py-2 text-sm text-danger">
          {saveError}
        </div>
      )}

      <Separator />

      <div className="flex items-center justify-end gap-3">
        <Button asChild variant="outline">
          <button type="button" onClick={() => navigate('/characters')}>取消</button>
        </Button>
        <Button type="button" variant="highlight" onClick={handleImport} disabled={!preview.parsed || saving}>
          <Save />
          {saving ? '导入中…' : '导入为新角色卡'}
        </Button>
      </div>
    </div>
  )
}

function PreviewPanel({ parsed }: { parsed: Partial<Character> }) {
  const stats = parsed.stats
  const derived = parsed.derived
  const skills = parsed.skills ?? []

  return (
    <div className="flex flex-col gap-4">
      <Section title="9 维属性">
        {stats ? (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <Stat label="STR 力量" v={stats.str} />
            <Stat label="DEX 敏捷" v={stats.dex} />
            <Stat label="POW 意志" v={stats.pow} />
            <Stat label="CON 体质" v={stats.con} />
            <Stat label="APP 外貌" v={stats.app} />
            <Stat label="EDU 教育" v={stats.edu} />
            <Stat label="SIZ 体型" v={stats.siz} />
            <Stat label="INT 智力" v={stats.int} />
            <Stat label="LUCK 幸运" v={stats.luck} />
          </div>
        ) : (
          <p className="text-xs text-muted">未解析到</p>
        )}
      </Section>

      <Section title="衍生值">
        {derived ? (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <Stat label="HP" v={derived.hp} />
            <Stat label="SAN" v={derived.san} />
            <Stat label="MP" v={derived.mp} />
            <Stat label="MOV" v={derived.mov} />
            <Stat label="Build" v={derived.build} />
            <Stat label="DB" v={derived.db} raw />
          </div>
        ) : (
          <p className="text-xs text-muted">未解析到</p>
        )}
      </Section>

      <Section title={`技能（${skills.length}）`}>
        {skills.length === 0 ? (
          <p className="text-xs text-muted">未解析到</p>
        ) : (
          <ul className="flex flex-col gap-1 text-xs">
            {skills.map((s) => (
              <SkillRow key={s.name} skill={s} />
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{title}</h3>
      {children}
    </div>
  )
}

function Stat({ label, v, raw }: { label: string; v: number | string; raw?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-sm border border-line bg-surface px-2 py-1">
      <span className="text-muted">{label}</span>
      <span className={raw ? 'font-mono' : 'font-mono font-semibold text-ink'}>
        {String(v)}
      </span>
    </div>
  )
}

function SkillRow({ skill }: { skill: CharacterSkill }) {
  const total = useMemo(
    () => skill.initial + skill.growth + skill.occupation + skill.interest,
    [skill],
  )
  return (
    <li className="flex items-center justify-between rounded-sm border border-line bg-surface px-2 py-1">
      <span className="truncate">{skill.name}</span>
      <Badge variant="outline" className="font-mono">
        {total}
      </Badge>
    </li>
  )
}