/**
 * 海报工作台（Phase 2-D MVP）
 * - 选模板（MVP 仅 1 套「调查员自介」）
 * - 绑定角色卡 → 自动取 9 维 + 衍生 + 技能
 * - 手填 slogan / background
 * - Canvas 实时预览（按模板原始 1080×1440 渲染，CSS 缩小）
 * - 下载 PNG（原始分辨率）
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { ImagePlus, Download, RotateCcw, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { SelectPopover, SelectItem } from '@/components/ui/select'
import {
  POSTER_TEMPLATES,
  SELF_INTRO_TEMPLATE,
  renderPoster,
  downloadCanvasAsPng,
} from '@/features/poster'
import { useCharacterStore } from '@/features/character'
import type { Character } from '@/features/character'

export function PosterStudio() {
  const [templateId, setTemplateId] = useState(SELF_INTRO_TEMPLATE.id)
  const [characterId, setCharacterId] = useState<string>('none')
  const [slogan, setSlogan] = useState('')
  const [background, setBackground] = useState('')

  const template = useMemo(
    () => POSTER_TEMPLATES.find((t) => t.id === templateId) ?? SELF_INTRO_TEMPLATE,
    [templateId],
  )
  const characters = useCharacterStore((s) => s.characters)
  const loadCharacters = useCharacterStore((s) => s.loadAll)

  useEffect(() => {
    if (characters.length === 0) loadCharacters()
  }, [characters.length, loadCharacters])

  // 选角色：自动填 slogan/background 占位（用户可改）
  const selectedCharacter: Character | null = useMemo(() => {
    if (characterId === 'none' || !characterId) return null
    return characters.find((c) => c.id === characterId) ?? null
  }, [characterId, characters])

  // 当换角色时，如果 slogan 还没填过，预填占位文字
  const sloganTouchedRef = useRef(false)
  const backgroundTouchedRef = useRef(false)
  useEffect(() => {
    if (!selectedCharacter) {
      setSlogan('')
      setBackground('')
      sloganTouchedRef.current = false
      backgroundTouchedRef.current = false
      return
    }
    if (!sloganTouchedRef.current) {
      const occ = selectedCharacter.info.occupation.trim()
      const tag = occ ? `${occ} · 寻找真相的同行者` : '在深渊的边缘，记录每一缕微光。'
      setSlogan(tag)
    }
    if (!backgroundTouchedRef.current) {
      setBackground(selectedCharacter.background.trim())
    }
  }, [selectedCharacter]) // eslint-disable-line react-hooks/exhaustive-deps

  // Canvas 引用
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 任意 input 变更都重画
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    renderPoster(canvas, {
      template,
      character: selectedCharacter,
      values: { slogan, background },
    })
  }, [template, selectedCharacter, slogan, background])

  function handleReset() {
    setSlogan('')
    setBackground('')
    sloganTouchedRef.current = true
    backgroundTouchedRef.current = true
  }

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return
    const baseName = selectedCharacter?.info.name.trim() || '调查员自介'
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    downloadCanvasAsPng(canvas, `${baseName}-自介-${ts}.png`)
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">海报工作台</h1>
          <p className="mt-1 text-sm text-muted">
            选定模板 → 绑定角色 → 填写 → 预览 → 下载 PNG。
          </p>
        </div>
        <Badge variant="default">MVP · 调查员自介</Badge>
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
                {template.size.w} × {template.size.h} px · PNG 导出按此分辨率
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">2. 绑定角色卡（可选）</CardTitle>
              <CardDescription>
                绑定后自动取名字 / PL / 职业 / 属性 / 技能。
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <SelectPopover value={characterId} onValueChange={setCharacterId} placeholder="选择角色卡…">
                <SelectItem value="none">— 不绑定，纯文字海报 —</SelectItem>
                {characters.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {(c.info.name.trim() || '未命名') + (c.info.module ? ` · ${c.info.module}` : '')}
                  </SelectItem>
                ))}
              </SelectPopover>
              {selectedCharacter && (
                <div className="flex items-center gap-2 rounded-sm border border-line bg-surface px-3 py-2 text-xs">
                  <User className="size-3 text-muted" />
                  <span className="font-medium">{selectedCharacter.info.name}</span>
                  <span className="text-muted">HP {selectedCharacter.derived.hp} · SAN {selectedCharacter.derived.san}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">3. 填写字段</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {template.fields.map((f) => (
                <div key={f.key} className="flex flex-col gap-1.5">
                  <Label htmlFor={`field-${f.key}`}>
                    {f.label}
                    {f.maxLength && (
                      <span className="ml-2 text-xs text-muted">
                        {f.key === 'slogan' ? slogan.length : background.length} / {f.maxLength}
                      </span>
                    )}
                  </Label>
                  {f.multiline ? (
                    <Textarea
                      id={`field-${f.key}`}
                      rows={f.key === 'background' ? 4 : 2}
                      maxLength={f.maxLength}
                      placeholder={f.placeholder}
                      value={f.key === 'slogan' ? slogan : background}
                      onChange={(e) => {
                        if (f.key === 'slogan') {
                          sloganTouchedRef.current = true
                          setSlogan(e.target.value)
                        } else {
                          backgroundTouchedRef.current = true
                          setBackground(e.target.value)
                        }
                      }}
                    />
                  ) : (
                    <Input
                      id={`field-${f.key}`}
                      maxLength={f.maxLength}
                      placeholder={f.placeholder}
                    />
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw />
                清空自定义字段
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
                渲染尺寸 1080 × 1440，CSS 缩放至适合容器宽度。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-sm border border-line bg-surface">
                <div className="relative mx-auto" style={{ aspectRatio: `${template.size.w} / ${template.size.h}` }}>
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
              <button type="button" onClick={handleReset}>重置</button>
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