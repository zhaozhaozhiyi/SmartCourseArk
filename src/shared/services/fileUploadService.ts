// 文件上传服务

import { createKimiAPI } from '@/shared/api/kimi'

interface FileUploadResult {
  fileId: string
  fileName: string
  fileSize: number
  fileType: string
}

export class FileUploadService {
  private kimiAPI = createKimiAPI()

  // 验证文件类型
  private validateFileType(file: File): boolean {
    const allowedTypes = [
      'application/pdf',
      'text/plain'
    ]
    return allowedTypes.includes(file.type)
  }

  // 验证文件大小
  private validateFileSize(file: File, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return file.size <= maxSizeBytes
  }

  // 上传文件
  async uploadFile(file: File): Promise<FileUploadResult> {
    try {
      // 验证文件类型
      if (!this.validateFileType(file)) {
        throw new Error('不支持的文件类型，只支持 PDF 和 TXT 文件')
      }

      // 验证文件大小
      if (!this.validateFileSize(file)) {
        throw new Error('文件大小不能超过 10MB')
      }

      // 上传到 Kimi API
      const uploadResponse = await this.kimiAPI.uploadFile(file)

      return {
        fileId: uploadResponse.id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      }
    } catch (error) {
      console.error('文件上传失败:', error)
      throw new Error(`文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 批量上传文件
  async uploadFiles(files: File[]): Promise<FileUploadResult[]> {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file))
      return await Promise.all(uploadPromises)
    } catch (error) {
      console.error('批量文件上传失败:', error)
      throw new Error(`批量文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 获取文件内容
  async getFileContent(fileId: string): Promise<string> {
    try {
      return await this.kimiAPI.getFileContent(fileId)
    } catch (error) {
      console.error('获取文件内容失败:', error)
      throw new Error(`获取文件内容失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 删除文件
  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.kimiAPI.deleteFile(fileId)
    } catch (error) {
      console.error('删除文件失败:', error)
      throw new Error(`删除文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 格式化文件大小
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 获取文件扩展名
  getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || ''
  }

  // 检查是否为支持的格式
  isSupportedFile(file: File): boolean {
    return this.validateFileType(file) && this.validateFileSize(file)
  }
}

export default FileUploadService
