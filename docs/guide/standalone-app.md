# 单文件应用使用指南

## 简介

智课方舟单文件应用是一个独立的桌面应用，无需安装任何依赖，双击即可运行。应用内嵌了完整的前端界面、文档系统和HTTP服务器。

## 下载与安装

### Windows

1. 从 [GitHub Releases](https://github.com/your-repo/releases) 下载 `智课方舟_windows_amd64.exe`
2. 双击运行
3. 首次运行可能遇到Windows安全警告，点击"更多信息" → "仍要运行"

### macOS

1. 从 GitHub Releases 下载对应芯片版本的二进制文件：
   - Intel芯片：`智课方舟_darwin_amd64`
   - Apple Silicon（M1/M2/M3）：`智课方舟_darwin_arm64`
2. 首次运行需要添加执行权限：
   ```bash
   chmod +x 智课方舟_darwin_amd64  # 或 darwin_arm64
   ```
3. 首次运行可能被macOS阻止，右键点击文件 → "打开" → 确认打开

### Linux

1. 从 GitHub Releases 下载 `智课方舟_linux_amd64`
2. 添加执行权限：
   ```bash
   chmod +x 智课方舟_linux_amd64
   ```
3. 运行：
   ```bash
   ./智课方舟_linux_amd64
   ```

## 首次运行配置

1. 双击运行应用，会自动打开原生窗口
2. 首次使用需要配置Kimi API Key：
   - 进入应用设置
   - 输入您的Kimi API Key
   - 保存配置

### 获取Kimi API Key

1. 访问 [Moonshot AI官网](https://platform.moonshot.cn/)
2. 注册/登录账号
3. 在控制台创建API Key
4. 复制API Key到应用

## 功能使用

### 课程管理

- 创建课程：上传文档，AI自动解析生成课程
- 编辑课程：修改课程内容和结构
- 发布课程：生成可分享的课程链接

### 题库系统

- 自动生成题目：基于课程内容生成各类题型
- 题目管理：编辑、删除、分类题目
- 题目导出：导出为Excel或PDF

### 学习系统

- 章节式学习：按章节顺序学习
- 学习进度：实时跟踪学习进度
- 学习记录：查看历史学习记录

### 练习系统

- 章节练习：针对特定章节练习
- 综合练习：随机抽取题目练习
- 错题练习：重复练习错题

### 文档系统

在应用中访问 `/docs` 路径可以查看完整的使用文档和API说明。

## 常见问题

### Windows

**Q: 双击没有反应？**  
A: 可能需要以管理员身份运行，或者检查是否被杀毒软件拦截。

**Q: 防火墙提示是否允许？**  
A: 选择"允许"以允许应用访问网络（用于API调用）。

**Q: 出现"无法启动应用"错误？**  
A: 可能需要安装 Visual C++ Redistributable 和 .NET Framework。

### macOS

**Q: "无法打开，因为无法验证开发者"？**  
A: 右键点击应用 → "打开" → 确认打开。这是macOS的安全机制。

**Q: 提示"文件已损坏"？**  
A: 在终端运行：`xattr -d com.apple.quarantine "应用路径"`

**Q: 应用无法启动？**  
A: 检查是否安装了Xcode Command Line Tools：
```bash
xcode-select --install
```

### Linux

**Q: 缺少依赖库？**  
A: 需要安装WebKit GTK+：
```bash
# Ubuntu/Debian
sudo apt-get install libwebkit2gtk-4.0-dev

# CentOS/RHEL
sudo yum install webkit2gtk3-devel
```

**Q: 无法显示窗口？**  
A: 确保已安装桌面环境和必要的图形库。

## 更新与卸载

### 更新

1. 从GitHub Releases下载最新版本
2. 替换旧版本文件
3. 重新运行

### 卸载

- **Windows**: 直接删除.exe文件
- **macOS**: 直接删除二进制文件
- **Linux**: 直接删除二进制文件

**注意**: 应用使用本地存储（LocalStorage），不会在系统留下其他文件。如有需要，可以手动清理浏览器缓存。

## 高级配置

### 自定义端口

应用默认使用随机端口。如需手动指定：

1. 在应用启动前设置环境变量
2. 修改应用代码中的端口配置

### 开发模式

如需在开发模式下运行：

1. 克隆项目代码
2. 运行 `npm install` 安装依赖
3. 运行 `npm run dev` 启动开发服务器
4. 运行 `go run server.go` 启动后端（可选）

## 技术支持

- **问题反馈**: [GitHub Issues](https://github.com/your-repo/issues)
- **使用文档**: 应用内 `/docs` 路径
- **API文档**: 查看 `docs/api/` 目录

## 版本历史

查看 [GitHub Releases](https://github.com/your-repo/releases) 了解版本更新历史。
