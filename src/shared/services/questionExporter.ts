// 题目导出服务
import type { Question } from '@/types/course'

export interface ExportOptions {
  format: 'excel' | 'word' | 'pdf' | 'csv'
  includeAnswers: boolean
  includeExplanations: boolean
  includeMetadata: boolean
  groupByType?: boolean
  groupByDifficulty?: boolean
}

export class QuestionExporter {
  /**
   * 导出题目到Excel
   */
  static async exportToExcel(questions: Question[], options: ExportOptions): Promise<void> {
    try {
      // 动态导入xlsx库
      const XLSX = await import('xlsx')
      
      // 准备数据
      const worksheetData = this.prepareExcelData(questions, options)
      
      // 创建工作簿
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
      
      // 设置列宽
      const colWidths = [
        { wch: 10 }, // 序号
        { wch: 15 }, // 题型
        { wch: 10 }, // 难度
        { wch: 50 }, // 题目内容
        { wch: 20 }, // 选项A
        { wch: 20 }, // 选项B
        { wch: 20 }, // 选项C
        { wch: 20 }, // 选项D
        { wch: 15 }, // 答案
        { wch: 30 }, // 解析
        { wch: 20 }, // 标签
        { wch: 15 }, // 创建时间
      ]
      worksheet['!cols'] = colWidths
      
      // 添加工作表
      XLSX.utils.book_append_sheet(workbook, worksheet, '题目列表')
      
      // 生成文件名
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const filename = `题目列表_${timestamp}.xlsx`
      
      // 下载文件
      XLSX.writeFile(workbook, filename)
      
    } catch (error) {
      console.error('Excel导出失败:', error)
      throw new Error('Excel导出失败，请检查浏览器是否支持文件下载')
    }
  }

  /**
   * 导出题目到Word
   */
  static async exportToWord(questions: Question[], options: ExportOptions): Promise<void> {
    try {
      // 动态导入docx库
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx')
      
      // 准备文档内容
      const doc = new Document({
        sections: [{
          properties: {},
          children: this.prepareWordContent(questions, options, doc)
        }]
      })
      
      // 生成文件
      const buffer = await Packer.toBuffer(doc)
      
      // 创建下载链接
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      link.download = `题目列表_${timestamp}.docx`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Word导出失败:', error)
      throw new Error('Word导出失败，请检查浏览器是否支持文件下载')
    }
  }

  /**
   * 导出题目到PDF
   */
  static async exportToPDF(questions: Question[], options: ExportOptions): Promise<void> {
    try {
      // 动态导入jsPDF库
      const { jsPDF } = await import('jspdf')
      await import('jspdf-autotable')
      
      const doc = new jsPDF()
      
      // 添加标题
      doc.setFontSize(16)
      doc.text('题目列表', 14, 22)
      
      // 准备表格数据
      const tableData = this.preparePDFData(questions, options)
      
      // 添加表格
      ;(doc as any).autoTable({
        head: [['序号', '题型', '难度', '题目内容', '选项A', '选项B', '选项C', '选项D', '答案', '解析']],
        body: tableData,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      })
      
      // 生成文件名并下载
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const filename = `题目列表_${timestamp}.pdf`
      doc.save(filename)
      
    } catch (error) {
      console.error('PDF导出失败:', error)
      throw new Error('PDF导出失败，请检查浏览器是否支持文件下载')
    }
  }

  /**
   * 导出题目到CSV
   */
  static async exportToCSV(questions: Question[], options: ExportOptions): Promise<void> {
    try {
      // 准备数据
      const csvData = this.prepareCSVData(questions, options)
      
      // 创建Blob对象，添加UTF-8 BOM确保Excel正确识别中文
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvData], { type: 'text/csv;charset=utf-8;' })
      
      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // 生成文件名
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      link.download = `题目列表_${timestamp}.csv`
      
      // 触发下载
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('CSV导出失败:', error)
      throw new Error('CSV导出失败，请检查浏览器是否支持文件下载')
    }
  }

  /**
   * 准备Excel数据
   */
  private static prepareExcelData(questions: Question[], options: ExportOptions): any[][] {
    const headers = ['序号', '题型', '难度', '题目内容']
    
    // 添加选项列（如果有选择题）
    const hasOptions = questions.some(q => q.options && q.options.length > 0)
    if (hasOptions) {
      headers.push('选项A', '选项B', '选项C', '选项D')
    }
    
    // 添加答案和解析
    if (options.includeAnswers) {
      headers.push('答案')
    }
    if (options.includeExplanations) {
      headers.push('解析')
    }
    
    // 添加元数据
    if (options.includeMetadata) {
      headers.push('标签', '创建时间')
    }
    
    const data = [headers]
    
    questions.forEach((question, index) => {
      const row = [
        index + 1,
        this.getTypeText(question.type),
        this.getDifficultyText(question.difficulty),
        question.content
      ]
      
      // 添加选项
      if (hasOptions) {
        const options = question.options || []
        row.push(
          options[0] || '',
          options[1] || '',
          options[2] || '',
          options[3] || ''
        )
      }
      
      // 添加答案和解析
      if (options.includeAnswers) {
        row.push(question.answer)
      }
      if (options.includeExplanations) {
        row.push(question.explanation)
      }
      
      // 添加元数据
      if (options.includeMetadata) {
        row.push(
          (question.tags || []).join(', '),
          new Date(question.createdAt).toLocaleDateString()
        )
      }
      
      data.push(row)
    })
    
    return data
  }

  /**
   * 准备Word内容
   */
  private static prepareWordContent(questions: Question[], options: ExportOptions, docx: any): any[] {
    const content: any[] = []
    
    // 添加标题
    content.push(
      new docx.Paragraph({
        text: '题目列表',
        heading: docx.HeadingLevel.TITLE,
        alignment: docx.AlignmentType.CENTER
      })
    )
    
    // 添加题目
    questions.forEach((question, index) => {
      // 题目序号和内容
      content.push(
        new docx.Paragraph({
          text: `${index + 1}. ${question.content}`,
          heading: docx.HeadingLevel.HEADING_2
        })
      )
      
      // 题型和难度
      content.push(
        new docx.Paragraph({
          text: `题型：${this.getTypeText(question.type)} | 难度：${this.getDifficultyText(question.difficulty)}`,
          style: 'caption'
        })
      )
      
      // 选项（如果有）
      if (question.options && question.options.length > 0) {
        question.options.forEach((option, optionIndex) => {
          if (option) {
            content.push(
              new docx.Paragraph({
                text: `${String.fromCharCode(65 + optionIndex)}. ${option}`,
                indent: { left: 720 }
              })
            )
          }
        })
      }
      
      // 答案和解析
      if (options.includeAnswers) {
        // 处理answer可能是数组的情况
        const answerText = Array.isArray(question.answer) 
          ? question.answer.join(', ')
          : String(question.answer || '')
        
        content.push(
          new docx.Paragraph({
            text: `答案：${answerText}`,
            style: 'caption'
          })
        )
      }
      
      if (options.includeExplanations) {
        const explanationText = String(question.explanation || '')
        content.push(
          new docx.Paragraph({
            text: `解析：${explanationText}`,
            style: 'caption'
          })
        )
      }
      
      // 分隔线
      content.push(
        new docx.Paragraph({
          text: '',
          spacing: { after: 200 }
        })
      )
    })
    
    return content
  }

  /**
   * 准备PDF数据
   */
  private static preparePDFData(questions: Question[], options: ExportOptions): any[][] {
    return questions.map((question, index) => {
      const row = [
        index + 1,
        this.getTypeText(question.type),
        this.getDifficultyText(question.difficulty),
        question.content.substring(0, 50) + (question.content.length > 50 ? '...' : ''),
        (question.options?.[0] || '').substring(0, 20),
        (question.options?.[1] || '').substring(0, 20),
        (question.options?.[2] || '').substring(0, 20),
        (question.options?.[3] || '').substring(0, 20),
        question.answer.substring(0, 20),
        question.explanation.substring(0, 30)
      ]
      
      return row
    })
  }

  /**
   * 获取题型文本
   */
  private static getTypeText(type: string): string {
    const typeMap: Record<string, string> = {
      single: '单选题',
      multiple: '多选题',
      judge: '判断题',
      fill: '填空题',
      essay: '简答题'
    }
    return typeMap[type] || type
  }

  /**
   * 获取难度文本
   */
  private static getDifficultyText(difficulty: string): string {
    const difficultyMap: Record<string, string> = {
      easy: '简单',
      medium: '中等',
      hard: '困难'
    }
    return difficultyMap[difficulty] || difficulty
  }

  /**
   * 准备CSV数据
   */
  private static prepareCSVData(questions: Question[], options: ExportOptions): string {
    const rows: string[] = []
    
    // 构建表头
    const headers = ['序号', '题型', '难度', '题目内容']
    
    // 检查是否有选项
    const hasOptions = questions.some(q => q.options && q.options.length > 0)
    if (hasOptions) {
      headers.push('选项A', '选项B', '选项C', '选项D')
    }
    
    if (options.includeAnswers) {
      headers.push('答案')
    }
    if (options.includeExplanations) {
      headers.push('解析')
    }
    
    if (options.includeMetadata) {
      headers.push('标签', '创建时间')
    }
    
    // 添加表头
    rows.push(headers.map(h => this.escapeCSV(h)).join(','))
    
    // 添加数据行
    questions.forEach((question, index) => {
      const row: string[] = [
        String(index + 1),
        this.getTypeText(question.type),
        this.getDifficultyText(question.difficulty),
        this.escapeCSV(String(question.content || ''))
      ]
      
      // 添加选项
      if (hasOptions) {
        const qOptions = question.options || []
        row.push(
          this.escapeCSV(qOptions[0] || ''),
          this.escapeCSV(qOptions[1] || ''),
          this.escapeCSV(qOptions[2] || ''),
          this.escapeCSV(qOptions[3] || '')
        )
      }
      
      // 添加答案和解析
      if (options.includeAnswers) {
        // 处理answer可能是数组的情况
        const answerText = Array.isArray(question.answer) 
          ? question.answer.join(', ')
          : String(question.answer || '')
        row.push(this.escapeCSV(answerText))
      }
      if (options.includeExplanations) {
        row.push(this.escapeCSV(String(question.explanation || '')))
      }
      
      // 添加元数据
      if (options.includeMetadata) {
        row.push(
          this.escapeCSV((question.tags || []).join('; ')),
          new Date(question.createdAt).toLocaleDateString()
        )
      }
      
      rows.push(row.join(','))
    })
    
    return rows.join('\n')
  }

  /**
   * CSV转义处理
   */
  private static escapeCSV(text: string | number): string {
    if (text === undefined || text === null) {
      return ''
    }
    
    const str = String(text)
    
    // 如果包含逗号、引号或换行符，需要用引号包围
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      // 将内容中的引号转义为两个引号
      return `"${str.replace(/"/g, '""')}"`
    }
    
    return str
  }
}
