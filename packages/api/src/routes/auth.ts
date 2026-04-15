/**
 * 认证路由
 */
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { code2Session, checkWechatH5Config, getWechatH5OAuthUrl, getWechatH5AccessToken } from '../services/wechat';
import { sendCode, verifyCode } from '../services/sms';
import { generateToken, verifyToken } from '../middleware/auth';
import type {
  WechatLoginRequest,
  PhoneSendRequest,
  PhoneVerifyRequest,
  AuthResponse,
  ApiErrorResponse
} from '../types/auth';

const authRoutes = new Hono();

// 默认头像 - 水墨风格太极图标
const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGNUYwRUI4Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMjAiIGZpbGw9IiNENUE1QTYiLz48L3N2Zz4=';

/**
 * POST /api/auth/wechat
 * 微信小程序登录
 */
authRoutes.post('/wechat', async (c) => {
  try {
    const body = await c.req.json<WechatLoginRequest>();

    // 验证请求体
    if (!body.code || typeof body.code !== 'string') {
      const error: ApiErrorResponse = {
        error: 'Invalid request: code is required',
        code: 400
      };
      return c.json(error, 400);
    }

    // 调用微信 API 获取 openid
    let wechatSession;
    try {
      wechatSession = await code2Session(body.code);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'WeChat API call failed';
      const errorResponse: ApiErrorResponse = {
        error: message,
        code: 500
      };
      return c.json(errorResponse, 500);
    }

    const { openid } = wechatSession;

    // 查询用户
    let user = await db.query.users.findFirst({
      where: eq(users.openid, openid)
    });

    // 用户不存在则创建
    if (!user) {
      const newUser = await db.insert(users).values({
        openid,
        nickname: `易友${Math.floor(Math.random() * 10000)}`,
        avatar: DEFAULT_AVATAR,
        isPremium: false
      }).returning();

      user = newUser[0];
    }

    // 生成 JWT token
    const token = await generateToken({
      userId: user.id,
      openid: user.openid
    });

    // 返回响应
    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        openid: user.openid,
        nickname: user.nickname,
        avatar: user.avatar,
        isPremium: user.isPremium,
        phone: user.phone
      }
    };

    return c.json(response, 200);
  } catch (error) {
    console.error('[Auth Route] Error:', error);
    const errorResponse: ApiErrorResponse = {
      error: 'Internal server error',
      code: 500
    };
    return c.json(errorResponse, 500);
  }
});

/**
 * POST /api/auth/phone/send
 * 发送验证码
 */
authRoutes.post('/phone/send', async (c) => {
  try {
    const body = await c.req.json<PhoneSendRequest>();

    // 验证请求体
    if (!body.phone || typeof body.phone !== 'string') {
      const error: ApiErrorResponse = {
        error: 'Invalid request: phone is required',
        code: 400
      };
      return c.json(error, 400);
    }

    // 发送验证码
    const result = await sendCode(body.phone);

    if (!result.success) {
      const error: ApiErrorResponse = {
        error: result.message,
        code: 400
      };
      return c.json(error, 400);
    }

    return c.json({ 
      success: true, 
      message: result.message,
      // 开发环境返回验证码
      ...(process.env.NODE_ENV !== 'production' && { devCode: '123456' })
    }, 200);
  } catch (error) {
    console.error('[Phone Auth] Send code error:', error);
    const errorResponse: ApiErrorResponse = {
      error: 'Failed to send verification code',
      code: 500
    };
    return c.json(errorResponse, 500);
  }
});

/**
 * POST /api/auth/phone/verify
 * 验证码登录
 */
authRoutes.post('/phone/verify', async (c) => {
  try {
    const body = await c.req.json<PhoneVerifyRequest>();

    // 验证请求体
    if (!body.phone || typeof body.phone !== 'string') {
      const error: ApiErrorResponse = {
        error: 'Invalid request: phone is required',
        code: 400
      };
      return c.json(error, 400);
    }

    if (!body.code || typeof body.code !== 'string') {
      const error: ApiErrorResponse = {
        error: 'Invalid request: code is required',
        code: 400
      };
      return c.json(error, 400);
    }

    // 验证验证码
    if (!verifyCode(body.phone, body.code)) {
      const error: ApiErrorResponse = {
        error: 'Invalid or expired verification code',
        code: 400
      };
      return c.json(error, 400);
    }

    // 使用 phone:{phone} 作为 openid 标识
    const openid = `phone:${body.phone}`;

    // 查询用户
    let user = await db.query.users.findFirst({
      where: eq(users.openid, openid)
    });

    // 用户不存在则创建
    if (!user) {
      const newUser = await db.insert(users).values({
        openid,
        phone: body.phone,
        nickname: `易友${Math.floor(Math.random() * 10000)}`,
        avatar: DEFAULT_AVATAR,
        isPremium: false
      }).returning();

      user = newUser[0];
    } else {
      // 更新手机号（如果之前没有）
      if (!user.phone) {
        const updated = await db
          .update(users)
          .set({ phone: body.phone })
          .where(eq(users.id, user.id))
          .returning();
        user = updated[0];
      }
    }

    // 生成 JWT token
    const token = await generateToken({
      userId: user.id,
      openid: user.openid
    });

    // 返回响应
    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        openid: user.openid,
        nickname: user.nickname,
        avatar: user.avatar,
        isPremium: user.isPremium,
        phone: user.phone
      }
    };

    return c.json(response, 200);
  } catch (error) {
    console.error('[Phone Auth] Verify error:', error);
    const errorResponse: ApiErrorResponse = {
      error: 'Internal server error',
      code: 500
    };
    return c.json(errorResponse, 500);
  }
});

/**
 * GET /api/auth/test-token
 * 生成测试 token（仅开发环境）
 */
authRoutes.get('/test-token', async (c) => {
  // 仅在开发环境启用
  if (process.env.NODE_ENV === 'production') {
    const error: ApiErrorResponse = {
      error: 'This endpoint is disabled in production',
      code: 403
    };
    return c.json(error, 403);
  }

  try {
    // 创建或获取测试用户
    const testOpenid = 'test_openid_' + Date.now();
    
    let user = await db.query.users.findFirst({
      where: eq(users.openid, testOpenid)
    });

    if (!user) {
      const newUser = await db.insert(users).values({
        openid: testOpenid,
        nickname: '测试用户',
        avatar: DEFAULT_AVATAR,
        isPremium: false
      }).returning();

      user = newUser[0];
    }

    // 生成 token
    const token = await generateToken({
      userId: user.id,
      openid: user.openid
    });

    return c.json({
      message: 'Test token generated successfully',
      token,
      user: {
        id: user.id,
        openid: user.openid,
        nickname: user.nickname,
        avatar: user.avatar,
        isPremium: user.isPremium,
        phone: user.phone
      }
    }, 200);
  } catch (error) {
    console.error('[Test Token] Error:', error);
    const errorResponse: ApiErrorResponse = {
      error: 'Failed to generate test token',
      code: 500
    };
    return c.json(errorResponse, 500);
  }
});

/**
 * GET /api/auth/protected-test
 * 测试受保护的路由（需要认证）
 */
authRoutes.get('/protected-test', async (c) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error: ApiErrorResponse = {
      error: 'Unauthorized: Missing token',
      code: 401
    };
    return c.json(error, 401);
  }

  const token = authHeader.slice(7);
  
  try {
    const payload = await verifyToken(token);
    
    return c.json({
      message: 'Access granted to protected resource',
      userId: payload.userId,
      openid: payload.openid
    }, 200);
  } catch (error) {
    const errorResponse: ApiErrorResponse = {
      error: 'Invalid token',
      code: 401
    };
    return c.json(errorResponse, 401);
  }
});



// ==================== H5 微信网页授权 ====================

/**
 * GET /api/auth/wechat-h5/url
 * 获取微信 H5 网页授权 URL
 */
authRoutes.get('/wechat-h5/url', async (c) => {
  try {
    const redirectUri = c.req.query('redirect_uri');
    const state = c.req.query('state') || undefined;  // 可用于防 CSRF 攻击

    // 验证参数
    if (!redirectUri) {
      const error: ApiErrorResponse = {
        error: 'Invalid request: redirect_uri is required',
        code: 400
      };
      return c.json(error, 400);
    }

    // 检查 H5 配置
    if (!checkWechatH5Config()) {
      // 未配置时返回友好提示
      return c.json({
        error: '微信 H5 登录未配置，请在微信公众号后台配置网页授权域名，并设置 WECHAT_H5_APPID 和 WECHAT_H5_SECRET 环境变量',
        code: 503,
        hint: '请联系管理员配置微信公众号网页授权'
      }, 503);
    }

    // 生成授权 URL
    const url = getWechatH5OAuthUrl(redirectUri, state);

    return c.json({ url }, 200);
  } catch (error) {
    console.error('[H5 OAuth] Get URL error:', error);
    const errorResponse: ApiErrorResponse = {
      error: error instanceof Error ? error.message : 'Failed to generate OAuth URL',
      code: 500
    };
    return c.json(errorResponse, 500);
  }
});

/**
 * GET /api/auth/wechat-h5/callback
 * 微信 H5 网页授权回调
 */
authRoutes.get('/wechat-h5/callback', async (c) => {
  try {
    const code = c.req.query('code');
    // state 可用于防 CSRF 攻击，当前版本暂不验证

    // 验证参数
    if (!code) {
      const error: ApiErrorResponse = {
        error: 'Invalid request: code is required',
        code: 400
      };
      return c.json(error, 400);
    }

    // 检查 H5 配置
    if (!checkWechatH5Config()) {
      const error: ApiErrorResponse = {
        error: '微信 H5 登录未配置',
        code: 503
      };
      return c.json(error, 503);
    }

    // 用 code 换取 access_token 和 openid
    let wechatH5Session;
    try {
      wechatH5Session = await getWechatH5AccessToken(code);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'WeChat H5 API call failed';
      const errorResponse: ApiErrorResponse = {
        error: message,
        code: 500
      };
      return c.json(errorResponse, 500);
    }

    const { openid, unionid } = wechatH5Session;

    // 查询用户（优先用 unionid 匹配，其次 openid）
    let user = await db.query.users.findFirst({
      where: unionid 
        ? eq(users.openid, openid)  // TODO: 如需 unionid 统一用户，需扩展 schema
        : eq(users.openid, openid)
    });

    // 用户不存在则创建
    if (!user) {
      const newUser = await db.insert(users).values({
        openid,
        nickname: `易友${Math.floor(Math.random() * 10000)}`,
        avatar: DEFAULT_AVATAR,
        isPremium: false
      }).returning();

      user = newUser[0];
    }

    // 生成 JWT token
    const token = await generateToken({
      userId: user.id,
      openid: user.openid
    });

    // 返回响应
    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        openid: user.openid,
        nickname: user.nickname,
        avatar: user.avatar,
        isPremium: user.isPremium,
        phone: user.phone
      }
    };

    return c.json(response, 200);
  } catch (error) {
    console.error('[H5 OAuth] Callback error:', error);
    const errorResponse: ApiErrorResponse = {
      error: 'Internal server error',
      code: 500
    };
    return c.json(errorResponse, 500);
  }
});

export default authRoutes;
