/**
 * JWT 认证中间件
 */
import { Context, Next } from 'hono';
import { jwtVerify, SignJWT, JWTPayload } from 'jose';
import type { ApiErrorResponse } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * JWT Payload 类型（扩展 jose 的 JWTPayload）
 */
export interface JwtPayload extends JWTPayload {
  userId: string;
  openid: string;
}

/**
 * 检查 JWT 配置
 */
export function checkJwtConfig(): void {
  if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET in environment variables');
  }
}

/**
 * 生成 JWT Token
 */
export async function generateToken(payload: JwtPayload): Promise<string> {
  checkJwtConfig();

  const secret = new TextEncoder().encode(JWT_SECRET);
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  return token;
}

/**
 * 验证 JWT Token
 */
export async function verifyToken(token: string): Promise<JwtPayload> {
  checkJwtConfig();

  const secret = new TextEncoder().encode(JWT_SECRET);
  
  const { payload } = await jwtVerify(token, secret);
  
  // 类型断言：我们确保 payload 包含 userId 和 openid
  return payload as JwtPayload;
}

/**
 * 认证中间件
 * 从 Authorization header 提取并验证 JWT token
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error: ApiErrorResponse = {
      error: 'Unauthorized: Missing or invalid Authorization header',
      code: 401
    };
    return c.json(error, 401);
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' prefix

  try {
    const payload = await verifyToken(token);
    
    // 将用户信息注入到 context 中
    c.set('userId', payload.userId);
    c.set('openid', payload.openid);
    
    await next();
  } catch (error) {
    const errorResponse: ApiErrorResponse = {
      error: 'Invalid token: Token expired or malformed',
      code: 401
    };
    return c.json(errorResponse, 401);
  }
}

/**
 * 获取当前用户 ID（在 authMiddleware 之后使用）
 */
export function getUserId(c: Context): string {
  return c.get('userId');
}

/**
 * 获取当前用户 openid（在 authMiddleware 之后使用）
 */
export function getOpenid(c: Context): string {
  return c.get('openid');
}
