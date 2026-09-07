import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCharacterStore } from '@/features/character'
import type { Character, CharacterInfo, CharacterStats } from '@/features/character'
import { coc7DerivedCalc } from '@/features/character/derivedCalc'
import { BasicInfoSection } from '@/features/character/components/BasicInfoSection'
import { StatsSection } from '@/features/character/components/StatsSection'
import { SkillsSection } from '@/features/character/components/SkillsSection'
import { NotesSection } from '@/features/character/components/NotesSection'

/**
 * 角色卡编辑（Phase 2-B 完整版）
 * - /characters/new：新建（无 id，状态为空）
 * - /characters/:id：编辑（从 store 读取）
 * - 顶部：返回 + 标题 + 保存/删除按钮
 * - 内容：4 个 sections（基础信息 / 属性 / 技能 / 标签与文本）
 */
export function CharacterEdit() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isNew = !id

  const loadAll = useCharacterStore((s) => s.loadAll)
  const storeCharacters = useCharacterStore((s) => s.characters)
  const isLoading = useCharacterStore((s) => s.isLoading)
  const createAction = useCharacterStore((s) => s.create)
  const updateAction = useCharacterStore((s) => s.update)
  const removeAction = useCharacterStore((s) => s.remove)

  // 本地表单状态（编辑时存的是现有 character 副本，新建时为空）
  const [form, setForm] = useState<Character | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 首次进入：保证 store 有数据
  useEffect(() => {
    if (storeCharacters.length === 0) {
      loadAll()
    }
  }, [storeCharacters.length, loadAll])

  // 根据 id 从 store 取（或等待加载）
  useEffect(() => {
    if (isNew) {
      // 新建模式：给一个空白卡草稿
      setForm(null) // 显式 null，下方按"草稿"模式渲染
      return
    }
    if (isLoading) return
    const c = storeCharacters.find((x) => x.id === id)
    if (c) {
      setForm(structuredClone(c))
    } else if (storeCharacters.length > 0) {
      // 列表已加载但找不到 id → 跳回列表
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
              // 衍生属性随 stats 实时重算
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

    if (isNew) {
      if (!form) {
        // 第一次点保存：先 create
        setSaving(true)
        try {
          const c = await createAction()
          navigate(`/characters/${c.id}`, { replace: true })
        } catch (e) {
          setError(e instanceof Error ? e.message : String(e))
        } finally {
          setSaving(false)
        }
        return
      }
      // 已有草稿（user 改过字段）→ 用 create 落库后跳转到新 id
      setSaving(true)
      try {
        const c = await createAction()
        await updateAction(c.id, form)
        navigate(`/characters/${c.id}`, { replace: true })
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setSaving(false)
      }
    } else {
      if (!form) return
      setSaving(true)
      try {
        await updateAction(form.id, form)
        navigate('/characters')
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setSaving(false)
      }
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

  if (isLoading && !form && !isNew) {
    return <div className="text-sm text-muted">加载中…</div>
  }

  // 编辑 / 草稿模式都共用 form 的 4 个 sections
  // 新建时 form 为 null，给一个全空默认
  const view: Character =
    form ?? {
      id: 'draft',
      info: {
        name: '',
        player: '',
        occupation: '',
        occupationNo: 0,
        age: 25,
        gender: '',
        residence: '',
        birthplace: '',
        era: '现代',
      },
      stats: {
        str: 50,
        dex: 50,
        pow: 50,
        con: 50,
        app: 50,
        edu: 50,
        siz: 50,
        int: 50,
        luck: 50,
      },
      derived: { hp: 10, san: 50, mp: 10, mov: 8, build: 0, db: '0' },
      skills: [],
      background: '',
      inventory: '',
      companions: '',
      notes: '',
      tags: [],
      createdAt: 0,
      updatedAt: 0,
    }

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
              {isNew ? '新建角色卡' : form?.info.name || '未命名角色卡'}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {isNew
                ? '填写后点保存。修改 9 维属性时衍生值自动重算。'
                : '修改后点保存。'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isNew && form && (
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
        <BasicInfoSection info={view.info} onChange={onInfoChange} />
        <StatsSection stats={view.stats} age={view.info.age} onStatsChange={onStatsChange} />
        <SkillsSection skills={view.skills} onChange={onSkillsChange} />
        <NotesSection
          tags={view.tags}
          background={view.background}
          inventory={view.inventory}
          companions={view.companions}
          notes={view.notes}
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
