<template>
  <div class="course-edit" v-loading="loading">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">编辑课程</h1>
        <p class="page-description">修改课程信息和章节内容</p>
      </div>
      <div class="header-actions">
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" @click="saveCourse">保存</el-button>
      </div>
    </div>

    <div class="edit-content">
      <el-card>
        <template #header>
          <h3>课程信息</h3>
        </template>
        
        <el-form :model="courseForm" :rules="formRules" ref="formRef" label-width="120px">
          <el-form-item label="课程标题" prop="title">
            <el-input v-model="courseForm.title" placeholder="请输入课程标题" />
          </el-form-item>
          
          <el-form-item label="课程描述" prop="description">
            <el-input v-model="courseForm.description" type="textarea" :rows="4" placeholder="请输入课程描述" />
          </el-form-item>
          
          <el-form-item label="难度级别" prop="level">
            <el-select v-model="courseForm.level" placeholder="请选择难度级别">
              <el-option label="初级" value="beginner" />
              <el-option label="中级" value="intermediate" />
              <el-option label="高级" value="advanced" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCourseStore } from '@/store/modules/course'
import type { CourseUpdateForm, CourseLevel } from '@/types/course'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()

const loading = ref(false)
const formRef = ref()
const courseForm = ref<CourseUpdateForm>({
  title: '',
  description: '',
  level: CourseLevel.INTERMEDIATE
})

const formRules = {
  title: [
    { required: true, message: '请输入课程标题', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入课程描述', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请选择难度级别', trigger: 'change' }
  ]
}

onMounted(async () => {
  const courseId = route.params.id as string
  if (courseId) {
    await fetchCourse(courseId)
  }
})

const fetchCourse = async (courseId: string) => {
  try {
    loading.value = true
    const course = await courseStore.fetchCourse(courseId)
    if (course) {
      courseForm.value = {
        title: course.title,
        description: course.description,
        level: course.level
      }
    }
  } catch (error) {
    ElMessage.error('获取课程信息失败')
  } finally {
    loading.value = false
  }
}

const saveCourse = async () => {
  try {
    if (!formRef.value) return
    await formRef.value.validate()
    
    loading.value = true
    const courseId = route.params.id as string
    await courseStore.updateCourse(courseId, courseForm.value)
    ElMessage.success('课程更新成功')
    router.push(`/courses/${courseId}`)
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  const courseId = route.params.id as string
  router.push(`/courses/${courseId}`)
}
</script>

<style lang="scss" scoped>
.course-edit {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--brand-border);

  .header-content {
    .page-title {
      font-size: 28px;
      font-weight: 600;
      color: var(--brand-text-primary);
      margin: 0 0 8px 0;
    }

    .page-description {
      color: var(--brand-text-secondary);
      margin: 0;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.edit-content {
  .el-card {
    border-radius: var(--brand-radius-lg);
  }
}
</style>
