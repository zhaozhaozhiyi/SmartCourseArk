<template>
  <el-dialog
    v-model="visible"
    width="900px"
    top="80px"
    :close-on-click-modal="false"
    class="edit-dialog"
    :show-close="false"
  >
    <div class="dialog-content">
      <div class="dialog-header">
        <h3 class="dialog-title">
          <el-icon><Edit /></el-icon>
          编辑课程信息
        </h3>
        <p class="dialog-subtitle">您可以修改课程内容，让课程更符合您的需求</p>
      </div>
        
      <div class="dialog-body">
        <el-form
          ref="editFormRef"
          :model="editForm"
          :rules="editFormRules"
          label-width="100px"
          label-position="top"
          class="edit-form"
          v-loading="loading"
        >
          <!-- 基础信息区域 -->
          <div class="form-section">
            <h4 class="section-title">基础信息</h4>
            
            <el-form-item label="课程标题" prop="title">
              <el-input
                v-model="editForm.title"
                placeholder="请输入课程标题"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="课程描述" prop="description">
              <el-input
                v-model="editForm.description"
                type="textarea"
                :rows="4"
                placeholder="请输入课程描述"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <div class="form-row">
              <el-form-item label="难度级别" prop="level" class="form-col">
                <el-select v-model="editForm.level" placeholder="请选择难度级别" style="width: 100%">
                  <el-option label="初级" value="beginner" />
                  <el-option label="中级" value="intermediate" />
                  <el-option label="高级" value="advanced" />
                </el-select>
              </el-form-item>

              <el-form-item label="课程状态" prop="status" class="form-col">
                <el-select v-model="editForm.status" placeholder="请选择课程状态" style="width: 100%">
                  <el-option label="草稿" value="draft" />
                  <el-option label="已发布" value="published" />
                  <el-option label="已归档" value="archived" />
                </el-select>
              </el-form-item>
            </div>
          </div>

          <!-- 学习目标区域 -->
          <div class="form-section">
            <h4 class="section-title">学习目标</h4>
            <div class="objectives-edit">
              <div 
                v-for="(_, index) in editForm.objectives" 
                :key="index" 
                class="objective-edit-item"
              >
                <el-input
                  v-model="editForm.objectives[index]"
                  :placeholder="`学习目标 ${index + 1}`"
                  maxlength="200"
                  show-word-limit
                  size="large"
                />
                <el-button 
                  type="danger" 
                  :icon="Delete" 
                  circle 
                  size="large"
                  @click="removeObjective(index)"
                  :disabled="editForm.objectives.length <= 1"
                />
              </div>
              <el-button 
                type="primary" 
                :icon="Plus" 
                size="large"
                @click="addObjective"
                :disabled="editForm.objectives.length >= 10"
                class="add-objective-btn"
              >
                添加学习目标
              </el-button>
            </div>
          </div>

          <!-- 课程章节区域 -->
          <div class="form-section">
            <h4 class="section-title">课程章节</h4>
            <div class="chapters-edit">
              <div 
                v-for="(chapter, index) in editForm.chapters" 
                :key="index" 
                class="chapter-edit-item"
              >
                <div class="chapter-edit-header">
                  <span class="chapter-number">第{{ chapter.order }}章</span>
                  <el-button 
                    type="danger" 
                    :icon="Delete" 
                    circle 
                    size="large"
                    @click="removeChapter(index)"
                    :disabled="editForm.chapters.length <= 1"
                  />
                </div>
                <div class="chapter-form-grid">
                  <el-form-item :label="`章节标题`" :prop="`chapters.${index}.title`" class="chapter-title-field">
                    <el-input
                      v-model="chapter.title"
                      placeholder="请输入章节标题"
                      maxlength="100"
                      show-word-limit
                      size="large"
                    />
                  </el-form-item>
                  <el-form-item :label="`预计时长（分钟）`" :prop="`chapters.${index}.duration`" class="chapter-duration-field">
                    <el-input-number
                      v-model="chapter.duration"
                      :min="1"
                      :max="300"
                      placeholder="请输入预计时长"
                      size="large"
                      controls-position="right"
                    />
                  </el-form-item>
                </div>
                <el-form-item :label="`章节描述`" :prop="`chapters.${index}.description`" class="chapter-description-field">
                  <el-input
                    v-model="chapter.description"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入章节描述"
                    maxlength="300"
                    show-word-limit
                    size="large"
                  />
                </el-form-item>
                <el-form-item :label="`章节内容`" :prop="`chapters.${index}.content`" class="chapter-content-field">
                  <el-input
                    v-model="chapter.content"
                    type="textarea"
                    :rows="6"
                    placeholder="请输入章节详细内容"
                    maxlength="2000"
                    show-word-limit
                    size="large"
                  />
                </el-form-item>
              </div>
              <el-button 
                type="primary" 
                :icon="Plus" 
                size="large"
                @click="addChapter"
                :disabled="editForm.chapters.length >= 20"
                class="add-chapter-btn"
              >
                添加章节
              </el-button>
            </div>
          </div>
        </el-form>
      </div>
      
      <div class="dialog-footer">
        <div class="footer-actions">
          <el-button @click="handleClose">
            <el-icon><Close /></el-icon>
            取消
          </el-button>
          <el-button 
            type="primary" 
            @click="handleSave" 
            :loading="saving"
            class="save-button"
          >
            <el-icon v-if="!saving"><Check /></el-icon>
            {{ saving ? '保存中...' : '保存修改' }}
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, Delete, Plus, Close, Check } from '@element-plus/icons-vue'
import { useCourseStore } from '@/store/modules/course'
import type { Course, CourseLevel, CourseStatus } from '@/types/course'

interface Props {
  modelValue: boolean
  course?: Course | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved', course: Course): void
}

const props = withDefaults(defineProps<Props>(), {
  course: null
})

const emit = defineEmits<Emits>()

const courseStore = useCourseStore()
const editFormRef = ref()
const loading = ref(false)
const saving = ref(false)

const visible = ref(false)

// 编辑表单数据
const editForm = ref({
  title: '',
  description: '',
  level: 'intermediate' as CourseLevel,
  status: 'draft' as CourseStatus,
  objectives: [] as string[],
  chapters: [] as Array<{
    order: number
    title: string
    description: string
    duration: number
    content: string
  }>
})

// 表单验证规则
const editFormRules = {
  title: [
    { required: true, message: '请输入课程标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入课程描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请选择难度级别', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择课程状态', trigger: 'change' }
  ]
}

// 监听弹窗显示状态
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal && props.course) {
    loadCourseData()
  }
})

// 监听弹窗内部状态变化
watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 加载课程数据
const loadCourseData = async () => {
  if (!props.course) return
  
  try {
    loading.value = true
    
    // 如果传入的课程没有完整数据，重新获取
    let courseData = props.course
    if (!courseData.chapters || courseData.chapters.length === 0) {
      courseData = await courseStore.fetchCourse(props.course.id)
    }
    
    // 填充表单数据
    editForm.value = {
      title: courseData.title,
      description: courseData.description,
      level: courseData.level,
      status: courseData.status,
      objectives: courseData.objectives || [],
      chapters: courseData.chapters?.map(chapter => ({
        order: chapter.orderIndex,
        title: chapter.title,
        description: chapter.description,
        duration: chapter.durationMinutes,
        content: chapter.content
      })) || []
    }
    
    // 确保至少有一个学习目标和章节
    if (editForm.value.objectives.length === 0) {
      editForm.value.objectives.push('')
    }
    if (editForm.value.chapters.length === 0) {
      addChapter()
    }
  } catch (error) {
    console.error('加载课程数据失败:', error)
    ElMessage.error('加载课程数据失败')
  } finally {
    loading.value = false
  }
}

// 添加学习目标
const addObjective = () => {
  if (editForm.value.objectives.length < 10) {
    editForm.value.objectives.push('')
  }
}

// 删除学习目标
const removeObjective = (index: number) => {
  if (editForm.value.objectives.length > 1) {
    editForm.value.objectives.splice(index, 1)
  }
}

// 添加章节
const addChapter = () => {
  if (editForm.value.chapters.length < 20) {
    const newOrder = editForm.value.chapters.length + 1
    editForm.value.chapters.push({
      order: newOrder,
      title: '',
      description: '',
      duration: 30,
      content: ''
    })
  }
}

// 删除章节
const removeChapter = (index: number) => {
  if (editForm.value.chapters.length > 1) {
    editForm.value.chapters.splice(index, 1)
    // 重新排序
    editForm.value.chapters.forEach((chapter, idx) => {
      chapter.order = idx + 1
    })
  }
}

// 保存编辑
const handleSave = async () => {
  if (!editFormRef.value || !props.course) return
  
  try {
    await editFormRef.value.validate()
    saving.value = true
    
    // 准备更新数据
    const updateData = {
      title: editForm.value.title,
      description: editForm.value.description,
      level: editForm.value.level,
      status: editForm.value.status,
      objectives: editForm.value.objectives.filter(obj => obj.trim() !== ''),
      chapters: editForm.value.chapters.map(chapter => ({
        title: chapter.title,
        description: chapter.description,
        content: chapter.content,
        orderIndex: chapter.order,
        durationMinutes: chapter.duration
      }))
    }
    
    // 更新课程
    const updatedCourse = await courseStore.updateCourse(props.course.id, updateData)
    
    ElMessage.success('课程更新成功')
    emit('saved', updatedCourse)
    handleClose()
  } catch (error) {
    console.error('保存课程失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}

// 弹窗关闭后的清理
const handleClosed = () => {
  // 重置表单
  if (editFormRef.value) {
    editFormRef.value.resetFields()
  }
  editForm.value = {
    title: '',
    description: '',
    level: 'intermediate' as CourseLevel,
    status: 'draft' as CourseStatus,
    objectives: [],
    chapters: []
  }
}
</script>

<style lang="scss" scoped>
.edit-dialog {
  :deep(.el-dialog) {
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    margin: 0 auto;
    top: 80px !important;
    transform: none;
  }

  :deep(.el-dialog__header) {
    display: none;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.dialog-content {
  display: flex;
  flex-direction: column;
  height: 80vh;
  max-height: 800px;
  background: white;
}

.dialog-header {
  background: white;
  color: var(--brand-text-primary);
  padding: 20px 32px 24px 32px;
  text-align: center;
  border-bottom: 1px solid var(--brand-border);

  .dialog-title {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--brand-text-primary);

    .el-icon {
      font-size: 24px;
      color: var(--brand-primary);
    }
  }

  .dialog-subtitle {
    font-size: 14px;
    color: var(--brand-text-secondary);
    margin: 0;
    line-height: 1.5;
  }
}

.dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background: white;

  .edit-form {
    padding: 32px;
    max-width: 100%;

    .form-section {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--brand-border);

      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      .section-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--brand-text-primary);
        margin: 0 0 20px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid var(--brand-primary);
        display: inline-block;
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;

      .form-col {
        margin-bottom: 0;
      }
    }

    .el-form-item {
      margin-bottom: 24px;

      .el-form-item__label {
        font-weight: 600;
        color: var(--brand-text-primary);
        font-size: 14px;
        margin-bottom: 8px;
      }
    }

    // 学习目标样式
    .objectives-edit {
      .objective-edit-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 16px;

        .el-input {
          flex: 1;
        }

        .el-button {
          margin-top: 4px;
        }
      }

      .add-objective-btn {
        width: 100%;
        margin-top: 8px;
      }
    }

    // 章节编辑样式
    .chapters-edit {
      .chapter-edit-item {
        background: var(--brand-bg-secondary);
        border: 1px solid var(--brand-border);
        border-radius: var(--brand-radius-lg);
        padding: 20px;
        margin-bottom: 20px;

        .chapter-edit-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--brand-border);

          .chapter-number {
            font-size: 16px;
            font-weight: 600;
            color: var(--brand-primary);
            background: var(--brand-bg-primary);
            padding: 4px 12px;
            border-radius: var(--brand-radius-base);
          }
        }

        .chapter-form-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
          margin-bottom: 16px;

          .chapter-title-field,
          .chapter-duration-field {
            margin-bottom: 0;
          }
        }

        .chapter-description-field,
        .chapter-content-field {
          margin-bottom: 0;
        }
      }

      .add-chapter-btn {
        width: 100%;
        margin-top: 8px;
      }
    }
  }
}

.dialog-footer {
  background: var(--brand-bg-secondary);
  padding: 20px 32px;
  border-top: 1px solid var(--brand-border);

  .footer-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .el-button {
      min-width: 100px;
      height: 40px;
      border-radius: 12px;
      font-weight: 600;
      transition: all 0.2s ease;

      &.save-button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .edit-dialog {
    :deep(.el-dialog) {
      width: 95vw !important;
      margin: 0 auto;
    }
  }

  .dialog-content {
    height: 85vh;
  }

  .dialog-header {
    padding: 24px 20px;

    .dialog-title {
      font-size: 20px;
    }

    .dialog-subtitle {
      font-size: 13px;
    }
  }

  .dialog-body {
    .edit-form {
      padding: 20px;

      .form-row {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .chapter-form-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }
  }

  .dialog-footer {
    padding: 16px 20px;

    .footer-actions {
      flex-direction: column;
      gap: 12px;

      .el-button {
        width: 100%;
        min-width: auto;
      }
    }
  }
}
</style>
