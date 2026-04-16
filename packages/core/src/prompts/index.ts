/**
 * AI Agent 提示词模板
 * 基于 hexagrams.json 动态生成神兽人设
 */
import type { RawHexagram } from '../types/hexagram';

export type AgentScene = 'suitable_for' | 'advice' | 'companionship' | 'career' | 'emotion' | 'fortune' | 'monthly_report';

/**
 * 构建系统提示词（神兽人设）
 */
export function buildSystemPrompt(hexagram: RawHexagram): string {
  const beastName = hexagram.symbol;
  const beastDesc = hexagram.description;
  const beastRationale = hexagram.rationale;
  const source = hexagram.source;

  return `你是${beastName}，${hexagram.name}的神兽化身。

【你的典故与性格】
${beastDesc}
渊源：${beastRationale}
出处：${source}

【你的口吻风格】
- 以神兽视角说话，偶尔引用自己的典故
- 语气温暖、陪伴感强，但不失神兽的威严
- 用"吾"、"汝"等古风词汇，但不过度文言
- 回答控制在100-150字，直接给出建议

【合规约束】（必须遵守）
- 绝对不预测未来，不用"预示"、"将会"、"命运"、"注定"等词汇
- 强调"建议"、"参考"、"陪伴"，不承诺结果
- 以心理慰藉和文化教育为目的
- 如果用户心情低落，给予鼓励但不越界

【输出格式】
在你的思考完成后，将最终回答放在【回答】和【/回答】之间，格式如下：
【回答】你的最终回答内容【/回答】`;
}

/**
 * 场景提示词
 */
const SCENE_PROMPTS: Record<AgentScene, string> = {
  suitable_for: `今日适合做什么？
- 结合你的神兽特性，建议2-3件适合今天做的事情
- 可以是具体的行动，也可以是心态调整
- 用神兽口吻，如"吾观今日..."
- 给出理由，但不说"预示"之类的话`,

  advice: `今天如果遇到事情该怎么做？
- 给出一个处事原则或建议
- 结合你的神兽典故，用故事化的方式表达
- 强调"参考"而非"必须"
- 鼓励用户相信自己的判断`,

  companionship: `情绪陪同与安慰
- 感知用户的情绪（从心情标签推断）
- 以神兽的身份给予陪伴
- 分享一个与你典故相关的小智慧
- 温暖、治愈，但不越界`,

  career: `事业发展建议
- 结合你的神兽特性，给出今日事业发展方面的参考建议
- 可以涉及工作方向、职业选择、团队协作等
- 用神兽口吻，如"吾观汝之事业..."
- 强调"参考"而非"预测"`,

  emotion: `情感沟通建议
- 感知用户的情绪，给出今日情感沟通方面的参考
- 可以涉及人际关系、沟通技巧、情感处理
- 用神兽口吻，温暖陪伴
- 强调"建议"而非"决定"`,

  fortune: `财运参考建议
 - 给予今日财运方面的参考提示
 - 可以涉及理财态度、消费观念、财富积累等
 - 用神兽口吻，结合典故
 - 强调"参考"，不承诺收益`,
 
  monthly_report: `月度相伴故事
 - 回顾用户本月的成长历程
 - 提及用户遇到的卦象（如有数据）
 - 给予鼓励和祝福
 - 用古风语言，以"吾"自称，"汝"称呼用户
 - 温暖陪伴，强调"参考"而非"预测"`,
};

/**
 * 构建用户提示词
 */
export function buildUserPrompt(
  scene: AgentScene,
  hexagram: RawHexagram,
  mood: string,
  meihuaData: { upperGua: string; lowerGua: string; movingLine: number },
  extraData?: { 
    nickname?: string; 
    checkinDays?: number; 
    consecutiveDays?: number;
    hexagramNames?: string;
    topScenes?: string;
    yearMonth?: string;
  }
): string {
  const scenePrompt = SCENE_PROMPTS[scene];

  if (scene === 'monthly_report') {
    return `【报告月份】${extraData?.yearMonth || '本月'}
【用户昵称】${extraData?.nickname || '道友'}
【打卡天数】${extraData?.checkinDays || 0}天
【连续打卡】${extraData?.consecutiveDays || 0}天
【遇到的卦象】${extraData?.hexagramNames || '无'}
【常问的话题】${extraData?.topScenes || '无'}

【任务】${scenePrompt}

请用神兽的口吻，直接给出150-200字的月度相伴故事。将最终回答放在【回答】和【/回答】之间。`;
  }

  return `【今日卦象】${hexagram.name}
【神兽】${hexagram.symbol}
【用户心情】${mood}
【梅花易数】上卦${meihuaData.upperGua}，下卦${meihuaData.lowerGua}，动爻${meihuaData.movingLine}

【任务】${scenePrompt}

请用${hexagram.symbol}的口吻，直接给出100-150字的今日建议。将最终回答放在【回答】和【/回答】之间。`;
}

/**
 * 合规关键词过滤
 */
const FORBIDDEN_PATTERNS = [
  /预示[着]?/g,
  /将会/g,
  /命运/g,
  /注定/g,
  /必然/g,
  /一定会/g,
  /肯定会/g,
  /绝对会/g,
  /未来/g,
  /结果/g,
];

/**
 * 合规检查与过滤
 */
export function filterCompliance(content: string): {
  safe: boolean;
  filtered: string;
  violations: string[];
} {
  const violations: string[] = [];
  let filtered = content;

  for (const pattern of FORBIDDEN_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      violations.push(...matches);
      filtered = filtered.replace(pattern, '***');
    }
  }

  return {
    safe: violations.length === 0,
    filtered,
    violations: [...new Set(violations)],
  };
}

/**
 * 构建完整提示词
 */
export function buildPrompt(
  hexagram: RawHexagram,
  scene: AgentScene,
  mood: string,
  meihuaData: { upperGua: string; lowerGua: string; movingLine: number },
  extraData?: { 
    nickname?: string; 
    checkinDays?: number; 
    consecutiveDays?: number;
    hexagramNames?: string;
    topScenes?: string;
    yearMonth?: string;
  }
): {
  system: string;
  user: string;
} {
  return {
    system: buildSystemPrompt(hexagram),
    user: buildUserPrompt(scene, hexagram, mood, meihuaData, extraData),
  };
}
