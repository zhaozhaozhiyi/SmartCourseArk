import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '智课方舟',
  description: '基于AI技术的在线教育平台',
  base: '/AIclassS/',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }]
  ],

  themeConfig: {
    logo: '/boat.png',
    
    nav: [
      { text: '首页', link: '/' },
      { text: '产品文档', link: '/product/' },
      { text: '技术文档', link: '/technical/' },
      { text: 'API文档', link: '/api/' },
      { text: '设计规范', link: '/design/' }
    ],

    sidebar: {
      '/product/': [
        {
          text: '产品文档',
          items: [
            { text: '产品概述', link: '/product/' },
            { text: '产品需求文档', link: '/product/prd' }
          ]
        }
      ],
      '/technical/': [
        {
          text: '技术文档',
          items: [
            { text: '题目生成设计', link: '/technical/question-generation' },
            { text: '题库管理优化', link: '/technical/question-bank-optimization' },
            { text: '数据统计指标', link: '/technical/data-statistics' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API文档',
          items: [
            { text: 'Kimi API配置', link: '/api/kimi-config' }
          ]
        }
      ],
      '/design/': [
        {
          text: '设计规范',
          items: [
            { text: '品牌设计规范', link: '/design/brand' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/AIclassS' }
    ],

    footer: {
      message: '智课方舟 - 让每一个学习者都能在知识的海洋中找到属于自己的方舟',
      copyright: 'Copyright © 2024 智课方舟团队'
    },

    search: {
      provider: 'local'
    }
  },

  markdown: {
    lineNumbers: true,
    theme: 'github-dark'
  }
})






