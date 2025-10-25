# 智课方舟 - 快速开始指南

## 🚀 一键启动

### 最简单的方式

```bash
# 方法一：直接运行脚本
./start.sh

# 方法二：使用 Make
make start
```

就这么简单！脚本会自动处理：
- ✅ 检测并安装 Node.js（如果需要）
- ✅ 安装项目依赖
- ✅ 创建环境配置文件
- ✅ 启动开发服务器

## 📋 脚本功能详解

### 自动检测和安装 Node.js

脚本会智能检测系统类型并提供多种安装方式：

**macOS 系统：**
- 使用 nvm 安装（推荐）- 可管理多个 Node.js 版本
- 使用 Homebrew 安装 - 系统级安装

**Linux 系统：**
- 自动使用 nvm 安装

**Windows 系统：**
- 提示手动安装 Node.js

### 交互式配置

1. **Node.js 安装选择**：如果未安装 Node.js，脚本会询问是否自动安装
2. **环境配置**：如果不存在 `.env` 文件，会询问是否创建默认配置
3. **版本检查**：自动检测 Node.js 版本，如果版本过低会提示升级

## 🛠️ 其他可用命令

### 使用 Make

```bash
make help       # 查看所有可用命令
make dev        # 快速启动（跳过检查）
make install    # 仅安装依赖
make build      # 构建生产版本
make clean      # 清理依赖和构建产物
make test       # 运行代码检查
```

### 使用 npm

```bash
npm run dev         # 启动开发服务器
npm run build       # 构建生产版本
npm run preview     # 预览生产版本
npm run lint        # 代码检查
npm run type-check  # 类型检查
```

## ⚙️ 环境配置

### 获取 Kimi API Key

1. 访问 [Moonshot AI 平台](https://platform.moonshot.cn/)
2. 注册/登录账号
3. 创建 API Key
4. 将 API Key 填入 `.env` 文件

### 环境变量说明

```env
VITE_KIMI_API_KEY=your-kimi-api-key-here  # Kimi API 密钥
VITE_KIMI_BASE_URL=/v1                    # API 基础路径
VITE_APP_NAME=智课方舟                     # 应用名称
```

## 🔧 故障排除

### 问题 1: 脚本没有执行权限

```bash
chmod +x start.sh
```

### 问题 2: Node.js 版本过低

脚本会自动检测并提示升级，或手动升级：

```bash
# 使用 nvm 升级（推荐）
nvm install 22
nvm use 22

# 使用 Homebrew 升级（macOS）
brew upgrade node
```

### 问题 3: npm 安装失败

```bash
# 清除缓存
npm cache clean --force

# 重新安装
rm -rf node_modules package-lock.json
npm install
```

### 问题 4: 端口被占用

修改 `vite.config.ts` 中的端口配置：

```typescript
server: {
  port: 3001, // 改为其他端口
}
```

## 📚 更多资源

- [完整文档](./README.md) - 查看完整项目文档
- [产品文档](./docs/product/index.md) - 产品功能说明
- [技术文档](./docs/technical/index.md) - 技术实现细节
- [API 文档](./docs/api/index.md) - API 接口说明

## 💡 提示

- **首次使用**：推荐使用 `./start.sh` 或 `make start`，会自动处理所有初始化工作
- **日常开发**：使用 `make dev` 快速启动
- **生产部署**：使用 `make build` 构建，`make preview` 预览

---

需要帮助？请查看 [README.md](./README.md) 或提交 Issue。
