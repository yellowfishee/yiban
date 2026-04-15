/**
 * 认证 API
 */
import { post, get } from './client';

export interface WechatLoginRequest {
  code: string;
}

export interface UserProfile {
  id: string;
  openid: string;
  nickname: string;
  avatar: string;
  isPremium: boolean;
}

export interface WechatLoginResponse {
  token: string;
  user: UserProfile;
}

export interface TestTokenResponse {
  message: string;
  token: string;
  user: UserProfile;
}

export interface SendPhoneCodeResponse {
  success: boolean;
  message: string;
}

export interface WechatH5UrlResponse {
  url: string;
}

export const authApi = {
  /**
   * 微信登录（小程序）
   * @param data - 包含微信授权码
   */
  wechatLogin: (data: WechatLoginRequest) =>
    post<WechatLoginResponse>('/api/auth/wechat', data),

  /**
   * 获取测试 Token（仅用于开发环境）
   */
  getTestToken: () =>
    get<TestTokenResponse>('/api/auth/test-token'),

  /**
   * 发送手机验证码
   * @param phone - 手机号
   */
  sendPhoneCode: (phone: string) =>
    post<SendPhoneCodeResponse>('/api/auth/phone/send', { phone }),

  /**
   * 验证手机验证码并登录
   * @param phone - 手机号
   * @param code - 验证码
   */
  verifyPhoneCode: (phone: string, code: string) =>
    post<WechatLoginResponse>('/api/auth/phone/verify', { phone, code }),

  /**
   * 获取微信 H5 授权 URL
   * @param redirectUri - 回调地址
   */
  getWechatH5Url: (redirectUri: string) =>
    get<WechatH5UrlResponse>(`/api/auth/wechat-h5/url?redirect_uri=${encodeURIComponent(redirectUri)}`),

  /**
   * 微信 H5 授权回调
   * @param code - 微信授权码
   */
  wechatH5Callback: (code: string) =>
    get<WechatLoginResponse>(`/api/auth/wechat-h5/callback?code=${code}`),
};
