# TRPG Helper

> 一个为跑团玩家设计的本地优先浏览器工具，用于管理 COC7 角色卡、生成可下载的自介 / 招聘 / 应征海报。

**核心特性**：
- 🗂️ 角色卡管理（COC7 完整字段）
- 📋 `.st` 格式快捷录卡（双向解析）
- 🎨 莱茵生命风 + 暖意 视觉风格
- 💾 数据完全本地（IndexedDB）
- 📤 JSON 一键导出 / 导入
- 🖼️ 海报生成（Canvas 自绘）

📖 设计文档：[PROJECT_DESIGN.md](./PROJECT_DESIGN.md)

---

## 技术栈（2026-09 稳定版）

| 层 | 选型 | 版本 |
|---|---|---|
| 运行时 | Node.js LTS "Krypton" | **24.20.0** |
| 包管理器 | npm（Node 自带） | **11.19.0+** |
| 框架 | React | **19.2.x** |
| 语言 | TypeScript | **5.7+** |
| 构建 | Vite（Rolldown + Oxc） | **8.2.x** |
| React 适配 | @vitejs/plugin-react | **6.1.x** |
| 样式 | Tailwind CSS（CSS-first，`@theme`） | **4.3.x** |
| 组件库 | shadcn/ui（new-york + OKLCH） | **latest** |
| 路由 | React Router | **v7** |
| 状态 | Zustand | **5.x** |
| 存储 | IndexedDB（idb 库） | **8.x** |
| 海报渲染 | Canvas 2D API | 原生 |

---

## 开发环境搭建（全新手向）

### 1. 安装 nvm-windows（Node 版本管理器）

nvm = Node Version Manager，让你可以在不同项目之间切换 Node 版本。

**用 winget 装（推荐，Windows 11 自带）**：

```powershell
winget install CoreyButler.NVMforWindows
```

**或者手动装**：

1. 打开 https://github.com/coreybutler/nvm-windows/releases
2. 下载最新 `nvm-setup.exe`
3. 双击安装（一路 Next）

安装完成后**重启 Git Bash / 终端**让 nvm 生效。

**验证安装**：
```bash
nvm --version
# 应该输出版本号，如 1.2.2
```

> ⚠️ **nvm-windows 1.2.x 的行为变化**：新版 `nvm use` 不带参数会报错（"activation error: A version argument is required but missing"）。必须显式传版本号，例如 `nvm use 24`。

### 2. 安装 Node.js 24（当前 LTS "Krypton"）

```bash
# 安装项目指定的版本
nvm install 24

# 切换到该版本
nvm use 24

# 验证
node --version
# 应该输出 v24.20.0

npm --version
# 应该输出 11.x.x（Node 24 自带 npm 11）
```

### 3. 克隆仓库 + 安装依赖

```bash
# 克隆（如果你还没 clone）
git clone https://github.com/你的用户名/trpg-helper.git
cd trpg-helper

# 或者本地已有项目，直接 cd 进去
cd "e:/wqx/Program_sum/python/trpg_helper"

# 用项目指定的 Node 版本
nvm use 24   # nvm-windows 1.2.x 必须显式带版本号

# 安装依赖（首次会下载 node_modules，比较慢）
npm install
```

### 4. 启动开发服务器

```bash
npm run dev
```

浏览器访问 `http://localhost:5173`，看到首页就算成功。

---

## 常用命令

| 命令 | 作用 |
|---|---|
| `npm run dev` | 启动开发服务器（带热更新） |
| `npm run build` | 生产构建（输出到 `dist/`） |
| `npm run preview` | 本地预览生产构建 |
| `npm run typecheck` | TypeScript 类型检查（必须 0 错误） |
| `npm run lint` | ESLint 代码检查 |

---

## 项目结构

```
trpg-helper/
├── src/
│   ├── pages/          # 路由对应的页面（薄壳）
│   ├── features/
│   │   ├── character/  # 角色卡 feature
│   │   ├── poster/     # 海报生成 feature
│   │   └── logBeautify/ # 跑团 log 美化（Backlog 预留）
│   ├── components/     # 跨 feature 的通用组件
│   ├── lib/            # 纯函数工具
│   ├── styles/         # 全局样式 / tokens
│   └── types/          # 全局类型
├── public/             # 静态资源
├── PROJECT_DESIGN.md   # 设计宪法
└── README.md           # 本文件
```

详细架构见 [PROJECT_DESIGN.md](./PROJECT_DESIGN.md)。

---

## Git 工作流（新手教程）

### 第一次推送

```bash
# 1. 初始化仓库（仅项目第一次需要）
git init

# 2. 配置你的身份（全局只配一次）
git config --global user.name "你的GitHub用户名"
git config --global user.email "your-email@example.com"

# 3. 关联远程仓库（在 GitHub 创建好后）
git remote add origin https://github.com/你的用户名/trpg-helper.git

# 4. 首次提交 + 推送
git add .
git commit -m "chore: initial commit"
git branch -M main
git push -u origin main
```

### 日常开发流程

```bash
# 1. 写代码...

# 2. 查看改了啥
git status
git diff

# 3. 暂存 + 提交
git add .
git commit -m "feat: 加上角色卡列表页"

# 4. 推送到 GitHub
git push
```

### 提交规范（Conventional Commits）

格式：`<类型>: <说明>`

| 类型 | 用途 | 例子 |
|---|---|---|
| `feat` | 新功能 | `feat: add character CRUD` |
| `fix` | 修 bug | `fix: resolve st parser edge case` |
| `docs` | 文档 | `docs: update README` |
| `style` | 代码格式 | `style: reformat with prettier` |
| `refactor` | 重构 | `refactor: split character store` |
| `test` | 测试 | `test: add st parser unit tests` |
| `chore` | 杂项 | `chore: bump vite to 8.2` |

### 认证问题

第一次 push 会要用户名密码：
- 用户名 = 你的 GitHub 用户名
- **密码 = Personal Access Token**（不是 GitHub 密码）

[如何生成 PAT →](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)

---

## 部署

部署到 GitHub Pages（静态站点）：

1. GitHub 仓库 → Settings → Pages
2. Source 选 `GitHub Actions`
3. 每次 push 到 `main` 自动部署

详细步骤等阶段 3 再配置。

---

## 路线图

- ✅ **阶段 0**：设计文档（已完成）
- ⏳ **阶段 1**：项目骨架 + 设计系统 + 路由
- ⏳ **阶段 2**：MVP（角色卡 CRUD + .st 双向解析 + 海报生成）
- ⏳ **阶段 3**：v1 + 部署

详见 [PROJECT_DESIGN.md §7](./PROJECT_DESIGN.md#7-开发流程4-阶段)。

---

## 许可证

MIT