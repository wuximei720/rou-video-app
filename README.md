# 生活记录短视频 Agent

基于火山方舟 Seedance 2.0 的生活记录短视频生成应用。

## 功能特性

- 📝 用户输入今日生活文字描述
- 🖼️ 上传手机实拍参考图片
- 🎬 AI 智能拆解生活化分镜
- 🎥 调用 Seedance 2.0 生成 9:16 竖屏视频
- 📝 自动添加字幕
- 🎵 支持背景音乐
- ✨ 柔和生活滤镜
- 👁️ 视频预览
- 📥 导出 MP4
- 📜 保存历史记录

## 技术栈

- Next.js 14 + React 18
- TypeScript
- Tailwind CSS 3
- Prisma + SQLite
- Volcano Ark Seedance 2.0 API
- FFmpeg (视频后处理)

## 快速开始

### 前置条件

- Node.js >= 18.17.0
- FFmpeg 安装在系统中

### 安装依赖

```bash
npm install
```

### 配置环境变量

在 `.env` 文件中配置：

```
DATABASE_URL="file:./dev.db"
ARK_API_KEY=你的火山方舟API Key
DOUBAO_API_KEY=你的豆包API Key
SEEDANCE_MODEL_ID=doubao-seedance-2-0
```

### 数据库初始化

```bash
npx prisma migrate dev --name init
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
npm run start
```

## API 端点

- `POST /api/upload` - 上传参考图片
- `POST /api/generate` - 创建视频生成任务（AI分析分镜）
- `POST /api/generate/execute` - 执行视频生成（调用Seedance API）
- `GET /api/status?id=xxx` - 查询生成状态
- `GET /api/history` - 获取历史记录
- `DELETE /api/history` - 删除历史记录

## 使用说明

1. 注册火山方舟账号并开通 Seedance 2.0 模型
2. 获取 API Key 并配置到环境变量
3. 启动应用后，输入生活描述并可选上传参考图片
4. 点击生成按钮，等待 AI 分析和视频生成
5. 预览生成的视频，支持导出和重新生成

## 项目结构

```
src/
├── components/          # 前端组件
│   ├── InputPanel.tsx   # 输入面板
│   ├── ScenePreview.tsx # 分镜预览
│   ├── VideoPreview.tsx # 视频预览
│   └── HistoryList.tsx  # 历史记录
├── lib/                 # 工具库
│   ├── db.ts            # 数据库连接
│   └── utils.ts         # 通用工具函数
├── pages/               # 页面路由
│   ├── api/             # API 端点
│   │   ├── upload.ts
│   │   ├── generate.ts
│   │   ├── generate/
│   │   │   └── execute.ts
│   │   ├── status.ts
│   │   └── history.ts
│   ├── _app.tsx
│   └── index.tsx        # 主页面
├── services/            # 服务层
│   ├── llm.ts           # LLM分镜分析
│   ├── seedance.ts      # Seedance API调用
│   └── video.ts         # 视频后处理
├── styles/
│   └── globals.css      # 全局样式
└── lib/prisma-client/   # Prisma客户端（自动生成）
```
