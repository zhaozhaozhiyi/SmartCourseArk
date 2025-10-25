// 主题类型
export type Theme = 'light' | 'dark'

// 布局类型
export type Layout = 'vertical' | 'horizontal'

// 用户信息类型
export interface UserInfo {
  id: string
  username: string
  nickname: string
  avatar?: string
  email?: string
  phone?: string
  roles: string[]
  permissions: string[]
}

// 空间信息类型
export interface SpaceInfo {
  id: string
  name: string
  description?: string
  owner: string
  members: string[]
  settings: Record<string, any>
}

// 菜单项类型
export interface MenuItem {
  id: string
  title: string
  icon?: string
  path?: string
  children?: MenuItem[]
  meta?: {
    title: string
    icon: string
    hidden?: boolean
    requiresAuth?: boolean
  }
}

// 路由元信息类型
export interface RouteMeta {
  title: string
  icon?: string
  hidden?: boolean
  requiresAuth?: boolean
  roles?: string[]
  permissions?: string[]
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

// 分页参数类型
export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

// 分页响应类型
export interface PaginationResponse<T = any> {
  list: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// 表格列类型
export interface TableColumn {
  prop: string
  label: string
  width?: number | string
  minWidth?: number | string
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean
  formatter?: (row: any, column: any, cellValue: any, index: number) => string
}

// 表单规则类型
export interface FormRule {
  required?: boolean
  message?: string
  trigger?: string | string[]
  validator?: (rule: any, value: any, callback: any) => void
  min?: number
  max?: number
  pattern?: RegExp
}

// 图表数据类型
export interface ChartData {
  name: string
  value: number
  children?: ChartData[]
}

// 图谱节点类型
export interface GraphNode {
  id: string
  label: string
  type: string
  properties: Record<string, any>
  x?: number
  y?: number
}

// 图谱边类型
export interface GraphEdge {
  id: string
  source: string
  target: string
  label: string
  type: string
  properties: Record<string, any>
}

// 图谱数据类型
export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

// 搜索建议类型
export interface SearchSuggestion {
  id: string
  text: string
  type: string
  score: number
}

// 搜索结果类型
export interface SearchResult {
  id: string
  title: string
  description: string
  type: string
  score: number
  url?: string
}
