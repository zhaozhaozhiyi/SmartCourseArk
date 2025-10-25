<template>
  <div class="question-group-manager">
    <!-- 分组列表 -->
    <div class="group-list">
      <div class="group-header">
        <h3>题目分组</h3>
        <el-button 
          type="primary" 
          size="small" 
          @click="showCreateDialog = true"
        >
          <FontAwesomeIcon :icon="['fas', 'plus']" class="mr-2" />
          新建分组
        </el-button>
      </div>
      
      <div class="group-items">
        <div 
          v-for="group in questionGroups" 
          :key="group.id"
          class="group-item"
          :class="{ active: selectedGroupId === group.id }"
          @click="selectGroup(group.id)"
        >
          <div class="group-info">
            <div class="group-name">{{ group.name }}</div>
            <div class="group-meta">
              <span class="question-count">{{ group.questionCount }} 题</span>
              <span class="group-date">{{ formatDate(group.createdAt) }}</span>
            </div>
          </div>
          <div class="group-actions">
            <el-button 
              type="text" 
              size="small" 
              @click.stop="editGroup(group)"
            >
              <FontAwesomeIcon :icon="['fas', 'edit']" />
            </el-button>
            <el-button 
              type="text" 
              size="small" 
              @click.stop="deleteGroup(group.id)"
            >
              <FontAwesomeIcon :icon="['fas', 'trash']" />
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建/编辑分组对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingGroup ? '编辑分组' : '新建分组'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="groupForm" 
        :rules="groupRules" 
        ref="groupFormRef"
        label-width="80px"
      >
        <el-form-item label="分组名称" prop="name">
          <el-input 
            v-model="groupForm.name" 
            placeholder="请输入分组名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="分组描述" prop="description">
          <el-input 
            v-model="groupForm.description" 
            type="textarea" 
            placeholder="请输入分组描述"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="关联课程" prop="courseId">
          <el-select 
            v-model="groupForm.courseId" 
            placeholder="选择关联课程（可选）"
            clearable
            filterable
          >
            <el-option 
              v-for="course in courses" 
              :key="course.id" 
              :label="course.title" 
              :value="course.id" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="cancelGroup">取消</el-button>
        <el-button type="primary" @click="saveGroup">
          {{ editingGroup ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faPlus, faEdit, faTrash
} from '@fortawesome/free-solid-svg-icons'
import { useQuestionStore } from '@/store/modules/question'
import { useCourseStore } from '@/store/modules/course'
import type { QuestionGroup } from '@/types/course'

// 添加图标到库
library.add(faPlus, faEdit, faTrash)

const questionStore = useQuestionStore()
const courseStore = useCourseStore()

// Props
const props = defineProps<{
  selectedGroupId?: string
}>()

// Emits
const emit = defineEmits<{
  'group-select': [groupId: string]
  'group-created': [group: QuestionGroup]
  'group-updated': [group: QuestionGroup]
  'group-deleted': [groupId: string]
}>()

// 响应式数据
const showCreateDialog = ref(false)
const editingGroup = ref<QuestionGroup | null>(null)
const groupFormRef = ref()

const groupForm = ref({
  name: '',
  description: '',
  courseId: ''
})

const groupRules = {
  name: [
    { required: true, message: '请输入分组名称', trigger: 'blur' },
    { min: 2, max: 50, message: '分组名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '分组描述不能超过 200 个字符', trigger: 'blur' }
  ]
}

// 计算属性
const questionGroups = computed(() => questionStore.questionGroups)
const courses = computed(() => courseStore.courses)

// 生命周期
onMounted(() => {
  fetchQuestionGroups()
  fetchCourses()
})

// 方法
const fetchQuestionGroups = async () => {
  try {
    await questionStore.fetchQuestionGroups()
  } catch (error) {
    console.error('获取分组列表失败:', error)
  }
}

const fetchCourses = async () => {
  try {
    await courseStore.fetchCourses()
  } catch (error) {
    console.error('获取课程列表失败:', error)
  }
}

const selectGroup = (groupId: string) => {
  emit('group-select', groupId)
}

const editGroup = (group: QuestionGroup) => {
  editingGroup.value = group
  groupForm.value = {
    name: group.name,
    description: group.description,
    courseId: group.courseId || ''
  }
  showCreateDialog.value = true
}

const deleteGroup = async (groupId: string) => {
  try {
    await ElMessageBox.confirm('确认删除该分组吗？', '删除分组', {
      type: 'warning'
    })
    
    await questionStore.deleteQuestionGroup(groupId)
    ElMessage.success('删除成功')
    emit('group-deleted', groupId)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const saveGroup = async () => {
  try {
    await groupFormRef.value.validate()
    
    const groupData = {
      name: groupForm.value.name,
      description: groupForm.value.description,
      courseId: groupForm.value.courseId || undefined
    }
    
    if (editingGroup.value) {
      // 更新分组
      const updatedGroup = await questionStore.updateQuestionGroup(editingGroup.value.id, groupData)
      ElMessage.success('更新成功')
      emit('group-updated', updatedGroup)
    } else {
      // 创建分组
      const newGroup = await questionStore.createQuestionGroup(groupData)
      ElMessage.success('创建成功')
      emit('group-created', newGroup)
    }
    
    cancelGroup()
  } catch (error) {
    console.error('保存分组失败:', error)
  }
}

const cancelGroup = () => {
  showCreateDialog.value = false
  editingGroup.value = null
  groupForm.value = {
    name: '',
    description: '',
    courseId: ''
  }
  groupFormRef.value?.resetFields()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}
</script>

<style lang="scss" scoped>
.question-group-manager {
  .group-list {
    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--brand-text-primary);
      }
    }
    
    .group-items {
      .group-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        margin-bottom: 8px;
        border: 1px solid var(--brand-border-light);
        border-radius: var(--brand-radius-md);
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
          border-color: var(--brand-primary);
          background-color: var(--brand-bg-light);
        }
        
        &.active {
          border-color: var(--brand-primary);
          background-color: var(--brand-primary-light);
        }
        
        .group-info {
          flex: 1;
          
          .group-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--brand-text-primary);
            margin-bottom: 4px;
          }
          
          .group-meta {
            display: flex;
            gap: 12px;
            font-size: 12px;
            color: var(--brand-text-secondary);
            
            .question-count {
              color: var(--brand-primary);
              font-weight: 500;
            }
          }
        }
        
        .group-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        &:hover .group-actions {
          opacity: 1;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .question-group-manager {
    .group-list {
      .group-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }
      
      .group-items {
        .group-item {
          flex-direction: column;
          align-items: stretch;
          gap: 8px;
          
          .group-actions {
            opacity: 1;
            justify-content: flex-end;
          }
        }
      }
    }
  }
}
</style>
