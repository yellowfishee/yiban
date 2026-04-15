/**
 * 认证上下文 - 处理用户登录状态和认证逻辑
 */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import Taro from '@tarojs/taro';
import { authApi } from '../api/auth';
import { userApi } from '../api/user';
import { storage, STORAGE_KEYS } from '../adapters/storage';

/**
 * 用户信息
 */
export interface User {
  id: string;
  nickname: string;
  avatar: string;
  isPremium: boolean;
}

/**
 * 认证上下文值
 */
export interface AuthContextValue {
  // 状态
  isLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  hasProfile: boolean;
  
  // 登录方法
  loginWithWeapp: () => Promise<void>;               // 小程序微信一键登录
  login: (code: string) => Promise<void>;              // 微信登录（需外部获取code）
  loginWithWechatH5: () => Promise<void>;              // H5 微信登录
  loginWithPhone: (phone: string, code: string) => Promise<void>;  // 手机号登录
  loginWithTestToken: () => Promise<void>;             // 测试登录（开发环境）
  logout: () => void;                                  // 登出
  checkAuth: () => Promise<void>;                      // 检查登录状态
  
  // 辅助方法
  sendPhoneCode: (phone: string) => Promise<void>;     // 发送验证码
  updateProfile: (nickname?: string, avatar?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * 认证 Provider
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);

  // 初始化检查登录状态
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * 检查登录状态
   * - 从 storage 读取 token
   * - 如果有 token，调用 userApi.getProfile() 验证
   * - 成功 → 设置登录状态
   * - 失败(401) → 清除 token
   */
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    const savedToken = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
    
    if (!savedToken) {
      setIsLoggedIn(false);
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await userApi.getProfile();
      const userData: User = {
        id: profile.user.id,
        nickname: profile.user.nickname,
        avatar: profile.user.avatar,
        isPremium: profile.user.isPremium,
      };
      setUser(userData);
      setToken(savedToken);
      setIsLoggedIn(true);
      const isDefaultNickname = /^易友\d{4}$/.test(profile.user.nickname);
      setHasProfile(!isDefaultNickname);
    } catch (error: any) {
      // Token 无效或网络错误，清除认证信息
      console.error('Auth check failed:', error);
      storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      storage.remove(STORAGE_KEYS.USER_ID);
      setIsLoggedIn(false);
      setUser(null);
      setToken(null);
    }
    
    setIsLoading(false);
  }, []);

  /**
   * 微信小程序登录
   * - 使用 Taro.login 获取微信授权码
   * - 发送到后端换取 JWT
   */
  const loginWithWeapp = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      // 获取微信登录凭证
      const loginResult = await Taro.login();
      if (!loginResult.code) {
        throw new Error('获取微信授权码失败');
      }

      // 发送到后端
      const response = await authApi.wechatLogin({ code: loginResult.code });

      // 存储认证信息
      storage.set(STORAGE_KEYS.AUTH_TOKEN, response.token);
      storage.set(STORAGE_KEYS.USER_ID, response.user.id);

      const userData: User = {
        id: response.user.id,
        nickname: response.user.nickname,
        avatar: response.user.avatar,
        isPremium: response.user.isPremium,
      };
      setUser(userData);
      setToken(response.token);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('WeApp login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 微信登录（小程序）
   * @param code - 微信授权码
   */
  const login = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.wechatLogin({ code });
      storage.set(STORAGE_KEYS.AUTH_TOKEN, response.token);
      storage.set(STORAGE_KEYS.USER_ID, response.user.id);
      
      const userData: User = {
        id: response.user.id,
        nickname: response.user.nickname,
        avatar: response.user.avatar,
        isPremium: response.user.isPremium,
      };
      setUser(userData);
      setToken(response.token);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('WeChat login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 微信 H5 登录
   * - 获取微信授权 URL
   * - 跳转到微信授权页
   * - 授权后会回调到当前页面，带上 code 参数
   */
  const loginWithWechatH5 = useCallback(async () => {
    setIsLoading(true);
    try {
      // 获取当前页面完整 URL 作为回调地址
      const currentUrl = window.location.href.split('?')[0];
      const response = await authApi.getWechatH5Url(currentUrl);
      
      // 跳转到微信授权页
      window.location.href = response.url;
    } catch (error) {
      console.error('WeChat H5 login failed:', error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  /**
   * 手机号登录
   * @param phone - 手机号
   * @param code - 验证码
   */
  const loginWithPhone = useCallback(async (phone: string, code: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.verifyPhoneCode(phone, code);
      storage.set(STORAGE_KEYS.AUTH_TOKEN, response.token);
      storage.set(STORAGE_KEYS.USER_ID, response.user.id);
      
      const userData: User = {
        id: response.user.id,
        nickname: response.user.nickname,
        avatar: response.user.avatar,
        isPremium: response.user.isPremium,
      };
      setUser(userData);
      setToken(response.token);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Phone login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 发送手机验证码
   * @param phone - 手机号
   */
  const sendPhoneCode = useCallback(async (phone: string) => {
    try {
      await authApi.sendPhoneCode(phone);
    } catch (error) {
      console.error('Send phone code failed:', error);
      throw error;
    }
  }, []);

  /**
   * 测试登录（仅开发环境）
   */
  const loginWithTestToken = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await authApi.getTestToken();
      storage.set(STORAGE_KEYS.AUTH_TOKEN, response.token);
      storage.set(STORAGE_KEYS.USER_ID, response.user.id);
      
      const userData: User = {
        id: response.user.id,
        nickname: response.user.nickname,
        avatar: response.user.avatar,
        isPremium: response.user.isPremium,
      };
      setUser(userData);
      setToken(response.token);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Test login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 登出
   */
  const logout = useCallback(() => {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.USER_ID);
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    setHasProfile(false);
  }, []);

  const updateProfile = useCallback(async (nickname?: string, avatar?: string) => {
    const token = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      throw new Error('未登录，请先登录');
    }
    
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
  }, []);

  const value: AuthContextValue = {
    isLoggedIn,
    isLoading,
    user,
    token,
    hasProfile,
    loginWithWeapp,
    login,
    loginWithWechatH5,
    loginWithPhone,
    loginWithTestToken,
    logout,
    checkAuth,
    sendPhoneCode,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 使用认证上下文的 Hook
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
