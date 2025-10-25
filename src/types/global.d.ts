// 全局类型声明

// 环境变量类型
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 通用API响应类型
interface ApiResponse<T = any> {
  code: string
  msg: string
  data: T
}

// 分页参数类型
interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

// 分页响应类型
interface PaginationResponse<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 用户信息类型
interface UserInfo {
  userId: string
  username: string
  role: string
  permissions: string[]
  spaceId?: string
  spaceName?: string
}

// 菜单项类型
interface MenuItem {
  id: string
  name: string
  path: string
  icon?: string
  children?: MenuItem[]
  meta?: {
    title: string
    hidden?: boolean
    keepAlive?: boolean
  }
}

// 图谱数据类型
interface GraphNode {
  id: string
  label: string
  type: string
  properties?: Record<string, any>
  x?: number
  y?: number
}

interface GraphEdge {
  id: string
  source: string
  target: string
  label?: string
  type?: string
  properties?: Record<string, any>
}

interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

// 主题类型
type Theme = 'light' | 'dark'

// 布局类型
type Layout = 'vertical' | 'horizontal' | 'mix'

// 组件尺寸类型
type ComponentSize = 'large' | 'default' | 'small'

// 文件上传类型
interface UploadFile {
  name: string
  url: string
  size: number
  type: string
  status: 'ready' | 'uploading' | 'success' | 'error'
  progress?: number
}

// 表格列配置类型
interface TableColumn {
  prop: string
  label: string
  width?: number | string
  minWidth?: number | string
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean
  formatter?: (row: any, column: any, cellValue: any) => string
  render?: (row: any, column: any, cellValue: any) => any
}

// 表单规则类型
interface FormRule {
  required?: boolean
  message?: string
  trigger?: string | string[]
  validator?: (rule: any, value: any, callback: any) => void
  min?: number
  max?: number
  pattern?: RegExp
}

// 图表配置类型
interface ChartOption {
  title?: any
  tooltip?: any
  legend?: any
  grid?: any
  xAxis?: any
  yAxis?: any
  series?: any[]
  [key: string]: any
}

// 路由元信息类型
interface RouteMeta {
  title?: string
  icon?: string
  hidden?: boolean
  keepAlive?: boolean
  requiresAuth?: boolean
  permissions?: string[]
}

// 空间信息类型
interface SpaceInfo {
  id: string
  name: string
  description?: string
  isDefault?: boolean
  permissions?: string[]
}

// 任务状态类型
type TaskStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled'

// 任务信息类型
interface TaskInfo {
  id: string
  name: string
  status: TaskStatus
  progress: number
  startTime?: string
  endTime?: string
  error?: string
  result?: any
}

// 数据源类型
interface DataSource {
  id: string
  name: string
  type: 'mysql' | 'postgresql' | 'oracle' | 'mongodb' | 'elasticsearch' | 'file'
  host: string
  port: number
  database: string
  username: string
  password?: string
  status: 'connected' | 'disconnected' | 'error'
  lastSyncTime?: string
}

// 本体类型
interface Ontology {
  id: string
  name: string
  description?: string
  namespace: string
  classes: OntologyClass[]
  properties: OntologyProperty[]
  relationships: OntologyRelationship[]
  createdTime: string
  updatedTime: string
}

interface OntologyClass {
  id: string
  name: string
  label: string
  description?: string
  parent?: string
  properties: string[]
}

interface OntologyProperty {
  id: string
  name: string
  label: string
  type: string
  domain: string
  range: string
  description?: string
}

interface OntologyRelationship {
  id: string
  name: string
  label: string
  source: string
  target: string
  properties: string[]
  description?: string
}
