#!/usr/bin/env node
/**
 * 构建 GH Pages 产物
 *
 * Windows Git Bash 上 bash 会自动把 `/trpg_helper/` 转成文件绝对路径
 * （变成 `E:/download/.../trpg_helper/`），导致 base path 错误。
 * 这里直接通过 node 调用 vite 的 JS 入口，跳过任何 shell 解析，
 * 并显式注入 env.VITE_BASE。
 *
 * 类型检查在 CI workflow 里跑（npm run typecheck），本地 build 不阻塞。
 */
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const viteBin = join(root, 'node_modules', 'vite', 'bin', 'vite.js')

const env = { ...process.env, VITE_BASE: '/trpg_helper/' }

const build = spawnSync(process.execPath, [viteBin, 'build'], {
  cwd: root,
  stdio: 'inherit',
  env,
  shell: false,
})
process.exit(build.status ?? 0)