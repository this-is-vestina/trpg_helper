import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/**
 * 海报工作台（Phase 1 空状态）
 * Phase 2 接入：
 * - 模板选择（自介 / 招聘 / 应征）
 * - 字段填写
 * - Canvas 实时预览
 * - PNG 下载
 */
export function PosterStudio() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">海报工作台</h1>
        <p className="mt-1 text-sm text-muted">
          选定模板 → 填写字段 → 预览 → 下载。数据完全本地，不上传任何图片。
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader className="items-center text-center">
          <CardTitle>模板系统准备中</CardTitle>
          <CardDescription>
            Phase 2 接入：1 套自介模板（MVP）→ 招聘 / 应征（v1）→ 模板切换
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-2 pb-8">
          <Badge variant="default">MVP: self-intro</Badge>
          <Badge variant="outline">v1: recruit</Badge>
          <Badge variant="outline">v1: apply</Badge>
        </CardContent>
      </Card>
    </div>
  )
}
