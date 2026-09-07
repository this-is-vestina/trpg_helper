import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Home } from '@/pages/Home'
import { CharacterList } from '@/pages/CharacterList'
import { CharacterEdit } from '@/pages/CharacterEdit'
import { PosterStudio } from '@/pages/PosterStudio'

/**
 * 路由表（React Router v7 data router）
 * - `/` 首页
 * - `/characters` 角色卡列表
 * - `/characters/new` 新建角色卡
 * - `/characters/:id` 编辑角色卡
 * - `/posters` 海报工作台
 * - 兜底：未匹配路由跳回首页
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Home /> },
      { path: 'characters', element: <CharacterList /> },
      { path: 'characters/new', element: <CharacterEdit /> },
      { path: 'characters/:id', element: <CharacterEdit /> },
      { path: 'posters', element: <PosterStudio /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
