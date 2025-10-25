// 课程管理状态

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Course, 
  Chapter, 
  CourseCreateForm, 
  CourseUpdateForm, 
  ChapterCreateForm, 
  ChapterUpdateForm,
  CourseSearchParams,
  CourseListResponse,
  CourseLevel
} from '@/types/course'
import { CourseStatus } from '@/types/course'
import { createStorageService } from '@/shared/services/storage'
import { useUserStore } from './user'
import { InteractiveContentGenerator } from '@/shared/services/svgGenerator'
import { PrebuiltContentManager } from '@/shared/services/prebuiltSvgManager'

export const useCourseStore = defineStore('course', () => {
  // 状态
  const courses = ref<Course[]>([])
  const currentCourse = ref<Course | null>(null)
  const currentChapter = ref<Chapter | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const courseCount = computed(() => courses.value.length)
  const publishedCourses = computed(() => courses.value.filter(c => c.status === 'published'))
  const draftCourses = computed(() => courses.value.filter(c => c.status === 'draft'))
  
  // 存储服务
  let storage = createStorageService()
  const userStore = useUserStore()
  const contentGenerator = new InteractiveContentGenerator()
  const prebuiltContentManager = new PrebuiltContentManager()

  // 初始化存储服务
  const initStorage = () => {
    const userId = userStore.userInfo?.userId || 'default'
    storage = createStorageService(userId)
  }

  // 获取所有课程
  const fetchCourses = async (params?: CourseSearchParams): Promise<CourseListResponse> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      let allCourses = await storage.getCourses()
      
      // 如果没有课程数据，创建一些示例数据
      if (allCourses.length === 0) {
        const sampleCourses: Course[] = [
          {
            id: '1',
            title: 'Vue.js 基础教程',
            description: '学习Vue.js的基础知识和核心概念',
            level: 'beginner' as CourseLevel,
            status: 'published' as CourseStatus,
            chapters: [
              {
                id: 'chapter_1_1',
                courseId: '1',
                title: 'Vue.js 简介与安装',
                description: '了解Vue.js的基本概念和安装方法',
                content: 'Vue.js是一个用于构建用户界面的渐进式框架...',
                orderIndex: 1,
                durationMinutes: 30,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'chapter_1_2',
                courseId: '1',
                title: '模板语法与指令',
                description: '学习Vue.js的模板语法和常用指令',
                content: 'Vue.js使用基于HTML的模板语法...',
                orderIndex: 2,
                durationMinutes: 45,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'chapter_1_3',
                courseId: '1',
                title: '组件化开发',
                description: '掌握Vue.js组件的基本概念和使用方法',
                content: '组件是Vue.js最强大的特性之一...',
                orderIndex: 3,
                durationMinutes: 45,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ],
            questionBanks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: '1',
            totalDuration: 120,
            progress: 0
          },
          {
            id: '2',
            title: 'TypeScript 进阶',
            description: '深入学习TypeScript的高级特性和最佳实践，包括高级类型系统、泛型编程、装饰器与元编程等技术，帮助你掌握TypeScript的核心技能。',
            level: 'intermediate' as CourseLevel,
            status: CourseStatus.PUBLISHED,
            objectives: [
              '掌握TypeScript高级类型系统的应用',
              '深入理解泛型编程的原理和实践',
              '学会使用装饰器和元编程技术',
              '掌握TypeScript在实际项目中的最佳实践'
            ],
            chapters: [
              {
                id: 'chapter_2_1',
                courseId: '2',
                title: '高级类型系统',
                description: '深入学习TypeScript的高级类型特性',
                content: `## 高级类型系统

### TypeScript类型系统的核心概念

TypeScript提供了强大的类型系统，包括基础类型、联合类型、交叉类型、条件类型等高级特性。

### 联合类型和交叉类型

#### 联合类型（Union Types）
\`\`\`typescript
type ID = string | number;
type Status = 'success' | 'error' | 'pending';

function processId(id: ID) {
  if (typeof id === 'string') {
    console.log(id.toUpperCase());
  } else {
    console.log(id.toFixed(2));
  }
}
\`\`\`

#### 交叉类型（Intersection Types）
\`\`\`typescript
interface A {
  a: string;
}

interface B {
  b: number;
}

type C = A & B; // { a: string, b: number }
\`\`\`

### 映射类型（Mapped Types）

\`\`\`typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P];
};
\`\`\`

### 条件类型（Conditional Types）

\`\`\`typescript
type IsArray<T> = T extends Array<any> ? true : false;

type NonNullable<T> = T extends null | undefined ? never : T;

type Flatten<T> = T extends (infer U)[] ? U : T;
\`\`\`

### 模板字面量类型

\`\`\`typescript
type EventName<T extends string> = \`event_\${T}\`;
type EmailLocaleIDs = "welcome_email" | "email_heading";
type FooterLocaleIDs = "footer_title" | "footer_sendoff";

type AllLocaleIDs = \`\${EmailLocaleIDs | FooterLocaleIDs}_id\`;
\`\`\`

### 工具类型的使用

TypeScript内置了多个实用的工具类型，这些工具类型可以帮助我们更好地操作和转换类型。

#### keyof和typeof

\`\`\`typescript
interface Point {
  x: number;
  y: number;
}

type PointKeys = keyof Point; // "x" | "y"

const person = {
  name: 'Alice',
  age: 30
};

type Person = typeof person; // { name: string, age: number }
\`\`\`

## 实践应用

高级类型系统在实际开发中的应用场景包括：
- 创建可复用的类型工具
- 构建类型安全的API
- 实现复杂的数据结构类型

掌握这些高级类型特性，可以让你的TypeScript代码更加健壮和类型安全。`,
                orderIndex: 1,
                durationMinutes: 60,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'chapter_2_2',
                courseId: '2',
                title: '泛型编程',
                description: '掌握TypeScript泛型的使用方法和最佳实践',
                content: `## 泛型编程

### 泛型的基本概念

泛型（Generics）是TypeScript中最重要的特性之一，它允许我们编写可重用的代码，同时保持类型安全。

### 基础泛型

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}

// 使用
let output = identity<string>("hello");
let output2 = identity<number>(42);
\`\`\`

### 泛型接口

\`\`\`typescript
interface GenericInterface<T> {
  data: T;
  getData: () => T;
}

class MyClass<T> implements GenericInterface<T> {
  data: T;
  
  constructor(data: T) {
    this.data = data;
  }
  
  getData(): T {
    return this.data;
  }
}
\`\`\`

### 泛型约束

#### 使用extends关键字

\`\`\`typescript
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): T {
  console.log(arg.length);
  return arg;
}

// 正确：字符串有length属性
logLength("hello");

// 错误：数字没有length属性
// logLength(42);
\`\`\`

#### 泛型约束中使用类型参数

\`\`\`typescript
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}

let x = { a: 1, b: 2, c: 3, d: 4 };

getProperty(x, "a"); // 正确
getProperty(x, "m"); // 错误：参数"m"的类型不能赋值给参数类型"a" | "b" | "c" | "d"
\`\`\`

### 高级泛型应用

#### 条件泛型

\`\`\`typescript
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>; // true
type Test2 = IsString<number>; // false
\`\`\`

#### 泛型工具函数

\`\`\`typescript
function createArray<T>(length: number, value: T): T[] {
  return new Array(length).fill(value);
}

const strings = createArray<string>(3, "hello");
const numbers = createArray<number>(3, 42);
\`\`\`

### 泛型的最佳实践

#### 1. 使用泛型而非any

\`\`\`typescript
// ❌ 不好
function logValue(arg: any): any {
  console.log(arg);
  return arg;
}

// ✅ 好
function logValue<T>(arg: T): T {
  console.log(arg);
  return arg;
}
\`\`\`

#### 2. 约束泛型参数

\`\`\`typescript
// ❌ 太宽松
function merge<T>(obj1: T, obj2: T): T {
  return { ...obj1, ...obj2 };
}

// ✅ 更具体
function merge<T extends Record<string, any>>(obj1: T, obj2: T): T {
  return { ...obj1, ...obj2 };
}
\`\`\`

#### 3. 泛型命名约定

- T, U, V - 通用类型
- K - 对象键
- V - 值
- E - 元素
- R - 返回类型

## 实战案例

\`\`\`typescript
// API响应类型
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);
  return response.json();
}

// 使用
interface User {
  id: number;
  name: string;
}

const userResponse = await fetchData<User>('/api/users/1');
\`\`\`

泛型让我们可以编写更加灵活和可重用的代码，同时保持类型安全。`,
                orderIndex: 2,
                durationMinutes: 60,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'chapter_2_3',
                courseId: '2',
                title: '装饰器与元编程',
                description: '学习TypeScript装饰器和元编程技术',
                content: `## 装饰器与元编程

### 装饰器（Decorators）简介

装饰器是一种特殊类型的声明，它能够被附加到类声明、方法、属性或参数上。装饰器使用@expression这种形式。

### 启用装饰器支持

在tsconfig.json中启用：

\`\`\`json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
\`\`\`

### 类装饰器

\`\`\`typescript
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  greet() {
    return "Hello, " + this.greeting;
  }
}
\`\`\`

### 方法装饰器

\`\`\`typescript
function enumerable(value: boolean) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    descriptor.enumerable = value;
  };
}

class Greeter {
  greeting: string;
  
  constructor(message: string) {
    this.greeting = message;
  }
  
  @enumerable(false)
  greet() {
    return "Hello, " + this.greeting;
  }
}
\`\`\`

### 属性装饰器

\`\`\`typescript
function required(target: any, propertyKey: string) {
  Object.defineProperty(target, propertyKey, {
    configurable: false
  });
}

class User {
  @required
  username: string;
  
  constructor(username: string) {
    this.username = username;
  }
}
\`\`\`

### 参数装饰器

\`\`\`typescript
function validate(
  target: any,
  propertyKey: string,
  parameterIndex: number
) {
  // 元数据存储
  console.log(\`Validating parameter \${parameterIndex} of \${propertyKey}\`);
}

class Calculator {
  add(@validate a: number, @validate b: number): number {
    return a + b;
  }
}
\`\`\`

### 装饰器工厂

\`\`\`typescript
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    console.log(\`Calling \${propertyKey} with args:\`, args);
    const result = originalMethod.apply(this, args);
    console.log(\`\${propertyKey} returned:\`, result);
    return result;
  };
  
  return descriptor;
}

class MathService {
  @log
  multiply(a: number, b: number): number {
    return a * b;
  }
}
\`\`\`

### 元编程实践

#### 使用reflect-metadata

\`\`\`typescript
import "reflect-metadata";

const formatMetadataKey = Symbol("format");

function format(formatString: string) {
  return Reflect.metadata(formatMetadataKey, formatString);
}

function getFormat(target: any, propertyKey: string) {
  return Reflect.getMetadata(formatMetadataKey, target, propertyKey);
}

class Greeter {
  @format("Hello, %s")
  greeting: string;
  
  constructor(message: string) {
    this.greeting = message;
  }
  
  greet() {
    let formatString = getFormat(this, "greeting");
    return formatString.replace("%s", this.greeting);
  }
}
\`\`\`

### 装饰器的组合

多个装饰器可以应用到同一个声明上：

\`\`\`typescript
@f @g
class C { }

// 等同于
f(g(C))
\`\`\`

### 装饰器的应用场景

#### 1. 依赖注入

\`\`\`typescript
class Service {
  doSomething() {
    console.log("Service working...");
  }
}

function inject(target: any, propertyKey: string) {
  // 依赖注入逻辑
}

class Controller {
  @inject
  private service: Service;
  
  execute() {
    this.service.doSomething();
  }
}
\`\`\`

#### 2. 路由装饰器

\`\`\`typescript
const routes = [];

function route(path: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    routes.push({ path, method: propertyKey });
  };
}

class UserController {
  @route("/api/users")
  getUsers() {
    return [];
  }
  
  @route("/api/users/:id")
  getUser(id: number) {
    return { id };
  }
}
\`\`\`

#### 3. 性能监控

\`\`\`typescript
function measure(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    const end = performance.now();
    console.log(\`\${propertyKey} took \${end - start} milliseconds\`);
    return result;
  };
  
  return descriptor;
}

class DataProcessor {
  @measure
  processLargeData() {
    // 复杂的数据处理
  }
}
\`\`\`

## 最佳实践

1. **谨慎使用装饰器**：装饰器会增加代码复杂度
2. **编写清晰的装饰器**：确保装饰器的作用明确
3. **文档化装饰器**：为自定义装饰器编写文档
4. **测试装饰器**：确保装饰器行为正确

装饰器为TypeScript提供了强大的元编程能力，是实现框架和库的重要技术。`,
                orderIndex: 3,
                durationMinutes: 60,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ],
            questionBanks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: '1',
            totalDuration: 180,
            progress: 25
          },
          {
            id: '3',
            title: '走进军事理论课堂：中国古近代武器装备发展史',
            description: '本课程旨在全面介绍中国从古至今的军事历史，重点探讨中国古近代武器装备的演变历程。课程内容涵盖了从公元前21世纪至1949年新中国成立的漫长历史时期，通过分析不同时代的武器装备，揭示了中国军事科技的发展及其对社会和历史的影响。',
            level: 'intermediate' as CourseLevel,
            status: 'published' as CourseStatus,
            objectives: [
              '了解中国古近代军事历史的时期划分和主要特点',
              '掌握武器装备在不同时代的发展变化',
              '分析中国军事科技发展的历史脉络',
              '理解武器装备发展对社会和历史的影响'
            ],
            chapters: [
              {
                id: 'chapter_3_1',
                courseId: '3',
                title: '中国古近代军事历史概述',
                description: '介绍中国古近代军事历史的时期划分和主要特点，包括各阶级、民族、政治集团通过战争完成新旧王朝的交替换代，以及中国人民追求国家独立和民族复兴的历史。',
                content: `## 中国古近代军事历史概述

### 历史时期划分
中国古近代军事历史可以追溯到公元前21世纪的夏朝，直至1949年新中国的成立。这一时期跨越了约4000年的历史长河，经历了奴隶社会、封建社会、半殖民地半封建社会的漫长发展历程。

### 主要特点

#### 王朝更替与战争
- 各阶级、民族、政治集团通过战争完成新旧王朝的交替换代
- 内部统一战争与外来侵扰的博弈
- 中央集权与地方割据的军事斗争

#### 民族融合与发展
- 汉族与其他少数民族的融合与发展
- 边疆地区的军事防御与开发
- 多民族共同构建的国防体系

### 中国人民的奋斗历程

#### 追求国家独立
- 反抗外来侵略的民族战争
- 维护国家主权和领土完整
- 中国人民不屈不挠的斗争精神

#### 民族复兴的历史
- 从闭关锁国到开放图强
- 军事现代化的艰难探索
- 为民族复兴奠定的基础

## 历史意义

中国古近代军事历史是中华民族发展的重要组成部分，为理解中国的军事传统和文化积淀提供了重要视角。`,
                orderIndex: 1,
                durationMinutes: 30,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'chapter_3_2',
                courseId: '3',
                title: '铜器时代的武器装备',
                description: '探讨中国铜器时代的武器装备特点，包括武器材料的制作上的转变，以及攻击性和防护性兵器的种类。',
                content: `## 铜器时代的武器装备

### 武器材料的转变
从石器时代进入铜器时代，是人类军事装备发展的重要里程碑。青铜作为一种新的材料，具有硬度高、韧性好的特点，为武器装备的制作带来了革命性变化。

### 攻击性兵器

#### 近战兵器
- **青铜剑**：不同长度的剑型适应不同战术需要
- **戈**：先秦时期的主要兵器，具有钩、啄、割的功能
- **矛**：长兵器，用于骑兵和步兵的冲击
- **斧、钺**：重型兵器，用于破甲和劈砍

#### 远射兵器
- **弓箭**：弓箭的发明大大提高了杀伤距离
- **弩**：更强大的远程武器，射程和威力显著增强

### 防护性兵器

#### 甲胄
- **青铜甲**：早期防护装备，保护关键部位
- **皮甲**：更灵活的防护装备，广泛使用
- **盾牌**：防御工事的重要组成部分

#### 防护体系
- **头盔**：头部防护装备
- **护臂护腿**：四肢防护装备

## 战术影响

铜器时代的武器装备发展为后来的军事战术奠定了重要基础，特别是车战战术的发展，在古代战争中发挥了重要作用。

## 历史意义

铜器时代的武器装备代表了中国早期军事文明的高度发展，为后世军事技术的演进提供了重要基础。`,
                orderIndex: 2,
                durationMinutes: 30,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'chapter_3_3',
                courseId: '3',
                title: '铁器时代的武器装备',
                description: '分析铁器时代武器装备的质的飞跃，包括武器材料的制作上的转变和武器装备种类的创新。',
                content: `## 铁器时代的武器装备

### 武器材料的革命性转变
从铜器到铁器的转变，标志着军事装备技术的质的飞跃。铁器具有硬度更高、成本更低、易于大规模生产的优势，使得武器装备得以普及和标准化。

### 武器装备种类的创新

#### 铁制兵器的多样性
- **铁剑**：更加锋利，易于锻造
- **铁刀**：短兵器的重要形式
- **长兵器**：铁制长矛、长枪的普及
- **复合武器**：铁制武器与其他材料的结合

#### 防护装备的发展
- **铁甲**：防护能力大幅提升
- **锁子甲**：灵活的金属链甲
- **铁制盾牌**：更强的防御能力

### 战术革新

#### 步兵的崛起
- 铁制武器的普及使大规模步兵成为可能
- 装备成本降低，军队规模扩大
- 战术更加灵活多样

#### 骑兵的发展
- 铁制马具的应用
- 骑兵装备的完善
- 骑兵战术的演进

### 攻城器械的完善
- **云梯**：改进的攻城器械
- **冲车**：破城器械
- **投石机**：远程攻城武器

## 军事组织的变化

铁器时代武器装备的发展促进了军事组织和战术思想的重大变化，为后来的军事体制奠定了基础。

## 历史意义

铁器时代的武器装备发展，标志着中国军事技术进入了一个新的发展阶段，对后来军事科技的发展产生了深远影响。`,
                orderIndex: 3,
                durationMinutes: 30,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'chapter_3_4',
                courseId: '3',
                title: '火器时代的武器装备',
                description: '描述火器时代武器装备的发展，特别是火药应用于战争后的变化，以及火器的初始阶段和爆炸性火器的出现。',
                content: `## 火器时代的武器装备

### 火药的应用与革命
火药的发明和应用，标志着人类战争进入了热兵器时代。火药应用于战争后，武器装备发生了根本性的变化，战争的杀伤力和破坏力大大增强。

### 火器的初始阶段

#### 早期火器
- **火铳**：早期火枪的雏形
- **火筒**：简单的喷射火器
- **火箭**：利用火药推进的武器

#### 火器制作工艺
- 火药配方的改进
- 火器制造技术的发展
- 金属铸造工艺的应用

### 爆炸性火器的出现

#### 火铳的演进
- **鸟铳**：精度更高的火铳
- **火枪**：单兵使用的火器
- **抬枪**：大型火铳

#### 火炮的发展
- **红夷大炮**：重型火炮
- **野战炮**：机动性强的火炮
- **守城炮**：防守用的大型火炮

### 火器战术的变革

#### 火器兵种的建立
- 火器营的组建
- 火器兵的训练
- 火器战术的制定

#### 火器与冷兵器的结合
- 火器与弓箭的配合
- 火器与骑兵的协同
- 步炮协同战术

### 火器对战局的影响
- 改变了战争的形态
- 提高了战争的破坏力
- 促进了军事技术的竞赛

## 中国的火器发展

中国是世界上最早发明和使用火器的国家，但在明清时期，火器技术的发展逐渐落后于西方，这成为了后来军事衰落的因素之一。

## 历史意义

火器时代标志着战争进入了新的历史阶段，火器的发明和应用不仅改变了战争的方式，也对人类社会的发展产生了深远影响。`,
                orderIndex: 4,
                durationMinutes: 30,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'chapter_3_5',
                courseId: '3',
                title: '机械化时代的武器装备',
                description: '探讨中国近代机械化时代武器装备的发展，特别是坦克和飞机的引入对中国军事的影响。',
                content: `## 机械化时代的武器装备

### 近代中国面临的挑战
19世纪末20世纪初，西方工业革命带来的军事技术革命，将战争推向了机械化时代。中国在鸦片战争后，面对西方列强的坚船利炮，开始意识到军事现代化的紧迫性。

### 坦克的引入与发展

#### 坦克的首次出现
- 第一次世界大战后，坦克作为新式武器登上战争舞台
- 中国于20世纪20年代开始引进坦克
- 北伐战争时期坦克的应用

#### 坦克对中国军事的影响
- **战术革新**：改变了步兵作战方式
- **装备现代化**：推动了中国军队的现代化进程
- **装备差距**：暴露了与西方国家的技术差距

### 飞机的引入与空军建立

#### 中国空军的诞生
- 北洋政府时期开始引进飞机
- 民国初年建立航空学校和空军
- 抗战时期中国空军的艰苦斗争

#### 空军对中国军事的影响
- **战略价值**：空中优势的建立
- **防御能力**：防空体系的建设
- **技术追赶**：航空工业的起步

### 海军现代化建设

#### 近代海军的建立
- 洋务运动时期的北洋水师
- 海军装备的引进与仿制
- 海军战术的现代化

#### 海军的局限
- 装备落后于西方国家
- 甲午战争的教训
- 海军现代化道路的曲折

### 机械化时代的影响

#### 军事组织的变化
- 新式军队的建设
- 军事指挥体系的现代化
- 军事教育的兴起

#### 国防工业的发展
- 军工企业的建立
- 武器装备的国产化努力
- 技术引进与自主创新

### 历史教训
机械化时代，中国虽然努力追赶，但由于基础薄弱、技术落后等因素，仍与西方国家存在较大差距。这一时期的历史经验教训，为后来中国军事现代化建设提供了重要启示。

## 历史意义

机械化时代标志着战争进入了全新的阶段，中国在这一时期的探索和努力，为后来的军事发展奠定了基础，也展现了中国人民追求民族独立和国家富强的坚定信念。`,
                orderIndex: 5,
                durationMinutes: 30,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ],
            questionBanks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: '1',
            totalDuration: 150,
            progress: 0
          },
          {
            id: '4',
            title: '六年级语文上册解读与拓展',
            description: '本课程针对六年级学生设计的语文上册教材解读与拓展，涵盖课文内容解析、写作技巧提升、阅读理解训练及文化背景介绍，旨在提高学生的语文综合素养。',
            level: 'beginner' as CourseLevel,
            status: 'published' as CourseStatus,
            objectives: [
              '掌握六年级语文上册的核心内容与学习策略',
              '提升阅读理解和写作能力',
              '增强文化素养和语文综合应用能力',
              '培养良好的语文学习习惯和思维方式'
            ],
            chapters: [
              {
                id: 'chapter_4_1',
                courseId: '4',
                title: '教材概览与学习策略',
                description: '介绍六年级语文上册的教材结构、核心主题及学习策略。',
                content: `## 教材概览与学习策略

### 六年级语文上册教材结构

#### 教材基本框架
六年级语文上册教材围绕**核心素养**构建，旨在培养学生的语言运用能力、思维能力、审美能力和文化传承能力。

#### 主要单元主题
- **第一单元**：走进自然，感受四季之美
- **第二单元**：人文关怀，感受人间真情
- **第三单元**：历史文化，传承民族精神
- **第四单元**：科技创新，展望未来发展
- **第五单元**：文学经典，提升审美素养

### 核心学习策略

#### 阅读策略
- **精读与略读结合**：根据文本特点选择阅读方法
- **圈点批注**：养成不动笔墨不读书的习惯
- **思维导图**：梳理文章结构，把握主要内容

#### 表达策略
- **积累运用**：好词好句的积累与运用
- **仿写练习**：通过仿写提升表达能力
- **创意写作**：培养创新思维与表达能力

### 学习方法指导

#### 课前预习
- 通读课文，理解大意
- 标记生字词，查阅字典
- 思考课后问题，做好准备

#### 课堂学习
- 认真听讲，积极思考
- 参与讨论，表达观点
- 做好笔记，记录要点

#### 课后复习
- 及时复习，巩固知识
- 完成练习，检测效果
- 拓展阅读，丰富积累

## 学习目标

通过本学期的学习，学生将：
- 积累丰富的语言材料
- 提高阅读理解和写作能力
- 增强文化底蕴和语文素养
- 培养良好的学习习惯和思维方式

## 学习方法

**主动学习**：积极参与课堂活动，主动思考和提问

**合作学习**：与同学交流讨论，共同进步

**实践学习**：将所学知识运用到实际生活中`,
                orderIndex: 1,
                durationMinutes: 40,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'chapter_4_2',
                courseId: '4',
                title: '课文内容深度解析',
                description: '深入分析每篇课文的内容、结构和主题思想。',
                content: `## 课文内容深度解析

### 课文分析方法

#### 整体感知
- 通读全文，了解大意
- 理清文章结构，把握脉络
- 识别文章体裁和题材

#### 重点分析
- 理解关键词句的含义和作用
- 分析人物形象和性格特点
- 把握文章主题和思想感情

### 典型课文解析示例

#### 写景散文
**《草原》**——感受自然之美

**主要内容**：
- 描写草原的壮美风光
- 展现草原人民的热情好客
- 抒发对草原的热爱之情

**重点词句**：
- "那里的天比别处的更可爱，空气是那么清鲜"
- 运用比喻、拟人等修辞手法

**主题思想**：赞美祖国山河的壮美

#### 叙事散文
**《丁香结》**——生活哲理的思考

**主要内容**：
- 描写丁香花的美丽
- 联想到生活中的烦恼和忧愁
- 表达对人生的感悟

**重点词句**：
- "人生中的问题也是解不完的"
- 由花及人，借物喻人

**主题思想**：面对生活中的困难要有坦然的态度

### 不同文体的阅读方法

#### 记叙文
- 理清六要素：时间、地点、人物、起因、经过、结果
- 分析人物形象和事件意义

#### 说明文
- 把握说明对象和特征
- 了解说明方法和说明顺序

#### 议论文
- 找出中心论点和分论点
- 理解论证方法和论证过程

## 深度阅读指导

**抓住重点**：理解关键词句的含义

**分析手法**：识别修辞手法和表达技巧

**感悟思想**：体会文章蕴含的情感

**联系实际**：结合生活经验理解文章`,
                orderIndex: 2,
                durationMinutes: 60,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'chapter_4_3',
                courseId: '4',
                title: '阅读理解与写作技巧提升',
                description: '通过精选课文练习，提高学生的阅读理解和写作能力。',
                content: `## 阅读理解与写作技巧提升

### 阅读理解能力提升

#### 理解词句含义
- **联系上下文**：在语境中理解词语意思
- **抓关键词语**：理解重点词语的作用
- **品味修辞**：体会修辞手法的表达效果

#### 把握主要内容
- **段意归纳法**：概括每段主要内容
- **要素提取法**：抓住时间、地点、人物等要素
- **线索梳理法**：理清文章的叙述线索

#### 体会思想感情
- **抓住关键词句**：找出体现情感的词语
- **分析人物言行**：通过人物言行体会情感
- **联系写作背景**：了解作者写作背景

### 写作技巧指导

#### 积累写作素材
- **观察生活**：从生活中获取写作素材
- **阅读积累**：通过阅读积累优美词句
- **写日记**：坚持写日记培养写作习惯

#### 掌握写作方法
**描写方法**：
- 人物描写：外貌、语言、动作、心理
- 环境描写：自然环境、社会环境
- 细节描写：抓住典型细节

**表达方式**：
- 记叙：清楚叙述事件经过
- 描写：生动形象地描绘景物
- 抒情：表达真挚的情感

#### 提高表达效果
- **运用修辞**：比喻、拟人、排比等
- **巧用动词**：选择准确的动词
- **善用成语**：恰当运用成语

### 写作训练示例

#### 写景作文
- 抓住景物特点
- 按照一定顺序描写
- 运用修辞手法

#### 写人作文
- 抓住人物特点
- 通过具体事例表现
- 运用多种描写方法

#### 记事作文
- 交代清楚六要素
- 详略得当
- 表达真情实感

## 能力提升路径

**多读**：广泛阅读，提高语感

**多写**：勤于练习，熟能生巧

**多思**：善于思考，提升思维

**多改**：反复修改，精益求精`,
                orderIndex: 3,
                durationMinutes: 50,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'chapter_4_4',
                courseId: '4',
                title: '文化背景与语文素养',
                description: '探讨课文背后的文化背景，增强学生的文化认同和语文素养。',
                content: `## 文化背景与语文素养

### 课文中的传统文化

#### 古诗词文化
**《古诗词三首》**——感受诗词之美
- 了解诗词的韵律之美
- 体会古人的思想感情
- 传承优秀的诗歌文化

#### 传统节日文化
**《北京的春节》**——感受节日氛围
- 了解春节的传统习俗
- 感受传统文化的魅力
- 增强民族文化认同

#### 古典文学
**《红楼春趣》**——走进文学经典
- 了解名著的基本内容
- 感受古典文学的魅力
- 培养阅读名著的兴趣

### 现代文化素养

#### 科技创新
**《只有一个地球》**——关注环保
- 认识环境保护的重要性
- 培养可持续发展的意识
- 理解人类与自然的关系

#### 爱国情怀
**《开国大典》**——感受爱国精神
- 了解新中国成立的历史
- 培养爱国情感
- 增强民族自豪感

#### 人生哲理
**《灯光》**——体会奉献精神
- 理解革命先烈的崇高品格
- 培养无私奉献的精神
- 树立正确的人生观

### 文化素养的培养

#### 广泛阅读
- 阅读经典文学作品
- 涉猎各类优秀读物
- 培养阅读兴趣

#### 文化积淀
- 了解传统文化知识
- 学习民族文化精神
- 增强文化自信

#### 审美能力
- 感受语言之美
- 欣赏文学之美
- 培养艺术素养

## 素养提升路径

**文化知识**：广泛涉猎，拓宽视野

**文化理解**：深入思考，深刻感悟

**文化实践**：学以致用，传承发扬`,
                orderIndex: 4,
                durationMinutes: 45,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'chapter_4_5',
                courseId: '4',
                title: '实践活动与应用',
                description: '通过模拟教学、角色扮演等活动，将所学知识应用于实际。',
                content: `## 实践活动与应用

### 语文实践活动类型

#### 口语交际活动
**主题讨论**：
- 围绕课文主题展开讨论
- 训练口语表达能力
- 培养合作学习能力

**演讲比赛**：
- 选择感兴趣的话题
- 准备演讲稿
- 进行演讲展示

**课本剧表演**：
- 选择合适的故事
- 改编成剧本
- 排练和演出

#### 综合性学习活动
**调查研究**：
- 选择研究主题
- 收集相关资料
- 整理分析成果

**主题班会**：
- 确定班会主题
- 准备相关内容
- 组织交流讨论

**作品展示**：
- 展示优秀作文
- 展示手抄报
- 展示学习成果

### 实践活动示例

#### 主题活动：走进自然
**活动目标**：
- 观察自然景物
- 描写自然之美
- 培养热爱自然的情感

**活动步骤**：
1. 选择观察地点
2. 仔细观察景物
3. 做好观察记录
4. 写观察作文

#### 主题活动：传承文化
**活动目标**：
- 了解传统文化
- 传承文化遗产
- 增强文化自信

**活动步骤**：
1. 选择文化主题
2. 收集相关资料
3. 制作文化小报
4. 分享交流心得

### 实践活动的意义

#### 学以致用
- 将理论知识运用于实践
- 在实践中加深理解
- 在实践中提升能力

#### 综合发展
- 培养多种能力
- 促进全面发展
- 提升综合素质

#### 培养兴趣
- 激发学习兴趣
- 增强学习动力
- 培养终身学习意识

## 实践活动指导

**明确目标**：清楚活动要达到的目标

**精心设计**：设计有趣有效的活动

**积极参与**：主动参与各项活动

**总结反思**：及时总结活动收获`,
                orderIndex: 5,
                durationMinutes: 60,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'chapter_4_6',
                courseId: '4',
                title: '考试技巧与复习指导',
                description: '提供考试技巧和复习策略，帮助学生有效准备期末考试。',
                content: `## 考试技巧与复习指导

### 复习策略

#### 系统复习
**梳理知识**：
- 整理课文主要内容
- 归纳重点词语和句子
- 总结写作方法和技巧

**查漏补缺**：
- 找出知识薄弱点
- 有针对性地复习
- 及时解决疑难问题

**综合练习**：
- 做各类题型练习
- 掌握答题方法
- 提高答题能力

#### 考前准备
**制定计划**：
- 合理安排复习时间
- 分配各科复习任务
- 确保充分准备

**调整心态**：
- 保持良好心态
- 克服紧张情绪
- 树立自信心

### 考试技巧指导

#### 基础知识题
**字词题**：
- 认真审题，弄清要求
- 注意字形、字音、字义
- 仔细辨析，选择准确

**句式题**：
- 理解句子意思
- 掌握句型变化
- 准确改写句子

#### 阅读理解题
**答题步骤**：
1. 通读全文，把握大意
2. 认真审题，明确要求
3. 细读相关段落
4. 准确组织答案

**答题技巧**：
- 从文中找答案
- 抓住关键语句
- 准确表达意思

#### 习作题
**审题**：
- 仔细审题，弄清要求
- 明确写作体裁和范围
- 确定文章中心

**构思**：
- 确定中心
- 选择材料
- 安排结构

**写作**：
- 语句通顺，表达清楚
- 内容具体，描写生动
- 结构完整，首尾呼应

### 复习重点提示

#### 重点词语
- 掌握课后生字词
- 理解重点词语含义
- 会正确运用词语

#### 重点句子
- 理解含义深刻的句子
- 体会优美句子的表达效果
- 会仿写优美句子

#### 重点课文
- 熟读重点课文
- 理解课文内容
- 掌握课文主题

## 考试注意事项

**仔细审题**：认真阅读题目要求

**规范答题**：按要求规范作答

**书写工整**：保持卷面整洁

**时间分配**：合理分配答题时间

**检查核对**：认真检查答案`,
                orderIndex: 6,
                durationMinutes: 55,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'chapter_4_7',
                courseId: '4',
                title: '综合讨论与反馈',
                description: '组织学生进行综合讨论，收集反馈，不断优化学习过程。',
                content: `## 综合讨论与反馈

### 学习总结与反思

#### 学期收获
通过本学期语文课程的学习，同学们获得了多方面的成长：

**知识方面**：
- 掌握了丰富的语言知识
- 阅读了大量的优秀文章
- 了解了丰富的文化知识

**能力方面**：
- 提高了阅读能力
- 增强了写作能力
- 培养了表达能力

**素养方面**：
- 增强了文化素养
- 提升了审美能力
- 培养了人文情怀

#### 学习反思
**做得好的地方**：
- 哪些学习方法有效？
- 哪些学习习惯值得坚持？
- 取得了哪些进步？

**需要改进的地方**：
- 还有哪些不足？
- 哪些地方需要加强？
- 如何进一步提高？

### 综合讨论主题

#### 主题一：语文学习的收获
**讨论要点**：
- 本学期最大的收获是什么？
- 最喜欢哪篇课文？为什么？
- 学习语文有什么感受？

#### 主题二：学习方法分享
**讨论要点**：
- 有什么好的学习方法可以分享？
- 如何提高学习效率？
- 如何培养良好的学习习惯？

#### 主题三：学习困惑与建议
**讨论要点**：
- 学习中有哪些困惑？
- 希望得到哪些帮助？
- 对课程有什么建议？

### 反馈收集

#### 课程反馈
**教学内容**：
- 课程内容是否合适？
- 难度是否适中？
- 是否需要调整？

**教学方法**：
- 教学方式是否有效？
- 哪些环节最受欢迎？
- 需要怎样改进？

**学习效果**：
- 是否达到了学习目标？
- 掌握了哪些知识技能？
- 还有哪些不足？

### 持续改进

#### 基于反馈的改进
**优化教学**：
- 根据反馈调整教学内容
- 改进教学方法
- 提高教学效果

**自我提升**：
- 反思学习过程
- 改进学习方法
- 持续进步

#### 展望未来
**新学期计划**：
- 制定新的学习目标
- 规划学习内容
- 培养新的能力

**长期目标**：
- 培养语文学习兴趣
- 提升语文素养
- 为终身学习打下基础

## 总结寄语

学习是一个不断积累和提升的过程，希望同学们在本学期语文学习中：

**养成良好习惯**：多读、多写、多思、多练

**培养语文兴趣**：热爱阅读，享受语文学习的乐趣

**提升语文素养**：在语文学习中成长，在成长中进步

愿大家在语文学习路上走得更远，飞得更高！`,
                orderIndex: 7,
                durationMinutes: 40,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ],
            questionBanks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: '1',
            totalDuration: 350,
            progress: 0
          }
        ]
        
        // 保存示例数据
        for (const course of sampleCourses) {
          await storage.saveCourse(course)
          // 保存章节数据
          for (const chapter of course.chapters) {
            await storage.saveChapter(chapter)
          }
        }
        
        allCourses = sampleCourses
      }
      
      // 应用搜索和筛选
      if (params) {
        if (params.keyword) {
          allCourses = allCourses.filter(course => 
            course.title.toLowerCase().includes(params.keyword!.toLowerCase()) ||
            course.description.toLowerCase().includes(params.keyword!.toLowerCase())
          )
        }
        
        if (params.level) {
          allCourses = allCourses.filter(course => course.level === params.level)
        }
        
        if (params.status) {
          allCourses = allCourses.filter(course => course.status === params.status)
        }
      }
      
      // 不要覆盖store中的原始数据，只在没有搜索条件时更新
      if (!params || (!params.keyword && !params.level && !params.status)) {
        // 为每个课程加载章节数据
        for (const course of allCourses) {
          const chapters = await storage.getChaptersByCourseId(course.id)
          course.chapters = chapters
        }
        courses.value = allCourses
      }
      
      // 分页处理
      const page = params?.page || 1
      const pageSize = params?.pageSize || 10
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const paginatedCourses = allCourses.slice(start, end)
      
      return {
        courses: paginatedCourses,
        total: allCourses.length,
        page,
        pageSize
      }
    } catch (err) {
      console.error('课程store获取课程失败:', err)
      error.value = err instanceof Error ? err.message : '获取课程列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取单个课程
  const fetchCourse = async (id: string): Promise<Course | null> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      const course = await storage.getCourse(id)
      if (course) {
        currentCourse.value = course
        // 同时加载章节
        const chapters = await storage.getChaptersByCourseId(id)
        currentCourse.value.chapters = chapters
      }
      
      return course
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取课程失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 创建课程
  const createCourse = async (courseForm: CourseCreateForm): Promise<Course> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      const userStore = useUserStore()
      const userId = userStore.userInfo?.userId || 'default'
      
      const newCourse: Course = {
        id: `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: courseForm.title,
        description: courseForm.description,
        level: courseForm.level,
        status: CourseStatus.DRAFT,
        chapters: [],
        questionBanks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId,
        progress: 0
      }
      
      await storage.saveCourse(newCourse)
      courses.value.push(newCourse)
      currentCourse.value = newCourse
      
      return newCourse
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建课程失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新课程
  const updateCourse = async (id: string, updateForm: CourseUpdateForm): Promise<Course> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      const course = await storage.getCourse(id)
      if (!course) {
        throw new Error('课程不存在')
      }
      
      // 处理章节更新
      let updatedChapters = course.chapters || []
      if (updateForm.chapters) {
        // 删除现有章节
        for (const chapter of course.chapters || []) {
          await storage.deleteChapter(chapter.id)
        }
        
        // 创建新章节
        updatedChapters = []
        for (const chapterData of updateForm.chapters) {
          const newChapter: Chapter = {
            id: `chapter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            courseId: id,
            title: chapterData.title,
            description: chapterData.description,
            content: chapterData.content,
            orderIndex: chapterData.orderIndex,
            durationMinutes: chapterData.durationMinutes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          await storage.saveChapter(newChapter)
          updatedChapters.push(newChapter)
        }
      }
      
      const updatedCourse: Course = {
        ...course,
        title: updateForm.title ?? course.title,
        description: updateForm.description ?? course.description,
        level: updateForm.level ?? course.level,
        status: updateForm.status ?? course.status,
        objectives: updateForm.objectives ?? course.objectives,
        chapters: updatedChapters,
        updatedAt: new Date().toISOString()
      }
      
      await storage.saveCourse(updatedCourse)
      
      // 更新本地状态
      const index = courses.value.findIndex(c => c.id === id)
      if (index >= 0) {
        courses.value[index] = updatedCourse
      }
      
      if (currentCourse.value?.id === id) {
        currentCourse.value = updatedCourse
      }
      
      return updatedCourse
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新课程失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除课程
  const deleteCourse = async (id: string): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      await storage.deleteCourse(id)
      
      // 更新本地状态
      courses.value = courses.value.filter(c => c.id !== id)
      
      if (currentCourse.value?.id === id) {
        currentCourse.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除课程失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 创建章节
  const createChapter = async (courseId: string, chapterForm: ChapterCreateForm): Promise<Chapter> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      const newChapter: Chapter = {
        id: `chapter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        courseId,
        title: chapterForm.title,
        description: chapterForm.description,
        content: chapterForm.content,
        orderIndex: chapterForm.orderIndex,
        durationMinutes: chapterForm.durationMinutes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await storage.saveChapter(newChapter)
      
      // 更新当前课程的章节列表
      if (currentCourse.value?.id === courseId) {
        currentCourse.value.chapters.push(newChapter)
        currentCourse.value.chapters.sort((a, b) => a.orderIndex - b.orderIndex)
      }
      
      return newChapter
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建章节失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新章节
  const updateChapter = async (id: string, updateForm: ChapterUpdateForm): Promise<Chapter> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      const chapter = await storage.getChapter(id)
      if (!chapter) {
        throw new Error('章节不存在')
      }
      
      const updatedChapter: Chapter = {
        ...chapter,
        ...updateForm,
        updatedAt: new Date().toISOString()
      }
      
      await storage.saveChapter(updatedChapter)
      
      // 更新当前课程的章节列表
      if (currentCourse.value) {
        const index = currentCourse.value.chapters.findIndex(c => c.id === id)
        if (index >= 0) {
          currentCourse.value.chapters[index] = updatedChapter
          currentCourse.value.chapters.sort((a, b) => a.orderIndex - b.orderIndex)
        }
      }
      
      if (currentChapter.value?.id === id) {
        currentChapter.value = updatedChapter
      }
      
      return updatedChapter
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新章节失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除章节
  const deleteChapter = async (id: string): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      await storage.deleteChapter(id)
      
      // 更新当前课程的章节列表
      if (currentCourse.value) {
        currentCourse.value.chapters = currentCourse.value.chapters.filter(c => c.id !== id)
      }
      
      if (currentChapter.value?.id === id) {
        currentChapter.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除章节失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 设置当前课程
  const setCurrentCourse = (course: Course | null) => {
    currentCourse.value = course
  }

  // 设置当前章节
  const setCurrentChapter = (chapter: Chapter | null) => {
    currentChapter.value = chapter
  }

  // 更新课程进度
  const updateCourseProgress = async (courseId: string, progress: number): Promise<void> => {
    try {
      const course = await storage.getCourse(courseId)
      if (course) {
        course.progress = progress
        await storage.saveCourse(course)
        
        // 更新本地状态
        const index = courses.value.findIndex(c => c.id === courseId)
        if (index >= 0) {
          courses.value[index].progress = progress
        }
        
        if (currentCourse.value?.id === courseId) {
          currentCourse.value.progress = progress
        }
      }
    } catch (err) {
      console.error('更新课程进度失败:', err)
    }
  }

  // 更新章节完成状态
  const updateChapterCompletion = async (chapterId: string, isCompleted: boolean): Promise<void> => {
    try {
      const chapter = await storage.getChapter(chapterId)
      if (chapter) {
        chapter.isCompleted = isCompleted
        chapter.lastLearnedAt = new Date().toISOString()
        await storage.saveChapter(chapter)
        
        // 更新本地状态
        if (currentCourse.value) {
          const chapterIndex = currentCourse.value.chapters.findIndex(c => c.id === chapterId)
          if (chapterIndex >= 0) {
            currentCourse.value.chapters[chapterIndex].isCompleted = isCompleted
            currentCourse.value.chapters[chapterIndex].lastLearnedAt = new Date().toISOString()
          }
        }
        
        if (currentChapter.value?.id === chapterId) {
          currentChapter.value.isCompleted = isCompleted
          currentChapter.value.lastLearnedAt = new Date().toISOString()
        }
      }
    } catch (err) {
      console.error('更新章节完成状态失败:', err)
    }
  }

  // 清除错误
  const clearError = () => {
    error.value = null
  }

  // 交互式内容相关方法
  
  // 获取章节的交互式内容（优先从数据库，回退到预制文件）
  const getChapterInteractiveContent = async (chapterId: string): Promise<string | null> => {
    try {
      initStorage()
      
      // 1. 从数据库获取
      const dbContent = await storage.getChapterInteractiveContent(chapterId)
      if (dbContent) {
        return dbContent
      }
      
      // 2. 从预制文件加载
      const course = currentCourse.value
      if (course) {
        const prebuiltContent = await prebuiltContentManager.loadPrebuiltContent(course.id, chapterId)
        if (prebuiltContent) {
          // 保存到数据库并标记为预制类型
          await storage.updateChapterInteractiveContentStatus(chapterId, true, 'prebuilt')
          return prebuiltContent
        }
      }
      
      return null
    } catch (error) {
      console.error('获取交互式内容失败:', error)
      return null
    }
  }

  // 保存生成的交互式内容
  const saveInteractiveContent = async (chapterId: string, content: string): Promise<void> => {
    try {
      initStorage()
      await storage.saveChapterInteractiveContent(chapterId, content)
      
      // 更新当前章节状态
      if (currentChapter.value?.id === chapterId) {
        currentChapter.value.interactiveContent = content
        currentChapter.value.hasInteractiveContent = true
        currentChapter.value.interactiveContentType = 'generated'
      }
      
      // 更新课程中的章节状态
      const course = currentCourse.value
      if (course?.chapters) {
        const chapterIndex = course.chapters.findIndex(c => c.id === chapterId)
        if (chapterIndex >= 0) {
          course.chapters[chapterIndex] = {
            ...course.chapters[chapterIndex],
            interactiveContent: content,
            hasInteractiveContent: true,
            interactiveContentType: 'generated'
          }
        }
      }
    } catch (error) {
      console.error('保存交互式内容失败:', error)
      throw error
    }
  }

  // 生成交互式内容
  const generateInteractiveContent = async (chapterId: string, courseTitle?: string, chapterTitle?: string, chapterDescription?: string, chapterContent?: string): Promise<string> => {
    try {
      // 优先使用传入的参数，否则从当前状态获取
      let finalCourseTitle = courseTitle
      let finalChapterTitle = chapterTitle
      let finalChapterDescription = chapterDescription
      let finalChapterContent = chapterContent
      
      if (!finalCourseTitle || !finalChapterTitle) {
        const chapter = currentChapter.value
        const course = currentCourse.value
        
        if (!chapter || !course) {
          throw new Error('章节或课程信息不完整')
        }
        
        finalCourseTitle = finalCourseTitle || course.title
        finalChapterTitle = finalChapterTitle || chapter.title
        finalChapterDescription = finalChapterDescription || chapter.description
        finalChapterContent = finalChapterContent || chapter.content || ''
      }
      
      const content = await contentGenerator.generateInteractiveContent(
        finalCourseTitle!,
        finalChapterTitle!,
        finalChapterDescription || '',
        finalChapterContent || ''
      )
      
      // 保存生成的内容
      await saveInteractiveContent(chapterId, content)
      
      return content
    } catch (error) {
      console.error('生成交互式内容失败:', error)
      throw error
    }
  }

  // 检查章节是否有预制交互式内容
  const checkPrebuiltInteractiveContent = async (courseId: string, chapterId: string): Promise<boolean> => {
    try {
      return await prebuiltContentManager.checkPrebuiltExists(courseId, chapterId)
    } catch (error) {
      console.error('检查预制内容失败:', error)
      return false
    }
  }

  // 预加载课程的预制交互内容
  const preloadCourseInteractiveContent = async (courseId: string): Promise<void> => {
    try {
      const course = courses.value.find(c => c.id === courseId)
      if (course?.chapters) {
        const chapterIds = course.chapters.map(c => c.id)
        await prebuiltContentManager.preloadCourseContent(courseId, chapterIds)
        
        // 更新章节的交互式内容状态
        for (const chapter of course.chapters) {
          const hasPrebuilt = await prebuiltContentManager.checkPrebuiltExists(courseId, chapter.id)
          if (hasPrebuilt) {
            await storage.updateChapterInteractiveContentStatus(chapter.id, true, 'prebuilt')
            chapter.hasInteractiveContent = true
            chapter.interactiveContentType = 'prebuilt'
          }
        }
      }
    } catch (error) {
      console.error('预加载交互式内容失败:', error)
    }
  }

  return {
    // 状态
    courses,
    currentCourse,
    currentChapter,
    loading,
    error,
    
    // 计算属性
    courseCount,
    publishedCourses,
    draftCourses,
    
    // 方法
    fetchCourses,
    fetchCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    createChapter,
    updateChapter,
    deleteChapter,
    setCurrentCourse,
    setCurrentChapter,
    updateCourseProgress,
    updateChapterCompletion,
    clearError,
    
    // 交互式内容方法
    getChapterInteractiveContent,
    saveInteractiveContent,
    generateInteractiveContent,
    checkPrebuiltInteractiveContent,
    preloadCourseInteractiveContent
  }
})
