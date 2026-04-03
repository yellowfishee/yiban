/**
 * 灵感上下文 - 处理每日打卡和卦象灵感
 * 改造后使用 API 替代本地存储
 */
import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import Taro from '@tarojs/taro';
import { checkinApi, type CheckinRecord } from '../api/checkin';
import { agentApi, type GenerateResponse } from '../api/agent';
import { useAuth } from './AuthContext';
import type { Mood, Inspiration, RawHexagram } from '@yiban/core';
import type { AgentScene } from '@yiban/core';

interface MeihuaResult {
  hexagramId: string;
  upperGua: number;
  lowerGua: number;
  movingLine: number;
  hasMovingLine: boolean;
  mainHexagram: RawHexagram;
}

interface AgentContent {
  scene: AgentScene;
  content: string;
  beastName: string;
  cached: boolean;
}

interface InspirationState {
  currentHexagram: RawHexagram | null;
  selectedMood: Mood | null;
  inspiration: Inspiration | null;
  alreadyAdoptedToday: boolean;
  isLoading: boolean;
  checkedInToday: boolean;
  meihuaResult: MeihuaResult | null;
  agentContents: AgentContent[];
  agentLoading: boolean;
  error: string | null;
  currentCheckinId: string | null;
}

type InspirationAction =
  | { type: 'LOAD'; payload: { currentHexagram: RawHexagram; inspiration: Inspiration; meihuaResult: MeihuaResult; checkinId: string } }
  | { type: 'SELECT_MOOD'; payload: { mood: Mood; inspiration: Inspiration } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AGENT_LOADING'; payload: boolean }
  | { type: 'SET_AGENT_CONTENTS'; payload: AgentContent[] }
  | { type: 'RESET' }
  | { type: 'SET_CHECKIN_ID'; payload: string | null };

const initialState: InspirationState = {
  currentHexagram: null,
  selectedMood: null,
  inspiration: null,
  alreadyAdoptedToday: false,
  isLoading: false,
  checkedInToday: false,
  meihuaResult: null,
  agentContents: [],
  agentLoading: false,
  error: null,
  currentCheckinId: null,
};

function inspirationReducer(state: InspirationState, action: InspirationAction): InspirationState {
  switch (action.type) {
    case 'LOAD':
      return {
        ...state,
        currentHexagram: action.payload.currentHexagram,
        inspiration: action.payload.inspiration,
        alreadyAdoptedToday: true,
        checkedInToday: true,
        meihuaResult: action.payload.meihuaResult,
        currentCheckinId: action.payload.checkinId,
        isLoading: false,
        error: null,
      };
    case 'SELECT_MOOD':
      if (!state.currentHexagram) return state;
      return {
        ...state,
        selectedMood: action.payload.mood,
        inspiration: action.payload.inspiration,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_AGENT_LOADING':
      return { ...state, agentLoading: action.payload };
    case 'SET_AGENT_CONTENTS':
      return { ...state, agentContents: action.payload, agentLoading: false };
    case 'RESET':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'SET_CHECKIN_ID':
      return { ...state, currentCheckinId: action.payload };
    default:
      return state;
  }
}

// 创建灵感对象
const createInspiration = (hexagram: RawHexagram, mood: Mood): Inspiration => {
  const text = hexagram.moods?.[mood]?.interpretation || hexagram.concept || '';
  return {
    hexagram,
    mood,
    text,
    date: new Date().toISOString().split('T')[0],
  };
};

// 转换 API 响应为 MeihuaResult
const convertToMeihuaResult = (checkin: CheckinRecord): MeihuaResult => {
  return {
    hexagramId: checkin.hexagramId,
    upperGua: parseInt(checkin.meihuaData.upperGua, 10),
    lowerGua: parseInt(checkin.meihuaData.lowerGua, 10),
    movingLine: checkin.meihuaData.movingLine,
    hasMovingLine: checkin.meihuaData.movingLine > 0,
    mainHexagram: checkin.hexagram,
  };
};

interface InspirationContextValue extends InspirationState {
  loadToday: () => Promise<void>;
  selectMood: (mood: Mood) => void;
  handleCheckIn: (mood?: string) => Promise<void>;
  resetCheckIn: () => void;
  generateAgentContents: (checkinId: string) => Promise<void>;
  showRewardedVideoAd: (scene: AgentScene, checkinId: string) => void;
  handleAdviceClick: (scene: AgentScene) => void;
}

const InspirationContext = createContext<InspirationContextValue | null>(null);

export function InspirationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(inspirationReducer, initialState);
  const { isLoggedIn, user } = useAuth();

  /**
   * 加载今日打卡状态
   */
  const loadToday = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // 未登录时不加载
      if (!isLoggedIn) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      const response = await checkinApi.getToday();

      if (response.hasCheckedIn && response.checkin) {
        const checkin = response.checkin;
        const mood = (checkin.mood as Mood) || 'work';
        const inspiration = createInspiration(checkin.hexagram, mood);
        const meihuaResult = convertToMeihuaResult(checkin);

        dispatch({
          type: 'LOAD',
          payload: {
            currentHexagram: checkin.hexagram,
            inspiration,
            meihuaResult,
            checkinId: checkin.id,
          },
        });

        // 加载该打卡的已有 AI 内容
        try {
          const contentsResponse = await agentApi.getContents(checkin.id);
          if (contentsResponse.contents && contentsResponse.contents.length > 0) {
            const contents = contentsResponse.contents.map((c) => ({
              scene: c.scene,
              content: c.content,
              beastName: checkin.hexagram.symbol,
              cached: c.cached,
            }));
            dispatch({ type: 'SET_AGENT_CONTENTS', payload: contents });
          }
        } catch (err) {
          console.error('Failed to load agent contents:', err);
        }
      } else {
        // 今日未打卡
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error: any) {
      console.error('Load today checkin failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || '加载打卡状态失败' });
    }
  }, [isLoggedIn]);

  /**
   * 生成 AI 建议内容
   */
  const generateAgentContents = useCallback(async (checkinId: string) => {
    dispatch({ type: 'SET_AGENT_LOADING', payload: true });

    try {
      const scenes: AgentScene[] = ['suitable_for', 'advice', 'companionship'];
      const results = await Promise.all(
        scenes.map((scene) =>
          agentApi.generate(checkinId, scene).catch((err) => {
            console.error(`Failed to generate ${scene}:`, err);
            return null;
          })
        )
      );

      const contents: AgentContent[] = results
        .filter((r): r is GenerateResponse => r !== null)
        .map((r) => ({
          scene: r.scene,
          content: r.content,
          beastName: r.beastName,
          cached: r.cached,
        }));

      dispatch({ type: 'SET_AGENT_CONTENTS', payload: contents });
    } catch (error: any) {
      console.error('Generate agent contents failed:', error);
      dispatch({ type: 'SET_AGENT_LOADING', payload: false });
    }
  }, []);

  /**
   * 显示激励视频广告
   */
  const showRewardedVideoAd = useCallback((scene: AgentScene, checkinId: string) => {
    // 微信小程序激励视频
    if (process.env.TARO_ENV === 'weapp') {
      const rewardedAd = Taro.createRewardedVideoAd({
        adUnitId: 'your_ad_unit_id',  // TODO: 替换为实际广告单元ID
      });

      rewardedAd.onClose((res: { isEnded: boolean }) => {
        if (res.isEnded) {
          // 用户完整观看，调用上报
          const userId = user?.id || '';
          const signature = Buffer.from(`${userId}${checkinId}${scene}`).toString('base64');
          agentApi.reportAdWatched(checkinId, scene, signature)
            .then(() => {
              // 重新获取建议
              generateAgentContents(checkinId);
            });
        }
      });

      rewardedAd.show().catch(() => {
        Taro.showToast({ title: '广告加载失败，请重试', icon: 'none' });
      });
    } else {
      // H5 环境
      Taro.showToast({ title: '仅小程序支持广告解锁', icon: 'none' });
    }
  }, [generateAgentContents]);

  /**
   * 解锁场景建议（通过激励视频广告）
   */
  const handleAdviceClick = useCallback((_scene: AgentScene) => {
    if (!state.currentCheckinId) {
      Taro.showToast({ title: '请先打卡', icon: 'none' });
      return;
    }
    // 广告单元 ID 未配置时提示
    if (process.env.TARO_ENV === 'weapp') {
      Taro.showToast({ title: '该功能即将上线', icon: 'none' });
    }
  }, [state.currentCheckinId]);

  /**
   * 打卡 - 直接调用 API 完成
   */
  const handleCheckIn = useCallback(async (mood?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // 不在这里检查登录状态，由 API 调用失败来触发错误
      const result = await checkinApi.create(mood);
      const checkin = result.checkin;
      const actualMood = (checkin.mood as Mood) || 'work';
      const inspiration = createInspiration(checkin.hexagram, actualMood);
      const meihuaResult = convertToMeihuaResult(checkin);

      dispatch({
        type: 'LOAD',
        payload: {
          currentHexagram: checkin.hexagram,
          inspiration,
          meihuaResult,
          checkinId: checkin.id,
        },
      });

      // 打卡成功后并行生成 AI 内容
      generateAgentContents(checkin.id);
    } catch (error: any) {
      console.error('Checkin failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || '打卡失败' });
      throw error;
    }
  }, [isLoggedIn, generateAgentContents]);

  /**
   * 选择心情
   */
  const selectMood = useCallback((mood: Mood) => {
    if (!state.currentHexagram) return;
    const inspiration = createInspiration(state.currentHexagram, mood);
    dispatch({ type: 'SELECT_MOOD', payload: { mood, inspiration } });
  }, [state.currentHexagram]);

  /**
   * 重置打卡状态（开发模式使用）
   */
  const resetCheckIn = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value: InspirationContextValue = {
    ...state,
    loadToday,
    selectMood,
    handleCheckIn,
    resetCheckIn,
    generateAgentContents,
    showRewardedVideoAd,
    handleAdviceClick,
  };

  return <InspirationContext.Provider value={value}>{children}</InspirationContext.Provider>;
}

export function useInspiration(): InspirationContextValue {
  const context = useContext(InspirationContext);
  if (!context) {
    throw new Error('useInspiration must be used within an InspirationProvider');
  }
  return context;
}
