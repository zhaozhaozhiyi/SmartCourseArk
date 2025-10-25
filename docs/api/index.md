---
title: API文档
description: 智课方舟API接口配置和开发指南
---

# API文档

欢迎来到智课方舟API文档中心。这里包含了完整的API接口配置、环境设置和开发指南。

## 文档列表

### 🔌 API配置文档
- [Kimi API配置](./kimi-config) - Kimi API接口配置和环境变量设置

## API概述

### 核心API服务
- **Kimi API**: 基于Moonshot AI的大语言模型服务
- **文件上传**: 支持PDF、DOC、DOCX、TXT等格式
- **课程生成**: AI自动生成课程大纲和内容
- **题目生成**: 智能生成多种题型

### 技术架构
- **AI模型**: Moonshot AI (moonshot-v1-8k)
- **API协议**: RESTful API
- **认证方式**: API Key
- **响应格式**: JSON

## 快速开始

### 1. 获取API密钥
1. 访问 [Moonshot AI 官网](https://platform.moonshot.cn/)
2. 注册账号并登录
3. 在控制台中创建API密钥
4. 复制您的API密钥

### 2. 配置环境变量
在项目根目录创建 `.env.local` 文件：

```bash
# Kimi API 配置
VITE_KIMI_API_KEY=your_actual_api_key_here
VITE_KIMI_BASE_URL=/v1

# 应用配置
VITE_APP_TITLE=智课方舟
VITE_APP_ENV=development
```

### 3. 验证配置
1. 访问课程创建页面
2. 上传一个文档文件
3. 点击"生成课程大纲"按钮
4. 如果配置正确，应该能看到AI生成的大纲

## 支持的模型

当前配置使用以下模型：

- `moonshot-v1-8k` - 8K上下文长度
- `moonshot-v1-32k` - 32K上下文长度
- `moonshot-v1-128k` - 128K上下文长度

## 费用说明

使用Kimi API会产生费用，具体费用请参考 [Moonshot AI 定价页面](https://platform.moonshot.cn/pricing)。

## 故障排除

如果API功能不工作，请检查：

1. **API密钥是否正确**：确保复制的密钥完整且正确
2. **网络连接**：确保能够访问 `api.moonshot.cn`
3. **API配额**：检查您的API账户是否有足够的调用次数
4. **文件格式**：确保上传的文件格式被支持
5. **文件大小**：确保文件大小不超过50MB

## 快速导航

- [开始配置API](./kimi-config)
- [查看产品文档](../product/)
- [了解技术实现](../technical/)
- [查看设计规范](../design/)

---

*如有API相关问题，请联系技术团队。*
