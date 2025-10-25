# API 配置说明

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
VITE_APP_TITLE=智课方知识图谱平台
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
