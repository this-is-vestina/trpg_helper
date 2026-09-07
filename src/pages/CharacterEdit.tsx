import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCharacterStore, createBlankCharacter } from '@/features/character'
import type { Character, CharacterInfo, CharacterStats } from '@/features/character'
import { coc7DerivedCalc } from '@/features/character/derivedCalc'
import { BasicInfoSection } from '@/features/character/components/BasicInfoSection'
import { StatsSection } from '@/features/character/components/StatsSection'
import { SkillsSection } from '@/features/character/components/SkillsSection'
import { NotesSection } from '@/features/character/components/NotesSection'

/**
 * 角色卡编辑（Phase 2-B 完整版 + bug fix）
 *
 * 关键修复：新建模式 form 用 createBlankCharacter() 立即初始化
 * 旧版：form 是 null，所有 onChange 是 no-op，用户输入被吞
 *
 * - /characters/new：form 立即为空白草稿，可直接输入
 * - /characters/:id：form 从 store clone，编辑不污染 store
 * - loadedIdRef：避免编辑模式 effect 在用户输入后被 store 引用变化"覆盖"草稿
 */
export function CharacterEdit() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isNew = !id

  const loadAll = useCharacterStore((s) => s.loadAll)
  const storeCharacters = useCharacterStore((s) => s.characters)
  const isLoading = useCharacterStore((s) => s.isLoading)
  const updateAction = useCharacterStore((s) => s.update)
  const removeAction = useCharacterStore((s) => s.remove)

  const [form, setForm] = useState<Character | null>(() =>
    isNew ? createBlankCharacter() : null,
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loadedIdRef = useRef<string | null>(null)

  // 首次进入：保证 store 有数据
  useEffect(() => {
    if (storeCharacters.length === 0 && !isLoading) {
      loadAll()
    }
  }, [storeCharacters.length, isLoading, loadAll])

  // 编辑模式：从 store 加载当前 id 到本地 form（只加载一次）
  useEffect(() => {
    if (isNew) return
    if (isLoading) return
    if (loadedIdRef.current === id) return
    const c = storeCharacters.find((x) => x.id === id)
    if (c) {
      setForm(structuredClone(c))
      loadedIdRef.current = id ?? null
    } else if (storeCharacters.length > 0) {
      setError('找不到该角色卡')
      navigate('/characters', { replace: true })
    }
  }, [id, isNew, isLoading, storeCharacters, navigate])

  const onInfoChange = useCallback(
    (info: CharacterInfo) => setForm((f) => (f ? { ...f, info } : f)),
    [],
  )
  const onStatsChange = useCallback(
    (stats: CharacterStats) =>
      setForm((f) =>
        f
          ? {
              ...f,
              stats,
              derived: coc7DerivedCalc.compute(stats, { age: f.info.age }),
            }
          : f,
      ),
    [],
  )
  const onSkillsChange = useCallback(
    (skills: Character['skills']) => setForm((f) => (f ? { ...f, skills } : f)),
    [],
  )
  const onTagsChange = useCallback(
    (tags: string[]) => setForm((f) => (f ? { ...f, tags } : f)),
    [],
  )
  const onBackgroundChange = useCallback(
    (v: string) => setForm((f) => (f ? { ...f, background: v } : f)),
    [],
  )
  const onInventoryChange = useCallback(
    (v: string) => setForm((f) => (f ? { ...f, inventory: v } : f)),
    [],
  )
  const onCompanionsChange = useCallback(
    (v: string) => setForm((f) => (f ? { ...f, companions: v } : f)),
    [],
  )
  const onNotesChange = useCallback(
    (v: string) => setForm((f) => (f ? { ...f, notes: v } : f)),
    [],
  )

  async function handleSave() {
    if (saving) return
    setError(null)
    if (!form) return

    setSaving(true)
    try {
      if (isNew) {
        // 新建模式：草稿已有 id（createBlankCharacter 生成），直接 upsert
        await updateAction(form.id, {
          ...form,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        navigate(`/characters/${form.id}`, { replace: true })
      } else {
        await updateAction(form.id, form)
        navigate('/characters')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!form || isNew) return
    if (!confirm(`确认删除「${form.info.name || '未命名'}」？此操作不可恢复。`)) return
    setSaving(true)
    try {
      await removeAction(form.id)
      navigate('/characters')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setSaving(false)
    }
  }

  // ---- 渲染 ----

  if (!isNew && !form) {
    if (isLoading) return <div className="text-sm text-muted">加载中…</div>
    return <div className="text-sm text-muted">准备中…</div>
  }
  if (!form) return null

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/characters" aria-label="返回列表">
              <ArrowLeft />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isNew ? '新建角色卡' : form.info.name || '未命名角色卡'}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {isNew
                ? '填写后点保存。修改 9 维属性时衍生值自动重算。'
                : '修改后点保存。'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <Button type="button" variant="outline" onClick={handleDelete} disabled={saving}>
              <Trash2 />
              删除
            </Button>
          )}
          <Button type="button" variant="highlight" onClick={handleSave} disabled={saving}>
            <Save />
            {saving ? '保存中…' : '保存'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-sm border border-danger bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6">
        <BasicInfoSection info={form.info} onChange={onInfoChange} />
        <StatsSection stats={form.stats} age={form.info.age} onStatsChange={onStatsChange} />
        <SkillsSection skills={form.skills} onChange={onSkillsChange} />
        <NotesSection
          tags={form.tags}
          background={form.background}
          inventory={form.inventory}
          companions={form.companions}
          notes={form.notes}
          onTagsChange={onTagsChange}
          onBackgroundChange={onBackgroundChange}
          onInventoryChange={onInventoryChange}
          onCompanionsChange={onCompanionsChange}
          onNotesChange={onNotesChange}
        />
      </div>
    </div>
  )
}