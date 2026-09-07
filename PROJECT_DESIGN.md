# PROJECT_DESIGN.md — TRPG Helper

> 单一文档即"宪法"。后续所有决策以本文档为准，需要变更先改文档再写代码。
>
> 状态：**v1.0 定稿（基于甲方三轮问答 + xlsx 字段分析）**

---

## 1. 项目定义

**为跑团玩家提供一个本地优先的浏览器工具**，用于管理 COC7 角色卡、生成可下载的自介 / 招聘 / 应征海报、未来扩展跑团辅助功能（骰子、log 美化等）。

**约束**：
- 纯静态站点（GitHub Pages 部署）
- 无后端 / 无登录 / 无云同步
- **多用户共用同一份部署，每个用户的数据完全本地隔离**

---

## 2. 范围切片

| 档位 | 内容 | 说明 |
|---|---|---|
| **MVP** | 角色卡 CRUD（COC7 完整字段）、`.st` 快捷录卡格式双向解析、JSON 导入导出、本地存储（IndexedDB）、1 种自介海报生成 + 下载 | 第一版必须做完 |
| **v1** | 招聘 / 应征海报、模板切换（多套自介）、骰子（基础骰 + 规则骰）、背景故事 / 背包的折叠展开优化 | 上线后 1-2 周 |
| **Backlog** | 团务管理、跑团 log txt 美化（**接口已预留**）、AI 生成头像 / 文案、模板市场、PWA（离线）、暗色模式、自定义域名 | 暂不评估

**接口预留说明**：
- **跑团 log 美化**：在 `src/features/logBeautify/` 下预留目录与 `types.ts`，未来加 parser + 模板即可
- **`.st` 格式**：MVP 必做（解析 + 序列化双向），详见 §5.4

---

## 3. 数据模型（**契约层，不要轻易改**）

### 3.1 角色卡 Character

```ts
// ===== COC7 调查员 =====

/** 9 维核心属性 */
export interface CharacterStats {
  str: number;     // 力量 STR
  dex: number;     // 敏捷 DEX
  pow: number;     // 意志 POW
  con: number;     // 体质 CON
  app: number;     // 外貌 APP
  edu: number;     // 教育 EDU
  siz: number;     // 体型 SIZ
  int: number;     // 智力 / 灵感 INT
  luck: number;    // 幸运 Luck
}

/** 衍生属性（自动计算但可手动覆盖） */
export interface CharacterDerived {
  hp: number;        // 生命值 HP = (CON+SIZ)/10 取整
  san: number;       // 理智 SAN = POW（可因剧情减少）
  mp: number;        // 魔法 MP = POW/5 取整
  mov: number;       // 移动力 MOV（依年龄 + STR/DEX/SIZ）
  build: number;     // 体格 Build
  db: string;        // 伤害加值 DB（"-2" / "0" / "+1D4" 等文字形式）
}

/** 调查员基础信息 */
export interface CharacterInfo {
  name: string;         // 调查员姓名（必填）
  player: string;       // 玩家姓名（必填）
  occupation: string;   // 职业（如"私家侦探"）
  occupationNo: number; // 职业序号（用于职业表查询，可选）
  age: number;
  gender: string;       // "男" / "女" / "其他"
  residence: string;    // 住地
  birthplace: string;   // 故乡
  era: string;          // 时代（"1920s" / "现代" / "未来"）
  avatar?: string;      // 头像 dataURL（IndexedDB 存储，建议 < 500KB）
}

/** 单条技能 */
export interface CharacterSkill {
  name: string;          // 技能名（中文 / 英文别名同存，见别名映射表）
  initial: number;       // 初始值（职业表基础值）
  growth: number;        // 成长值（游戏中提升）
  occupation: number;    // 本职加点
  interest: number;      // 兴趣加点
  // total = initial + growth + occupation + interest
}

/** 角色卡（顶层） */
export interface Character {
  id: string;                       // uuid
  info: CharacterInfo;
  stats: CharacterStats;
  derived: CharacterDerived;
  skills: CharacterSkill[];         // 只存用户实际分配了值的技能（空技能不存）
  background: string;               // 背景故事（多行）
  inventory: string;                // 背包物品（多行）
  companions: string;               // 调查员同伴
  notes: string;                    // 其他备注
  tags: string[];                   // 标签（如 "PL" / "PC" / "NPC"）
  createdAt: number;
  updatedAt: number;
}
```

**关键设计**：
- **结构化 `stats` / `derived` / `info`**——COC7 字段固定，类型明确
- **`skills` 是数组而非 Map**——保留填入顺序，方便 UI 折叠展开
- **不存所有 60+ 技能，只存用户实际分配的**——减小存储
- **`avatar` 是 dataURL**——存 IndexedDB（不上传服务器），单图建议 < 500KB

### 3.2 海报模板 PosterTemplate

```ts
export type PosterType = 'self-intro' | 'recruit' | 'apply';

export interface PosterField {
  key: string;                   // 字段标识
  label: string;                 // 表单标签
  maxLength?: number;
  placeholder?: string;
  multiline?: boolean;
}

export interface PosterTemplate {
  id: string;
  type: PosterType;
  name: string;                  // "莱茵生命风自介"
  thumbnail: string;             // 缩略图 url
  size: { w: number; h: number };// 像素尺寸
  fields: PosterField[];         // 该模板需要哪些字段
  // 模板美术 = JSON 描述（图层 / 字体 / 颜色 / 字段位置），详见 §5.5
  artSpec: PosterArtSpec;
}

export interface PosterDraft {
  id: string;
  templateId: string;
  values: Record<string, string>;  // 用户填入的字段值
  // 海报字段独立于角色卡（甲方决策），故不引用 characterId
  thumbnail?: string;
  updatedAt: number;
}
```

**关键设计**：
- **海报字段独立于角色卡**（甲方决策）——海报可独立填写，不从角色卡自动填充
- 未来若想打通"一键生成"，再通过 §5.4 的字段映射表实现

### 3.3 存储版本号

```ts
export const STORAGE_VERSION = 1;  // 数据迁移用
```

---

## 4. 目录结构

```
trpg-helper/
├── public/
│   └── fonts/                   # 思源黑体 + JetBrains Mono（MVP 用系统字体兜底）
├── src/
│   ├── main.tsx
│   ├── App.tsx                  # 路由 + 全局布局
│   ├── pages/                   # 页面（路由对应，薄壳）
│   │   ├── Home.tsx
│   │   ├── CharacterList.tsx
│   │   ├── CharacterEdit.tsx
│   │   ├── StImporter.tsx       # .st 格式导入页（MVP）
│   │   └── PosterStudio.tsx     # 海报生成工作台
│   ├── features/
│   │   ├── character/
│   │   │   ├── types.ts         # 重新导出 Character / Stats / Skill 等
│   │   │   ├── store.ts         # Zustand store
│   │   │   ├── repo.ts          # ★ CharacterRepo 接口 + IndexedDB 实现
│   │   │   ├── stParser.ts      # ★ .st 字符串 ↔ Character 双向转换
│   │   │   ├── aliasMap.ts      # ★ 属性 / 技能别名映射表
│   │   │   ├── derivedCalc.ts   # 衍生属性（HP/SAN/MOV/Build/DB）计算
│   │   │   └── ui/              # 该 feature 内部组件
│   │   ├── poster/
│   │   │   ├── types.ts
│   │   │   ├── store.ts
│   │   │   ├── templates/       # 模板 JSON
│   │   │   ├── render/          # ★ PosterRenderer 接口 + Canvas 实现
│   │   │   └── ui/
│   │   └── logBeautify/         # ★ 占位模块（Backlog 预留接口）
│   │       ├── types.ts         # 输入 / 输出类型定义
│   │       └── index.ts         # 空实现
│   ├── components/
│   │   └── ui/                  # 基础组件（Button、Input、Card…）
│   ├── lib/
│   │   ├── id.ts                # uuid
│   │   ├── download.ts          # 触发文件下载（PNG / JSON）
│   │   └── cn.ts                # className 工具
│   ├── types/
│   │   └── index.ts             # 全局类型
│   └── styles/
│       └── tokens.css           # 设计 tokens
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

**目录规则**：
- `pages/` 只组合 `features/` 和 `components/`
- `features/` 之间**不互相 import**，共享数据走全局 store 或 `lib/`
- `lib/` 是叶子，无业务逻辑
- `logBeautify/` 即使 MVP 不实现，目录与 types.ts 也要存在

---

## 5. 扩展点（**关键，避免日后大改**）

下面 5 个接口在 MVP 阶段就定义好，**实现可以简陋，但接口签名不能变**。

### 5.1 CharacterRepo：角色卡存储抽象

```ts
// features/character/repo.ts
export interface CharacterRepo {
  list(): Promise<Character[]>;
  get(id: string): Promise<Character | null>;
  save(c: Character): Promise<void>;      // upsert by id
  delete(id: string): Promise<void>;
  exportAll(): Promise<string>;           // JSON 导出（含所有角色卡 + 头像 base64）
  importAll(json: string): Promise<void>; // 从 JSON 还原
}

// MVP 实现
export const indexedDBCharacterRepo: CharacterRepo = { ... };
```

**未来加云同步**：只新增一个实现（如 `cloudCharacterRepo`），UI 一行不改。

### 5.2 PosterRenderer：海报渲染抽象

```ts
// features/poster/render/types.ts
export interface PosterRenderer {
  render(template: PosterTemplate, values: Record<string, string>): Promise<Blob>;
}

// MVP 实现
export const canvasRenderer: PosterRenderer = { ... };
```

**未来加 html2canvas / satori**：新增实现，主流程不动。

### 5.3 Template：海报模板 = JSON 数据 + 美术规格

```ts
export interface PosterArtSpec {
  background: { type: 'color' | 'gradient'; value: string };
  layers: PosterLayer[];        // 自下而上堆叠
  fonts: { heading: string; body: string; mono: string };
}

export interface PosterLayer {
  type: 'rect' | 'text' | 'image' | 'line' | 'badge';
  x: number; y: number; w?: number; h?: number;
  style?: Record<string, string>;
  // text 类特有
  fieldKey?: string;            // 引用 values[fieldKey]
  text?: string;                // 静态文本
  font?: 'heading' | 'body' | 'mono';
  align?: 'left' | 'center' | 'right';
}
```

**新增模板 = 加一个 JSON 文件**，不需要改渲染器代码。

### 5.4 .st 格式双向解析（**MVP 关键功能**）

跑团圈常用的 dice! 工具的快捷录卡命令 `.st` 格式：

```
.st 力量0str0敏捷0dex0意志0pow0体质0con0外貌0app0教育0edu0体型0siz0智力0int0san0san值0理智0理智值0幸运0运气0mp0魔法0hp0体力0会计5人类学1...
```

格式说明：
- 每个 token 形如 `属性名 + 值`（无分隔符）
- 一个属性可有多个别名（如"理智" / "理智值" / "san" / "san值" 都指向 SAN）

```ts
// features/character/stParser.ts
export interface StParser {
  /** .st 字符串 → Character（部分字段，未填的保持默认） */
  parse(st: string): Partial<Character>;

  /** Character → .st 字符串（只输出有值的字段） */
  serialize(c: Character): string;
}

export const defaultStParser: StParser = { ... };
```

依赖的别名映射表（`aliasMap.ts`）：

```ts
// 属性别名：每个属性的多个名称都映射到同一个 key
export const STAT_ALIASES: Record<string, keyof CharacterStats | keyof CharacterDerived> = {
  '力量': 'str', 'str': 'str',
  '敏捷': 'dex', 'dex': 'dex',
  // ... 完整 60+ 项
};

export const SKILL_ALIASES: Record<string, string> = {
  '计算机': '计算机使用',
  '电脑': '计算机使用',
  '图书馆': '图书馆使用',
  '汽车': '汽车驾驶',
  '驾驶': '汽车驾驶',
  // ... 完整映射
};
```

**未来想支持其他格式（如 `.coc` / JSON）**：新增 parser 实现即可。

### 5.5 衍生属性自动计算

```ts
// features/character/derivedCalc.ts
export interface DerivedCalculator {
  compute(stats: CharacterStats, info: { age: number }): CharacterDerived;
}

export const coc7DerivedCalc: DerivedCalculator = { ... };
// 实现：HP = (CON+SIZ)/10, SAN = POW, MP = POW/5, MOV/Build/DB 查表
```

---

## 6. 设计语言（tokens）：**莱茵生命 + 暖意**

**风格定位**：参考《明日方舟》莱茵生命的视觉语言——**冷峻理性的工业实验室风**，但保留一份暖意以贴合跑团圈的氛围。

### 6.1 色彩

```css
:root {
  /* === 冷色基底（莱茵生命主调）=== */
  --color-bg: #F7F7F5;          /* 浅灰白背景 */
  --color-surface: #FFFFFF;     /* 面板白 */
  --color-ink: #1F1F1F;         /* 主文字（深灰近黑，不用纯黑）*/
  --color-muted: #8A8A8A;       /* 次要文字 */
  --color-line: #E5E5E5;        /* 边框 / 分隔线（极浅）*/

  /* === 主色：科研感青绿 === */
  --color-accent: #4FB3A4;      /* 按钮 / 链接 / 选中态 */
  --color-accent-soft: #E8F4F1; /* 强调色的极浅背景 */

  /* === 高亮色：工程感橙 === */
  --color-highlight: #E68A3C;   /* 主操作（下载 / 提交）*/
  --color-highlight-soft: #FAF0E6;

  /* === 暖意色：暖驼（用于头像边框 / 标签 / 海报"暖版"）=== */
  --color-warm: #D4A574;        /* 暖意点缀 */
  --color-warm-soft: #FAF6EE;

  /* === 角色识别色（参考明日方舟员工 ID 配色）=== */
  --color-tag-pl: #4FB3A4;      /* PL 玩家 */
  --color-tag-pc: #4A90C2;      /* PC 玩家角色 */
  --color-tag-npc: #E68A3C;     /* NPC */
  --color-tag-kp: #C75A5A;      /* KP / 团务 */

  /* === 状态色 === */
  --color-success: #4FB3A4;
  --color-warning: #E68A3C;
  --color-danger: #C75A5A;
}
```

### 6.2 字体

```css
:root {
  /* 主字体：思源黑体（开源，覆盖中文 + 西文 + 数字） */
  --font-sans: "Source Han Sans SC", "Noto Sans SC", system-ui, -apple-system, sans-serif;

  /* 等宽字体：数字 / ID / 字段 key / .st 输出 */
  --font-mono: "JetBrains Mono", "SF Mono", "Cascadia Mono", Consolas, monospace;

  /* 标题字体：思源宋体（用于海报标题，营造书卷气） */
  --font-serif: "Source Han Serif SC", "Songti SC", serif;
}
```

### 6.3 圆角 / 间距 / 阴影

```css
:root {
  /* 莱茵生命风格：圆角极小或直角 */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 6px;
  /* 头像 / 卡片区域：柔化圆角 6-8px，添暖意 */
  --radius-soft: 8px;

  --space-1: 4px; --space-2: 8px; --space-3: 12px;
  --space-4: 16px; --space-6: 24px; --space-8: 32px;

  /* 阴影极弱，主要靠描边分层 */
  --shadow-sm: 0 1px 0 rgba(0,0,0,.04);
  --shadow-md: 0 2px 8px rgba(0,0,0,.06);
}
```

### 6.4 海报风格规则

- **冷版（默认）**：白底 + 细灰描边 + 1 处青绿强调 + 思源黑体
- **暖版**：暖白底（`--color-warm-soft`）+ 暖棕强调 + 思源宋体标题
- 装饰元素：细线分隔条、数据条（如"HP: 12"用 12px 横条 + 数字）、六边形角章
- **禁用**：大块渐变背景、花纹背景、彩虹色

### 6.5 质量门

- 所有颜色 / 间距 / 圆角 / 字体必须用 token
- 数字 / 字段 key 一律用 `--font-mono`
- 标题区域允许 `--font-serif`，正文一律 `--font-sans`

---

## 7. 开发流程（4 阶段）

| 阶段 | 目标 | Done 标准 | 预计 |
|---|---|---|---|
| **0. 定义** | 写完本文档 | 甲方 review 并签字 | ✅ 完成 |
| **1. 地基** | Vite 项目跑起来 + tokens + 路由 + 一个空首页 | `npm run dev` 起站，修改 token 全站联动，`typecheck` 0 error | 1 天 |
| **2. MVP 切片** | 角色卡 CRUD（含 COC7 字段）+ .st 双向解析 + IndexedDB + JSON 导入导出 + 1 种自介海报生成 + 下载 | 端到端走通：从 .st 文本导入 → 编辑角色卡 → 导出 .st → 生成海报 → 下载 PNG | 3-5 天 |
| **3. v1 + 部署** | 招聘 / 应征海报、模板切换、骰子、GitHub Pages 部署 +上线在线可用 | 视需求 |

**每个阶段结束时**：跑 `npm run build` + `npm run typecheck`，确认 0 错误才进入下一阶段。

---

## 8. 质量底线（项目长期护栏）

1. TypeScript strict + `npm run typecheck` 必须 0 error
2. 所有 UI 颜色 / 间距走 token，无硬编码
3. 跨模块交互只通过类型 + 接口
4. 每个新功能做完跑一次 `npm run build`，确认能打包
5. 主分支 `main` 始终能 `build` 通过
6. 头像图片建议 < 500KB（过大给用户警告）
7. 角色卡导出 JSON 含所有头像 base64，单文件建议 < 5MB

---

## 9. 错误补救预案

| 场景 | 预防 | 补救 |
|---|---|---|
| 数据模型设计错了 | 阶段 0 走完再动手 | 新字段 optional + 迁移函数；老数据保留 |
| 存储方案选错 | Repo 接口先定 | 只换实现，UI 不动 |
| 渲染方案选错 | Renderer 接口先定 | 同上 |
| 模板写死到代码里 | 模板 = JSON | 重构为 JSON 数据驱动 |
| 跨 feature 互相 import | 强制规则 | 抽到 `lib/` 或合并到上层 |
| 做到一半发现新需求 | 写进 backlog | 评估后归入 v1 / Backlog，**当前 PR 不加** |
| .st 别名漏映射 | 别名表集中维护 | 在 aliasMap.ts 补全，单元测试覆盖 |
| 头像 baseURL 过大 | IndexedDB 容量监控 | 警告用户 → 自动压缩 → 失败兜底 |

---

## 10. 不做的事（明确范围）

为了避免 scope creep，下列功能**明确不在 v1 之前**：
- 用户系统 / 登录 / 账号
- 云同步 / 服务端 / 数据库
- AI 生成头像 / 文案 / 模板
- 骰子（v1 加，MVP 不做）
- 团务管理
- 跑团 log 美化（接口预留，MVP 不实现）
- 多人协作 / 共享 / 评论
- 多语言（先用中文）
- PWA / 离线 / 桌面应用
- 暗色模式
- 自定义域名 / SEO 优化

加这些功能前，先更新本文档对应章节。

---

## 11. 架构决策记录（ADR）

### ADR-001：存储方案 = 客户端 IndexedDB + JSON 导入导出

- **背景**：工具网站部署在 GitHub Pages，无服务器
- **方案**：每个用户的数据存自己浏览器的 IndexedDB
- **理由**：
  - 零运维，零服务器成本
  - 数据完全本地，天然隐私
  - 跨设备通过「导出 JSON → 上传网盘 → 在新设备导入」实现曲线同步
- **不选云同步**：避免账号系统 / 服务器 / 隐私合规问题，对个人工具过度设计
- **影响**：所有数据访问走异步 API（Promise），UI 需 loading 态

### ADR-002：海报独立于角色卡

- **背景**：甲方决策——海报与角色卡字段不联动
- **方案**：海报字段独立填写，不从角色卡读取
- **理由**：
  - 自介海报可能用于"虚构角色"或"未来角色"，不必绑定已有数据
  - 实现简单
- **未来扩展**：若用户后续要求一键生成，加字段映射表即可，不破坏当前结构

### ADR-003：技术栈 = React + TS + Vite + Tailwind + shadcn/ui + Zustand + IndexedDB (idb)

- **理由**：见 §11（用户已确认）
- **Canvas 自绘海报**：MVP 不引入 html2canvas / satori，先用 Canvas 2D API 自绘
- **理由**：可控性最强，加载最快，依赖最少

### ADR-004：MVP 视觉风格 = 莱茵生命（克制冷峻）+ 暖驼点缀

- **背景**：甲方喜欢的视觉参考
- **方案**：白灰为基调 + 青绿主色 + 橙色高亮 + 暖驼点缀
- **理由**：保留莱茵生命的"工业感 / 数据感"，同时通过头像边框、卡片圆角、海报"暖版"添加人味

---

## 12. 待办（非阻塞，进入实施阶段后逐步推进）

- [x] 三轮问答确定项目边界
- [x] 数据模型对齐 xlsx 字段
- [ ] **阶段 1**：Vite + Tailwind + 路由 + tokens + 空首页
- [ ] **阶段 2**：MVP 全功能切片
- [ ] **阶段 3**：v1 + 部署

---

## 变更记录

| 版本 | 变更 | 日期 |
|---|---|---|
| v0.1 | 初稿（仅框架） | 2026-09-07 |
| v0.2 | 加入范围切片 / 数据模型 / 设计 tokens | 2026-09-07 |
| v1.0 | 三轮问答 + xlsx 字段分析后定稿：CO C7 化数据模型、`.st` 双向解析、莱茵生命+暖意风格、logBeautify 接口预留 | 2026-09-07 |