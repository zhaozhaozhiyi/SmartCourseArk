// 格式化工具函数

/**
 * 格式化日期时间
 * @param date 日期
 * @param format 格式，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export const formatDateTime = (date: Date | string | number, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化数字
 * @param num 数字
 * @param decimals 小数位数，默认2位
 * @returns 格式化后的数字字符串
 */
export const formatNumber = (num: number, decimals = 2): string => {
  if (isNaN(num)) return '0'
  return num.toFixed(decimals)
}

/**
 * 格式化百分比
 * @param num 数字
 * @param decimals 小数位数，默认1位
 * @returns 格式化后的百分比字符串
 */
export const formatPercent = (num: number, decimals = 1): string => {
  if (isNaN(num)) return '0%'
  return (num * 100).toFixed(decimals) + '%'
}

/**
 * 格式化货币
 * @param num 数字
 * @param currency 货币符号，默认'¥'
 * @param decimals 小数位数，默认2位
 * @returns 格式化后的货币字符串
 */
export const formatCurrency = (num: number, currency = '¥', decimals = 2): string => {
  if (isNaN(num)) return currency + '0.00'
  return currency + num.toFixed(decimals)
}

/**
 * 格式化手机号
 * @param phone 手机号
 * @returns 格式化后的手机号字符串
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  }
  return phone
}

/**
 * 格式化身份证号
 * @param idCard 身份证号
 * @returns 格式化后的身份证号字符串
 */
export const formatIdCard = (idCard: string): string => {
  if (!idCard) return ''
  const cleaned = idCard.replace(/\D/g, '')
  if (cleaned.length === 18) {
    return cleaned.replace(/(\d{6})(\d{8})(\d{4})/, '$1-$2-$3')
  }
  return idCard
}

/**
 * 格式化银行卡号
 * @param cardNumber 银行卡号
 * @returns 格式化后的银行卡号字符串
 */
export const formatBankCard = (cardNumber: string): string => {
  if (!cardNumber) return ''
  const cleaned = cardNumber.replace(/\D/g, '')
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ')
}

/**
 * 截断字符串
 * @param str 字符串
 * @param length 最大长度
 * @param suffix 后缀，默认'...'
 * @returns 截断后的字符串
 */
export const truncateString = (str: string, length: number, suffix = '...'): string => {
  if (!str || str.length <= length) return str
  return str.substring(0, length) + suffix
}

/**
 * 首字母大写
 * @param str 字符串
 * @returns 首字母大写的字符串
 */
export const capitalize = (str: string): string => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * 驼峰命名转换
 * @param str 字符串
 * @returns 驼峰命名字符串
 */
export const toCamelCase = (str: string): string => {
  if (!str) return ''
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

/**
 * 短横线命名转换
 * @param str 字符串
 * @returns 短横线命名字符串
 */
export const toKebabCase = (str: string): string => {
  if (!str) return ''
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

/**
 * 获取相对时间
 * @param date 日期
 * @returns 相对时间字符串
 */
export const getRelativeTime = (date: Date | string | number): string => {
  if (!date) return ''
  
  const now = new Date()
  const target = new Date(date)
  const diff = now.getTime() - target.getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前'
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前'
  } else if (diff < week) {
    return Math.floor(diff / day) + '天前'
  } else if (diff < month) {
    return Math.floor(diff / week) + '周前'
  } else if (diff < year) {
    return Math.floor(diff / month) + '个月前'
  } else {
    return Math.floor(diff / year) + '年前'
  }
}

/**
 * 格式化JSON字符串
 * @param obj 对象
 * @param indent 缩进空格数，默认2
 * @returns 格式化后的JSON字符串
 */
export const formatJSON = (obj: any, indent = 2): string => {
  try {
    return JSON.stringify(obj, null, indent)
  } catch (error) {
    return String(obj)
  }
}

/**
 * 解析JSON字符串
 * @param str JSON字符串
 * @param defaultValue 默认值
 * @returns 解析后的对象或默认值
 */
export const parseJSON = <T = any>(str: string, defaultValue: T): T => {
  try {
    return JSON.parse(str)
  } catch (error) {
    return defaultValue
  }
}

/**
 * 格式化日期（简化版本）
 * @param date 日期
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date | string | number): string => {
  return formatDateTime(date, 'YYYY-MM-DD HH:mm:ss')
}
