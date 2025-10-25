// Kimi 模型配置常量

export const KIMI_MODELS = {
  // 长文本处理模型（适合文档解析、课程生成、章节内容、试题生成等）
  LONG_TEXT: 'moonshot-v1-128k',
  
  // 通用对话模型（适合问题生成、内容增强等）
  GENERAL: 'moonshot-v1-8k',
  
  // 预览模型（仅用于SVG生成）
  SVG_GENERATION: 'kimi-k2-0905-preview'
} as const

export type KimiModelType = typeof KIMI_MODELS[keyof typeof KIMI_MODELS]

// 根据用途获取推荐模型
export const getRecommendedModel = (purpose: 'svg' | 'question' | 'content' | 'document' | 'course' | 'chapter'): KimiModelType => {
  switch (purpose) {
    case 'svg':
      return KIMI_MODELS.SVG_GENERATION
    case 'question':
    case 'content':
    case 'document':
    case 'course':
    case 'chapter':
      return KIMI_MODELS.LONG_TEXT
    default:
      return KIMI_MODELS.LONG_TEXT
  }
}
