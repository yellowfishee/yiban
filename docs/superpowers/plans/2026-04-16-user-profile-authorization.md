# 用户资料授权实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在用户首次进入小程序时，引导用户填写昵称和头像（可跳过）。

**Architecture:** 新增独立授权页面，检查登录状态后决定是否跳转。使用微信小程序 `open-type="chooseAvatar"` 和 `type="nickname"` 获取用户信息。

**Tech Stack:** Taro 3.6, React, TypeScript, SCSS

---

## 文件结构

| 文件 | 操作 | 职责 |
|------|------|------|
| `packages/app/src/pages/authorize/index.tsx` | 新增 | 授权页面组件 |
| `packages/app/src/pages/authorize/index.scss` | 新增 | 授权页面样式 |
| `packages/app/src/app.config.ts` | 修改 | 添加页面路由 |
| `packages/app/src/context/AuthContext.tsx` | 修改 | 添加 hasProfile 判断 |
| `packages/app/src/api/user.ts` | 修改 | 添加 updateProfile 方法 |
| `packages/api/src/routes/user.ts` | 修改 | 添加 PUT /profile 路由 |

---

### Task 1: 后端添加更新资料 API

**Files:**
- Modify: `packages/api/src/routes/user.ts`

- [ ] **Step 1: 添加 PUT /profile 路由**

在 `packages/api/src/routes/user.ts` 中添加：

```typescript
/**
 * PUT /api/user/profile - 更新用户资料
 */
router.put('/profile', authMiddleware, async (c) => {
  try {
    const userId = getUserId(c);
    const body = await c.req.json<{ nickname?: string; avatar?: string }>();

    // 验证参数
    if (!body.nickname && !body.avatar) {
      return c.json<ApiErrorResponse>(
        {
          error: '至少需要提供 nickname 或 avatar',
          code: 400,
        },
        400
      );
    }

    // 构建更新数据
    const updateData: Record<string, any> = {};
    if (body.nickname) {
      if (body.nickname.length < 2 || body.nickname.length > 20) {
        return c.json<ApiErrorResponse>(
          {
            error: '昵称长度需要在 2-20 个字符之间',
            code: 400,
          },
          400
        );
      }
      updateData.nickname = body.nickname;
    }
    if (body.avatar) {
      updateData.avatar = body.avatar;
    }

    // 更新用户
    const updated = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (updated.length === 0) {
      return c.json<ApiErrorResponse>(
        {
          error: '用户不存在',
          code: 404,
        },
        404
      );
    }

    const user = updated[0];

    return c.json({
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<ApiErrorResponse>(
      {
        error: '更新失败：' + message,
        code: 500,
      },
      500
    );
  }
});
```

- [ ] **Step 2: 运行类型检查**

Run: `pnpm --filter @yiban/api typecheck`
Expected: 无错误

---

### Task 2: 前端添加 updateProfile API

**Files:**
- Modify: `packages/app/src/api/user.ts`

- [ ] **Step 1: 添加 updateProfile 方法**

在 `packages/app/src/api/user.ts` 中添加：

```typescript
export interface UpdateProfileRequest {
  nickname?: string;
  avatar?: string;
}

export interface UpdateProfileResponse {
  user: {
    id: string;
    nickname: string;
    avatar: string;
    isPremium: boolean;
  };
}

export const userApi = {
  // ... existing methods ...

  /**
   * 更新用户资料
   * @param data - 昵称和/或头像
   */
  updateProfile: (data: UpdateProfileRequest) =>
    put<UpdateProfileResponse>('/api/user/profile', data, true),
};
```

- [ ] **Step 2: 运行类型检查**

Run: `pnpm --filter @yiban/app typecheck`
Expected: 无错误

---

### Task 3: 修改 AuthContext 添加 hasProfile 判断

**Files:**
- Modify: `packages/app/src/context/AuthContext.tsx`

- [ ] **Step 1: 添加 hasProfile 状态和判断逻辑**

在 `AuthContext.tsx` 中：

1. 添加 `hasProfile` 到 `AuthContextValue` 接口：

```typescript
export interface AuthContextValue {
  // ... existing fields ...
  hasProfile: boolean;  // 是否已完善资料
  updateProfile: (nickname?: string, avatar?: string) => Promise<void>;  // 更新资料
}
```

2. 在 `AuthProvider` 中添加状态：

```typescript
const [hasProfile, setHasProfile] = useState(false);
```

3. 在 `checkAuth` 中设置 `hasProfile`：

```typescript
// 在 checkAuth 成功后添加
const isDefaultNickname = /^易友\d{4}$/.test(profile.user.nickname);
setHasProfile(!isDefaultNickname);
```

4. 添加 `updateProfile` 方法：

```typescript
const updateProfile = useCallback(async (nickname?: string, avatar?: string) => {
  if (!isLoggedIn) return;
  
  try {
    const response = await userApi.updateProfile({ nickname, avatar });
    const userData: User = {
      id: response.user.id,
      nickname: response.user.nickname,
      avatar: response.user.avatar,
      isPremium: response.user.isPremium,
    };
    setUser(userData);
    setHasProfile(true);
  } catch (error) {
    console.error('Update profile failed:', error);
    throw error;
  }
}, [isLoggedIn]);
```

5. 更新 `value`：

```typescript
const value: AuthContextValue = {
  // ... existing fields ...
  hasProfile,
  updateProfile,
};
```

6. 添加导入：

```typescript
import { userApi } from '../api/user';
```

- [ ] **Step 2: 运行类型检查**

Run: `pnpm --filter @yiban/app typecheck`
Expected: 无错误

---

### Task 4: 创建授权页面

**Files:**
- Create: `packages/app/src/pages/authorize/index.tsx`

- [ ] **Step 1: 创建授权页面组件**

创建 `packages/app/src/pages/authorize/index.tsx`：

```typescript
import { View, Text, Image, Input, Button } from '@tarojs/components';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import { useAuth } from '../../context/AuthContext';
import './index.scss';

const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGNUYwRUI4Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMjAiIGZpbGw9IiNENUE1QTYiLz48cGF0aCBkPSJNNTAsMzBjMTYuNTc3LDkuMjY3LDI2LjQ2NywyMCwyNi40NjcsNDBzLTkuODksMzAuNzMzLTI2LjQ2NywzMEMzMy40MjMsNjkuNzMzLDIzLjUzMyw2MCw1MCw2MHMxNi41NzctOS4yNjcsMjYuNDY3LTIwLTI2LjQ2Ny0zMHptMCwzMGMyNS41NzMsMTUuMjY3LDQxLjQ2NywyNS41NzMsNDEuNDY3LDQwcy0xNS44OSwyNC43MzMtNDEuNDY3LDQwYy0yNS41NzMtMTUuMjY3LTQxLjQ2Ny0yNS41NzMtNDEuNDY3LTQwUzI0LjQyNyw2NC43MzMsNTAsNzBzMjUuNTczLTE1LjI2NywyNi40NjctNDBTMzMuNDIzLDQ1LjI2Nyw1MCw1MHoiIGZpbGw9InVybCgjY29sb3IxKSIvPjx1cmwgaWQ9ImNvbG9yMSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0Q1QTVBNiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0U2NjY2NiIvPjwvdXJsPjwvc3ZnPg==';

export default function AuthorizePage() {
  const { loginWithWeapp, updateProfile, isLoggedIn } = useAuth();
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChooseAvatar = (e: any) => {
    const { avatarUrl } = e.detail;
    setAvatar(avatarUrl);
  };

  const handleNicknameInput = (e: any) => {
    setNickname(e.detail.value);
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      
      if (!isLoggedIn) {
        await loginWithWeapp();
      }
      
      const finalNickname = nickname.trim() || `易友${Math.floor(Math.random() * 10000)}`;
      const finalAvatar = avatar;
      
      await updateProfile(finalNickname, finalAvatar);
      
      Taro.switchTab({ url: '/pages/home/index' });
    } catch (error) {
      Taro.showToast({ title: '保存失败', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setLoading(true);
      
      if (!isLoggedIn) {
        await loginWithWeapp();
      }
      
      const randomNickname = `易友${Math.floor(Math.random() * 10000)}`;
      await updateProfile(randomNickname, DEFAULT_AVATAR);
      
      Taro.switchTab({ url: '/pages/home/index' });
    } catch (error) {
      Taro.showToast({ title: '操作失败', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="authorize-page">
      <View className="authorize-page__brand">
        <Text className="authorize-page__logo">易伴</Text>
        <Text className="authorize-page__subtitle">设置你的专属形象</Text>
      </View>

      <View className="authorize-page__form">
        <Button
          className="authorize-page__avatar-btn"
          openType="chooseAvatar"
          onChooseAvatar={handleChooseAvatar}
        >
          <Image className="authorize-page__avatar" src={avatar} mode="aspectFill" />
          <Text className="authorize-page__avatar-hint">点击选择头像</Text>
        </Button>

        <Input
          className="authorize-page__input"
          type="nickname"
          placeholder="请输入昵称（可选）"
          value={nickname}
          onInput={handleNicknameInput}
          maxlength={20}
        />
      </View>

      <View className="authorize-page__actions">
        <Button
          className="authorize-page__btn authorize-page__btn--primary"
          onClick={handleComplete}
          disabled={loading}
        >
          完成
        </Button>
        <Button
          className="authorize-page__btn authorize-page__btn--skip"
          onClick={handleSkip}
          disabled={loading}
        >
          跳过
        </Button>
      </View>
    </View>
  );
}
```

---

### Task 5: 创建授权页面样式

**Files:**
- Create: `packages/app/src/pages/authorize/index.scss`

- [ ] **Step 1: 创建样式文件**

创建 `packages/app/src/pages/authorize/index.scss`：

```scss
@import '../../styles/tokens.scss';

.authorize-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  background-color: var(--color-bg-primary);
}

.authorize-page__brand {
  text-align: center;
  margin-bottom: 60px;
}

.authorize-page__logo {
  display: block;
  font-size: 48px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 16px;
}

.authorize-page__subtitle {
  display: block;
  font-size: 28px;
  color: var(--color-text-secondary);
}

.authorize-page__form {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60px;
}

.authorize-page__avatar-btn {
  background: transparent;
  border: none;
  padding: 0;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.authorize-page__avatar {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 4px solid var(--color-border);
  margin-bottom: 16px;
}

.authorize-page__avatar-hint {
  font-size: 24px;
  color: var(--color-text-tertiary);
}

.authorize-page__input {
  width: 100%;
  height: 96px;
  padding: 0 32px;
  font-size: 32px;
  background-color: var(--color-bg-secondary);
  border: 2px solid var(--color-border);
  border-radius: 16px;
  color: var(--color-text-primary);
}

.authorize-page__actions {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.authorize-page__btn {
  width: 100%;
  height: 96px;
  font-size: 32px;
  border-radius: 48px;
  border: none;
  
  &--primary {
    background-color: var(--color-primary);
    color: white;
  }
  
  &--skip {
    background: transparent;
    color: var(--color-text-tertiary);
    font-size: 28px;
  }
  
  &[disabled] {
    opacity: 0.5;
  }
}
```

---

### Task 6: 注册授权页面路由

**Files:**
- Modify: `packages/app/src/app.config.ts`

- [ ] **Step 1: 添加页面路由**

修改 `packages/app/src/app.config.ts`，将 authorize 页面添加到 pages 数组开头：

```typescript
export default {
  pages: [
    'pages/authorize/index',  // 添加到首位
    'pages/home/index',
    'pages/login/index',
    // ... 其他页面
  ],
  // ... 其他配置
};
```

---

### Task 7: 在首页添加授权检查

**Files:**
- Modify: `packages/app/src/pages/home/index.tsx`

- [ ] **Step 1: 添加授权检查逻辑**

在 `HomePage` 组件中添加：

```typescript
const { isLoggedIn, isLoading: authLoading, loginWithWeapp, hasProfile } = useAuth();

// 添加授权检查
useEffect(() => {
  if (!authLoading && (!isLoggedIn || !hasProfile)) {
    Taro.redirectTo({ url: '/pages/authorize/index' });
  }
}, [authLoading, isLoggedIn, hasProfile]);
```

- [ ] **Step 2: 运行类型检查**

Run: `pnpm --filter @yiban/app typecheck`
Expected: 无错误

---

### Task 8: 测试完整流程

- [ ] **Step 1: 启动后端服务**

Run: `pnpm --filter @yiban/api dev`

- [ ] **Step 2: 启动 H5 开发服务**

Run: `pnpm --filter @yiban/app dev:h5`

- [ ] **Step 3: 构建小程序**

Run: `pnpm --filter @yiban/app build:weapp`

- [ ] **Step 4: 用微信开发者工具打开**

打开 `packages/app/dist` 目录，测试：
1. 首次进入跳转到授权页
2. 选择头像和昵称
3. 点击完成跳转到首页
4. 重新进入不再显示授权页
5. 点击跳过使用随机昵称

---

### Task 9: 提交代码

- [ ] **Step 1: 提交所有改动**

```bash
git add .
git commit -m "feat: add user profile authorization page

- 新增授权页面，引导用户填写昵称和头像
- 添加 PUT /api/user/profile 接口
- AuthContext 添加 hasProfile 判断和 updateProfile 方法
- 首页添加授权检查，未授权用户跳转到授权页"
```
