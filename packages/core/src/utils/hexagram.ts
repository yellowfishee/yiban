/**
 * 卦象工具函数
 */

import type { RawHexagram } from '../types/hexagram';
import hexagramsData from '../data/hexagrams.json';
import { getHexagramId } from './meihua';

// Hexagram = RawHexagram，统一类型
export type Hexagram = RawHexagram;

// 类型断言：JSON 导入的 category 是字符串，需要断言为 BeastCategory
const typedHexagrams = hexagramsData.hexagrams as RawHexagram[];

/**
 * 获取所有卦象数据
 */
export function getAllHexagrams(): RawHexagram[] {
  return typedHexagrams;
}

/**
 * 根据 ID 获取卦象
 */
export function getHexagramById(id: string): RawHexagram | undefined {
  return typedHexagrams.find((h) => h.id === id);
}

/**
 * 根据上下卦索引获取卦象
 */
export function getHexagramByGua(upperGua: number, lowerGua: number): RawHexagram | undefined {
  const id = getHexagramId(upperGua, lowerGua);
  return getHexagramById(id);
}
