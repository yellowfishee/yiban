/**
 * 梅花易数起卦算法
 *
 * 规则（用户指定）：
 * - 八卦顺序：乾兑离震巽坎艮坤（0-7）
 * - 上卦(外卦) = (seed + 年份%8) % 8
 * - 下卦(内卦) = seed % 8
 * - 上卦为行，下卦为列
 * - 动爻 = seed % 6 + 1（1-6）
 *
 * 种子 N：
 * - 时间戳末2位 × 三位随机小数，取积的小数部分×1000 取前三位
 */

import { GUA_IDS, GUA_NAME_MAP } from '../constants/gua';

// 兼容旧 API：导出卦名映射
export const GUA_NAMES: Record<number, string> = GUA_NAME_MAP;

/**
 * 根据上卦+下卦索引获取64卦ID
 * @param upperGua 上卦索引（行 0-7）
 * @param lowerGua 下卦索引（列 0-7）
 */
export function getHexagramId(upperGua: number, lowerGua: number): string {
  return `${GUA_IDS[upperGua]}_${GUA_IDS[lowerGua]}`;
}

/**
 * 获取单卦ID（0-7 → qian/dui/li/zhen/xun/kan/gen/kun）
 */
export function getSingleGuaId(index: number): string {
  return GUA_IDS[index % 8];
}

/**
 * 梅花易数起卦
 * @param timestamp 打卡时间戳（毫秒）
 */
export function meihuaDivination(timestamp: number): {
  upperGua: number;  // 上卦（外卦，行 0-7）
  lowerGua: number;  // 下卦（内卦，列 0-7）
  movingLine: number;
  seed: number;
  hexagramId: string;
} {
  // 1. 取时间戳末两位
  const lastTwo = Number(String(timestamp).slice(-2));

  // 2. 生成随机三位小数 [0.000, 0.999]
  const randomThree = Math.random();

  // 3. 乘积
  const product = lastTwo * randomThree;

  // 4. 取小数部分 × 1000，取前三位
  const decimalPart = product - Math.floor(product);
  const seed = Math.floor(decimalPart * 1000) % 1000;

  // 下卦(内卦) = seed % 8
  const lowerGua = seed % 8;

  // 上卦(外卦) = (seed + 年份%8) % 8
  const year = new Date().getFullYear();
  const upperGua = (seed + year % 8) % 8;

  // 动爻：seed % 6 + 1（结果 1-6）
  const movingLine = (seed % 6) + 1;

  // 64卦ID
  const hexagramId = getHexagramId(upperGua, lowerGua);

  return { upperGua, lowerGua, movingLine, seed, hexagramId };
}
