import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { checkJwtConfig } from './middleware/auth';
import { checkWechatConfig } from './services/wechat';
import authRoutes from './routes/auth';
import checkinRoutes from './routes/checkin';
import collectionRoutes from './routes/collection';
import hexagramRoutes from './routes/hexagram';
import userRoutes from './routes/user';

import agentRoutes from './routes/agent';

const app = new Hono();

// 启动时检查配置
try {
  checkJwtConfig();
  checkWechatConfig();
  console.log('✓ Configuration check passed');
} catch (error) {
  console.error('✗ Configuration check failed:', error);
  process.exit(1);
}

// CORS middleware - 开发环境允许所有来源
app.use('*', cors({
  origin: '*',  // 开发环境允许所有来源
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check route
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// API routes
app.route('/api/auth', authRoutes);
app.route('/api/checkin', checkinRoutes);
app.route('/api/collection', collectionRoutes);
app.route('/api/hexagram', hexagramRoutes);
app.route('/api/hexagrams', hexagramRoutes);  // 复用同一路由
app.route('/api/user', userRoutes);
app.route('/api/agent', agentRoutes);

const port = parseInt(process.env.PORT || '3000');

console.log(`Server is running on http://localhost:${port}`);
console.log(`Available endpoints:`);
console.log(`  POST /api/auth/wechat`);
console.log(`  POST /api/auth/phone/send`);
console.log(`  POST /api/auth/phone/verify`);
console.log(`  GET  /api/auth/test-token`);
console.log(`  POST /api/checkin`);
console.log(`  GET  /api/checkin/today`);
console.log(`  GET  /api/collection`);
console.log(`  GET  /api/hexagrams`);
console.log(`  GET  /api/hexagram/:id`);
console.log(`  GET  /api/user/profile`);
console.log(`  POST /api/agent/generate`);
console.log(`  GET  /api/agent/contents/:checkinId`);

serve({
  fetch: app.fetch,
  port,
});
