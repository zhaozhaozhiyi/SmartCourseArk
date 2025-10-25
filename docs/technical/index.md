---
title: 技术文档
description: 智课方舟技术规格文档和实现方案
---

# 技术文档

欢迎来到智课方舟技术文档中心。这里包含了系统的技术架构、实现方案和优化报告。

## 文档列表

### 🔧 技术规格文档
- [题目生成设计](./question-generation) - 题目生成系统详细技术规格和实现方案
- [题库管理优化](./question-bank-optimization) - 题库管理模块优化完成报告
- [数据统计指标](./data-statistics) - 数据统计指标定义和计算方式

## 技术架构

### 前端技术栈
- **框架**：Vue 3 + TypeScript
- **状态管理**：Pinia
- **UI组件**：Element Plus
- **构建工具**：Vite
- **图表库**：ECharts
- **文件处理**：FileReader API

### 后端技术栈
- **运行环境**：Python 3.9+
- **Web框架**：FastAPI
- **数据库**：PostgreSQL
- **ORM**：SQLAlchemy
- **AI集成**：Kimi API (Moonshot AI)
- **异步处理**：Celery

### 核心功能模块

#### 1. 题目生成系统
- 基于AI的智能题目生成
- 支持多种题型（单选、多选、判断、填空、简答）
- 按章节、难度、类型智能生成
- 实时预览和微调功能

#### 2. 题库管理系统
- 题目分类和标签管理
- 批量操作和导出功能
- 高级搜索和筛选
- 分组管理功能

#### 3. 数据统计分析
- 学习行为数据收集
- 可视化图表展示
- 个性化学习建议
- 学习效果评估

## 开发指南

### 环境配置
1. 安装 Node.js 18+ 和 Python 3.9+
2. 配置数据库（PostgreSQL）
3. 设置环境变量（API密钥等）
4. 安装依赖包

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 Composition API 规范
- 使用 ESLint 和 Prettier 进行代码格式化
- 编写单元测试和集成测试

### 部署说明
- 前端构建为静态文件
- 后端使用 Docker 容器化部署
- 数据库使用 PostgreSQL
- 使用 Nginx 作为反向代理

## 快速导航

- [开始阅读技术文档](./question-generation)
- [查看产品文档](../product/)
- [了解API配置](../api/)
- [查看设计规范](../design/)

---

*如有技术问题，请联系开发团队。*
