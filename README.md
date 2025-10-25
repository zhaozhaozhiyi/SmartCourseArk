# 智课方舟 - 智能课程创建平台

智课方舟是一个基于AI技术的智能课程创建平台，能够将用户上传的文档自动转换为结构化的交互式网络课程，大幅提升课程制作效率并增强学习体验。

## 功能特性

### 核心功能
- **课程管理**: 完整的课程生命周期管理，包括创建、编辑、发布
- **智能生成**: 基于Kimi AI自动解析文档并生成课程大纲
- **题库系统**: 自动生成多种题型的练习题目
- **学习系统**: 完整的课程学习和练习体验
- **学习分析**: 详细的学习数据分析和可视化

### 技术特性
- **纯前端实现**: 基于Vue 3 + TypeScript的现代化前端架构
- **AI集成**: 直接调用Kimi API进行文档解析和内容生成
- **本地存储**: 使用LocalStorage实现数据持久化
- **响应式设计**: 支持桌面端和移动端
- **品牌化UI**: 专业的智课方舟品牌设计系统

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **UI组件**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **构建工具**: Vite
- **AI服务**: Kimi API (Moonshot AI)
- **文档解析**: 支持PDF、DOC、DOCX、TXT格式
- **样式**: SCSS + CSS Variables
- **图标**: FontAwesome + Element Plus Icons


## 快速开始

### 方式一：一键启动脚本（推荐）✨

最简单的方式，自动检测并安装所需环境：

```bash
# macOS/Linux
./start.sh

# Windows (批处理)
start.bat

# Windows (PowerShell)
.\start.ps1

# 或使用 Make（跨平台）
make start
```

脚本会自动：
- ✅ 检测操作系统类型
- ✅ 检查 Node.js 是否安装（未安装会自动安装）
- ✅ 自动安装项目依赖
- ✅ 创建环境配置文件
- ✅ 启动开发服务器

### 方式二：使用 Make 命令

```bash
make start      # 启动开发服务器（自动检查环境）
make dev        # 快速启动
make install    # 安装依赖
make build      # 构建生产版本
make help       # 查看所有可用命令
```

### Windows 用户特别说明

#### 使用批处理脚本 (start.bat)
1. 双击 `start.bat` 文件
2. 或在命令提示符中运行：`start.bat`

#### 使用 PowerShell 脚本 (start.ps1)
1. 右键点击 `start.ps1` 文件，选择"使用 PowerShell 运行"
2. 或在 PowerShell 中运行：`.\start.ps1`

**注意**: 如果遇到执行策略限制，请先运行：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 常见问题
- **双击 start.bat 没有反应**: 在命令提示符中运行 `cd /d "项目路径" && start.bat`
- **PowerShell 脚本无法执行**: 设置执行策略（见上方命令）
- **Node.js 安装失败**: 以管理员身份运行，关闭杀毒软件
- **npm install 失败**: 运行 `npm cache clean --force` 后重试
- **端口被占用**: 使用 `npm run dev -- --port 3001` 指定其他端口

### 方式三：手动启动

#### 环境要求

- Node.js 18+ (推荐 Node.js 22)
- npm 或 yarn

#### 安装依赖

```bash
npm install
```

#### 环境配置

1. 复制环境变量配置文件：
```bash
# macOS/Linux
cp .env.example .env

# Windows
copy .env.example .env
```

2. 编辑 `.env` 文件，配置Kimi API密钥：
```env
VITE_KIMI_API_KEY=your-kimi-api-key
VITE_KIMI_BASE_URL=/v1
VITE_APP_NAME=智课方舟
```

#### 开发运行

```bash
npm run dev
```

访问 `http://localhost:3000` 查看应用。

#### 构建生产版本

```bash
npm run build
```

#### 代码检查

```bash
npm run lint
```

## 项目结构

```
src/
├── assets/                 # 静态资源
│   ├── css/
│   │   └── brand.css      # 品牌样式系统
│   └── ...
├── modules/               # 功能模块
│   ├── course/           # 课程管理模块
│   ├── learning/         # 课程学习模块
│   ├── question/         # 题库管理模块
│   ├── practice/         # 练习系统模块
│   └── analytics/        # 学习分析模块
├── shared/               # 共享组件和服务
│   ├── api/             # API服务
│   ├── components/      # 通用组件
│   ├── services/        # 业务服务
│   └── utils/           # 工具函数
├── store/               # 状态管理
├── types/               # 类型定义
└── views/               # 页面组件
```

## 主要功能

### 1. 课程创建
- 上传PDF、DOC、DOCX、TXT格式文档
- AI自动解析文档内容
- 智能生成课程大纲和章节
- 支持大纲编辑和调整

### 2. 题库管理
- 基于课程内容自动生成题目
- 支持单选题、多选题、判断题、填空题、简答题
- 题目难度分级（简单、中等、困难）
- 题目预览和编辑功能

### 3. 学习系统
- 章节式学习界面
- 学习进度跟踪
- 章节完成标记
- 学习时长统计

### 4. 练习系统
- 多种练习模式（章节练习、综合练习、错题练习）
- 随机题目抽取
- 答题结果分析
- 练习记录统计

### 5. 学习分析
- 学习数据统计
- 章节掌握度分析
- 学习进度可视化
- 个性化学习建议

## API配置

项目使用Kimi API进行文档解析和内容生成。需要：

1. 注册Moonshot AI账号
2. 获取API密钥
3. 在环境变量中配置密钥

API支持的功能：
- 文档上传和解析
- 课程大纲生成
- 章节内容生成
- 题目自动生成
- 内容优化和增强

## 浏览器支持

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 开发指南

### 添加新功能模块

1. 在 `src/modules/` 下创建模块目录
2. 实现页面组件和业务逻辑
3. 更新路由配置
4. 添加状态管理（如需要）

### 自定义主题

修改 `src/assets/css/brand.css` 中的CSS变量来自定义品牌主题。

### 数据存储

项目使用LocalStorage进行数据持久化，支持：
- 课程数据存储
- 学习记录保存
- 用户设置缓存
- 数据导入导出

## 更多帮助

- **Windows 用户**: 查看 [Windows 安装指南](WINDOWS_SETUP.md) 获取详细说明
- **API 配置**: 查看 [API 配置说明](docs/api/kimi-config.md)
- **开发文档**: 查看 [docs/](docs/) 目录获取更多技术文档