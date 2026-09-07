/**
 * 基础信息 + 头像
 * - 头像：FileReader 读 dataURL（IndexedDB 存字符串）
 * - 9 个基础字段
 */
import { useRef } from 'react'
import { User, Upload, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { CharacterInfo } from '../types'

const MAX_AVATAR_SIZE = 500 * 1024 // 500KB

export function BasicInfoSection({
  info,
  onChange,
}: {
  info: CharacterInfo
  onChange: (next: CharacterInfo) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  function setField<K extends keyof CharacterInfo>(key: K, value: CharacterInfo[K]) {
    onChange({ ...info, [key]: value })
  }

  function handleAvatarFile(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }
    if (file.size > MAX_AVATAR_SIZE) {
      alert(`图片过大（${(file.size / 1024).toFixed(0)}KB > 500KB），请压缩后再上传`)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setField('avatar', String(reader.result))
    }
    reader.readAsDataURL(file)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>基础信息</CardTitle>
        <CardDescription>姓名 / 玩家 / 职业等基础字段。带 * 为必填。</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <AvatarField
          value={info.avatar}
          onClear={() => setField('avatar', undefined)}
          onPick={() => fileRef.current?.click()}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleAvatarFile(f)
            e.target.value = '' // 允许重复上传同一文件
          }}
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="调查员姓名 *" id="name">
            <Input
              id="name"
              value={info.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="如：白井黑子"
            />
          </Field>
          <Field label="玩家姓名 *" id="player">
            <Input
              id="player"
              value={info.player}
              onChange={(e) => setField('player', e.target.value)}
              placeholder="你的昵称"
            />
          </Field>
          <Field label="职业" id="occupation">
            <Input
              id="occupation"
              value={info.occupation}
              onChange={(e) => setField('occupation', e.target.value)}
              placeholder="如：私家侦探"
            />
          </Field>
          <Field label="职业序号" id="occupationNo">
            <Input
              id="occupationNo"
              type="number"
              value={info.occupationNo || ''}
              onChange={(e) => setField('occupationNo', Number(e.target.value) || 0)}
              placeholder="可选"
            />
          </Field>
          <Field label="年龄" id="age">
            <Input
              id="age"
              type="number"
              min={15}
              max={90}
              value={info.age}
              onChange={(e) => setField('age', Number(e.target.value) || 0)}
            />
          </Field>
          <Field label="性别" id="gender">
            <Input
              id="gender"
              value={info.gender}
              onChange={(e) => setField('gender', e.target.value)}
              placeholder="男 / 女 / 其他"
            />
          </Field>
          <Field label="住地" id="residence">
            <Input
              id="residence"
              value={info.residence}
              onChange={(e) => setField('residence', e.target.value)}
              placeholder="如：学园都市"
            />
          </Field>
          <Field label="故乡" id="birthplace">
            <Input
              id="birthplace"
              value={info.birthplace}
              onChange={(e) => setField('birthplace', e.target.value)}
              placeholder="如：东京"
            />
          </Field>
          <Field label="时代" id="era" fullWidth>
            <Input
              id="era"
              value={info.era}
              onChange={(e) => setField('era', e.target.value)}
              placeholder="1920s / 现代 / 未来"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="出生模组" id="module">
            <Input
              id="module"
              value={info.module ?? ''}
              onChange={(e) => setField('module', e.target.value)}
              placeholder="可选，如：克苏鲁的呼唤"
            />
          </Field>
          <Field label="Ho 位" id="hoSlot">
            <Input
              id="hoSlot"
              type="number"
              min={0}
              max={4}
              value={info.hoSlot ?? 0}
              onChange={(e) => setField('hoSlot', Number(e.target.value) || 0)}
              placeholder="0 表示未填"
              className="font-mono"
            />
          </Field>
          <p className="self-end pb-1 text-xs text-muted md:col-span-1">
            填了模组 + Ho 位后，会在「Ho 位管理」页面自动生成一个条目。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function Field({
  label,
  id,
  children,
  fullWidth,
}: {
  label: string
  id: string
  children: React.ReactNode
  fullWidth?: boolean
}) {
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <div className="mt-1">{children}</div>
    </div>
  )
}

function AvatarField({
  value,
  onPick,
  onClear,
}: {
  value?: string
  onPick: () => void
  onClear: () => void
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="size-24 shrink-0 overflow-hidden rounded-soft border-2 border-warm bg-bg">
        {value ? (
          <img src={value} alt="avatar" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-muted">
            <User className="size-8" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onPick}>
            <Upload />
            {value ? '更换头像' : '上传头像'}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={onClear}>
              <X />
              清除
            </Button>
          )}
        </div>
        <p className="text-xs text-muted">建议 &lt; 500KB，将存在浏览器本地（dataURL）。</p>
      </div>
    </div>
  )
}
