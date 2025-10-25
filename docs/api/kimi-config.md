---
title: Kimi API配置说明
description: Kimi API接口配置、环境变量设置和故障排除指南
---

# Kimi API 配置说明

## Kimi API 配置

为了使用AI生成课程大纲功能，您需要配置Kimi API密钥。

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

**注意：** 现在使用代理配置，`VITE_KIMI_BASE_URL` 应该设置为 `/v1`，而不是完整的URL。代理配置会自动将所有 `/v1` 开头的请求转发到 `https://api.moonshot.cn/v1`，包括：
- `/v1/files` - 文件上传和管理
- `/v1/chat/completions` - 聊天对话API
- `/v1/models` - 模型列表API

**重要提示：**
- 请将 `your_actual_api_key_here` 替换为您的实际API密钥
- 不要将 `.env.local` 文件提交到版本控制系统
- 确保API密钥的安全性

### 3. 重启开发服务器

配置完成后，重启开发服务器：

```bash
npm run dev
```

### 4. 验证配置

1. 访问课程创建页面
2. 上传一个文档文件
3. 点击"生成课程大纲"按钮
4. 如果配置正确，应该能看到AI生成的大纲

### 5. 故障排除

如果AI生成功能仍然不工作，请检查：

1. **API密钥是否正确**：确保复制的密钥完整且正确
2. **网络连接**：确保能够访问 `api.moonshot.cn`
3. **API配额**：检查您的API账户是否有足够的调用次数
4. **文件格式**：确保上传的文件格式被支持（PDF、DOC、DOCX、TXT）
5. **文件大小**：确保文件大小不超过50MB

### 6. 支持的模型

当前配置使用 `moonshot-v1-8k` 模型，您也可以根据需要修改为其他可用模型：

- `moonshot-v1-8k`
- `moonshot-v1-32k`
- `moonshot-v1-128k`

### 7. 费用说明

使用Kimi API会产生费用，具体费用请参考 [Moonshot AI 定价页面](https://platform.moonshot.cn/pricing)。

## API接口详情

### 文件上传接口

```typescript
POST /v1/files
Content-Type: multipart/form-data

// 请求参数
{
  file: File,           // 上传的文件
  purpose: "assistants" // 文件用途
}

// 响应格式
{
  "id": "file-xxx",
  "object": "file",
  "bytes": 12345,
  "created_at": 1234567890,
  "filename": "document.pdf",
  "purpose": "assistants"
}
```

### 聊天对话接口

```typescript
POST /v1/chat/completions
Content-Type: application/json

// 请求参数
{
  "model": "moonshot-v1-8k",
  "messages": [
    {
      "role": "system",
      "content": "你是一个专业的课程大纲生成助手..."
    },
    {
      "role": "user", 
      "content": "请基于以下文档内容生成课程大纲..."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 4000
}

// 响应格式
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "moonshot-v1-8k",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "生成的课程大纲内容..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 500,
    "total_tokens": 600
  }
}
```

### 模型列表接口

```typescript
GET /v1/models

// 响应格式
{
  "object": "list",
  "data": [
    {
      "id": "moonshot-v1-8k",
      "object": "model",
      "created": 1234567890,
      "owned_by": "moonshot"
    },
    {
      "id": "moonshot-v1-32k", 
      "object": "model",
      "created": 1234567890,
      "owned_by": "moonshot"
    }
  ]
}
```

## 错误处理

### 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 401 | 未授权 | 检查API密钥是否正确 |
| 403 | 禁止访问 | 检查API配额是否充足 |
| 429 | 请求过多 | 降低请求频率 |
| 500 | 服务器错误 | 稍后重试或联系技术支持 |

### 错误响应格式

```json
{
  "error": {
    "message": "错误描述",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

## 最佳实践

### 1. 请求频率控制
- 避免过于频繁的API调用
- 使用适当的重试机制
- 实现请求队列管理

### 2. 错误处理
- 实现完善的错误处理机制
- 提供用户友好的错误提示
- 记录详细的错误日志

### 3. 性能优化
- 合理设置请求超时时间
- 使用适当的模型参数
- 实现响应缓存机制

### 4. 安全考虑
- 保护API密钥安全
- 实现请求验证
- 监控异常访问

## 开发示例

### Node.js 调用示例

```javascript
const OpenAI = require("openai");
const fs = require("fs")
 
const client = new OpenAI({
    apiKey: "$MOONSHOT_API_KEY",  
    baseURL: "https://api.moonshot.cn/v1",
});
 
async function main() {
    // 上传文件 (支持 pdf, doc 以及图片等格式)
    let file_object = await client.files.create({
        file: fs.createReadStream("document.pdf"), 
        purpose: "file-extract"
    })
    
    // 获取文件内容
    let file_content = await (await client.files.content(file_object.id)).text()
 
    // 构建对话消息
    let messages = [
        {
            "role": "system",
            "content": "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。",
        },
        {
            "role": "system",
            "content": file_content,
        },
        {"role": "user", "content": "请基于这个文档生成课程大纲"},
    ]    
 
    const completion = await client.chat.completions.create({
        model: "moonshot-v1-8k",         
        messages: messages,
        temperature: 0.6
    });
    console.log(completion.choices[0].message.content);    
}
 
main();
```

### 前端调用示例

```typescript
// 文件上传
async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('purpose', 'assistants')
  
  const response = await fetch('/v1/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_KIMI_API_KEY}`
    },
    body: formData
  })
  
  return await response.json()
}

// 生成课程大纲
async function generateCourseOutline(fileId: string, content: string) {
  const response = await fetch('/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_KIMI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'moonshot-v1-8k',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的课程大纲生成助手，请根据文档内容生成结构化的课程大纲。'
        },
        {
          role: 'user',
          content: `请基于以下文档内容生成课程大纲：\n\n${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })
  })
  
  return await response.json()
}
```

### 后端代理配置

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/v1': {
        target: 'https://api.moonshot.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/v1/, '/v1')
      }
    }
  }
})
```

## 监控和日志

### 1. API调用监控
- 记录API调用次数和响应时间
- 监控错误率和成功率
- 设置告警阈值

### 2. 日志记录
- 记录详细的API调用日志
- 包含请求参数和响应结果
- 便于问题排查和性能分析

### 3. 性能指标
- 平均响应时间
- 成功率统计
- 错误分布分析

---

*最后更新时间: 2025-01-27*
*文档版本: v1.0*
