# Windows 安装指南

## 快速开始

### 方法一：一键启动（推荐）

#### 使用批处理脚本
1. 双击 `start.bat` 文件
2. 按照提示操作即可

#### 使用 PowerShell 脚本
1. 右键点击 `start.ps1` 文件
2. 选择"使用 PowerShell 运行"
3. 按照提示操作即可

**如果遇到执行策略限制，请先运行：**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 方法二：手动安装

#### 1. 安装 Node.js
- 访问 [Node.js 官网](https://nodejs.org/)
- 下载 LTS 版本（推荐 22.x）
- 运行安装程序，按默认设置安装

#### 2. 验证安装
打开命令提示符或 PowerShell，运行：
```cmd
node --version
npm --version
```

#### 3. 安装项目依赖
在项目目录中运行：
```cmd
npm install
```

#### 4. 配置环境变量
1. 复制 `.env.example` 为 `.env`
2. 编辑 `.env` 文件，填入您的 Kimi API Key：
```env
VITE_KIMI_API_KEY=your-kimi-api-key-here
VITE_KIMI_BASE_URL=/v1
VITE_APP_NAME=智课方舟
```

#### 5. 启动应用
```cmd
npm run dev
```

访问 `http://localhost:3000` 查看应用。

## 常见问题

### Q: 双击 start.bat 没有反应？
A: 请尝试在命令提示符中运行：
```cmd
cd /d "项目路径"
start.bat
```

### Q: PowerShell 脚本无法执行？
A: 请运行以下命令设置执行策略：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q: Node.js 安装失败？
A: 请确保：
- 以管理员身份运行安装程序
- 关闭杀毒软件
- 检查网络连接

### Q: npm install 失败？
A: 请尝试：
```cmd
npm cache clean --force
npm install
```

### Q: 端口 3000 被占用？
A: 可以修改端口：
```cmd
npm run dev -- --port 3001
```

## 系统要求

- Windows 10 或更高版本
- 至少 4GB 内存
- 至少 1GB 可用磁盘空间
- 网络连接（用于下载依赖和调用 API）

## 获取帮助

如果遇到问题，请：
1. 查看控制台错误信息
2. 检查网络连接
3. 确认 Node.js 版本（需要 18+）
4. 查看项目 README.md 文件
