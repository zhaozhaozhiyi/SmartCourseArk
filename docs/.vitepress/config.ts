import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '智课方舟文档中心',
  description: '智能交互式课程创建工具 - 完整文档',
  
  // 网站基础配置
  base: '/docs/',
  lang: 'zh-CN',
  
  // 网站图标
  head: [
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '192x192', href: '/favicon-192.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '512x512', href: '/favicon-512.png' }],
    ['link', { rel: 'shortcut icon', href: '/favicon.ico' }]
  ],
  
  // 主题配置
  themeConfig: {
    // 网站标题
    siteTitle: '智课方舟',
    
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '产品文档', link: '/product/' },
      { text: '技术文档', link: '/technical/' },
      { text: 'API文档', link: '/api/' },
      { text: '设计规范', link: '/design/' }
    ],

    // 侧边栏
    sidebar: {
      '/product/': [
        {
          text: '产品需求文档',
          items: [
            { text: '产品概述', link: '/product/' },
            { text: 'PRD文档', link: '/product/prd' }
          ]
        }
      ],
      '/technical/': [
        {
          text: '技术规格文档',
          items: [
            { text: '技术概述', link: '/technical/' },
            { text: '题目生成设计', link: '/technical/question-generation' },
            { text: '题库管理优化', link: '/technical/question-bank-optimization' },
            { text: '数据统计指标', link: '/technical/data-statistics' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API配置文档',
          items: [
            { text: 'API概述', link: '/api/' },
            { text: 'Kimi API配置', link: '/api/kimi-config' }
          ]
        }
      ],
      '/design/': [
        {
          text: '设计规范文档',
          items: [
            { text: '设计概述', link: '/design/' },
            { text: '品牌设计规范', link: '/design/brand' },
            { text: '题目要求', link: '/design/requirements' }
          ]
        }
      ]
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/your-repo' }
    ],

    // 搜索配置
    search: {
      provider: 'local'
    },

    // 页脚
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024 智课方舟'
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/your-org/your-repo/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    // 最后更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  },

  // Markdown 配置
  markdown: {
    lineNumbers: true,
    theme: 'github-dark',
    // 支持 Mermaid 图表
    mermaid: true
  },

  // 构建配置
  build: {
    outDir: '../dist-docs'
  },

  // 开发服务器配置
  server: {
    port: 5173,
    host: true
  }
})
