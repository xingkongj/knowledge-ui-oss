# Knowledge UI

智能知识库前端（React + Vite + Tailwind）。提供文档管理、语义搜索、聊天问答、系统设置与仪表盘等模块，面向个人与团队的知识管理与检索场景。

## 功能特性
- 仪表盘：展示文档数量、服务健康、模型信息、最近活动等
- 文件管理：拖拽上传、多格式支持、删除、进度提示、列表搜索
- 智能搜索：语义搜索与关键词搜索，支持最小相似度与返回数量配置
- 聊天问答：支持 OpenAI 与本地 Qwen 模型，可启用搜索增强并展示参考资料
- 系统设置：主题切换、语言切换、API/向量库/文件等参数配置
- 深色模式：全局暗色主题，随状态自动切换

## 技术栈
- 构建：`Vite`、`TypeScript`
- 框架：`React 18`、`React Router`
- 状态：`Zustand`
- UI：`Tailwind CSS`、`radix-ui`、`lucide-react`
- 其他：`react-dropzone`、`react-markdown`、`framer-motion`

## 快速开始
### 环境要求
- Node.js 18+（建议 20+）
- 推荐包管理器：`pnpm` 或 `npm`

### 安装与启动
```bash
# 安装依赖
pnpm install   # 或 npm install

# 开发模式
pnpm dev       # 或 npm run dev

# 构建生产包
pnpm build     # 或 npm run build

# 本地预览
pnpm preview   # 或 npm run preview
```

### 后端服务
前端默认调用的后端地址为 `http://localhost:8000`（见 `src/lib/api.ts:4`）。请确保后端服务已启动并提供以下接口：
- 系统健康与信息：`/system/health`、`/system/info`
- 文档管理：`/documents/upload`、`/documents/delete`
- 语义搜索：`/search/semantic`
- 聊天问答：`/chat/ask`（OpenAI）
- 本地 Qwen：`/qwen/chat`、`/qwen/chat-with-search`、`/qwen/model-info`

如需修改后端地址，可在 `src/lib/api.ts:4` 替换 `BASE_URL`，后续可将该配置迁移到环境变量实现更灵活的部署。

## 目录结构
```text
├─ index.html
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
├─ tailwind.config.js
├─ postcss.config.js
└─ src
   ├─ main.tsx            # 应用入口
   ├─ App.tsx             # 路由与全局布局
   ├─ index.css           # Tailwind 引导与样式
   ├─ components
   │  ├─ Layout.tsx       # 主布局（Header + Sidebar + 内容）
   │  ├─ Header.tsx       # 顶部栏
   │  ├─ Sidebar.tsx      # 侧边导航
   │  └─ ui/*             # 基础 UI 组件（button/card/input/progress 等）
   ├─ pages
   │  ├─ Dashboard.tsx    # 仪表盘
   │  ├─ FileManager.tsx  # 文件管理
   │  ├─ Search.tsx       # 智能搜索
   │  ├─ Chat.tsx         # 聊天问答
   │  └─ Settings.tsx     # 系统设置
   ├─ store
   │  └─ useAppStore.ts   # 全局状态（Zustand）
   └─ lib
      ├─ api.ts           # 后端 API 封装
      ├─ i18n.ts          # 国际化资源
      └─ useTranslation.ts# 国际化 Hook
```

## 主要模块说明
- 文件管理（`src/pages/FileManager.tsx`）：支持拖拽上传，读取文件内容并携带元数据上传，删除文档，进度与状态反馈
- 智能搜索（`src/pages/Search.tsx`）：语义搜索，结果相似度展示与分页参数配置，空态与加载态优化
- 聊天问答（`src/pages/Chat.tsx`）：OpenAI/Qwen 双模型，搜索增强、历史对话截取、参考资料折叠展示、上下文统计
- 状态管理（`src/store/useAppStore.ts`）：文件、搜索、聊天、API 状态、主题与语言切换等集中管理
- 布局与导航（`src/components/*`）：统一布局与基础 UI 组件，Tailwind + radix 风格一致

## 路径别名与构建
- 路径别名：`@` 指向 `src` 目录（见 `vite.config.ts:9-12` 与 `tsconfig.json:24-27`）
- 构建脚本：`package.json` 中提供 `dev/build/preview/lint` 脚本

## 部署说明
- 生产构建输出在 `dist/`，可部署到任意静态服务器（Nginx、Vercel、Netlify 等）
- 如需自定义后端地址，建议将 `BASE_URL` 改为读取环境变量（例如 `import.meta.env.VITE_API_URL`）并在部署时配置同名变量

## 贡献指南
- Fork 本仓库并创建分支进行修改
- 遵循现有代码风格与架构（React 组件、Zustand 状态、Tailwind 样式）
- 提交 PR 前请运行 `pnpm lint` 并确保无警告

## 许可证
本项目采用 `CC BY-NC 4.0` 非商业许可证：允许非商业使用与修改，须署名；禁止任何商业用途。详见 `LICENSE` 文件与 https://creativecommons.org/licenses/by-nc/4.0/

## 仓库地址
- GitHub：`https://github.com/xingkongj/knowledge-ui-oss`
