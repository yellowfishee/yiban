/**
 * HTTP 客户端封装
 * 基于 Taro.request 实现跨平台 HTTP 请求
 */
import Taro from '@tarojs/taro';
import { storage, STORAGE_KEYS } from '../adapters/storage';

// 编译时由 Taro defineConstants 注入，dev 用局域网 IP，prod 用线上地址
const BASE_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://localhost:3000';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
  needAuth?: boolean;
  timeout?: number;  // ms, default 10000, AI requests need 30000+
}

interface ApiResponse<T> {
  statusCode: number;
  data: T;
}

/**
 * 统一请求方法
 * @param url - 请求路径（不含 BASE_URL）
 * @param options - 请求选项
 * @returns Promise<T> - 响应数据
 */
export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', data, header = {}, needAuth = false, timeout = 10000 } = options;

  // 如果需要认证，自动注入 Authorization header
  if (needAuth) {
    const token = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await Taro.request<ApiResponse<T>>({
      url: `${BASE_URL}${url}`,
      method,
      data,
      timeout,
      header: {
        'Content-Type': 'application/json',
        ...header,
      },
    });

    // 处理 HTTP 错误
    if (response.statusCode >= 400) {
      const errorData = response.data as any;
      throw new Error(errorData?.error || errorData?.message || `Request failed with status ${response.statusCode}`);
    }

    return response.data as T;
  } catch (error) {
    // 网络错误或请求失败
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network request failed');
  }
}

/**
 * GET 请求
 */
export async function get<T>(url: string, needAuth = false): Promise<T> {
  return request<T>(url, { method: 'GET', needAuth });
}

/**
 * POST 请求
 */
export async function post<T>(url: string, data?: any, needAuth = false, timeout?: number): Promise<T> {
  return request<T>(url, { method: 'POST', data, needAuth, timeout });
}

/**
 * PUT 请求
 */
export async function put<T>(url: string, data?: any, needAuth = false): Promise<T> {
  return request<T>(url, { method: 'PUT', data, needAuth });
}

/**
 * DELETE 请求
 */
export async function del<T>(url: string, needAuth = false): Promise<T> {
  return request<T>(url, { method: 'DELETE', needAuth });
}
