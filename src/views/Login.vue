<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <div class="logo">
          <FontAwesomeIcon :icon="['fas', 'graduation-cap']" />
        </div>
        <h1 class="title">智课方舟</h1>
        <p class="subtitle">智能课程平台，让学习更高效</p>
        <div class="slogan">
          <span class="slogan-text">AI驱动的个性化学习体验</span>
        </div>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-link type="primary" :underline="false" @click="showForgotPassword">忘记密码？</el-link>
          </div>
        </el-form-item>

        <el-form-item>
          <div class="demo-accounts">
            <p class="demo-title">演示账号</p>
            <div class="demo-buttons">
              <el-button size="small" @click="fillDemoAccount('admin')" type="primary" plain>
                管理员账号
              </el-button>
              <el-button size="small" @click="fillDemoAccount('user')" type="success" plain>
                普通用户
              </el-button>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            class="login-btn"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 背景装饰 -->
    <div class="login-bg">
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
      <div class="bg-circle circle-3"></div>
    </div>

    <!-- 忘记密码对话框 -->
    <el-dialog
      v-model="forgotPasswordVisible"
      title="忘记密码"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="forgot-password-content">
        <p class="forgot-password-text">
          请联系系统管理员重置密码，或使用以下演示账号：
        </p>
        <div class="demo-accounts-dialog">
          <div class="account-item">
            <strong>管理员账号：</strong>
            <span>admin / 123456</span>
          </div>
          <div class="account-item">
            <strong>普通用户：</strong>
            <span>user / 123456</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="forgotPasswordVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons'
import { useUserStore } from '@/store/modules/user'
import { validateRequired, validateStringLength } from '@/shared/utils/validate'

// 添加图标到库
library.add(faGraduationCap)

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const rememberMe = ref(false)
const forgotPasswordVisible = ref(false)

// 登录表单
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { validator: (rule, value, callback) => {
      const result = validateRequired(value, '用户名')
      if (!result.valid) {
        callback(new Error(result.message))
      } else {
        const lengthResult = validateStringLength(value, 3, 20, '用户名')
        if (!lengthResult.valid) {
          callback(new Error(lengthResult.message))
        } else {
          callback()
        }
      }
    }, trigger: 'blur' }
  ],
  password: [
    { validator: (rule, value, callback) => {
      const result = validateRequired(value, '密码')
      if (!result.valid) {
        callback(new Error(result.message))
      } else {
        const lengthResult = validateStringLength(value, 6, 20, '密码')
        if (!lengthResult.valid) {
          callback(new Error(lengthResult.message))
        } else {
          callback()
        }
      }
    }, trigger: 'blur' }
  ]
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    loading.value = true
    await userStore.login(loginForm)
    
    ElMessage.success('登录成功，欢迎使用智课方舟！')
    router.push('/')
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 显示忘记密码对话框
const showForgotPassword = () => {
  forgotPasswordVisible.value = true
}

// 填充演示账号
const fillDemoAccount = (type: string) => {
  if (type === 'admin') {
    loginForm.username = 'admin'
    loginForm.password = '123456'
    ElMessage.info('已填入管理员账号')
  } else if (type === 'user') {
    loginForm.username = 'user'
    loginForm.password = '123456'
    ElMessage.info('已填入普通用户账号')
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--brand-primary-5) 0%, var(--brand-primary-7) 100%);
  overflow: hidden;
}

.login-box {
  position: relative;
  width: 420px;
  padding: 48px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(16px);
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    background: var(--brand-primary-5);
    border-radius: 50%;
    color: white;
    font-size: 36px;
    box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
  }

  .title {
    margin: 0 0 12px 0;
    font-size: 32px;
    font-weight: 700;
    color: var(--brand-text-primary);
    background: linear-gradient(135deg, var(--brand-primary-5), var(--brand-primary-7));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: var(--brand-text-secondary);
    font-weight: 500;
  }

  .slogan {
    .slogan-text {
      display: inline-block;
      padding: 8px 16px;
      background: var(--brand-primary-bg);
      color: var(--brand-primary-6);
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      border: 1px solid var(--brand-primary-2);
    }
  }
}

.login-form {
  .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .login-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 12px;
    background: var(--brand-primary-5);
    border-color: var(--brand-primary-5);
    
    &:hover {
      background: var(--brand-primary-6);
      border-color: var(--brand-primary-6);
    }
  }

  .demo-accounts {
    text-align: center;
    padding: 16px;
    background: var(--brand-bg-secondary);
    border-radius: var(--brand-radius-base);
    border: 1px solid var(--brand-border-color);

    .demo-title {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: var(--brand-text-secondary);
      font-weight: 500;
    }

    .demo-buttons {
      display: flex;
      gap: 8px;
      justify-content: center;
    }
  }
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;

  .bg-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    animation: float 8s ease-in-out infinite;

    &.circle-1 {
      width: 240px;
      height: 240px;
      top: 5%;
      left: 5%;
      animation-delay: 0s;
      background: rgba(59, 130, 246, 0.1);
    }

    &.circle-2 {
      width: 180px;
      height: 180px;
      top: 55%;
      right: 5%;
      animation-delay: 3s;
      background: rgba(16, 185, 129, 0.1);
    }

    &.circle-3 {
      width: 120px;
      height: 120px;
      bottom: 15%;
      left: 15%;
      animation-delay: 6s;
      background: rgba(139, 92, 246, 0.1);
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
  }
}

.forgot-password-content {
  .forgot-password-text {
    margin: 0 0 20px 0;
    color: var(--brand-text-secondary);
    line-height: 1.5;
  }

  .demo-accounts-dialog {
    .account-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      margin-bottom: 8px;
      background: var(--brand-bg-secondary);
      border-radius: var(--brand-radius-base);
      border: 1px solid var(--brand-border-color);

      strong {
        color: var(--brand-text-primary);
      }

      span {
        color: var(--brand-text-secondary);
        font-family: 'Courier New', monospace;
        font-size: 14px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 480px) {
  .login-box {
    width: 90%;
    padding: 32px 24px;
  }

  .login-header {
    margin-bottom: 32px;

    .logo {
      width: 64px;
      height: 64px;
      font-size: 28px;
    }

    .title {
      font-size: 24px;
    }

    .subtitle {
      font-size: 14px;
    }
  }
}
</style>
