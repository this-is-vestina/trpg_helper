import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * 角色卡编辑（Phase 1 骨架）
 * - 路由：/characters/new（新建） / /characters/:id（编辑）
 * - Phase 2 接入表单 + derived calc + .st 解析
 */
export function CharacterEdit() {
  const { id } = useParams<{ id?: string }>()
  const isNew = !id

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link to="/characters" aria-label="返回列表">
            <ArrowLeft />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isNew ? '新建角色卡' : `编辑角色卡 #${id}`}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isNew ? '从空白卡开始填写' : '修改已存在的调查员'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基础信息</CardTitle>
          <CardDescription>Phase 2 将接入 9 维核心属性、技能点、自动衍生计算。</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">调查员姓名</Label>
            <Input id="name" placeholder="例如：张三" disabled />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="player">玩家姓名</Label>
            <Input id="player" placeholder="你的昵称" disabled />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="occupation">职业</Label>
            <Input id="occupation" placeholder="例如：私家侦探" disabled />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="age">年龄</Label>
            <Input id="age" type="number" placeholder="25" disabled />
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted">
        详细编辑表单（9 维属性 / 技能折叠展开 / 头像上传 / .st 导入）在 Phase 2 接入。
      </p>
    </div>
  )
}
