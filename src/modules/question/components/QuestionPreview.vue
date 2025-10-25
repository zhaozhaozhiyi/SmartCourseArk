<template>
  <div class="question-preview">
    <div class="preview-header">
      <h3>题目预览测试</h3>
      <div class="preview-stats">
        <span>第 {{ currentQuestionIndex + 1 }} 题，共 {{ questions.length }} 题</span>
        <span class="score">得分：{{ score }}/{{ questions.length }}</span>
      </div>
    </div>

    <div v-if="currentQuestion" class="question-container">
      <div class="question-header">
        <div class="question-meta">
          <el-tag :type="getTypeColor(currentQuestion.type)">
            {{ getTypeText(currentQuestion.type) }}
          </el-tag>
          <el-tag :type="getDifficultyColor(currentQuestion.difficulty)" size="small">
            {{ getDifficultyText(currentQuestion.difficulty) }}
          </el-tag>
        </div>
      </div>

      <div class="question-content">
        <div class="question-text">
          {{ currentQuestion.content }}
        </div>

        <!-- 选择题选项 -->
        <div v-if="currentQuestion.options && currentQuestion.options.length > 0" class="question-options">
          <div 
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            class="option-item"
            :class="{ 
              'selected': userAnswers[currentQuestionIndex] === String.fromCharCode(65 + index),
              'correct': showAnswer && currentQuestion.answer === String.fromCharCode(65 + index),
              'incorrect': showAnswer && userAnswers[currentQuestionIndex] === String.fromCharCode(65 + index) && currentQuestion.answer !== String.fromCharCode(65 + index)
            }"
            @click="selectAnswer(String.fromCharCode(65 + index))"
          >
            <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
            <span class="option-text">{{ option }}</span>
          </div>
        </div>

        <!-- 判断题选项 -->
        <div v-else-if="currentQuestion.type === 'judge'" class="judge-options">
          <div 
            class="option-item"
            :class="{ 
              'selected': userAnswers[currentQuestionIndex] === '正确',
              'correct': showAnswer && currentQuestion.answer === '正确',
              'incorrect': showAnswer && userAnswers[currentQuestionIndex] === '正确' && currentQuestion.answer !== '正确'
            }"
            @click="selectAnswer('正确')"
          >
            正确
          </div>
          <div 
            class="option-item"
            :class="{ 
              'selected': userAnswers[currentQuestionIndex] === '错误',
              'correct': showAnswer && currentQuestion.answer === '错误',
              'incorrect': showAnswer && userAnswers[currentQuestionIndex] === '错误' && currentQuestion.answer !== '错误'
            }"
            @click="selectAnswer('错误')"
          >
            错误
          </div>
        </div>

        <!-- 填空题输入 -->
        <div v-else-if="currentQuestion.type === 'fill'" class="fill-input">
          <el-input
            v-model="userAnswers[currentQuestionIndex]"
            placeholder="请输入答案"
            :disabled="showAnswer"
          />
        </div>

        <!-- 简答题输入 -->
        <div v-else-if="currentQuestion.type === 'essay'" class="essay-input">
          <el-input
            v-model="userAnswers[currentQuestionIndex]"
            type="textarea"
            :rows="4"
            placeholder="请输入答案"
            :disabled="showAnswer"
          />
        </div>
      </div>

      <!-- 答案和解析 -->
      <div v-if="showAnswer" class="answer-section">
        <div class="correct-answer">
          <strong>正确答案：</strong>{{ currentQuestion.answer }}
        </div>
        <div class="explanation">
          <strong>解析：</strong>{{ currentQuestion.explanation }}
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button 
          v-if="!showAnswer" 
          type="primary" 
          @click="checkAnswer"
          :disabled="!userAnswers[currentQuestionIndex]"
        >
          检查答案
        </el-button>
        
        <el-button 
          v-if="showAnswer" 
          @click="nextQuestion"
          :disabled="currentQuestionIndex >= questions.length - 1"
        >
          {{ currentQuestionIndex >= questions.length - 1 ? '完成测试' : '下一题' }}
        </el-button>
        
        <el-button @click="resetTest">重新开始</el-button>
        <el-button @click="$emit('close')">关闭</el-button>
      </div>
    </div>

    <!-- 测试完成 -->
    <div v-if="testCompleted" class="test-completed">
      <div class="completion-header">
        <h3>测试完成！</h3>
        <div class="final-score">
          <span class="score-number">{{ score }}</span>
          <span class="score-total">/ {{ questions.length }}</span>
        </div>
        <div class="score-percentage">
          {{ Math.round((score / questions.length) * 100) }}%
        </div>
      </div>
      
      <div class="completion-actions">
        <el-button type="primary" @click="resetTest">重新测试</el-button>
        <el-button @click="$emit('close')">关闭</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

interface Question {
  type: string
  content: string
  options?: string[]
  answer: string
  explanation: string
  difficulty: string
}

interface Props {
  questions: Question[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

// 状态
const currentQuestionIndex = ref(0)
const userAnswers = ref<string[]>([])
const showAnswer = ref(false)
const testCompleted = ref(false)

// 计算属性
const currentQuestion = computed(() => {
  return props.questions[currentQuestionIndex.value]
})

const score = computed(() => {
  return userAnswers.value.filter((answer, index) => {
    return answer === props.questions[index]?.answer
  }).length
})

// 监听题目变化
watch(currentQuestionIndex, () => {
  showAnswer.value = false
})

// 方法
const selectAnswer = (answer: string) => {
  if (showAnswer.value) return
  
  userAnswers.value[currentQuestionIndex.value] = answer
}

const checkAnswer = () => {
  if (!userAnswers.value[currentQuestionIndex.value]) {
    ElMessage.warning('请先选择答案')
    return
  }
  
  showAnswer.value = true
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < props.questions.length - 1) {
    currentQuestionIndex.value++
  } else {
    testCompleted.value = true
  }
}

const resetTest = () => {
  currentQuestionIndex.value = 0
  userAnswers.value = []
  showAnswer.value = false
  testCompleted.value = false
}

// 工具函数
const getTypeColor = (type: string): string => {
  switch (type) {
    case 'single': return 'primary'
    case 'multiple': return 'success'
    case 'judge': return 'warning'
    case 'fill': return 'info'
    case 'essay': return 'danger'
    default: return 'info'
  }
}

const getTypeText = (type: string): string => {
  switch (type) {
    case 'single': return '单选题'
    case 'multiple': return '多选题'
    case 'judge': return '判断题'
    case 'fill': return '填空题'
    case 'essay': return '简答题'
    default: return '未知'
  }
}

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return 'success'
    case 'medium': return 'warning'
    case 'hard': return 'danger'
    default: return 'info'
  }
}

const getDifficultyText = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return '简单'
    case 'medium': return '中等'
    case 'hard': return '困难'
    default: return '未知'
  }
}
</script>

<style scoped>
.question-preview {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.preview-header h3 {
  margin: 0;
  color: #2c3e50;
}

.preview-stats {
  display: flex;
  gap: 20px;
  color: #7f8c8d;
}

.score {
  font-weight: bold;
  color: #409eff;
}

.question-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 30px;
}

.question-header {
  margin-bottom: 20px;
}

.question-meta {
  display: flex;
  gap: 10px;
}

.question-content {
  margin-bottom: 30px;
}

.question-text {
  font-size: 18px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 25px;
  line-height: 1.6;
}

.question-options, .judge-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.option-item.selected {
  border-color: #409eff;
  background: #e6f7ff;
}

.option-item.correct {
  border-color: #67c23a;
  background: #f0f9ff;
}

.option-item.incorrect {
  border-color: #f56c6c;
  background: #fef0f0;
}

.option-label {
  font-weight: bold;
  margin-right: 12px;
  min-width: 20px;
  color: #409eff;
}

.option-text {
  flex: 1;
  color: #2c3e50;
}

.fill-input, .essay-input {
  margin-top: 20px;
}

.answer-section {
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.correct-answer {
  margin-bottom: 15px;
  font-size: 16px;
  color: #67c23a;
}

.explanation {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.test-completed {
  text-align: center;
  padding: 40px 20px;
}

.completion-header h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.final-score {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 10px;
}

.score-number {
  color: #409eff;
}

.score-total {
  color: #7f8c8d;
}

.score-percentage {
  font-size: 24px;
  color: #67c23a;
  margin-bottom: 30px;
}

.completion-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .question-preview {
    padding: 15px;
  }
  
  .preview-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .preview-stats {
    justify-content: space-between;
  }
  
  .question-container {
    padding: 20px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .completion-actions {
    flex-direction: column;
  }
}
</style>
