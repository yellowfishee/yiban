/**
 * 认证相关类型定义
 */

// 微信登录请求
export interface WechatLoginRequest {
  code: string;
}

// 手机号验证码发送请求
export interface PhoneSendRequest {
  phone: string;
}

// 手机号验证码登录请求
export interface PhoneVerifyRequest {
  phone: string;
  code: string;
}

// 认证响应
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    openid: string;
    nickname: string;
    avatar: string;
    isPremium: boolean;
    phone?: string | null;
  };
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  openid: string;
}

// 微信 code2session API 响应
export interface WechatSessionResponse {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

// API 错误响应
export interface ApiErrorResponse {
  error: string;
  code: number;
}

// ==================== H5 网页授权相关 ====================

// 微信 H5 OAuth access_token 响应
export interface WechatH5AccessTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  openid: string;
  scope: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

// H5 OAuth URL 响应
export interface WechatH5UrlResponse {
  url: string;
}

// H5 OAuth 回调请求
export interface WechatH5CallbackRequest {
  code: string;
  state?: string;
}
