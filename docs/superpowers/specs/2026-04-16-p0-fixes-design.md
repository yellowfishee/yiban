# P0 问题修复设计文档

**日期**: 2026-04-16  
**状态**: 待实现

## 概述

本文档描述两个 P0 问题的修复方案：
1. 缺少用户服务协议同意机制 — 微信小程序审核必须项
2. AI 分析占位符不消失 — 核心功能不可用

---

## 问题一：用户协议同意机制

### 背景

微信小程序审核要求：用户登录前需勾选同意《用户服务协议》和《隐私政策》。

当前状态：
- 登录页无协议勾选框
- 小程序一键登录（`loginWithWeapp`）在首页点击按钮时直接执行，无任何同意步骤
- 整个代码库无协议相关组件/页面/接口

### 用户选择

- **协议内容**: 需要模板
- **存储方式**: 本地存储（Taro Storage）
- **交互方式**: 弹窗 + 登录页都需要

### 架构设计

```
首页点击打卡按钮
    │
    ├── 未同意协议? ──→ 弹出协议弹窗 ──→ 勾选同意 ──→ 存储同意状态 ──→ 继续登录/打卡
    │
    └── 已同意协议? ──→ 直接登录/打卡

登录页
    │
    └── 手机号登录表单前 ──→ 协议勾选框 + 链接 ──→ 勾选后才能点击登录
```

### 组件设计

#### 新增组件

| 组件 | 文件路径 | 功能 |
|------|----------|------|
| `AgreementModal` | `packages/app/src/components/agreement/AgreementModal.tsx` | 协议弹窗，包含勾选框、协议链接、确认按钮 |
| `AgreementCheckbox` | `packages/app/src/components/agreement/AgreementCheckbox.tsx` | 独立勾选组件，用于登录页 |
| `UserAgreement` | `packages/app/src/pages/agreement/index.tsx` | 用户服务协议页面 |
| `PrivacyPolicy` | `packages/app/src/pages/privacy/index.tsx` | 隐私政策页面 |

#### 修改文件

| 文件 | 改动 |
|------|------|
| `packages/app/src/pages/home/index.tsx` | `onCheckIn` 中增加协议检查逻辑 |
| `packages/app/src/pages/login/index.tsx` | 登录表单前添加协议勾选框 |
| `packages/app/src/app.config.ts` | 注册新页面路由 |
| `packages/app/src/adapters/storage.ts` | 新增 `AGREEMENT_ACCEPTED` 存储键 |

### 数据存储

**存储键**: `agreement_accepted`

**存储值**:
```typescript
interface AgreementStatus {
  accepted: boolean;
  acceptedAt: string;  // ISO 日期字符串
}
```

**存储位置**: Taro Storage（本地持久化）

### 组件详细设计

#### AgreementModal

```typescript
interface AgreementModalProps {
  visible: boolean;
  onConfirm: () => void;
  onClose: () => void;
}
```

UI 结构：
- 遮罩层（点击不关闭）
- 弹窗容器
- 标题："用户协议与隐私政策"
- 说明文字
- 勾选框 + 协议链接（"我已阅读并同意《用户服务协议》和《隐私政策》"）
- 确认按钮（勾选后可点击）

#### AgreementCheckbox

```typescript
interface AgreementCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}
```

UI 结构：
- 勾选框图标
- 文字："我已阅读并同意《用户服务协议》和《隐私政策》"
- 两个协议名称可点击跳转

### 协议内容模板

#### 用户服务协议要点

1. **总则**: 服务范围、协议更新
2. **账号注册与使用**: 注册条件、账号安全
3. **用户行为规范**: 禁止行为、违规处理
4. **服务内容**: 卦象神兽功能说明、内容免责
5. **知识产权**: 版权归属、授权使用
6. **免责声明**: 服务中断、第三方链接
7. **协议终止**: 终止条件、后续处理
8. **法律适用与争议解决**

#### 隐私政策要点

1. **引言**: 政策目的、适用范围
2. **信息收集**: 收集类型（微信 openid、使用记录）、收集方式
3. **信息使用**: 功能实现、个性化服务、安全保障
4. **信息存储**: 存储位置、存储期限
5. **信息保护**: 安全措施、安全事件处理
6. **用户权利**: 访问、更正、删除、注销账号
7. **未成年人保护**: 监护人同意要求
8. **隐私政策更新**: 更新方式、用户通知

### 流程详细说明

#### 首页打卡流程

1. 用户点击"梅花起卦·打卡领养"
2. 检查本地存储 `agreement_accepted`
3. 如果未同意：
   - 显示 `AgreementModal`
   - 用户勾选并点击确认
   - 存储同意状态
   - 关闭弹窗
4. 执行原有登录/打卡逻辑

#### 登录页流程

1. 渲染 `AgreementCheckbox` 在登录表单前
2. 登录按钮禁用状态绑定勾选状态
3. 用户勾选后可点击登录
4. 登录成功时存储同意状态（如果之前未存储）

---

## 问题二：AI 分析占位符修复

### 背景

用户点击场景标签后，skeleton 占位符显示，API 请求完成后占位符不消失，需退出小程序重进才能看到内容。

### 根本原因

`InspirationContext.tsx` 中 `generateAgentContent` 使用 `useCallback` 依赖 `state.agentContents`：

```typescript
const generateAgentContent = useCallback(async (checkinId, scene) => {
  if (state.agentContents.some((c) => c.scene === scene && c.content)) return;  // 闭包读取旧 state
  // ...
}, [state.agentContents, state.generatingScene]);
```

问题：
1. `async` 函数在 `await` 前后持有同一个闭包中的 `state` 引用
2. 在 Taro 小程序环境下，`useReducer` + `Context` 的 state 更新可能存在异步延迟
3. 导致 dispatch 后 Consumer 不能及时收到更新触发重渲染

### 修复方案

使用 `useRef` 保持最新 state 引用。

### 修改文件

| 文件 | 改动 |
|------|------|
| `packages/app/src/context/InspirationContext.tsx` | 添加 stateRef，修改 generateAgentContent |

### 代码改动

```typescript
// InspirationContext.tsx

// 1. 在组件顶部添加 ref
const stateRef = useRef(state);

// 2. 每次渲染更新 ref
useEffect(() => {
  stateRef.current = state;
}, [state]);

// 3. 修改 generateAgentContent，从 ref 读取状态
const generateAgentContent = useCallback(async (checkinId: string, scene: AgentScene) => {
  const currentState = stateRef.current;
  
  // 已有内容则跳过
  if (currentState.agentContents.some((c) => c.scene === scene && c.content)) {
    return;
  }
  // 已在生成中则跳过
  if (currentState.generatingScene === scene) {
    return;
  }

  dispatch({ type: 'SET_GENERATING_SCENE', payload: scene });

  try {
    const result = await agentApi.generate(checkinId, scene);

    if (!result.content) {
      Taro.showToast({ title: result.message || '今日已领取，请明天再来', icon: 'none' });
      dispatch({ type: 'SET_GENERATING_SCENE', payload: null });
      return;
    }

    dispatch({
      type: 'ADD_AGENT_CONTENT',
      payload: {
        scene: result.scene,
        content: result.content,
        beastName: result.beastName,
        cached: result.cached,
      },
    });
  } catch (err) {
    console.error(`Failed to generate ${scene}:`, err);
    dispatch({ type: 'SET_GENERATING_SCENE', payload: null });
  }
}, []);  // 依赖数组简化为空数组
```

---

## 实现计划

### 阶段一：用户协议同意机制

1. 新增存储键 `AGREEMENT_ACCEPTED`
2. 创建 `AgreementCheckbox` 组件
3. 创建 `AgreementModal` 组件
4. 创建用户服务协议页面
5. 创建隐私政策页面
6. 注册新页面路由
7. 修改登录页添加勾选框
8. 修改首页 `onCheckIn` 添加协议检查

### 阶段二：AI 分析修复

1. 在 `InspirationContext` 添加 `stateRef`
2. 修改 `generateAgentContent` 使用 ref 读取状态

---

## 测试要点

### 用户协议

- [ ] 首次点击打卡按钮弹出协议弹窗
- [ ] 未勾选时确认按钮禁用
- [ ] 点击协议链接可跳转到对应页面
- [ ] 勾选并确认后弹窗关闭，继续打卡流程
- [ ] 再次点击打卡按钮不再弹出弹窗
- [ ] 登录页显示协议勾选框
- [ ] 未勾选时登录按钮禁用
- [ ] 勾选后可正常登录

### AI 分析

- [ ] 点击场景标签显示 skeleton
- [ ] API 返回后 skeleton 消失，内容正确显示
- [ ] 切换其他场景正常加载
- [ ] 已有缓存的场景直接显示内容
