import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/**
 * 角色卡列表（Phase 1 空状态）
 * Phase 2 接入 IndexedDB repo 后展示真实数据
 */
export function CharacterList() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">角色卡</h1>
          <p className="mt-1 text-sm text-muted">管理你的所有 COC7 调查员。</p>
        </div>
        <Button asChild variant="highlight">
          <Link to="/characters/new">
            <Plus />
            新建角色卡
          </Link>
        </Button>
      </div>

      <EmptyState />
    </div>
  )
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardHeader className="items-center text-center">
        <CardTitle>还没有角色卡</CardTitle>
        <CardDescription>点击右上角"新建角色卡"开始，或在 Phase 2 启用 .st 格式导入。</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-8">
        <Badge variant="warm">Phase 2 启用</Badge>
      </CardContent>
    </Card>
  )
}
