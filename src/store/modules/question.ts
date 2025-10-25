// 题库管理状态

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { 
  Question, 
  QuestionBank, 
  QuestionGroup,
  QuestionCreateForm, 
  QuestionUpdateForm,
  QuestionSearchParams,
  QuestionListResponse
} from '@/types/course'
import { QuestionType, QuestionDifficulty } from '@/types/course'
import { createStorageService } from '@/shared/services/storage'
import { useUserStore } from './user'

export const useQuestionStore = defineStore('question', () => {
  // 状态
  const questions = ref<Question[]>([])
  const questionBanks = ref<QuestionBank[]>([])
  const questionGroups = ref<QuestionGroup[]>([])
  const currentQuestion = ref<Question | null>(null)
  const currentQuestionBank = ref<QuestionBank | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const questionCount = computed(() => questions.value.length)
  const questionBankCount = computed(() => questionBanks.value.length)
  
  // 按类型统计题目
  const questionsByType = computed(() => {
    const stats: Record<QuestionType, number> = {
      single: 0,
      multiple: 0,
      judge: 0,
      fill: 0,
      essay: 0
    }
    
    questions.value.forEach(q => {
      stats[q.type]++
    })
    
    return stats
  })
  
  // 按难度统计题目
  const questionsByDifficulty = computed(() => {
    const stats: Record<QuestionDifficulty, number> = {
      easy: 0,
      medium: 0,
      hard: 0
    }
    
    questions.value.forEach(q => {
      stats[q.difficulty]++
    })
    
    return stats
  })

  // 存储服务
  let storage = createStorageService()
  const userStore = useUserStore()

  // 初始化存储服务
  const initStorage = () => {
    const userId = userStore.userInfo?.userId || 'default'
    storage = createStorageService(userId)
  }

  // 初始化预置试题
  const initSampleQuestions = async (): Promise<void> => {
    try {
      initStorage()
      const existingQuestions = await storage.getQuestions()
      
      // 如果已有题目，跳过初始化
      if (existingQuestions.length > 0) {
        return
      }
      
      // 创建预置试题
      const sampleQuestions: Question[] = createSampleQuestions()
      
      // 保存所有预置题目
      for (const question of sampleQuestions) {
        await storage.saveQuestion(question)
      }
      
      console.log(`初始化了 ${sampleQuestions.length} 道预置题目`)
    } catch (error) {
      console.error('初始化预置题目失败:', error)
    }
  }

  // 创建预置试题数据
  const createSampleQuestions = (): Question[] => {
    const now = new Date().toISOString()
    const userId = userStore.userInfo?.userId || 'default'
    
    return [
      // Vue.js 课程 - 单选题 (3道)
      {
        id: 'q_vue_1',
        bankId: 'bank_vue',
        courseId: '1',
        chapterId: 'chapter_1_1',
        type: QuestionType.SINGLE,
        content: 'Vue.js 是什么类型的框架？',
        options: ['渐进式框架', '编程语言', '数据库系统', '服务器端框架'],
        answer: '渐进式框架',
        explanation: 'Vue.js是一个用于构建用户界面的渐进式JavaScript框架，可以逐步应用到项目中。',
        difficulty: QuestionDifficulty.EASY,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['Vue.js', '框架', '基础'],
        status: 'active'
      },
      {
        id: 'q_vue_2',
        bankId: 'bank_vue',
        courseId: '1',
        chapterId: 'chapter_1_1',
        type: QuestionType.SINGLE,
        content: '以下哪个命令可以创建一个新的Vue项目？',
        options: ['npm create vue', 'vue init', 'npm new vue', 'vue create'],
        answer: 'npm create vue',
        explanation: '在Vue 3中，推荐使用 npm create vue 命令来创建新项目，这是官方推荐的方式。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['Vue.js', '安装', '工具'],
        status: 'active'
      },
      {
        id: 'q_vue_3',
        bankId: 'bank_vue',
        courseId: '1',
        chapterId: 'chapter_1_2',
        type: QuestionType.SINGLE,
        content: 'Vue.js中用于条件渲染的指令是？',
        options: ['v-if', 'v-for', 'v-model', 'v-bind'],
        answer: 'v-if',
        explanation: 'v-if指令用于条件渲染，根据表达式的真假值来决定是否渲染元素。',
        difficulty: QuestionDifficulty.EASY,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['Vue.js', '指令', '条件渲染'],
        status: 'active'
      },
      
      // Vue.js 课程 - 多选题 (3道)
      {
        id: 'q_vue_4',
        bankId: 'bank_vue',
        courseId: '1',
        chapterId: 'chapter_1_2',
        type: QuestionType.MULTIPLE,
        content: '以下哪些是Vue.js的指令？（多选）',
        options: ['v-if', 'v-for', 'v-model', 'v-text'],
        answer: ['v-if', 'v-for', 'v-model', 'v-text'],
        explanation: '这些都是Vue.js的核心指令：v-if用于条件渲染，v-for用于列表渲染，v-model用于双向数据绑定，v-text用于更新元素文本。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['Vue.js', '指令', '模板'],
        status: 'active'
      },
      {
        id: 'q_vue_5',
        bankId: 'bank_vue',
        courseId: '1',
        chapterId: 'chapter_1_3',
        type: QuestionType.MULTIPLE,
        content: 'Vue组件可以接收哪些选项？（多选）',
        options: ['data', 'methods', 'computed', 'watch'],
        answer: ['data', 'methods', 'computed', 'watch'],
        explanation: 'Vue组件支持data（数据）、methods（方法）、computed（计算属性）、watch（侦听器）等选项。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['Vue.js', '组件', '选项'],
        status: 'active'
      },
      {
        id: 'q_vue_6',
        bankId: 'bank_vue',
        courseId: '1',
        chapterId: 'chapter_1_2',
        type: QuestionType.MULTIPLE,
        content: 'Vue.js的响应式系统特点包括？（多选）',
        options: ['数据变化时自动更新视图', '基于Object.defineProperty', '支持深度监听', '性能优化'],
        answer: ['数据变化时自动更新视图', '基于Object.defineProperty', '支持深度监听', '性能优化'],
        explanation: 'Vue.js的响应式系统通过Object.defineProperty实现数据劫持，当数据变化时自动更新视图，支持深度监听，并进行了性能优化。',
        difficulty: QuestionDifficulty.HARD,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['Vue.js', '响应式', '系统'],
        status: 'active'
      },
      
      // Vue.js 课程 - 判断题 (3道)
      {
        id: 'q_vue_7',
        bankId: 'bank_vue',
        courseId: '1',
        chapterId: 'chapter_1_1',
        type: QuestionType.JUDGE,
        content: 'Vue.js只能在浏览器环境中运行。',
        answer: '错误',
        explanation: 'Vue.js不仅可以在浏览器中运行，还可以通过SSR在服务器端运行，也可以在原生应用中通过Weex或NativeScript使用。',
        difficulty: QuestionDifficulty.EASY,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['Vue.js', '环境'],
        status: 'active'
      },
      {
        id: 'q_vue_8',
        bankId: 'bank_vue',
        courseId: '1',
        chapterId: 'chapter_1_2',
        type: QuestionType.JUDGE,
        content: 'v-model 指令用于实现数据的双向绑定。',
        answer: '正确',
        explanation: 'v-model是Vue.js提供的用于在表单元素上创建双向数据绑定的指令，它会在输入事件中更新数据。',
        difficulty: QuestionDifficulty.EASY,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['Vue.js', 'v-model', '双向绑定'],
        status: 'active'
      },
      {
        id: 'q_vue_9',
        bankId: 'bank_vue',
        courseId: '1',
        chapterId: 'chapter_1_3',
        type: QuestionType.JUDGE,
        content: 'Vue组件中的data必须是一个函数。',
        answer: '正确',
        explanation: '在Vue组件中，data必须是一个函数，这样可以确保每个组件实例都有独立的数据副本，避免数据共享问题。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['Vue.js', '组件', 'data'],
        status: 'active'
      },
      
      // Vue.js 课程 - 填空题 (3道)
      {
        id: 'q_vue_10',
        bankId: 'bank_vue',
        courseId: '1',
        chapterId: 'chapter_1_2',
        type: QuestionType.FILL,
        content: '在Vue中，使用{{ }}可以插入数据，这被称为 _____ 语法。',
        answer: '插值',
        explanation: '{{ }}是Vue.js的插值（Mustache）语法，用于将数据绑定到DOM文本中。',
        difficulty: QuestionDifficulty.EASY,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['Vue.js', '模板', '插值'],
        status: 'active'
      },
      {
        id: 'q_vue_11',
        bankId: 'bank_vue',
        courseId: '1',
        chapterId: 'chapter_1_3',
        type: QuestionType.FILL,
        content: '在Vue组件中，_____属性用于定义组件的数据。',
        answer: 'data',
        explanation: 'data是Vue组件的一个选项，用于定义组件的数据状态，必须是一个返回对象的函数。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['Vue.js', '组件', 'data'],
        status: 'active'
      },
      {
        id: 'q_vue_12',
        bankId: 'bank_vue',
        courseId: '1',
        chapterId: 'chapter_1_2',
        type: QuestionType.FILL,
        content: 'Vue.js使用_____来监听数据变化并更新视图。',
        answer: '响应式系统',
        explanation: 'Vue.js使用响应式系统来监听数据变化，当数据发生变化时自动更新相关的视图。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['Vue.js', '响应式', '系统'],
        status: 'active'
      },
      
      // TypeScript 课程 - 单选题 (3道)
      {
        id: 'q_ts_1',
        bankId: 'bank_ts',
        courseId: '2',
        chapterId: 'chapter_2_1',
        type: QuestionType.SINGLE,
        content: 'TypeScript 是 JavaScript 的什么？',
        options: ['超集', '子集', '替代品', '不同的语言'],
        answer: '超集',
        explanation: 'TypeScript是JavaScript的超集，包含了JavaScript的所有特性，并添加了类型系统和其他增强功能。',
        difficulty: QuestionDifficulty.EASY,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['TypeScript', '基础'],
        status: 'active'
      },
      {
        id: 'q_ts_2',
        bankId: 'bank_ts',
        courseId: '2',
        chapterId: 'chapter_2_2',
        type: QuestionType.SINGLE,
        content: '泛型在TypeScript中的作用是什么？',
        options: ['创建可重用的组件', '定义类型', '创建变量', '声明函数'],
        answer: '创建可重用的组件',
        explanation: '泛型允许我们创建可重用的组件，这些组件可以工作在多种数据类型上，而不是单一的数据类型。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['TypeScript', '泛型'],
        status: 'active'
      },
      {
        id: 'q_ts_3',
        bankId: 'bank_ts',
        courseId: '2',
        chapterId: 'chapter_2_3',
        type: QuestionType.SINGLE,
        content: '装饰器在TypeScript中用于什么？',
        options: ['添加元数据', '定义类型', '创建变量', '声明函数'],
        answer: '添加元数据',
        explanation: '装饰器是TypeScript中用于添加元数据的特殊声明，可以附加到类、方法、属性或参数上。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['TypeScript', '装饰器'],
        status: 'active'
      },
      
      // TypeScript 课程 - 多选题 (3道)
      {
        id: 'q_ts_4',
        bankId: 'bank_ts',
        courseId: '2',
        chapterId: 'chapter_2_1',
        type: QuestionType.MULTIPLE,
        content: '以下哪些是TypeScript的基本类型？（多选）',
        options: ['string', 'number', 'boolean', 'array'],
        answer: ['string', 'number', 'boolean', 'array'],
        explanation: 'TypeScript提供了多种基本类型，包括string（字符串）、number（数字）、boolean（布尔值）和array（数组）等。',
        difficulty: QuestionDifficulty.EASY,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['TypeScript', '类型系统'],
        status: 'active'
      },
      {
        id: 'q_ts_5',
        bankId: 'bank_ts',
        courseId: '2',
        chapterId: 'chapter_2_1',
        type: QuestionType.MULTIPLE,
        content: 'TypeScript的高级类型包括哪些？（多选）',
        options: ['联合类型', '交叉类型', '映射类型', '条件类型'],
        answer: ['联合类型', '交叉类型', '映射类型', '条件类型'],
        explanation: 'TypeScript的高级类型包括联合类型（Union Types）、交叉类型（Intersection Types）、映射类型（Mapped Types）和条件类型（Conditional Types）等。',
        difficulty: QuestionDifficulty.HARD,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['TypeScript', '高级类型'],
        status: 'active'
      },
      {
        id: 'q_ts_6',
        bankId: 'bank_ts',
        courseId: '2',
        chapterId: 'chapter_2_2',
        type: QuestionType.MULTIPLE,
        content: '泛型约束可以使用哪些关键字？（多选）',
        options: ['extends', 'keyof', 'in', 'typeof'],
        answer: ['extends', 'keyof'],
        explanation: '泛型约束主要使用extends关键字来限制泛型参数，keyof用于获取对象类型的键的联合类型。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['TypeScript', '泛型', '约束'],
        status: 'active'
      },
      
      // TypeScript 课程 - 判断题 (3道)
      {
        id: 'q_ts_7',
        bankId: 'bank_ts',
        courseId: '2',
        chapterId: 'chapter_2_1',
        type: QuestionType.JUDGE,
        content: 'TypeScript编译后的代码可以在任何JavaScript环境中运行。',
        answer: '正确',
        explanation: 'TypeScript代码会被编译成JavaScript代码，所以可以在任何支持JavaScript的环境中运行。',
        difficulty: QuestionDifficulty.EASY,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['TypeScript', '编译'],
        status: 'active'
      },
      {
        id: 'q_ts_8',
        bankId: 'bank_ts',
        courseId: '2',
        chapterId: 'chapter_2_2',
        type: QuestionType.JUDGE,
        content: '泛型只能在函数中使用。',
        answer: '错误',
        explanation: '泛型不仅可以在函数中使用，还可以在接口、类和类型别名中使用，提供更灵活的类型定义。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['TypeScript', '泛型'],
        status: 'active'
      },
      {
        id: 'q_ts_9',
        bankId: 'bank_ts',
        courseId: '2',
        chapterId: 'chapter_2_3',
        type: QuestionType.JUDGE,
        content: '装饰器是TypeScript的专有特性。',
        answer: '错误',
        explanation: '装饰器不是TypeScript的专有特性，它是ECMAScript的提案，TypeScript提供了实验性支持。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['TypeScript', '装饰器'],
        status: 'active'
      },
      
      // TypeScript 课程 - 填空题 (3道)
      {
        id: 'q_ts_10',
        bankId: 'bank_ts',
        courseId: '2',
        chapterId: 'chapter_2_2',
        type: QuestionType.FILL,
        content: '使用泛型时，通常用大写字母如_____来表示类型参数。',
        answer: 'T',
        explanation: '在TypeScript中，约定使用大写字母如T、U、V等来表示泛型类型参数，T是最常用的。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['TypeScript', '泛型'],
        status: 'active'
      },
      {
        id: 'q_ts_11',
        bankId: 'bank_ts',
        courseId: '2',
        chapterId: 'chapter_2_1',
        type: QuestionType.FILL,
        content: 'TypeScript使用_____来定义对象的结构。',
        answer: 'interface',
        explanation: 'interface是TypeScript中用于定义对象结构的主要方式，可以描述对象的形状和契约。',
        difficulty: QuestionDifficulty.EASY,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['TypeScript', 'interface'],
        status: 'active'
      },
      {
        id: 'q_ts_12',
        bankId: 'bank_ts',
        courseId: '2',
        chapterId: 'chapter_2_3',
        type: QuestionType.FILL,
        content: '装饰器使用_____符号来标记。',
        answer: '@',
        explanation: '装饰器使用@符号来标记，例如@decorator，这是装饰器的标准语法。',
        difficulty: QuestionDifficulty.EASY,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['TypeScript', '装饰器'],
        status: 'active'
      },
      
      // 简答题
      {
        id: 'q_ts_6',
        bankId: 'bank_ts',
        courseId: '2',
        chapterId: 'chapter_2_1',
        type: QuestionType.ESSAY,
        content: '解释TypeScript中interface和type的区别。',
        answer: 'interface和type的主要区别：1）interface主要用于定义对象结构，可以被extends和implements；type可以定义任何类型别名；2）interface可以声明合并，type不能；3）type支持联合类型、交叉类型等复杂类型；interface主要用于对象结构。',
        explanation: 'interface主要用于定义对象的形状，可以被扩展和实现；type则可以创建任何类型的别名，功能更广泛。',
        difficulty: QuestionDifficulty.HARD,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['TypeScript', 'interface', 'type'],
        status: 'active'
      },
      
      // 中国古代军事史课程 - 单选题 (3道)
      {
        id: 'q_military_1',
        bankId: 'bank_military',
        courseId: '3',
        chapterId: 'chapter_3_1',
        type: QuestionType.SINGLE,
        content: '中国古近代军事历史跨越了大约多少年的历史？',
        options: ['约2000年', '约3000年', '约4000年', '约5000年'],
        answer: '约4000年',
        explanation: '中国古近代军事历史可以追溯到公元前21世纪的夏朝，直至1949年新中国的成立，这一时期跨越了约4000年的历史长河。',
        difficulty: QuestionDifficulty.EASY,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['军事历史', '中国历史', '时间跨度'],
        status: 'active'
      },
      {
        id: 'q_military_2',
        bankId: 'bank_military',
        courseId: '3',
        chapterId: 'chapter_3_2',
        type: QuestionType.SINGLE,
        content: '铜器时代的主要兵器材料转变是什么？',
        options: ['从石器到铁器', '从石器到青铜', '从青铜到铁器', '从木器到石器'],
        answer: '从石器到青铜',
        explanation: '从石器时代进入铜器时代，是人类军事装备发展的重要里程碑，青铜作为新材料具有硬度高、韧性好的特点。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['军事装备', '铜器时代', '兵器材料'],
        status: 'active'
      },
      {
        id: 'q_military_3',
        bankId: 'bank_military',
        courseId: '3',
        chapterId: 'chapter_3_4',
        type: QuestionType.SINGLE,
        content: '火器时代开始于哪个朝代？',
        options: ['唐朝', '宋朝', '元朝', '明朝'],
        answer: '宋朝',
        explanation: '火器时代开始于宋朝，中国是世界上最早发明和使用火器的国家，宋朝时期火药开始应用于军事。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['军事装备', '火器时代', '宋朝'],
        status: 'active'
      },
      
      // 中国古代军事史课程 - 多选题 (3道)
      {
        id: 'q_military_4',
        bankId: 'bank_military',
        courseId: '3',
        chapterId: 'chapter_3_2',
        type: QuestionType.MULTIPLE,
        content: '铜器时代的近战兵器包括哪些？（多选）',
        options: ['青铜剑', '戈', '矛', '弩'],
        answer: ['青铜剑', '戈', '矛'],
        explanation: '铜器时代的近战兵器包括青铜剑、戈、矛、斧、钺等。弩属于远射兵器，不是近战兵器。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['军事装备', '近战兵器'],
        status: 'active'
      },
      {
        id: 'q_military_5',
        bankId: 'bank_military',
        courseId: '3',
        chapterId: 'chapter_3_3',
        type: QuestionType.MULTIPLE,
        content: '铁器时代的军事优势包括哪些？（多选）',
        options: ['武器更锋利', '成本更低', '大规模生产', '战术革新'],
        answer: ['武器更锋利', '成本更低', '大规模生产', '战术革新'],
        explanation: '铁器时代的军事优势包括武器更锋利、成本更低、能够大规模生产，以及由此带来的战术革新。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['军事装备', '铁器时代', '军事优势'],
        status: 'active'
      },
      {
        id: 'q_military_6',
        bankId: 'bank_military',
        courseId: '3',
        chapterId: 'chapter_3_4',
        type: QuestionType.MULTIPLE,
        content: '火器时代的早期火器包括哪些？（多选）',
        options: ['火铳', '火筒', '火箭', '火炮'],
        answer: ['火铳', '火筒', '火箭'],
        explanation: '火器时代的早期火器包括火铳、火筒、火箭等，火炮是后来发展的大型火器。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['军事装备', '火器时代', '早期火器'],
        status: 'active'
      },
      
      // 中国古代军事史课程 - 判断题 (3道)
      {
        id: 'q_military_7',
        bankId: 'bank_military',
        courseId: '3',
        chapterId: 'chapter_3_1',
        type: QuestionType.JUDGE,
        content: '中国古近代军事历史只包括汉族与其他民族的战争。',
        answer: '错误',
        explanation: '中国古近代军事历史不仅包括汉族与其他民族的战争，还涉及内部统一战争、外来侵扰以及民族融合发展等多个方面。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['军事历史', '民族关系'],
        status: 'active'
      },
      {
        id: 'q_military_8',
        bankId: 'bank_military',
        courseId: '3',
        chapterId: 'chapter_3_2',
        type: QuestionType.JUDGE,
        content: '青铜武器的出现标志着人类进入了铁器时代。',
        answer: '错误',
        explanation: '青铜武器的出现标志着人类进入了铜器时代，而不是铁器时代。铁器时代是在铜器时代之后。',
        difficulty: QuestionDifficulty.EASY,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['军事装备', '铜器时代', '铁器时代'],
        status: 'active'
      },
      {
        id: 'q_military_9',
        bankId: 'bank_military',
        courseId: '3',
        chapterId: 'chapter_3_5',
        type: QuestionType.JUDGE,
        content: '机械化时代的武器装备包括坦克和飞机。',
        answer: '正确',
        explanation: '机械化时代的武器装备确实包括坦克和飞机，这些新式武器改变了战争的方式和形态。',
        difficulty: QuestionDifficulty.EASY,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['军事装备', '机械化时代', '坦克', '飞机'],
        status: 'active'
      },
      
      // 中国古代军事史课程 - 填空题 (3道)
      {
        id: 'q_military_10',
        bankId: 'bank_military',
        courseId: '3',
        chapterId: 'chapter_3_2',
        type: QuestionType.FILL,
        content: '戈是先秦时期的主要兵器，具有_____、_____、_____的功能。',
        answer: '钩、啄、割',
        explanation: '戈是先秦时期的主要兵器，具有钩、啄、割等多种作战功能，是一种多功能兵器。',
        difficulty: QuestionDifficulty.HARD,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['军事装备', '戈'],
        status: 'active'
      },
      {
        id: 'q_military_11',
        bankId: 'bank_military',
        courseId: '3',
        chapterId: 'chapter_3_3',
        type: QuestionType.FILL,
        content: '铁器时代，_____的普及使大规模步兵成为可能。',
        answer: '铁制武器',
        explanation: '铁器时代，铁制武器的普及使大规模步兵成为可能，因为铁制武器成本更低，可以装备更多士兵。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['军事装备', '铁器时代', '步兵'],
        status: 'active'
      },
      {
        id: 'q_military_12',
        bankId: 'bank_military',
        courseId: '3',
        chapterId: 'chapter_3_4',
        type: QuestionType.FILL,
        content: '中国是世界上最早发明和使用_____的国家。',
        answer: '火器',
        explanation: '中国是世界上最早发明和使用火器的国家，火药的发明和应用标志着人类战争进入了热兵器时代。',
        difficulty: QuestionDifficulty.EASY,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['军事装备', '火器', '中国'],
        status: 'active'
      },
      
      // 简答题
      {
        id: 'q_military_6',
        bankId: 'bank_military',
        courseId: '3',
        chapterId: 'chapter_3_1',
        type: QuestionType.ESSAY,
        content: '简述中国古近代军事历史的主要特点。',
        answer: '中国古近代军事历史的主要特点包括：1）王朝更替与战争：各阶级、民族、政治集团通过战争完成新旧王朝的交替换代；2）内部统一战争与外来侵扰的博弈；3）民族融合与发展：汉族与其他少数民族的融合与发展；4）中国人民追求国家独立和民族复兴的历史。',
        explanation: '中国古近代军事历史体现了王朝更替、民族融合、国家独立和民族复兴等复杂的历史进程。',
        difficulty: QuestionDifficulty.HARD,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['军事历史', '历史特点'],
        status: 'active'
      },
      
      // 六年级语文上册课程 - 单选题 (3道)
      {
        id: 'q_chinese_1',
        bankId: 'bank_chinese',
        courseId: '4',
        chapterId: 'chapter_4_1',
        type: QuestionType.SINGLE,
        content: '六年级语文上册教材围绕什么构建？',
        options: ['核心素养', '考试成绩', '知识点', '课文数量'],
        answer: '核心素养',
        explanation: '六年级语文上册教材围绕核心素养构建，旨在培养学生的语言运用能力、思维能力、审美能力和文化传承能力。',
        difficulty: QuestionDifficulty.EASY,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['语文', '核心素养', '教材'],
        status: 'active'
      },
      {
        id: 'q_chinese_2',
        bankId: 'bank_chinese',
        courseId: '4',
        chapterId: 'chapter_4_2',
        type: QuestionType.SINGLE,
        content: '阅读分析课文时，首先应该做什么？',
        options: ['分析人物形象', '理解关键词句', '通读全文了解大意', '把握文章主题'],
        answer: '通读全文了解大意',
        explanation: '阅读分析课文时，应该先通读全文了解大意，理清文章结构，把握脉络，这是分析课文的基础。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['语文', '阅读理解', '方法'],
        status: 'active'
      },
      {
        id: 'q_chinese_3',
        bankId: 'bank_chinese',
        courseId: '4',
        chapterId: 'chapter_4_2',
        type: QuestionType.SINGLE,
        content: '《草原》这篇课文的体裁是什么？',
        options: ['记叙文', '说明文', '议论文', '散文'],
        answer: '散文',
        explanation: '《草原》是一篇写景散文，通过描写草原的壮美风光和草原人民的热情好客，抒发对草原的热爱之情。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['语文', '课文', '体裁'],
        status: 'active'
      },
      
      // 六年级语文上册课程 - 多选题 (3道)
      {
        id: 'q_chinese_4',
        bankId: 'bank_chinese',
        courseId: '4',
        chapterId: 'chapter_4_1',
        type: QuestionType.MULTIPLE,
        content: '六年级语文的核心素养包括哪些？（多选）',
        options: ['语言运用能力', '思维能力', '审美能力', '文化传承能力'],
        answer: ['语言运用能力', '思维能力', '审美能力', '文化传承能力'],
        explanation: '六年级语文的核心素养包括语言运用能力、思维能力、审美能力和文化传承能力四个方面。',
        difficulty: QuestionDifficulty.EASY,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['语文', '核心素养'],
        status: 'active'
      },
      {
        id: 'q_chinese_5',
        bankId: 'bank_chinese',
        courseId: '4',
        chapterId: 'chapter_4_1',
        type: QuestionType.MULTIPLE,
        content: '六年级语文上册的主要单元主题包括哪些？（多选）',
        options: ['走进自然，感受四季之美', '人文关怀，感受人间真情', '历史文化，传承民族精神', '科技创新，展望未来发展'],
        answer: ['走进自然，感受四季之美', '人文关怀，感受人间真情', '历史文化，传承民族精神', '科技创新，展望未来发展'],
        explanation: '六年级语文上册的主要单元主题包括走进自然感受四季之美、人文关怀感受人间真情、历史文化传承民族精神、科技创新展望未来发展等。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['语文', '单元主题'],
        status: 'active'
      },
      {
        id: 'q_chinese_6',
        bankId: 'bank_chinese',
        courseId: '4',
        chapterId: 'chapter_4_2',
        type: QuestionType.MULTIPLE,
        content: '阅读策略包括哪些方法？（多选）',
        options: ['精读与略读结合', '圈点批注', '思维导图', '死记硬背'],
        answer: ['精读与略读结合', '圈点批注', '思维导图'],
        explanation: '阅读策略包括精读与略读结合、圈点批注、思维导图等方法，死记硬背不是有效的阅读策略。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['语文', '阅读策略'],
        status: 'active'
      },
      
      // 六年级语文上册课程 - 判断题 (3道)
      {
        id: 'q_chinese_7',
        bankId: 'bank_chinese',
        courseId: '4',
        chapterId: 'chapter_4_1',
        type: QuestionType.JUDGE,
        content: '课前预习只需要标记生字词即可。',
        answer: '错误',
        explanation: '课前预习不仅需要标记生字词，还应该通读课文理解大意，查阅字典，思考课后问题，做好充分准备。',
        difficulty: QuestionDifficulty.EASY,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['语文', '学习方法', '预习'],
        status: 'active'
      },
      {
        id: 'q_chinese_8',
        bankId: 'bank_chinese',
        courseId: '4',
        chapterId: 'chapter_4_2',
        type: QuestionType.JUDGE,
        content: '《丁香结》这篇课文主要描写了丁香花的美丽。',
        answer: '正确',
        explanation: '《丁香结》这篇课文确实主要描写了丁香花的美丽，并由此联想到生活中的烦恼和忧愁，表达对人生的感悟。',
        difficulty: QuestionDifficulty.EASY,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['语文', '课文', '丁香结'],
        status: 'active'
      },
      {
        id: 'q_chinese_9',
        bankId: 'bank_chinese',
        courseId: '4',
        chapterId: 'chapter_4_1',
        type: QuestionType.JUDGE,
        content: '六年级语文学习只需要掌握课本内容就足够了。',
        answer: '错误',
        explanation: '六年级语文学习不仅要掌握课本内容，还需要拓展阅读，丰富积累，培养良好的学习习惯和思维方式。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['语文', '学习方法'],
        status: 'active'
      },
      
      // 六年级语文上册课程 - 填空题 (3道)
      {
        id: 'q_chinese_10',
        bankId: 'bank_chinese',
        courseId: '4',
        chapterId: 'chapter_4_1',
        type: QuestionType.FILL,
        content: '六年级语文上册教材围绕_____构建，旨在培养学生的语言运用能力、思维能力、审美能力和文化传承能力。',
        answer: '核心素养',
        explanation: '六年级语文上册教材围绕核心素养构建，这是现代语文教育的重要理念。',
        difficulty: QuestionDifficulty.EASY,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['语文', '核心素养'],
        status: 'active'
      },
      {
        id: 'q_chinese_11',
        bankId: 'bank_chinese',
        courseId: '4',
        chapterId: 'chapter_4_2',
        type: QuestionType.FILL,
        content: '阅读分析课文时，应该先_____全文了解大意，理清文章结构。',
        answer: '通读',
        explanation: '阅读分析课文时，应该先通读全文了解大意，这是分析课文的基础步骤。',
        difficulty: QuestionDifficulty.EASY,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['语文', '阅读方法'],
        status: 'active'
      },
      {
        id: 'q_chinese_12',
        bankId: 'bank_chinese',
        courseId: '4',
        chapterId: 'chapter_4_1',
        type: QuestionType.FILL,
        content: '课后复习应该做到及时复习、完成练习、_____阅读。',
        answer: '拓展',
        explanation: '课后复习应该做到及时复习、完成练习、拓展阅读，这样才能巩固知识并丰富积累。',
        difficulty: QuestionDifficulty.MEDIUM,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['语文', '学习方法', '复习'],
        status: 'active'
      },
      
      // 简答题
      {
        id: 'q_chinese_6',
        bankId: 'bank_chinese',
        courseId: '4',
        chapterId: 'chapter_4_1',
        type: QuestionType.ESSAY,
        content: '简述六年级语文上册的学习方法和策略。',
        answer: '六年级语文上册的学习方法包括：1）阅读策略：精读与略读结合、圈点批注、思维导图；2）表达策略：积累运用、仿写练习、创意写作；3）学习步骤：课前预习（通读课文、标记生字词、思考问题）、课堂学习（认真听讲、参与讨论、做好笔记）、课后复习（及时复习、完成练习、拓展阅读）。',
        explanation: '良好的学习方法和策略能够帮助学生更好地掌握语文知识，提高语文综合素养。',
        difficulty: QuestionDifficulty.HARD,
        createdAt: now,
        updatedAt: now,
        userId,
        tags: ['语文', '学习方法', '策略'],
        status: 'active'
      }
    ]
  }

  // 获取所有题目
  const fetchQuestions = async (params?: QuestionSearchParams): Promise<QuestionListResponse> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      
      // 初始化预置试题（如果还没有）
      await initSampleQuestions()
      
      let allQuestions = await storage.getQuestions()
      
      // 应用搜索和筛选
      if (params) {
        if (params.keyword) {
          allQuestions = allQuestions.filter(question => {
            const contentMatch = question.content.toLowerCase().includes(params.keyword!.toLowerCase())
            const answerMatch = Array.isArray(question.answer) 
              ? question.answer.some(ans => ans.toLowerCase().includes(params.keyword!.toLowerCase()))
              : question.answer.toLowerCase().includes(params.keyword!.toLowerCase())
            return contentMatch || answerMatch
          })
        }
        
        if (params.type) {
          allQuestions = allQuestions.filter(question => question.type === params.type)
        }
        
        if (params.difficulty) {
          allQuestions = allQuestions.filter(question => question.difficulty === params.difficulty)
        }
        
        if (params.chapterId) {
          allQuestions = allQuestions.filter(question => question.chapterId === params.chapterId)
        }
        
        if (params.courseId) {
          allQuestions = allQuestions.filter(question => question.courseId === params.courseId)
        }
      }
      
      questions.value = allQuestions
      
      // 分页处理
      const page = params?.page || 1
      const pageSize = params?.pageSize || 10
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const paginatedQuestions = allQuestions.slice(start, end)
      
      return {
        questions: paginatedQuestions,
        total: allQuestions.length,
        page,
        pageSize
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取题目列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取所有题库
  const fetchQuestionBanks = async (courseId?: string): Promise<QuestionBank[]> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      let allQuestionBanks = await storage.getQuestionBanks()
      
      if (courseId) {
        allQuestionBanks = allQuestionBanks.filter(qb => qb.courseId === courseId)
      }
      
      questionBanks.value = allQuestionBanks
      return allQuestionBanks
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取题库列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取单个题目
  const fetchQuestion = async (id: string): Promise<Question | null> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      const question = await storage.getQuestion(id)
      currentQuestion.value = question
      return question
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取题目失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取单个题库
  const fetchQuestionBank = async (id: string): Promise<QuestionBank | null> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      const questionBank = await storage.getQuestionBank(id)
      if (questionBank) {
        // 加载题库中的题目
        const bankQuestions = await storage.getQuestionsByBankId(id)
        questionBank.questions = bankQuestions
      }
      currentQuestionBank.value = questionBank
      return questionBank
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取题库失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 创建题目
  const createQuestion = async (questionForm: QuestionCreateForm, bankId: string): Promise<Question> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      const userStore = useUserStore()
      const userId = userStore.userInfo?.userId || 'default'
      
      // 确保 questions.value 已初始化
      if (!questions.value) {
        questions.value = []
      }
      
      const newQuestion: Question = {
        id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        bankId,
        chapterId: questionForm.chapterId,
        courseId: '', // 需要从题库中获取
        type: questionForm.type,
        content: questionForm.content,
        options: questionForm.options,
        answer: questionForm.answer,
        explanation: questionForm.explanation,
        difficulty: questionForm.difficulty,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId,
        correctCount: 0,
        totalCount: 0
      }
      
      // 获取题库信息以设置课程ID
      const questionBank = await storage.getQuestionBank(bankId)
      if (questionBank) {
        newQuestion.courseId = questionBank.courseId
      }
      
      await storage.saveQuestion(newQuestion)
      questions.value.push(newQuestion)
      currentQuestion.value = newQuestion
      
      return newQuestion
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建题目失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 批量创建题目
  const createQuestions = async (questions: QuestionCreateForm[], bankId: string): Promise<Question[]> => {
    try {
      loading.value = true
      error.value = null
      
      const createdQuestions: Question[] = []
      
      for (const questionForm of questions) {
        const question = await createQuestion(questionForm, bankId)
        createdQuestions.push(question)
      }
      
      return createdQuestions
    } catch (err) {
      error.value = err instanceof Error ? err.message : '批量创建题目失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新题目
  const updateQuestion = async (id: string, updateForm: QuestionUpdateForm): Promise<Question> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      const question = await storage.getQuestion(id)
      if (!question) {
        throw new Error('题目不存在')
      }
      
      const updatedQuestion: Question = {
        ...question,
        ...updateForm,
        updatedAt: new Date().toISOString()
      }
      
      await storage.saveQuestion(updatedQuestion)
      
      // 更新本地状态
      const index = questions.value.findIndex(q => q.id === id)
      if (index >= 0) {
        questions.value[index] = updatedQuestion
      }
      
      if (currentQuestion.value?.id === id) {
        currentQuestion.value = updatedQuestion
      }
      
      return updatedQuestion
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新题目失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除题目
  const deleteQuestion = async (id: string): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      await storage.deleteQuestion(id)
      
      // 确保 questions.value 已初始化
      if (!questions.value) {
        questions.value = []
      }
      
      // 更新本地状态
      questions.value = questions.value.filter(q => q.id !== id)
      
      if (currentQuestion.value?.id === id) {
        currentQuestion.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除题目失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 创建题库
  const createQuestionBank = async (courseId: string, name: string, description: string): Promise<QuestionBank> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      const userStore = useUserStore()
      const userId = userStore.userInfo?.userId || 'default'
      
      const newQuestionBank: QuestionBank = {
        id: `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        courseId,
        name,
        description,
        questions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId
      }
      
      await storage.saveQuestionBank(newQuestionBank)
      questionBanks.value.push(newQuestionBank)
      currentQuestionBank.value = newQuestionBank
      
      return newQuestionBank
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建题库失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除题库
  const deleteQuestionBank = async (id: string): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      await storage.deleteQuestionBank(id)
      
      // 更新本地状态
      questionBanks.value = questionBanks.value.filter(qb => qb.id !== id)
      
      if (currentQuestionBank.value?.id === id) {
        currentQuestionBank.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除题库失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 随机抽取题目
  const getRandomQuestions = async (
    courseId: string, 
    count: number, 
    options?: {
      chapterId?: string
      types?: QuestionType[]
      difficulties?: QuestionDifficulty[]
    }
  ): Promise<Question[]> => {
    try {
      initStorage()
      let allQuestions = await storage.getQuestionsByCourseId(courseId)
      
      // 应用筛选条件
      if (options) {
        if (options.chapterId) {
          allQuestions = allQuestions.filter(q => q.chapterId === options.chapterId)
        }
        
        if (options.types && options.types.length > 0) {
          allQuestions = allQuestions.filter(q => options.types!.includes(q.type))
        }
        
        if (options.difficulties && options.difficulties.length > 0) {
          allQuestions = allQuestions.filter(q => options.difficulties!.includes(q.difficulty))
        }
      }
      
      // 随机打乱并取指定数量
      const shuffled = allQuestions.sort(() => Math.random() - 0.5)
      return shuffled.slice(0, Math.min(count, shuffled.length))
    } catch (err) {
      console.error('随机抽取题目失败:', err)
      return []
    }
  }

  // 更新题目练习统计
  const updateQuestionStats = async (questionId: string, isCorrect: boolean): Promise<void> => {
    try {
      const question = await storage.getQuestion(questionId)
      if (question) {
        question.totalCount = (question.totalCount || 0) + 1
        if (isCorrect) {
          question.correctCount = (question.correctCount || 0) + 1
        }
        question.lastPracticedAt = new Date().toISOString()
        
        await storage.saveQuestion(question)
        
        // 更新本地状态
        const index = questions.value.findIndex(q => q.id === questionId)
        if (index >= 0) {
          questions.value[index] = question
        }
        
        if (currentQuestion.value?.id === questionId) {
          currentQuestion.value = question
        }
      }
    } catch (err) {
      console.error('更新题目统计失败:', err)
    }
  }

  // 设置当前题目
  const setCurrentQuestion = (question: Question | null) => {
    currentQuestion.value = question
  }

  // 设置当前题库
  const setCurrentQuestionBank = (questionBank: QuestionBank | null) => {
    currentQuestionBank.value = questionBank
  }

  // 清除错误
  const clearError = () => {
    error.value = null
  }

  // 批量添加题目
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addQuestions = async (questionsToAdd: any[]): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      const userStore = useUserStore()
      const userId = userStore.userInfo?.userId || 'default'
      
      // 确保 questions.value 已初始化
      if (!questions.value) {
        questions.value = []
      }
      
      // 加载现有题目（如果还没有加载）
      if (questions.value.length === 0) {
        const existingQuestions = await storage.getQuestions()
        questions.value = existingQuestions
      }
      
      // 创建默认题库（如果不存在）
      let defaultBank = questionBanks.value.find(bank => bank.name === '默认题库')
      if (!defaultBank) {
        defaultBank = await createQuestionBank('', '默认题库', '系统默认题库')
      }
      
      // 批量创建题目
      for (const questionData of questionsToAdd) {
        const newQuestion: Question = {
          id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          bankId: defaultBank.id,
          chapterId: questionData.chapterId || '',
          courseId: questionData.courseId || '',
          type: questionData.type,
          content: questionData.content,
          options: questionData.options,
          answer: questionData.answer,
          explanation: questionData.explanation,
          difficulty: questionData.difficulty,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId,
          correctCount: 0,
          totalCount: 0
        }
        
        await storage.saveQuestion(newQuestion)
        questions.value.push(newQuestion)
      }
      
      ElMessage.success(`成功添加 ${questionsToAdd.length} 道题目到题库`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '批量添加题目失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 临时题目状态管理
  const tempQuestions = ref<Question[]>([])
  const tempQuestionBanks = ref<QuestionBank[]>([])

  // 添加临时题目
  const addTempQuestion = (question: Question) => {
    tempQuestions.value.push(question)
  }

  // 批量添加临时题目
  const addTempQuestions = (questions: Question[]) => {
    tempQuestions.value.push(...questions)
  }

  // 清空临时题目
  const clearTempQuestions = () => {
    tempQuestions.value = []
  }

  // 保存临时题目到正式题库
  const saveTempQuestions = async (bankId: string): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      
      // 确保 questions.value 已初始化
      if (!questions.value) {
        questions.value = []
      }
      
      for (const question of tempQuestions.value) {
        question.bankId = bankId
        question.id = `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        question.createdAt = new Date().toISOString()
        question.updatedAt = new Date().toISOString()
        
        await storage.saveQuestion(question)
        questions.value.push(question)
      }
      
      clearTempQuestions()
      ElMessage.success(`成功保存 ${tempQuestions.value.length} 道题目`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '保存临时题目失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 题目编辑状态管理
  const editingQuestions = ref<Set<string>>(new Set())
  const questionEditHistory = ref<Map<string, Question>>(new Map())

  // 开始编辑题目
  const startEditQuestion = (questionId: string) => {
    editingQuestions.value.add(questionId)
    const question = questions.value.find(q => q.id === questionId)
    if (question) {
      questionEditHistory.value.set(questionId, { ...question })
    }
  }

  // 取消编辑题目
  const cancelEditQuestion = (questionId: string) => {
    editingQuestions.value.delete(questionId)
    const originalQuestion = questionEditHistory.value.get(questionId)
    if (originalQuestion) {
      const index = questions.value.findIndex(q => q.id === questionId)
      if (index >= 0) {
        questions.value[index] = { ...originalQuestion }
      }
      questionEditHistory.value.delete(questionId)
    }
  }

  // 完成编辑题目
  const finishEditQuestion = (questionId: string) => {
    editingQuestions.value.delete(questionId)
    questionEditHistory.value.delete(questionId)
  }

  // 检查题目是否正在编辑
  const isQuestionEditing = (questionId: string): boolean => {
    return editingQuestions.value.has(questionId)
  }

  // 批量删除题目
  const batchDeleteQuestions = async (questionIds: string[]) => {
    try {
      loading.value = true
      for (const id of questionIds) {
        await deleteQuestion(id)
      }
      await fetchQuestions()
    } catch (err) {
      error.value = '批量删除失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 批量更新题目
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const batchUpdateQuestions = async (questionIds: string[], updateData: any) => {
    try {
      loading.value = true
      for (const id of questionIds) {
        await updateQuestion(id, updateData)
      }
      await fetchQuestions()
    } catch (err) {
      error.value = '批量更新失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 添加题目到分组
  const addQuestionsToGroup = async (groupId: string, questionIds: string[]) => {
    try {
      loading.value = true
      // 这里需要实现具体的分组逻辑
      console.log('添加题目到分组:', groupId, questionIds)
    } catch (err) {
      error.value = '添加到分组失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取分组列表
  const fetchQuestionGroups = async () => {
    try {
      loading.value = true
      initStorage()
      const groups = await storage.getQuestionGroups()
      questionGroups.value = groups
    } catch (err) {
      error.value = '获取分组列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 创建分组
  const createQuestionGroup = async (data: Partial<QuestionGroup>) => {
    try {
      loading.value = true
      initStorage()
      const newGroup: QuestionGroup = {
        id: Date.now().toString(),
        name: data.name || '',
        description: data.description || '',
        courseId: data.courseId,
        questionCount: 0,
        questionIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'current-user' // 这里应该从用户store获取
      }
      
      questionGroups.value.push(newGroup)
      await storage.saveQuestionGroup(newGroup)
      return newGroup
    } catch (err) {
      error.value = '创建分组失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新分组
  const updateQuestionGroup = async (id: string, data: Partial<QuestionGroup>) => {
    try {
      loading.value = true
      initStorage()
      const index = questionGroups.value.findIndex(g => g.id === id)
      if (index > -1) {
        const updatedGroup = {
          ...questionGroups.value[index],
          ...data,
          updatedAt: new Date().toISOString()
        }
        questionGroups.value[index] = updatedGroup
        await storage.saveQuestionGroup(updatedGroup)
        return updatedGroup
      }
      throw new Error('分组不存在')
    } catch (err) {
      error.value = '更新分组失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除分组
  const deleteQuestionGroup = async (id: string) => {
    try {
      loading.value = true
      initStorage()
      const index = questionGroups.value.findIndex(g => g.id === id)
      if (index > -1) {
        questionGroups.value.splice(index, 1)
        await storage.deleteQuestionGroup(id)
      }
    } catch (err) {
      error.value = '删除分组失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    questions,
    questionBanks,
    questionGroups,
    currentQuestion,
    currentQuestionBank,
    loading,
    error,
    tempQuestions,
    tempQuestionBanks,
    editingQuestions,
    questionEditHistory,
    
    // 计算属性
    questionCount,
    questionBankCount,
    questionsByType,
    questionsByDifficulty,
    
    // 方法
    fetchQuestions,
    fetchQuestionBanks,
    fetchQuestion,
    fetchQuestionBank,
    createQuestion,
    createQuestions,
    updateQuestion,
    deleteQuestion,
    createQuestionBank,
    deleteQuestionBank,
    getRandomQuestions,
    updateQuestionStats,
    setCurrentQuestion,
    setCurrentQuestionBank,
    batchDeleteQuestions,
    batchUpdateQuestions,
    addQuestionsToGroup,
    fetchQuestionGroups,
    createQuestionGroup,
    updateQuestionGroup,
    deleteQuestionGroup,
    clearError,
    
    // 新增方法
    addQuestions,
    addTempQuestion,
    addTempQuestions,
    clearTempQuestions,
    saveTempQuestions,
    startEditQuestion,
    cancelEditQuestion,
    finishEditQuestion,
    isQuestionEditing
  }
})
