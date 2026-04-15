/**
 * 八卦基础常量
 */

// 八卦ID（用于组成64卦ID）
export const GUA_IDS = ['qian', 'dui', 'li', 'zhen', 'xun', 'kan', 'gen', 'kun'] as const;

// 八卦名称
export const GUA_NAMES = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'] as const;

// 八卦象
export const GUA_NATURE = ['天', '泽', '火', '雷', '风', '水', '山', '地'] as const;

// 类型定义
export type GuaId = typeof GUA_IDS[number];
export type GuaName = typeof GUA_NAMES[number];

// 名称映射（数字索引 → 卦名）
export const GUA_NAME_MAP: Record<number, string> = {
  0: '乾', 1: '兑', 2: '离', 3: '震',
  4: '巽', 5: '坎', 6: '艮', 7: '坤',
};
