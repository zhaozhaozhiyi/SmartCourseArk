// 课程相关类型定义

// 课程状态枚举
export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// 课程难度枚举
export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

// 课程模型
export interface Course {
  id: string
  title: string
  description: string
  level: CourseLevel
  status: CourseStatus
  chapters: Chapter[]
  questionBanks: QuestionBank[]
  objectives?: string[] // 学习目标
  createdAt: string
  updatedAt: string
  userId: string
  // 学习相关字段
  totalDuration?: number // 总学习时长（分钟）
  progress?: number // 学习进度（0-100）
  lastLearnedAt?: string // 最后学习时间
  // 文件相关字段
  uploadedFileId?: string // 上传到Kimi的文件ID
  uploadedFileName?: string // 原始文件名
}

// 章节模型
export interface Chapter {
  id: string
  courseId: string
  title: string
  description: string
  content: string
  orderIndex: number
  durationMinutes: number
  createdAt: string
  updatedAt: string
  // 学习相关字段
  isCompleted?: boolean // 是否已完成
  learnedDuration?: number // 已学习时长（分钟）
  lastLearnedAt?: string // 最后学习时间
  // 交互式内容字段
  interactiveContent?: string // AI生成或预制的SVG内容
  hasInteractiveContent?: boolean // 是否有交互式内容
  interactiveContentType?: 'prebuilt' | 'generated' // 内容来源类型
}

// 题库模型
export interface QuestionBank {
  id: string
  courseId: string
  name: string
  description: string
  questions: Question[]
  createdAt: string
  updatedAt: string
  userId: string
}

// 题库分组模型
export interface QuestionGroup {
  id: string
  name: string
  description: string
  courseId?: string
  questionCount: number
  questionIds: string[]
  createdAt: string
  updatedAt: string
  userId: string
}

// 题目类型枚举
export enum QuestionType {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
  JUDGE = 'judge',
  FILL = 'fill',
  ESSAY = 'essay'
}

// 题目难度枚举
export enum QuestionDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

// 题目模型
export interface Question {
  id: string
  bankId: string
  chapterId?: string
  courseId: string
  type: QuestionType
  content: string
  options?: string[] // 选项列表（单选、多选、判断题）
  answer: string | string[] // 正确答案
  explanation: string // 详细解析
  difficulty: QuestionDifficulty
  sourceContent?: string // 来源内容
  createdAt: string
  updatedAt: string
  userId: string
  // 练习相关字段
  correctCount?: number // 正确次数
  totalCount?: number // 总练习次数
  lastPracticedAt?: string // 最后练习时间
  // 新增字段
  tags?: string[]                   // 标签
  knowledgePoints?: string[]        // 知识点
  groupIds?: string[]               // 所属分组
  usageCount?: number               // 使用次数
  correctRate?: number              // 正确率
  source?: string                   // 来源（生成/导入/手动）
  status?: 'active' | 'archived'    // 状态
  qualityScore?: number             // 质量评分
  avgAnswerTime?: number            // 平均答题时间
  metadata?: Record<string, any>    // 元数据
}

// 练习系统相关类型
export interface PracticeSession {
  id: string;
  userId: string;
  courseId: string;
  questionBankId: string;
  startTime: string;
  endTime?: string;
  duration: number;
  score?: number;
  totalQuestions: number;
  answeredQuestions: number;
  correctQuestions: number;
  answers: { questionId: string; userAnswer: string | string[]; isCorrect: boolean }[];
  status: 'in_progress' | 'completed';
  createdAt: string;
  // 练习配置信息
  questionTypes?: QuestionType[];
}

export interface PracticeConfig {
  mode: 'comprehensive' | 'chapter' | 'wrong' | 'mock';
  courseId: string;
  questionBankId: string;
  questionCount?: number;
  difficulty?: QuestionDifficulty;
  questionTypes?: QuestionType[];
  timeLimit?: number; // 分钟
}

export interface PracticeResult {
  sessionId: string;
  score: number;
  totalQuestions: number;
  correctQuestions: number;
  incorrectQuestions: number;
  duration: number;
  answers: { questionId: string; userAnswer: string | string[]; isCorrect: boolean }[];
}

export type PracticeStatus = 'in_progress' | 'completed';

// 学习记录模型
export interface LearningRecord {
  id: string
  userId: string
  courseId: string
  chapterId: string
  questionId?: string
  userAnswer?: string
  isCorrect?: boolean
  score?: number
  duration?: number // 学习时长（秒）
  createdAt: string
  updatedAt: string
}

// 学习会话模型
export interface StudySession {
  id: string
  userId: string
  courseId: string
  chapterId?: string
  startTime: string
  endTime?: string
  durationMinutes: number
  questionsAnswered?: number
  correctAnswers?: number
  accuracyRate?: number
  status: 'active' | 'completed' | 'paused'
  createdAt: string
  updatedAt: string
}

// 练习会话模型（重命名避免冲突）
export interface PracticeSessionData {
  id: string
  userId: string
  courseId: string
  chapterId?: string
  questions: Question[]
  currentQuestionIndex: number
  answers: Record<string, string> // 用户答案
  startTime: string
  endTime?: string
  durationMinutes: number
  score?: number
  accuracyRate?: number
  status: 'active' | 'completed' | 'paused'
  mode: 'chapter' | 'comprehensive' | 'wrong' | 'mock'
  createdAt: string
  updatedAt: string
}

// 课程创建表单
export interface CourseCreateForm {
  title: string
  description: string
  level: CourseLevel
  file?: File
}

// 课程更新表单
export interface CourseUpdateForm {
  title?: string
  description?: string
  level?: CourseLevel
  status?: CourseStatus
  objectives?: string[]
  chapters?: Array<{
    title: string
    description: string
    content: string
    orderIndex: number
    durationMinutes: number
  }>
}

// 章节创建表单
export interface ChapterCreateForm {
  title: string
  description: string
  content: string
  orderIndex: number
  durationMinutes: number
}

// 章节更新表单
export interface ChapterUpdateForm {
  title?: string
  description?: string
  content?: string
  orderIndex?: number
  durationMinutes?: number
}

// 题目创建表单
export interface QuestionCreateForm {
  type: QuestionType
  content: string
  options?: string[]
  answer: string
  explanation: string
  difficulty: QuestionDifficulty
  chapterId?: string
}

// 题目更新表单
export interface QuestionUpdateForm {
  type?: QuestionType
  content?: string
  options?: string[]
  answer?: string
  explanation?: string
  difficulty?: QuestionDifficulty
}

// 练习配置（重命名避免冲突）
export interface PracticeConfigData {
  mode: 'chapter' | 'comprehensive' | 'wrong' | 'mock'
  chapterId?: string
  questionCount: number
  questionTypes: QuestionType[]
  difficulty?: QuestionDifficulty
  timeLimit?: number // 时间限制（分钟）
}

// 学习统计
export interface LearningStats {
  totalCourses: number
  completedCourses: number
  totalStudyTime: number // 总学习时长（分钟）
  totalPracticeCount: number
  averageScore: number
  lastStudyDate?: string
  weeklyStudyTime: number // 本周学习时长（分钟）
  monthlyStudyTime: number // 本月学习时长（分钟）
}

// 课程统计
export interface CourseStats {
  courseId: string
  totalStudyTime: number
  completedChapters: number
  totalChapters: number
  progress: number
  averageScore: number
  lastStudyDate?: string
  chapterStats: ChapterStats[]
}

// 章节统计
export interface ChapterStats {
  chapterId: string
  isCompleted: boolean
  studyTime: number
  practiceCount: number
  averageScore: number
  lastStudyDate?: string
}

// 练习统计
export interface PracticeStats {
  totalPractices: number
  totalQuestions: number
  correctAnswers: number
  averageScore: number
  averageTime: number // 平均答题时间（秒）
  byType: Record<QuestionType, {
    count: number
    correct: number
    averageScore: number
  }>
  byDifficulty: Record<QuestionDifficulty, {
    count: number
    correct: number
    averageScore: number
  }>
}

// 学习分析数据
export interface LearningAnalytics {
  userId: string
  stats: LearningStats
  courseStats: CourseStats[]
  practiceStats: PracticeStats
  weeklyProgress: Array<{
    date: string
    studyTime: number
    practiceCount: number
  }>
  monthlyProgress: Array<{
    month: string
    studyTime: number
    completedCourses: number
  }>
  weakPoints: Array<{
    chapterId: string
    chapterTitle: string
    errorRate: number
    practiceCount: number
  }>
}

// API响应类型
export interface CourseListResponse {
  courses: Course[]
  total: number
  page: number
  pageSize: number
}

export interface QuestionListResponse {
  questions: Question[]
  total: number
  page: number
  pageSize: number
}

// 搜索和筛选
export interface CourseSearchParams {
  keyword?: string
  level?: CourseLevel
  status?: CourseStatus
  page?: number
  pageSize?: number
}

export interface QuestionSearchParams {
  keyword?: string
  type?: QuestionType
  difficulty?: QuestionDifficulty
  chapterId?: string
  courseId?: string
  page?: number
  pageSize?: number
}
