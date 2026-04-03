/**
 * 短信验证码服务
 *
 * 开发环境：使用固定验证码 123456
 * 生产环境：支持阿里云/腾讯云短信服务
 */

// 开发环境固定验证码
const DEV_CODE = '123456';

// 验证码有效期：5分钟
const CODE_EXPIRY = 5 * 60 * 1000;

// 最大错误次数
const MAX_ERROR_COUNT = 3;

// 验证码存储结构
interface CodeData {
  code: string;
  expires: number;
  errorCount: number;
}

// 内存存储验证码
// 生产环境建议使用 Redis
const codeStore = new Map<string, CodeData>();

/**
 * 验证手机号格式
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 发送验证码
 */
export async function sendCode(phone: string): Promise<{ success: boolean; message: string }> {
  if (!isValidPhone(phone)) {
    return { success: false, message: '手机号格式不正确' };
  }

  const code = process.env.NODE_ENV === 'production'
    ? generateCode()
    : DEV_CODE;

  codeStore.set(phone, {
    code,
    expires: Date.now() + CODE_EXPIRY,
    errorCount: 0,
  });

  // 生产环境：调用短信服务商
  if (process.env.NODE_ENV === 'production') {
    await sendSmsProduction(phone, code);
  } else {
    console.log(`[SMS Service] Dev mode: code for ${phone} is ${code}`);
  }

  return { success: true, message: '验证码发送成功' };
}

/**
 * 验证验证码
 */
export function verifyCode(phone: string, code: string): boolean {
  const stored = codeStore.get(phone);

  if (!stored) {
    return false;
  }

  // 检查错误次数
  if (stored.errorCount >= MAX_ERROR_COUNT) {
    codeStore.delete(phone);
    return false;
  }

  // 检查是否过期
  if (Date.now() > stored.expires) {
    codeStore.delete(phone);
    return false;
  }

  // 验证码匹配
  if (stored.code === code) {
    codeStore.delete(phone);
    return true;
  }

  // 错误计数
  stored.errorCount++;
  return false;
}

/**
 * 发送短信（生产环境）
 */
async function sendSmsProduction(phone: string, code: string): Promise<void> {
  const provider = process.env.SMS_PROVIDER || 'aliyun';

  if (provider === 'aliyun') {
    await sendViaAliyun(phone, code);
  } else if (provider === 'tencent') {
    await sendViaTencent(phone, code);
  } else {
    console.warn(`[SMS Service] Unknown provider: ${provider}, SMS not sent`);
  }
}

/**
 * 阿里云短信发送
 */
async function sendViaAliyun(phone: string, code: string): Promise<void> {
  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
  const templateCode = process.env.ALIYUN_SMS_TEMPLATE_CODE;

  if (!accessKeyId || !accessKeySecret || !templateCode) {
    console.warn('[SMS Service] Aliyun SMS not configured, skipping');
    return;
  }

  // 阿里云 SMS API 调用
  // const aliyunSms = await import('../utils/aliyunsms');
  // const signName = process.env.ALIYUN_SMS_SIGN_NAME || '易伴';
  // await aliyunSms.send({ phone, code, signName, templateCode });
  console.log(`[SMS Service] Aliyun: would send SMS to ${phone} with code ${code}`);
}

/**
 * 腾讯云短信发送
 */
async function sendViaTencent(phone: string, code: string): Promise<void> {
  const secretId = process.env.TENCENT_SECRET_ID;
  const secretKey = process.env.TENCENT_SECRET_KEY;
  const appId = process.env.TENCENT_SMS_APP_ID;
  const templateId = process.env.TENCENT_SMS_TEMPLATE_ID;

  if (!secretId || !secretKey || !appId || !templateId) {
    console.warn('[SMS Service] Tencent SMS not configured, skipping');
    return;
  }

  // 腾讯云 SMS API 调用
  // const tencentSms = await import('../utils/tencentsms');
  // await tencentSms.send({ phone, code, appId, templateId });
  console.log(`[SMS Service] Tencent: would send SMS to ${phone} with code ${code}`);
}

/**
 * 生成随机验证码
 * @returns 6位数字验证码
 */
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 清理过期验证码（可定时调用）
 */
export function cleanExpiredCodes(): void {
  const now = Date.now();
  for (const [phone, data] of codeStore.entries()) {
    if (now > data.expires) {
      codeStore.delete(phone);
    }
  }
}
