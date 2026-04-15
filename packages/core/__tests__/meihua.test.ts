/**
 * 梅花易数起卦算法单元测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { meihuaDivination, getHexagramId, getSingleGuaId, GUA_NAMES } from '../src/utils/meihua';

describe('meihuaDivination', () => {
  // 保存原始 Math.random
  const originalRandom = Math.random;

  beforeEach(() => {
    // 在每个测试前重置 mock
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // 恢复原始 Math.random
    Math.random = originalRandom;
  });

  describe('返回值结构', () => {
    it('应返回包含所有必需字段的对象', () => {
      const result = meihuaDivination(Date.now());

      expect(result).toHaveProperty('upperGua');
      expect(result).toHaveProperty('lowerGua');
      expect(result).toHaveProperty('movingLine');
      expect(result).toHaveProperty('seed');
      expect(result).toHaveProperty('hexagramId');
    });

    it('返回值的类型应正确', () => {
      const result = meihuaDivination(Date.now());

      expect(typeof result.upperGua).toBe('number');
      expect(typeof result.lowerGua).toBe('number');
      expect(typeof result.movingLine).toBe('number');
      expect(typeof result.seed).toBe('number');
      expect(typeof result.hexagramId).toBe('string');
    });
  });

  describe('卦象范围', () => {
    it('上卦(upperGua)应在 0-7 范围内', () => {
      // 多次测试确保覆盖不同情况
      for (let i = 0; i < 100; i++) {
        const result = meihuaDivination(Date.now() + i);
        expect(result.upperGua).toBeGreaterThanOrEqual(0);
        expect(result.upperGua).toBeLessThanOrEqual(7);
        expect(Number.isInteger(result.upperGua)).toBe(true);
      }
    });

    it('下卦(lowerGua)应在 0-7 范围内', () => {
      for (let i = 0; i < 100; i++) {
        const result = meihuaDivination(Date.now() + i);
        expect(result.lowerGua).toBeGreaterThanOrEqual(0);
        expect(result.lowerGua).toBeLessThanOrEqual(7);
        expect(Number.isInteger(result.lowerGua)).toBe(true);
      }
    });

    it('seed 应在 0-999 范围内', () => {
      for (let i = 0; i < 100; i++) {
        const result = meihuaDivination(Date.now() + i);
        expect(result.seed).toBeGreaterThanOrEqual(0);
        expect(result.seed).toBeLessThanOrEqual(999);
        expect(Number.isInteger(result.seed)).toBe(true);
      }
    });
  });

  describe('动爻范围', () => {
    it('动爻(movingLine)应在 1-6 范围内', () => {
      for (let i = 0; i < 100; i++) {
        const result = meihuaDivination(Date.now() + i);
        expect(result.movingLine).toBeGreaterThanOrEqual(1);
        expect(result.movingLine).toBeLessThanOrEqual(6);
        expect(Number.isInteger(result.movingLine)).toBe(true);
      }
    });
  });

  describe('卦象ID格式', () => {
    it('hexagramId 应为有效的格式 (上卦_下卦)', () => {
      const validGuaIds = ['qian', 'dui', 'li', 'zhen', 'xun', 'kan', 'gen', 'kun'];

      for (let i = 0; i < 50; i++) {
        const result = meihuaDivination(Date.now() + i);
        const parts = result.hexagramId.split('_');

        expect(parts).toHaveLength(2);
        expect(validGuaIds).toContain(parts[0]);
        expect(validGuaIds).toContain(parts[1]);
      }
    });
  });

  describe('算法正确性验证', () => {
    it('使用固定的 random 值应产生确定性结果', () => {
      // Mock Math.random 返回固定值 0.5
      Math.random = vi.fn().mockReturnValue(0.5);

      // 使用时间戳末两位为 50 的时间戳
      const timestamp = 1709548375450; // 末两位是 50
      const result = meihuaDivination(timestamp);

      // product = 50 * 0.5 = 25
      // decimalPart = 25 - 25 = 0
      // seed = floor(0 * 1000) % 1000 = 0
      expect(result.seed).toBe(0);
      expect(result.lowerGua).toBe(0); // 0 % 8 = 0
      // upperGua = (0 + year % 8) % 8, 2026 % 8 = 2
      expect(result.upperGua).toBe(2);
      expect(result.movingLine).toBe(1); // 0 % 6 + 1 = 1
    });

    it('验证不同 random 值产生的结果', () => {
      // Mock Math.random 返回固定值 0.123
      Math.random = vi.fn().mockReturnValue(0.123);

      const timestamp = 1709548375450; // 末两位是 50
      const result = meihuaDivination(timestamp);

      // product = 50 * 0.123 = 6.15
      // decimalPart = 6.15 - 6 = 0.15
      // seed = floor(0.15 * 1000) % 1000 = 150
      expect(result.seed).toBe(150);
      expect(result.lowerGua).toBe(150 % 8); // 150 % 8 = 6
      // upperGua = (150 + 2026 % 8) % 8 = (150 + 2) % 8 = 152 % 8 = 0
      expect(result.upperGua).toBe(0);
      expect(result.movingLine).toBe((150 % 6) + 1); // 150 % 6 + 1 = 1
    });

    it('下卦 = seed % 8 应正确计算', () => {
      // 测试多个固定 random 值
      const testCases = [
        // random: 0.0 → product=0 → seed=0 → lowerGua=0
        { random: 0.0, expectedLowerGua: 0 },
        // random: 0.001 → product=0.05 → seed=50 → lowerGua=50%8=2
        { random: 0.001, expectedLowerGua: 2 },
        // random: 0.125 → product=6.25 → seed=250 → lowerGua=250%8=2
        { random: 0.125, expectedLowerGua: 2 },
        // random: 0.5 → product=25 → seed=0 → lowerGua=0
        { random: 0.5, expectedLowerGua: 0 },
      ];

      testCases.forEach(({ random, expectedLowerGua }) => {
        Math.random = vi.fn().mockReturnValue(random);
        const timestamp = 1709548375450;
        const result = meihuaDivination(timestamp);

        expect(result.lowerGua).toBe(expectedLowerGua);
      });
    });

    it('动爻 = seed % 6 + 1 应正确计算', () => {
      const testCases = [
        { random: 0.0, expectedMovingLine: 1 },   // seed = 0, 0 % 6 + 1 = 1
        { random: 0.12, expectedMovingLine: 1 },  // seed = 0, floor(600) = 0, 实际上 50*0.12=6, decimal=0, seed=0
        { random: 0.125, expectedMovingLine: 5 }, // seed = 250, 250 % 6 + 1 = 4 + 1 = 5
      ];

      testCases.forEach(({ random, expectedMovingLine }) => {
        Math.random = vi.fn().mockReturnValue(random);
        const timestamp = 1709548375450;
        const result = meihuaDivination(timestamp);

        expect(result.movingLine).toBe(expectedMovingLine);
      });
    });
  });
});

describe('getHexagramId', () => {
  it('应正确组合上卦和下卦ID', () => {
    expect(getHexagramId(0, 0)).toBe('qian_qian');
    expect(getHexagramId(1, 2)).toBe('dui_li');
    expect(getHexagramId(7, 7)).toBe('kun_kun');
  });

  it('所有卦象组合应产生有效ID', () => {
    const validGuaIds = ['qian', 'dui', 'li', 'zhen', 'xun', 'kan', 'gen', 'kun'];

    for (let upper = 0; upper < 8; upper++) {
      for (let lower = 0; lower < 8; lower++) {
        const hexagramId = getHexagramId(upper, lower);
        const [upperId, lowerId] = hexagramId.split('_');

        expect(validGuaIds).toContain(upperId);
        expect(validGuaIds).toContain(lowerId);
      }
    }
  });
});

describe('getSingleGuaId', () => {
  it('应返回正确的单卦ID', () => {
    expect(getSingleGuaId(0)).toBe('qian');
    expect(getSingleGuaId(1)).toBe('dui');
    expect(getSingleGuaId(2)).toBe('li');
    expect(getSingleGuaId(3)).toBe('zhen');
    expect(getSingleGuaId(4)).toBe('xun');
    expect(getSingleGuaId(5)).toBe('kan');
    expect(getSingleGuaId(6)).toBe('gen');
    expect(getSingleGuaId(7)).toBe('kun');
  });

  it('应处理大于7的索引（取模）', () => {
    expect(getSingleGuaId(8)).toBe('qian');
    expect(getSingleGuaId(9)).toBe('dui');
    expect(getSingleGuaId(15)).toBe('kun');
    expect(getSingleGuaId(16)).toBe('qian');
  });
});

describe('GUA_NAMES 常量', () => {
  it('应包含所有八卦名称', () => {
    expect(GUA_NAMES[0]).toBe('乾');
    expect(GUA_NAMES[1]).toBe('兑');
    expect(GUA_NAMES[2]).toBe('离');
    expect(GUA_NAMES[3]).toBe('震');
    expect(GUA_NAMES[4]).toBe('巽');
    expect(GUA_NAMES[5]).toBe('坎');
    expect(GUA_NAMES[6]).toBe('艮');
    expect(GUA_NAMES[7]).toBe('坤');
  });

  it('应有8个卦象', () => {
    expect(Object.keys(GUA_NAMES)).toHaveLength(8);
  });
});
