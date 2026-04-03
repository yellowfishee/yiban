import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { v4 as uuidv4 } from 'uuid';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  openid: text('openid').notNull().unique(),
  phone: text('phone').unique(),  // 手机号，可选，用于手机号登录
  nickname: text('nickname').notNull(),
  avatar: text('avatar').notNull(),
  isPremium: integer('is_premium', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const checkins = sqliteTable('checkins', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  hexagramId: text('hexagram_id').notNull(),
  meihuaData: text('meihua_data', { mode: 'json' }).notNull().$type<{
    upperGua: string;
    lowerGua: string;
    movingLine: number;
  }>(),
  mood: text('mood').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const collections = sqliteTable('collections', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  hexagramId: text('hexagram_id').notNull(),
  adoptedAt: integer('adopted_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// AI Agent generated content
export const agentContents = sqliteTable('agent_contents', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  checkinId: text('checkin_id').notNull().references(() => checkins.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  hexagramId: text('hexagram_id').notNull(), // 用于缓存匹配
  mood: text('mood').notNull(), // 用于缓存匹配
  scene: text('scene').notNull(), // 'suitable_for' | 'advice' | 'companionship'
  content: text('content').notNull(),
  cached: integer('cached', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
});

// 每日免费使用记录
export const dailyFreeUsage = sqliteTable('daily_free_usage', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  userId: text('user_id').notNull().references(() => users.id),
  usedDate: text('used_date').notNull(),  // 格式：YYYY-MM-DD
  scene: text('scene').notNull(),          // 场景标识
  usedAt: integer('used_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
