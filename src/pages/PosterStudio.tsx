/**
 * 海报工作台（Phase 3-A 通用化）
 * - 支持多模板（自介 / 招募）
 * - 绑定角色卡 → 自介模板自动取 9 维 + 衍生 + 技能
 * - 招募模板纯文本字段
 * - Canvas 实时预览 → 下载 PNG
 * - 配色 / 西文字体 / 中文字体 独立可选
 * - 左下角固定植物图鉴装饰（半透明）
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { ImagePlus, Download, RotateCcw, User, Megaphone, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { SelectPopover, SelectItem } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  POSTER_TEMPLATES,
  SELF_INTRO_TEMPLATE,
  POSTER_PALETTES,
  POSTER_HEADING_FONTS,
  POSTER_CJK_FONTS,
  PLANT_IMAGE_DATA_URL,
  getPaletteById,
  getHeadingFont,
  getCjkFont,
  renderPoster,
  renderRecruitPoster,
  renderApplicationPoster,
  downloadCanvasAsPng,
} from '@/features/poster'
import type { PosterTheme } from '@/features/poster'
import { useCharacterStore } from '@/features/character'
import type { Character } from '@/features/character'

const DEFAULT_MONO_FONT =
  '"JetBrains Mono", "Fira Code", ui-monospace, monospace'

export function PosterStudio() {
  const [templateId, setTemplateId] = useState(SELF_INTRO_TEMPLATE.id)
  const [characterId, setCharacterId] = useState<string>('none')
  const [paletteId, setPaletteId] = useState(POSTER_PALETTES[0].id)
  const [headingFontId, setHeadingFontId] = useState(POSTER_HEADING_FONTS[0].id)
  const [bodyFontId, setBodyFontId] = useState(POSTER_CJK_FONTS[0].id)
  // 通用字段值：key → 字符串
  const [values, setValues] = useState<Record<string, string>>({})

  const template = useMemo(
    () => POSTER_TEMPLATES.find((t) => t.id === templateId) ?? SELF_INTRO_TEMPLATE,
    [templateId],
  )
  const characters = useCharacterStore((s) => s.characters)
  const loadCharacters = useCharacterStore((s) => s.loadAll)

  useEffect(() => {
    if (characters.length === 0) loadCharacters()
  }, [characters.length, loadCharacters])

  const selectedCharacter: Character | null = useMemo(() => {
    if (characterId === 'none' || !characterId) return null
    return characters.find((c) => c.id === characterId) ?? null
  }, [characterId, characters])

  // 换模板时清空 values，避免遗留字段
  const prevTemplateIdRef = useRef(templateId)
  useEffect(() => {
    if (prevTemplateIdRef.current !== templateId) {
      setValues({})
      prevTemplateIdRef.current = templateId
    }
  }, [templateId])

  // 自介模板：选角色时，预填 slogan/background 占位
  const sloganTouchedRef = useRef(false)
  const backgroundTouchedRef = useRef(false)
  useEffect(() => {
    if (template.type !== 'self-intro') return
    if (!selectedCharacter) {
      setValues((v) => ({ ...v, slogan: '', background: '' }))
      sloganTouchedRef.current = false
      backgroundTouchedRef.current = false
      return
    }
    setValues((v) => {
      const next = { ...v }
      if (!sloganTouchedRef.current) {
        const occ = selectedCharacter.info.occupation.trim()
        next.slogan = occ
          ? `${occ} · 寻找真相的同行者`
          : '在深渊的边缘，记录每一缕微光。'
      }
      if (!backgroundTouchedRef.current) {
        next.background = selectedCharacter.background.trim()
      }
      return next
    })
  }, [selectedCharacter, template.type])

  // 加载植物图鉴（data URL → HTMLImageElement）
  const [plantImage, setPlantImage] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    const img = new Image()
    img.onload = () => setPlantImage(img)
    img.onerror = () => setPlantImage(null)
    img.src = PLANT_IMAGE_DATA_URL
  }, [])

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 任意 input 变更都重画
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const theme: PosterTheme = {
      palette: getPaletteById(paletteId),
      headingFont: getHeadingFont(headingFontId).value,
      bodyFont: getCjkFont(bodyFontId).value,
      monoFont: DEFAULT_MONO_FONT,
    }
    if (template.type === 'self-intro') {
      renderPoster(canvas, {
        template,
        character: selectedCharacter,
        values: { slogan: values.slogan ?? '', background: values.background ?? '' },
        theme,
        plantImage,
      })
    } else if (template.type === 'recruit') {
      renderRecruitPoster(canvas, { template, values, theme, plantImage })
    } else if (template.type === 'apply') {
      renderApplicationPoster(canvas, { template, values, theme, plantImage })
    }
  }, [
    template,
    selectedCharacter,
    values,
    paletteId,
    headingFontId,
    bodyFontId,
    plantImage,
  ])

  function setField(key: string, v: string) {
    if (key === 'slogan') sloganTouchedRef.current = true
    if (key === 'background') backgroundTouchedRef.current = true
    setValues((prev) => ({ ...prev, [key]: v }))
  }

  function handleReset() {
    setValues({})
    sloganTouchedRef.current = true
    backgroundTouchedRef.current = true
  }

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    let baseName: string
    if (template.type === 'self-intro') {
      baseName = selectedCharacter?.info.name.trim() || '角色卡'
    } else if (template.type === 'recruit') {
      baseName = `${values.moduleType?.slice(0, 16) || '模组'}-招募`
    } else {
      baseName = `${values.name?.trim().slice(0, 16) || '角色'}-应征`
    }
    downloadCanvasAsPng(canvas, `${baseName}-${ts}.png`)
  }

  const showCharacterBinding = template.type === 'self-intro'
  const applyFormLabel =
    showCharacterBinding ? '3. 填写字段' : template.type === 'recruit' ? '2. 填写招募信息' : '2. 填写应征信息'

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">海报工作台</h1>
          <p className="mt-1 text-sm text-muted">
            选定模板 → 绑定角色（自介模板）→ 填写 → 预览 → 下载 PNG。
          </p>
        </div>
        <Badge variant={template.type === 'self-intro' ? 'default' : 'pl'}>
          {template.type === 'self-intro'
            ? '角色卡'
            : template.type === 'recruit'
              ? '模组招募'
              : '应征申请'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
        {/* 左侧：表单 */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">1. 选模板</CardTitle>
            </CardHeader>
            <CardContent>
              <SelectPopover value={templateId} onValueChange={setTemplateId}>
                {POSTER_TEMPLATES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectPopover>
              <p className="mt-2 text-xs text-muted">
                信纸风格 · 高度自适应内容
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">选配色</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {POSTER_PALETTES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaletteId(p.id)}
                    className={cn(
                      'group flex items-center gap-2 rounded-sm border p-2 text-left transition-colors',
                      paletteId === p.id
                        ? 'border-accent bg-accent-soft'
                        : 'border-line bg-surface hover:border-accent/50',
                    )}
                  >
                    <div className="flex shrink-0">
                      <div
                        className="size-5 rounded-l-sm border border-line"
                        style={{ background: p.bgTop }}
                      />
                      <div
                        className="size-5 border border-line"
                        style={{ background: p.bgBot }}
                      />
                      <div
                        className="size-5 border border-line"
                        style={{ background: p.ink }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium">{p.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">选字体</CardTitle>
              <CardDescription>西文 / 中文分开选择</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted">西文字体（标题 / 数字）</Label>
                <SelectPopover value={headingFontId} onValueChange={setHeadingFontId}>
                  {POSTER_HEADING_FONTS.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      <span style={{ fontFamily: f.value }}>{f.name}</span>
                    </SelectItem>
                  ))}
                </SelectPopover>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted">中文字体（正文）</Label>
                <SelectPopover value={bodyFontId} onValueChange={setBodyFontId}>
                  {POSTER_CJK_FONTS.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      <span style={{ fontFamily: f.value }}>{f.name}</span>
                    </SelectItem>
                  ))}
                </SelectPopover>
              </div>
            </CardContent>
          </Card>

          {showCharacterBinding && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">2. 绑定角色卡（可选）</CardTitle>
                <CardDescription>
                  绑定后自动取名字 / PL / 职业 / 属性 / 技能。
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <SelectPopover
                  value={characterId}
                  onValueChange={setCharacterId}
                  placeholder="选择角色卡…"
                >
                  <SelectItem value="none">— 不绑定，纯文字海报 —</SelectItem>
                  {characters.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {(c.info.name.trim() || '未命名') +
                        (c.info.module ? ` · ${c.info.module}` : '')}
                    </SelectItem>
                  ))}
                </SelectPopover>
                {selectedCharacter && (
                  <div className="flex items-center gap-2 rounded-sm border border-line bg-surface px-3 py-2 text-xs">
                    <User className="size-3 text-muted" />
                    <span className="font-medium">{selectedCharacter.info.name}</span>
                    <span className="text-muted">
                      HP {selectedCharacter.derived.hp} · SAN {selectedCharacter.derived.san}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {showCharacterBinding ? (
                  applyFormLabel
                ) : template.type === 'recruit' ? (
                  <>
                    <Megaphone className="size-4 text-accent" />
                    {applyFormLabel}
                  </>
                ) : (
                  <>
                    <Send className="size-4 text-accent" />
                    {applyFormLabel}
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {template.fields.map((f) => {
                const current = values[f.key] ?? ''
                return (
                  <div key={f.key} className="flex flex-col gap-1.5">
                    <Label htmlFor={`field-${f.key}`}>{f.label}</Label>
                    {f.multiline ? (
                      <Textarea
                        id={`field-${f.key}`}
                        rows={f.key === 'summary' || f.key === 'background' ? 4 : 2}
                        placeholder={f.placeholder}
                        value={current}
                        onChange={(e) => setField(f.key, e.target.value)}
                      />
                    ) : (
                      <Input
                        id={`field-${f.key}`}
                        placeholder={f.placeholder}
                        value={current}
                        onChange={(e) => setField(f.key, e.target.value)}
                      />
                    )}
                  </div>
                )
              })}
              <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw />
                清空字段
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：预览 */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImagePlus className="size-4 text-accent" />
                预览
              </CardTitle>
              <CardDescription>
                渲染尺寸 1080 宽，高度自适应内容。CSS 缩放至适合容器宽度。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-sm border border-line bg-surface">
                <div className="relative mx-auto w-full">
                  <canvas
                    ref={canvasRef}
                    className="block size-full"
                    style={{ imageRendering: 'auto' }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex items-center justify-end gap-3">
            <Button asChild variant="outline">
              <button type="button" onClick={handleReset}>
                重置
              </button>
            </Button>
            <Button type="button" variant="highlight" onClick={handleDownload}>
              <Download />
              下载 PNG
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}