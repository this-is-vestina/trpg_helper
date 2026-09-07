# TRPG Helper

面向 COC 跑团玩家的本地优先 Web 工具：管理 COC7 角色卡、Ho 位看板、生成可下载的角色海报。数据全部保存在浏览器本地（IndexedDB），无后端、无账号。

线上地址：[https://this-is-vestina.github.io/trpg_helper/](https://this-is-vestina.github.io/trpg_helper/)

## 功能

- **角色卡管理** — COC7 完整字段（9 维属性 / 衍生属性 / 技能 / 背景 / 随身物 / 同伴）
- **`.st` 快捷导入** — 粘文本自动解析生成角色卡
- **Ho 位管理** — 分 lane 看板管理"进行中 / 卫星中 / 暂停 / 已结团"等模组状态，支持导出与 PNG 生成
- **海报工作台** — 信纸风格海报，支持多模板（角色卡 / 模组招募 / 应征申请 / 互换表）、主题配色与字体可选、Canvas 渲染、下载 PNG
- **本地优先** — IndexedDB 持久化，数据不出浏览器；JSON 导入 / 导出

## 技术栈

| 层 | 选型 |
|---|---|
| 运行时 | Node.js ≥ 24 |
| 框架 | React 19 · TypeScript 5.7 |
| 构建 | Vite 8（Rolldown + Oxc）· @vitejs/plugin-react 6 |
| 样式 | Tailwind CSS 4（CSS-first `@theme`）· shadcn/ui |
| 路由 | React Router v7 |
| 状态 / 存储 | Zustand 5 · IndexedDB（idb） |
| 海报渲染 | Canvas 2D API |
| 部署 | GitHub Pages（push main 自动构建） |

## 快速开始

```bash
# 前置：Node.js ≥ 24
nvm use 24        # nvm-windows 1.2.x 需显式指定版本

npm install
npm run dev
```

开发服务器默认运行在 `http://localhost:5173`。

## 常用命令

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动开发服务器（热更新） |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run build` | 生产构建（`tsc -b` + `vite build`，输出到 `dist/`） |
| `npm run preview` | 本地预览生产构建 |
| `npm run build:ghpages` | 以 base `/trpg_helper/` 生产构建（用于 GitHub Pages） |

## 部署

推送到 `main` 分支触发 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)：

1. `npm ci` + typecheck + `npm run build`（`VITE_BASE=/trpg_helper/`）
2. `peaceiris/actions-gh-pages@v4` 把 `dist/` 推送到 `gh-pages` 分支
3. 仓库 Settings → Pages 需配置 Source = `gh-pages` / `(root)`

**要点**：public 资源引用必须用 `import.meta.env.BASE_URL` 拼接（如 `/trpg_helper/plant.png`），不可写死绝对路径，否则在子路径部署下 404。构建 base path 由 `VITE_BASE` 控制，Windows Git Bash 下请走 `build:ghpages` 脚本而非直接 `vite build`。

## 项目结构

```
src/
├── pages/          # 路由页面（薄壳）
│   ├── CharacterList / CharacterEdit   # 角色卡
│   ├── StImporter                      # .st 快捷导入
│   ├── HoSlotPage                      # Ho 位看板
│   └── PosterStudio                    # 海报工作台
├── features/
│   ├── character/   # 角色卡（类型 / 存储 / .st 解析）
│   ├── poster/      # 海报模板 + Canvas 渲染器 + 主题
│   ├── hoSlot/      # Ho 位看板 + PNG 导出
│   └── logBeautify/ # 预留
├── components/      # 跨 feature 通用组件
├── lib/             # 工具函数
└── styles/          # 全局样式 / tokens
```

详细架构与设计约定见 [PROJECT_DESIGN.md](./PROJECT_DESIGN.md)。

## 文档

- [PROJECT_DESIGN.md](PROJECT_DESIGN.md) — 设计宪法（数据契约 / 架构 / 4 阶段路线图）
- [README_old.md](README_old.md) — 早期版本（含环境搭建新手教程），存档保留
