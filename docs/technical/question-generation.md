---
title: 题目生成设计需求规格
description: 基于智课方舟品牌理念的智能题目生成系统设计规格，包含UI设计、功能需求和交互规范
---

# 题目生成设计需求规格

## 1. 项目概述

### 1.1 项目背景
基于智课方舟品牌理念，设计一个智能题目生成系统，为学习者提供专业而温暖的题目生成体验。系统将承载知识，护航学习者的成长历程，通过系统化的题目生成支持，让每一个学习者都能在知识的海洋中找到属于自己的方舟。

### 1.2 设计目标
- 遵循智课方舟品牌设计系统，提供专业而温暖的用户界面
- 实现直观的左右分栏布局，配置与预览同步显示
- 支持多种生成模式和题型选择，体现系统化提升理念
- 实现实时预览和微调功能，提供全面支持
- 提供完整的题目管理流程，护航学习者的成长历程

## 2. 功能需求

### 2.1 整体布局设计

#### 2.1.1 布局结构
```
│             │                                               │
│   左侧配置面板  │              右侧预览面板                    │
│   (40%宽度)   │              (60%宽度)                      │
│             │                                               │
│  - 标签页导航  │  - 生成预览区                               │
│  - 领域选择   │  - 题目列表                                 │
│  - 生成设置   │  - 微调功能                                 │
│  - 操作按钮   │  - 批量操作                                 │
│             │                                               │
└─────────────┴───────────────────────────────────────────────┘
```

#### 2.1.2 响应式设计
- 桌面端：左右分栏布局
- 平板端：可折叠侧边栏
- 移动端：全屏切换模式

### 2.2 左侧配置面板

#### 2.2.1 标签页导航
**功能描述**：提供不同的生成模式选择

**标签页选项**：
- 题库管理：展示所有的题目
- 课程生成：基于已有课程内容生成题目
- 描述生成：基于文本描述生成题目
- 主题生成：基于主题领域生成题目
- 资料生成：基于上传资料生成题目

**交互要求**：
- 点击切换标签页
- 当前激活标签页高亮显示
- 切换时保持配置状态

#### 2.2.2 课程选择模块（课程生成模式）
**功能描述**：选择要基于其内容生成题目的课程

**设计要素**：
- 课程列表：显示所有可用课程
- 课程搜索：支持按课程名称搜索
- 课程预览：显示课程基本信息和内容概览
- 章节选择：支持选择特定章节生成题目

**课程信息显示**：
- 课程标题和描述
- 课程章节列表
- 课程难度级别
- 课程创建时间
- 课程内容类型（文档、视频、音频等）

**章节选择功能**：
- 全选/取消全选
- 按章节难度筛选
- 按章节类型筛选
- 自定义章节组合

#### 2.2.3 领域选择模块（其他生成模式）
**功能描述**：选择题目涉及的知识领域

**设计要素**：
- 标题：您对哪些具体领域感兴趣？
- 多选框组：预设领域选项
- 自定义输入：支持添加其他领域

**预设领域选项**：
- 平面几何
- 立体几何
- 几何应用
- 几何证明
- 几何计算
- 代数运算
- 函数与图像
- 概率统计
- 微积分
- 线性代数

**自定义输入**：
- 占位符：其他:(在这里添加没有的领域,多个领域用分号";"分隔。)
- 支持多领域输入，用分号分隔
- 实时验证输入格式

#### 2.2.4 生成设置模块
**功能描述**：配置题目的基本参数

**通用设置项**：
1. **语言设置**
   - 选项：简体中文、English、繁体中文
   - 默认：简体中文

2. **难度级别**
   - 选项：简单、中等、困难
   - 默认：简单
   - 支持多选

3. **题型选择**
   - 选项：判断题、单选题、多选题、填空题、简答题
   - 显示格式：题型名称 (题目数量)
   - 支持多选

4. **题目数量**
   - 范围：1-50题
   - 默认：1题
   - 实时更新显示

**课程生成模式专用设置**：
5. **内容深度**
   - 选项：基础概念、应用理解、综合分析、创新思维
   - 默认：应用理解
   - 支持多选

6. **知识点覆盖**
   - 选项：重点知识点、全部知识点、自定义选择
   - 默认：重点知识点

7. **题目分布**
   - 选项：均匀分布、重点突出、随机分布
   - 默认：重点突出

8. **内容关联度**
   - 选项：紧密关联、适度关联、宽松关联
   - 默认：适度关联

**描述生成模式专用设置**：
5. **描述内容**
   - 文本输入框：支持多行输入
   - 字数限制：100-2000字
   - 实时字数统计

6. **生成重点**
   - 选项：概念理解、应用能力、分析能力、综合能力
   - 支持多选

**主题生成模式专用设置**：
5. **主题领域**
   - 多选框：从预设领域中选择
   - 自定义输入：支持添加其他领域

**资料生成模式专用设置**：
5. **资料上传**
   - 支持文件类型：PDF、DOC、DOCX、TXT、图片
   - 文件大小限制：50MB
   - 支持多文件上传

6. **内容提取**
   - 选项：自动提取、手动选择、全文分析
   - 默认：自动提取

#### 2.2.5 状态显示
**剩余题数显示**：
- 格式：当前剩余题数 X
- 实时更新
- 颜色提示（var(--brand-success)：充足，var(--brand-warning)：不足，var(--brand-error)：用完）

**课程生成模式状态显示**：
- 选中课程信息：显示课程名称和选中章节数量
- 内容分析状态：显示内容分析进度
- 知识点提取状态：显示提取到的知识点数量

#### 2.2.6 操作按钮
**主要按钮**：
- 继续生成：使用 brand-btn-primary 样式，大按钮，体现专业而温暖的设计理念
- 清空配置：使用 brand-btn-secondary 样式，重置所有设置
- 保存模板：使用 brand-btn-secondary 样式，保存当前配置

### 2.3 右侧预览面板

#### 2.3.1 预览区域
**功能描述**：实时显示生成的题目

**布局结构**：
- 标题：生成预览区
- 题目列表：垂直排列
- 滚动支持：内容过多时支持滚动

#### 2.3.2 题目卡片设计
**单个题目卡片包含**：
1. **题目编号**：1. 2. 3. ...
2. **题目内容**：题目文本
3. **选项内容**：A. B. C. D. （选择题）
4. **答案解析**：详细解析说明
5. **正确答案**：标准答案
6. **微调按钮**：支持单个题目调整

**卡片样式**：
- 背景：var(--brand-bg-tertiary) (#F3F4F6)
- 边框：1px solid var(--brand-border-light)
- 圆角：var(--brand-radius-lg) (12px)
- 内边距：var(--brand-spacing-lg) (24px)
- 间距：var(--brand-spacing-lg) (24px)
- 阴影：var(--brand-shadow-base)
- 悬停效果：轻微上移和阴影加深

#### 2.3.3 微调功能
**功能描述**：支持对单个题目进行编辑

**操作方式**：
- 点击"微调题目"按钮
- 弹出编辑对话框
- 支持修改题目内容、选项、答案、解析
- 保存后实时更新预览

#### 2.3.4 底部操作区
**成功提示**：
- 图标：var(--brand-success) 勾选图标
- 背景：var(--brand-success-bg)
- 文字颜色：var(--brand-success)
- 文字：成功生成试题,本次共生成X题;受限于AI模型,请自行核对生成的试题是否正确。

**使用说明**：
- 图标：var(--brand-primary) 信息图标
- 背景：var(--brand-primary-bg)
- 文字颜色：var(--brand-primary)
- 文字：试题生成怎么用?自己刷题就用百思考!组织学员刷题就用艾刷刷题! 想要组织考试,立即使用匡优考试组卷!

**操作按钮组**：
- 清空预览区：使用 brand-btn-secondary 样式，清除所有生成的题目
- 保存到题库：使用 brand-btn-primary 样式，批量保存到题库
- 下载试题：使用 brand-btn-secondary 样式，导出为文件

### 2.4 课程生成功能详解

#### 2.4.1 课程内容分析
**功能描述**：智能分析课程内容，提取关键知识点和概念

**分析维度**：
- 知识点提取：自动识别课程中的核心概念
- 难度评估：分析内容的复杂程度
- 关联分析：识别知识点之间的关联关系
- 重点识别：标记重要和难点内容

**分析结果展示**：
- 知识点列表：显示提取到的知识点
- 难度分布：展示不同难度级别的分布
- 关联图谱：可视化知识点关联关系
- 重点标记：突出显示重要内容

#### 2.4.2 智能题目生成
**功能描述**：基于课程内容智能生成高质量题目

**生成策略**：
- 内容匹配：确保题目与课程内容高度相关
- 难度适配：根据设置自动调整题目难度
- 题型平衡：合理分配不同题型的比例
- 知识点覆盖：确保重要知识点得到充分覆盖

**质量控制**：
- 内容准确性：确保题目内容与课程一致
- 逻辑合理性：保证题目逻辑清晰合理
- 答案正确性：确保答案准确无误
- 解析完整性：提供详细的解题思路

#### 2.4.3 个性化配置
**功能描述**：支持根据教学需求个性化配置生成参数

**配置选项**：
- 内容深度：控制题目的认知层次
- 知识点覆盖：选择覆盖的知识点范围
- 题目分布：控制题目在章节间的分布
- 内容关联度：调整题目与课程内容的关联程度

### 2.5 交互设计

#### 2.5.1 实时更新
- 配置更改时立即更新预览
- 题目生成过程中显示进度
- 支持增量生成（追加模式）

#### 2.5.2 状态管理
- 生成中：显示进度条和状态文字
- 生成完成：显示成功提示
- 生成失败：显示错误信息和重试按钮

#### 2.5.3 快捷键支持
- Ctrl+G：开始生成
- Ctrl+S：保存到题库
- Ctrl+D：下载试题
- Delete：删除选中题目
- Ctrl+Z：撤销操作

## 3. 技术实现

### 3.1 技术栈
- **前端框架**：Vue 3 + TypeScript
- **UI组件库**：Element Plus
- **状态管理**：Pinia
- **构建工具**：Vite
- **样式**：SCSS + CSS变量

### 3.2 组件结构
```
QuestionGenerate/
├── index.vue                 # 主组件
├── components/
│   ├── ConfigPanel.vue      # 配置面板
│   ├── PreviewPanel.vue     # 预览面板
│   ├── TabNavigation.vue    # 标签页导航
│   ├── CourseSelector.vue   # 课程选择器
│   ├── FieldSelector.vue    # 领域选择器
│   ├── DescriptionInput.vue # 描述输入
│   ├── MaterialUpload.vue   # 资料上传
│   ├── GenerationSettings.vue # 生成设置
│   ├── QuestionCard.vue     # 题目卡片
│   └── QuestionEditor.vue   # 题目编辑器
├── composables/
│   ├── useQuestionGenerator.ts # 题目生成逻辑
│   ├── usePreviewManager.ts    # 预览管理
│   ├── useCourseAnalysis.ts    # 课程分析
│   └── useMaterialProcessing.ts # 资料处理
└── types/
    ├── question.ts          # 题目类型定义
    ├── course.ts            # 课程类型定义
    └── generation.ts        # 生成配置类型定义
```

### 3.3 数据流设计

#### 3.3.1 课程生成数据流
```
课程选择 → 章节选择 → 内容分析 → 知识点提取 → 生成配置 → 题目生成 → 预览更新
    ↓
课程信息缓存 ← 分析结果缓存 ← 配置保存 ← 用户操作 ← 预览交互
```

#### 3.3.2 其他生成模式数据流
```
用户配置 → 配置验证 → 生成请求 → AI处理 → 结果解析 → 预览更新
    ↓
配置保存 ← 状态同步 ← 用户操作 ← 预览交互
```

#### 3.3.3 通用数据流
```
用户操作 → 状态管理 → 界面更新 → 数据持久化
    ↓
错误处理 ← 异常捕获 ← 用户反馈 ← 操作结果
```

### 3.4 API接口设计
```typescript
// 课程生成题目
POST /api/questions/generate-from-course
{
  courseId: string,
  chapterIds?: string[],
  language: string,
  difficulties: string[],
  types: string[],
  count: number,
  contentDepth: string[],
  knowledgeCoverage: string,
  questionDistribution: string,
  contentRelevance: string
}

// 描述生成题目
POST /api/questions/generate-from-description
{
  description: string,
  language: string,
  difficulties: string[],
  types: string[],
  count: number,
  focusAreas: string[]
}

// 主题生成题目
POST /api/questions/generate-from-topic
{
  fields: string[],
  language: string,
  difficulties: string[],
  types: string[],
  count: number,
  customFields?: string
}

// 资料生成题目
POST /api/questions/generate-from-materials
{
  fileIds: string[],
  language: string,
  difficulties: string[],
  types: string[],
  count: number,
  extractionMode: string
}

// 微调题目
PUT /api/questions/:id/finetune
{
  content: string,
  options?: string[],
  answer: string,
  explanation: string
}

// 保存到题库
POST /api/question-banks/:id/questions
{
  questions: Question[]
}

// 获取课程列表
GET /api/courses?page=1&limit=20&search=keyword

// 获取课程详情
GET /api/courses/:id

// 获取课程章节
GET /api/courses/:id/chapters

// 分析课程内容
POST /api/courses/:id/analyze
{
  chapterIds?: string[]
}

// 获取课程知识点
GET /api/courses/:id/knowledge-points
```

## 4. 样式规范

### 4.1 品牌色彩规范
遵循智课方舟品牌设计系统，使用CSS变量确保一致性：

```scss
// 品牌主色调 - 温暖的蓝色（专业）
--brand-primary: #3B82F6;           // 主色
--brand-primary-light: #60A5FA;     // 浅色
--brand-primary-dark: #1D4ED8;      // 深色
--brand-primary-bg: #EFF6FF;        // 背景色

// 辅助色 - 橙色（鼓励性）
--brand-secondary: #F59E0B;         // 辅助色
--brand-secondary-light: #FBBF24;   // 浅色
--brand-secondary-dark: #D97706;    // 深色
--brand-secondary-bg: #FFFBEB;      // 背景色

// 功能色彩
--brand-success: #10B981;           // 成功色
--brand-warning: #F59E0B;           // 警告色
--brand-error: #EF4444;             // 错误色
--brand-info: #6B7280;              // 信息色

// 中性色彩
--brand-text-primary: #111827;      // 主要文字
--brand-text-secondary: #6B7280;    // 次要文字
--brand-text-tertiary: #9CA3AF;     // 第三级文字
--brand-text-disabled: #D1D5DB;     // 禁用文字

// 背景色
--brand-bg-primary: #FFFFFF;        // 主背景
--brand-bg-secondary: #F9FAFB;      // 次背景
--brand-bg-tertiary: #F3F4F6;       // 第三级背景

// 边框色
--brand-border: #E5E7EB;            // 主边框
--brand-border-light: #F3F4F6;      // 浅边框
```

### 4.2 品牌字体规范
```scss
// 字体族
--brand-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;

// 字体大小
--brand-font-size-xs: 12px;         // 超小字体
--brand-font-size-sm: 14px;         // 小字体
--brand-font-size-base: 16px;       // 基础字体
--brand-font-size-lg: 18px;         // 大字体
--brand-font-size-xl: 20px;         // 超大字体
--brand-font-size-2xl: 24px;        // 2倍大字体
--brand-font-size-3xl: 30px;        // 3倍大字体

// 字体粗细
font-weight: 400;                   // 常规
font-weight: 500;                   // 中等
font-weight: 600;                   // 半粗
font-weight: 700;                   // 粗体
```

### 4.3 品牌间距规范
```scss
// 间距系统
--brand-spacing-xs: 4px;            // 超小间距
--brand-spacing-sm: 8px;            // 小间距
--brand-spacing-base: 16px;         // 基础间距
--brand-spacing-lg: 24px;           // 大间距
--brand-spacing-xl: 32px;           // 超大间距
--brand-spacing-2xl: 48px;          // 2倍大间距
--brand-spacing-3xl: 64px;          // 3倍大间距

// 圆角系统
--brand-radius-sm: 4px;             // 小圆角
--brand-radius-base: 8px;           // 基础圆角
--brand-radius-lg: 12px;            // 大圆角
--brand-radius-xl: 16px;            // 超大圆角
--brand-radius-2xl: 24px;           // 2倍大圆角
```

### 4.4 品牌阴影规范
```scss
// 阴影系统
--brand-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);                    // 小阴影
--brand-shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);  // 基础阴影
--brand-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);  // 大阴影
--brand-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);  // 超大阴影
```

### 4.5 品牌组件样式规范

#### 4.5.1 按钮样式
```scss
// 主要按钮
.brand-btn-primary {
  background-color: var(--brand-primary);
  color: white;
  border: none;
  border-radius: var(--brand-radius-base);
  padding: var(--brand-spacing-sm) var(--brand-spacing-base);
  font-size: var(--brand-font-size-sm);
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.brand-btn-primary:hover {
  background-color: var(--brand-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--brand-shadow-lg);
}

// 次要按钮
.brand-btn-secondary {
  background-color: var(--brand-secondary);
  color: white;
  border: none;
  border-radius: var(--brand-radius-base);
  padding: var(--brand-spacing-sm) var(--brand-spacing-base);
  font-size: var(--brand-font-size-sm);
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}
```

#### 4.5.2 卡片样式
```scss
// 品牌卡片
.brand-card {
  background-color: var(--brand-bg-primary);
  border-radius: var(--brand-radius-lg);
  box-shadow: var(--brand-shadow-base);
  border: 1px solid var(--brand-border-light);
  transition: all 0.2s ease;
}

.brand-card:hover {
  box-shadow: var(--brand-shadow-lg);
  transform: translateY(-2px);
}
```

#### 4.5.3 表单样式
```scss
// 表单输入框
.brand-form-input {
  width: 100%;
  padding: var(--brand-spacing-sm) var(--brand-spacing-base);
  border: 1px solid var(--brand-border);
  border-radius: var(--brand-radius-base);
  font-size: var(--brand-font-size-sm);
  transition: all 0.2s ease;
  background-color: var(--brand-bg-primary);
}

.brand-form-input:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px var(--brand-primary-bg);
}
```

### 4.6 响应式设计规范
```scss
// 移动端适配
@media (max-width: 768px) {
  :root {
    --brand-spacing-base: 12px;
    --brand-spacing-lg: 16px;
    --brand-spacing-xl: 24px;
    --brand-font-size-base: 15px;
    --brand-font-size-lg: 17px;
    --brand-font-size-xl: 19px;
  }
}
```

## 5. 品牌一致性设计

### 5.1 品牌理念体现
**方舟精神**：承载知识，护航成长
- 题目生成系统作为知识载体，为学习者提供系统化的练习支持
- 通过智能生成功能，护航学习者的成长历程
- 界面设计体现专业而温暖的教育理念

**核心价值**：系统化提升，全面支持
- 提供完整的题目生成流程，从配置到预览到保存
- 支持多种题型和难度，满足不同学习需求
- 实时预览和微调功能，确保题目质量

### 5.2 视觉设计原则
**专业而温暖**：
- 使用温暖的蓝色作为主色调，体现专业性
- 橙色作为辅助色，传达鼓励性
- 圆角设计增加亲和力，减少距离感

**清晰简洁**：
- 左右分栏布局，信息层次清晰
- 使用品牌字体系统，确保可读性
- 合理的间距和留白，避免视觉混乱

**一致性**：
- 严格遵循品牌色彩规范
- 统一使用品牌组件样式
- 保持交互行为的一致性

### 5.3 品牌元素应用
**色彩应用**：
- 主色调：用于主要操作按钮和重要信息
- 辅助色：用于次要操作和提示信息
- 功能色：用于状态提示和反馈信息

**字体应用**：
- 标题：使用较大字号和适当字重
- 正文：使用基础字号，确保易读性
- 说明文字：使用较小字号和次要颜色

**组件应用**：
- 按钮：统一使用品牌按钮样式
- 卡片：使用品牌卡片样式，增强层次感
- 表单：使用品牌表单样式，保持一致性

## 6. 用户体验设计

### 6.1 加载状态
- 生成过程中显示进度条
- 提供取消操作选项
- 显示预估剩余时间

### 6.2 错误处理
- 网络错误：显示重试按钮
- 生成失败：显示错误原因和建议
- 配置错误：实时验证和提示

### 6.3 操作反馈
- 成功操作：显示成功提示
- 危险操作：二次确认
- 批量操作：显示操作进度

### 6.4 数据持久化
- 配置自动保存到本地存储
- 支持配置模板保存和加载
- 生成历史记录管理

## 7. 性能要求

### 7.1 响应时间
- 页面加载：< 2秒
- 配置更新：< 100ms
- 题目生成：< 30秒
- 微调保存：< 1秒

### 7.2 并发支持
- 支持多用户同时使用
- 单用户最大并发生成：3个
- 系统最大并发：100个

### 7.3 资源优化
- 图片懒加载
- 组件按需加载
- 接口请求防抖
- 本地缓存策略

## 8. 测试要求

### 8.1 功能测试
- 配置面板各项功能
- 预览面板显示和交互
- 题目生成和微调
- 批量操作功能

### 8.2 兼容性测试
- 浏览器兼容：Chrome、Firefox、Safari、Edge
- 设备兼容：桌面、平板、手机
- 分辨率兼容：1920x1080、1366x768、375x667

### 8.3 性能测试
- 大量题目生成性能
- 长时间使用稳定性
- 内存泄漏检测

## 9. 部署要求

### 9.1 环境要求
- Node.js: >= 20.19.0
- 浏览器：支持ES6+
- 网络：稳定的互联网连接

### 9.2 配置要求
- API接口地址配置
- 文件上传大小限制
- 题目生成频率限制

## 10. 后续扩展

### 10.1 功能扩展
- 增加拖拽排序功能
- 支持题目预览模式切换
- 增加快捷键操作
- 优化移动端体验

### 10.2 体验优化
- 增加拖拽排序功能
- 支持题目预览模式切换
- 增加快捷键操作
- 优化移动端体验
