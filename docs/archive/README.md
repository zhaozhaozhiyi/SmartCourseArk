# 文档归档说明

## 归档原因

这些文档已经成功迁移到 VitePress 文档系统中，按照新的分类结构重新组织。原始文件已不再需要，但为了历史记录保留在此归档目录中。

## 归档文件列表

| 原始文件 | 新位置 | 状态 |
|---------|--------|------|
| `PRD.md` | `product/prd.md` | ✅ 已迁移 |
| `题目生成设计需求规格.md` | `technical/question-generation.md` | ✅ 已迁移 |
| `题库管理模块优化完成报告.md` | `technical/question-bank-optimization.md` | ✅ 已迁移 |
| `数据统计指标说明.md` | `technical/data-statistics.md` | ✅ 已迁移 |
| `API配置说明.md` | `api/kimi-config.md` | ✅ 已迁移 |
| `智课方品牌设计规范.md` | `design/brand.md` | ✅ 已迁移 |
| `题目要求.md` | `design/requirements.md` | ✅ 已迁移 |

## 新的文档结构

```
docs/
├── .vitepress/           # VitePress 配置
├── index.md              # 文档首页
├── product/              # 产品文档
│   ├── index.md
│   └── prd.md
├── technical/            # 技术文档
│   ├── index.md
│   ├── question-generation.md
│   ├── question-bank-optimization.md
│   └── data-statistics.md
├── api/                  # API文档
│   ├── index.md
│   └── kimi-config.md
├── design/               # 设计规范
│   ├── index.md
│   ├── brand.md
│   └── requirements.md
└── archive/              # 归档文件（本目录）
```

## 访问新文档

- **VitePress 开发服务器**: `npm run docs:dev` → http://localhost:5173/docs/
- **主应用集成**: 访问主应用 → 侧边栏 → 文档中心

## 保留文件

以下文件仍然保留在根目录，因为它们有特殊用途：

- `输入样例：义务教育教科书·语文六年级上册-节选.pdf` - 示例文件
- `KIMI_API.md` - Node.js 调用示例（已合并到 kimi-config.md）

## 归档时间

归档时间：2025-01-27

---

*如需恢复任何归档文件，请从本目录复制到相应位置。*
