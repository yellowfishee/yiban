import { Hono } from 'hono';
import { authMiddleware, getUserId } from '../middleware/auth';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const dir = dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = join(dir, '../../uploads/avatars');

if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

const uploadRoutes = new Hono();

uploadRoutes.post('/avatar', authMiddleware, async (c) => {
  try {
    const userId = getUserId(c);
    const body = await c.req.parseBody();
    const avatarFile = body.avatar;

    if (!avatarFile || !(avatarFile instanceof File)) {
      return c.json({ error: '请选择头像文件', code: 400 }, 400);
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(avatarFile.type)) {
      return c.json({ error: '不支持的图片格式', code: 400 }, 400);
    }

    if (avatarFile.size > 2 * 1024 * 1024) {
      return c.json({ error: '图片大小不能超过2MB', code: 400 }, 400);
    }

    const ext = avatarFile.type.split('.')[1] || 'jpg';
    const filename = userId + '.' + ext;
    const filepath = join(UPLOAD_DIR, filename);

    const buffer = await avatarFile.arrayBuffer();
    writeFileSync(filepath, Buffer.from(buffer));

    const avatarUrl = '/uploads/avatars/' + filename;
    return c.json({ url: avatarUrl });
  } catch (error) {
    console.error('[Upload] Error:', error);
    return c.json({ error: '上传失败', code: 500 }, 500);
  }
});

export default uploadRoutes;
