/**
 * @yiban/core - 易伴核心包
 *
 * 提供共享类型、工具函数、常量和数据
 */

// 工具函数
export {
  meihuaDivination,
  getHexagramId,
  getSingleGuaId,
  GUA_NAMES,
} from './utils/meihua';

export * from './utils/storage';
export * from './utils/date';
export * from './utils/hexagram';

// 类型定义 - 使用 export type
export type { Hexagram, Mood, Inspiration, RawHexagram, RawMoodData, BeastCategory } from './types/hexagram';

// 常量 - 值和类型分开导出
export {
  GUA_IDS,
  GUA_NATURE,
  GUA_NAME_MAP,
} from './constants/gua';

export type { GuaId, GuaName } from './constants/gua';

// GUA_NAMES 数组格式
export { GUA_NAMES as GUA_NAMES_ARRAY } from './constants/gua';

// 数据
import hexagramsData from './data/hexagrams.json';
import type { RawHexagram } from './types/hexagram';
const typedHexagrams = hexagramsData.hexagrams as RawHexagram[];
export const hexagrams = typedHexagrams;

// AI Agent 提示词 - 显式导出以确保兼容性
export {
  buildSystemPrompt,
  buildUserPrompt,
  filterCompliance,
  buildPrompt,
  type AgentScene,
} from './prompts';

// 卦象查询工具
export function getHexagramById(id: string): RawHexagram | undefined {
  return typedHexagrams.find((h) => h.id === id);
}
