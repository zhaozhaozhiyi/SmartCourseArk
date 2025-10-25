<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="htmlType"
    @click="handleClick"
  >
    <!-- 加载状态图标 -->
    <FontAwesomeIcon
      v-if="loading"
      :icon="['fas', 'spinner']"
      class="button-icon button-icon-loading"
      :class="{ 'button-icon-left': iconPosition === 'left' }"
    />
    
    <!-- 左侧图标 -->
    <FontAwesomeIcon
      v-else-if="icon && iconPosition === 'left'"
      :icon="icon"
      class="button-icon button-icon-left"
    />
    
    <!-- 按钮文字 -->
    <span v-if="$slots.default" class="button-text">
      <slot />
    </span>
    
    <!-- 右侧图标 -->
    <FontAwesomeIcon
      v-if="icon && iconPosition === 'right'"
      :icon="icon"
      class="button-icon button-icon-right"
    />
    
    <!-- 角标 -->
    <span v-if="badge" class="button-badge">
      {{ badge }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

// 添加图标到库
library.add(faSpinner)

// 定义组件属性
interface Props {
  type?: 'primary' | 'secondary' | 'text' | 'danger'
  size?: 'small' | 'medium' | 'large' | 'extra-large'
  disabled?: boolean
  loading?: boolean
  icon?: any
  iconPosition?: 'left' | 'right'
  badge?: string | number
  htmlType?: 'button' | 'submit' | 'reset'
  block?: boolean
  round?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  disabled: false,
  loading: false,
  iconPosition: 'left',
  htmlType: 'button',
  block: false,
  round: false
})

// 定义事件
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// 计算按钮类名
const buttonClasses = computed(() => {
  const classes = ['button']
  
  // 按钮类型
  classes.push(`button--${props.type}`)
  
  // 按钮大小
  classes.push(`button--${props.size}`)
  
  // 状态类
  if (props.disabled) classes.push('button--disabled')
  if (props.loading) classes.push('button--loading')
  if (props.block) classes.push('button--block')
  if (props.round) classes.push('button--round')
  
  return classes
})

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
.button {
  // 基础样式
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: none;
  outline: none;
  cursor: pointer;
  font-family: var(--font-family-primary);
  font-weight: var(--button-font-weight);
  text-decoration: none;
  transition: all var(--transition-base);
  user-select: none;
  white-space: nowrap;
  vertical-align: middle;
  
  // 默认圆角
  border-radius: var(--button-radius);
  
  // 默认大小
  height: var(--button-height-base);
  padding: var(--button-padding-base);
  
  // 禁用状态
  &:disabled,
  &.button--disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  // 加载状态
  &.button--loading {
    cursor: not-allowed;
  }
  
  // 块级按钮
  &.button--block {
    width: 100%;
  }
  
  // 圆形按钮
  &.button--round {
    border-radius: var(--radius-full);
  }
  
  // 按钮大小
  &--small {
    height: var(--button-height-sm);
    padding: var(--button-padding-sm);
    font-size: var(--font-size-sm);
  }
  
  &--medium {
    height: var(--button-height-base);
    padding: var(--button-padding-base);
    font-size: var(--font-size-base);
  }
  
  &--large {
    height: var(--button-height-lg);
    padding: var(--button-padding-lg);
    font-size: var(--font-size-lg);
  }
  
  &--extra-large {
    height: var(--button-height-xl);
    padding: var(--button-padding-xl);
    font-size: var(--font-size-xl);
  }
  
  // 主按钮样式
  &--primary {
    background-color: var(--button-primary-bg);
    color: var(--button-primary-color);
    border: 1px solid var(--button-primary-bg);
    
    &:hover:not(:disabled):not(.button--loading) {
      background-color: var(--button-primary-hover-bg);
      border-color: var(--button-primary-hover-bg);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    &:active:not(:disabled):not(.button--loading) {
      background-color: var(--button-primary-active-bg);
      border-color: var(--button-primary-active-bg);
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
    }
    
    &:disabled,
    &.button--disabled {
      background-color: var(--button-primary-disabled-bg);
      color: var(--button-primary-disabled-color);
      border-color: var(--button-primary-disabled-bg);
    }
  }
  
  // 次按钮样式
  &--secondary {
    background-color: var(--button-secondary-bg);
    color: var(--button-secondary-color);
    border: 1px solid var(--button-secondary-border);
    
    &:hover:not(:disabled):not(.button--loading) {
      background-color: var(--button-secondary-hover-bg);
      border-color: var(--button-secondary-hover-border);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    &:active:not(:disabled):not(.button--loading) {
      background-color: var(--color-primary-100);
      border-color: var(--color-primary-800);
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
    }
    
    &:disabled,
    &.button--disabled {
      background-color: var(--button-secondary-disabled-bg);
      color: var(--button-secondary-disabled-color);
      border-color: var(--button-secondary-disabled-border);
    }
  }
  
  // 文字按钮样式
  &--text {
    background-color: transparent;
    color: var(--color-primary);
    border: 1px solid transparent;
    padding: var(--spacing-2) var(--spacing-4);
    
    &:hover:not(:disabled):not(.button--loading) {
      background-color: var(--color-primary-50);
      color: var(--color-primary-800);
    }
    
    &:active:not(:disabled):not(.button--loading) {
      background-color: var(--color-primary-100);
      color: var(--color-primary-900);
    }
    
    &:disabled,
    &.button--disabled {
      color: var(--color-text-disabled);
    }
  }
  
  // 危险按钮样式
  &--danger {
    background-color: var(--color-error);
    color: #FFFFFF;
    border: 1px solid var(--color-error);
    
    &:hover:not(:disabled):not(.button--loading) {
      background-color: var(--color-error-700);
      border-color: var(--color-error-700);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    &:active:not(:disabled):not(.button--loading) {
      background-color: var(--color-error-800);
      border-color: var(--color-error-800);
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
    }
    
    &:disabled,
    &.button--disabled {
      background-color: var(--color-error-200);
      color: var(--color-text-disabled);
      border-color: var(--color-error-200);
    }
  }
}

// 按钮内容
.button-text {
  flex: 1;
  text-align: center;
  line-height: 1;
}

// 按钮图标
.button-icon {
  flex-shrink: 0;
  font-size: inherit;
  
  &-left {
    margin-right: var(--spacing-2);
  }
  
  &-right {
    margin-left: var(--spacing-2);
  }
  
  &-loading {
    animation: spin 1s linear infinite;
  }
}

// 按钮角标
.button-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background-color: var(--color-error);
  color: #FFFFFF;
  font-size: 10px;
  font-weight: var(--font-weight-medium);
  line-height: 16px;
  text-align: center;
  border-radius: var(--radius-full);
  border: 2px solid #FFFFFF;
  box-shadow: var(--shadow-sm);
}

// 加载动画
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .button {
    &--small {
      height: 36px;
      padding: var(--spacing-2) var(--spacing-3);
      font-size: var(--font-size-sm);
    }
    
    &--medium {
      height: 44px;
      padding: var(--spacing-3) var(--spacing-4);
      font-size: var(--font-size-base);
    }
    
    &--large {
      height: 52px;
      padding: var(--spacing-4) var(--spacing-6);
      font-size: var(--font-size-lg);
    }
    
    &--extra-large {
      height: 60px;
      padding: var(--spacing-5) var(--spacing-8);
      font-size: var(--font-size-xl);
    }
  }
}

// 焦点样式（无障碍设计）
.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

// 打印样式
@media print {
  .button {
    background-color: transparent !important;
    color: #000000 !important;
    border: 1px solid #000000 !important;
    box-shadow: none !important;
    transform: none !important;
  }
}
</style>
