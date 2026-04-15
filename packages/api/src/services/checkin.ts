/**
 * 打卡服务
 */

import { eq, and, gte, lt } from 'drizzle-orm';
import { db } from '../db/index';
import { checkins, collections } from '../db/schema';
import { meihuaDivination, hexagrams } from '@yiban/core';
import type { CheckinRecord, CheckinMeihuaData } from '../types/api';
import type { RawHexagram } from '@yiban/core';

/**
 * 获取 UTC+8 时区的今日日期字符串
 */
function getTodayUTC8(): string {
  const now = new Date();
  // UTC+8 = UTC时间 + 8小时
  const utc8Time = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return utc8Time.toISOString().split('T')[0]; // "2026-04-03"
}

/**
 * 获取今日开始和结束时间戳（UTC）
 */
function getTodayRangeUTC(): { start: Date; end: Date } {
  const todayStr = getTodayUTC8();

  // 今日开始：UTC+8 00:00 = UTC 16:00（前一天）
  const [year, month, day] = todayStr.split('-').map(Number);
  const startUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - 8 * 60 * 60 * 1000);
  const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000);

  return { start: startUTC, end: endUTC };
}

/**
 * 根据 ID 查找卦象
 */
function findHexagramById(id: string): RawHexagram | undefined {
  return hexagrams.find((h) => h.id === id);
}

/**
 * 获取今日打卡记录
 */
export async function getTodayCheckin(userId: string): Promise<CheckinRecord | null> {
  const { start, end } = getTodayRangeUTC();

  const records = await db
    .select()
    .from(checkins)
    .where(
      and(
        eq(checkins.userId, userId),
        gte(checkins.createdAt, start),
        lt(checkins.createdAt, end)
      )
    )
    .limit(1);

  if (records.length === 0) {
    return null;
  }

  const record = records[0];
  const hexagram = findHexagramById(record.hexagramId);

  if (!hexagram) {
    return null;
  }

  return {
    id: record.id,
    hexagramId: record.hexagramId,
    hexagram,
    meihuaData: record.meihuaData as CheckinMeihuaData,
    mood: record.mood || '',
    createdAt: record.createdAt.toISOString(),
  };
}

/**
 * 创建打卡记录
 */
export async function createCheckin(
  userId: string,
  mood?: string
): Promise<{ checkin: CheckinRecord; collectionAdded: boolean }> {
  // 1. 检查今日是否已打卡
  const todayCheckin = await getTodayCheckin(userId);
  if (todayCheckin) {
    throw new Error('ALREADY_CHECKED_IN');
  }

  // 2. 梅花易数起卦
  const timestamp = Date.now();
  const meihuaResult = meihuaDivination(timestamp);

  // 3. 获取完整卦象数据
  const hexagram = findHexagramById(meihuaResult.hexagramId);
  if (!hexagram) {
    throw new Error('HEXAGRAM_NOT_FOUND');
  }

  // 4. 构造梅花数据
  const meihuaData: CheckinMeihuaData = {
    upperGua: String(meihuaResult.upperGua),
    lowerGua: String(meihuaResult.lowerGua),
    movingLine: meihuaResult.movingLine,
  };

  // 5. 创建打卡记录
  const [checkinRecord] = await db
    .insert(checkins)
    .values({
      userId,
      hexagramId: hexagram.id,
      meihuaData,
      mood: mood || 'work',
    })
    .returning();

  // 6. 自动收藏（如果未收藏）
  const collectionAdded = await addToCollectionIfNotExists(userId, hexagram.id);

  return {
    checkin: {
      id: checkinRecord.id,
      hexagramId: checkinRecord.hexagramId,
      hexagram,
      meihuaData,
      mood: checkinRecord.mood || '',
      createdAt: checkinRecord.createdAt.toISOString(),
    },
    collectionAdded,
  };
}

/**
 * 根据 ID 获取打卡记录
 */
export async function getCheckinById(checkinId: string): Promise<CheckinRecord | null> {
  const records = await db
    .select()
    .from(checkins)
    .where(eq(checkins.id, checkinId))
    .limit(1);

  if (records.length === 0) {
    return null;
  }

  const record = records[0];
  const hexagram = findHexagramById(record.hexagramId);

  if (!hexagram) {
    return null;
  }

  return {
    id: record.id,
    hexagramId: record.hexagramId,
    hexagram,
    meihuaData: record.meihuaData as CheckinMeihuaData,
    mood: record.mood || '',
    createdAt: record.createdAt.toISOString(),
    userId: record.userId,
  };
}
async function addToCollectionIfNotExists(
  userId: string,
  hexagramId: string
): Promise<boolean> {
  // 检查是否已收藏
  const existing = await db
    .select()
    .from(collections)
    .where(
      and(
        eq(collections.userId, userId),
        eq(collections.hexagramId, hexagramId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return false;
  }

  // 添加收藏
  await db.insert(collections).values({
    userId,
    hexagramId,
  });

  return true;
}
