/**
 * 微信小程序登录服务
 */
import type { WechatSessionResponse, WechatH5AccessTokenResponse } from '../types/auth';

const WECHAT_APPID = process.env.WECHAT_APPID;
const WECHAT_SECRET = process.env.WECHAT_SECRET;

/**
 * 检查微信配置是否完整
 */
export function checkWechatConfig(): void {
  if (!WECHAT_APPID || !WECHAT_SECRET) {
    throw new Error('Missing WECHAT_APPID or WECHAT_SECRET in environment variables');
  }
}

/**
 * 调用微信 code2session API
 * @param code 微信登录 code
 * @returns 微信会话信息
 */
export async function code2Session(code: string): Promise<WechatSessionResponse> {
  checkWechatConfig();

  const url = new URL('https://api.weixin.qq.com/sns/jscode2session');
  url.searchParams.set('appid', WECHAT_APPID!);
  url.searchParams.set('secret', WECHAT_SECRET!);
  url.searchParams.set('js_code', code);
  url.searchParams.set('grant_type', 'authorization_code');

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`WeChat API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as WechatSessionResponse;

  // 微信 API 返回错误码
  if (data.errcode && data.errcode !== 0) {
    const errorMsg = `WeChat API error: ${data.errcode} - ${data.errmsg || 'Unknown error'}`;
    console.error('[WeChat Service] code2Session failed:', errorMsg);
    throw new Error(errorMsg);
  }

  if (!data.openid) {
    throw new Error('WeChat API returned no openid');
  }

  return data;
}

// ==================== H5 网页授权 ====================

const WECHAT_H5_APPID = process.env.WECHAT_H5_APPID;
const WECHAT_H5_SECRET = process.env.WECHAT_H5_SECRET;

const WECHAT_OAUTH_URL = 'https://open.weixin.qq.com/connect/oauth2/authorize';

/**
 * 检查微信 H5 配置是否完整
 */
export function checkWechatH5Config(): boolean {
  return !!(WECHAT_H5_APPID && WECHAT_H5_SECRET);
}

/**
 * 生成微信 H5 网页授权 URL
 * @param redirectUri 授权后重定向的回调地址
 * @param state 自定义状态参数
 * @param scope 授权作用域，默认 snsapi_base
 * @returns 微信授权页 URL
 */
export function getWechatH5OAuthUrl(
  redirectUri: string,
  state?: string,
  scope: 'snsapi_base' | 'snsapi_userinfo' = 'snsapi_base'
): string {
  if (!checkWechatH5Config()) {
    throw new Error('微信 H5 网页授权未配置，请设置 WECHAT_H5_APPID 和 WECHAT_H5_SECRET');
  }

  const params = new URLSearchParams({
    appid: WECHAT_H5_APPID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scope,
    state: state || '',
  });

  return `${WECHAT_OAUTH_URL}?${params.toString()}#wechat_redirect`;
}

/**
 * 用授权码换取 H5 access_token
 * @param code 微信授权码
 * @returns access_token 和 openid 等信息
 */
export async function getWechatH5AccessToken(code: string): Promise<WechatH5AccessTokenResponse> {
  if (!checkWechatH5Config()) {
    throw new Error('微信 H5 网页授权未配置');
  }

  const url = new URL('https://api.weixin.qq.com/sns/oauth2/access_token');
  url.searchParams.set('appid', WECHAT_H5_APPID!);
  url.searchParams.set('secret', WECHAT_H5_SECRET!);
  url.searchParams.set('code', code);
  url.searchParams.set('grant_type', 'authorization_code');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`WeChat H5 API request failed: ${response.status}`);
  }

  const data = await response.json() as WechatH5AccessTokenResponse;

  // 微信 API 返回错误码
  if (data.errcode && data.errcode !== 0) {
    const errorMsg = `WeChat H5 OAuth error: ${data.errcode} - ${data.errmsg || 'Unknown error'}`;
    console.error('[WeChat H5 Service] getAccessToken failed:', errorMsg);
    throw new Error(errorMsg);
  }

  if (!data.openid) {
    throw new Error('WeChat H5 API returned no openid');
  }

  return data;
}
