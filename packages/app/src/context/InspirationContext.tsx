/**
 * 灵感上下文 - 处理每日打卡和卦象灵感
 * 改造后使用 API 替代本地存储
 */
import {
	createContext,
	useContext,
	useReducer,
	useCallback,
	useRef,
	type ReactNode,
} from "react";
import Taro from "@tarojs/taro";
import { checkinApi, type CheckinRecord } from "../api/checkin";
import { agentApi } from "../api/agent";
import { useAuth } from "./AuthContext";
import type { Mood, Inspiration, RawHexagram } from "@yiban/core";
import type { AgentScene } from "@yiban/core";

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
	generatingScene: AgentScene | null; // 当前正在生成的场景（null = 无）
	error: string | null;
	currentCheckinId: string | null;
}

type InspirationAction =
	| {
			type: "LOAD";
			payload: {
				currentHexagram: RawHexagram;
				inspiration: Inspiration;
				meihuaResult: MeihuaResult;
				checkinId: string;
			};
	  }
	| { type: "SELECT_MOOD"; payload: { mood: Mood; inspiration: Inspiration } }
	| { type: "SET_LOADING"; payload: boolean }
	| { type: "SET_ERROR"; payload: string | null }
	| { type: "SET_AGENT_CONTENTS"; payload: AgentContent[] }
	| { type: "ADD_AGENT_CONTENT"; payload: AgentContent }
	| { type: "SET_GENERATING_SCENE"; payload: AgentScene | null }
	| { type: "RESET" }
	| { type: "SET_CHECKIN_ID"; payload: string | null };

const initialState: InspirationState = {
	currentHexagram: null,
	selectedMood: null,
	inspiration: null,
	alreadyAdoptedToday: false,
	isLoading: false,
	checkedInToday: false,
	meihuaResult: null,
	agentContents: [],
	generatingScene: null,
	error: null,
	currentCheckinId: null,
};

function inspirationReducer(
	state: InspirationState,
	action: InspirationAction,
): InspirationState {
	switch (action.type) {
		case "LOAD":
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
		case "SELECT_MOOD":
			if (!state.currentHexagram) return state;
			return {
				...state,
				selectedMood: action.payload.mood,
				inspiration: action.payload.inspiration,
			};
		case "SET_LOADING":
			return { ...state, isLoading: action.payload };
		case "SET_ERROR":
			return { ...state, error: action.payload, isLoading: false };
		case "SET_AGENT_CONTENTS":
			return { ...state, agentContents: action.payload, generatingScene: null };
		case "ADD_AGENT_CONTENT": {
			const newContents = state.agentContents.filter(
				(c) => c.scene !== action.payload.scene,
			);
			newContents.push(action.payload);
			return {
				...state,
				agentContents: newContents,
				generatingScene: null,
			};
		}
		case "SET_GENERATING_SCENE":
			return { ...state, generatingScene: action.payload };
		case "RESET":
			return {
				...initialState,
				isLoading: false,
			};
		case "SET_CHECKIN_ID":
			return { ...state, currentCheckinId: action.payload };
		default:
			return state;
	}
}

// 创建灵感对象
const createInspiration = (hexagram: RawHexagram, mood: Mood): Inspiration => {
	const text = hexagram.moods?.[mood]?.interpretation || hexagram.concept || "";
	return {
		hexagram,
		mood,
		text,
		date: new Date().toISOString().split("T")[0],
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
	generateAgentContent: (checkinId: string, scene: AgentScene) => Promise<void>;
}

const InspirationContext = createContext<InspirationContextValue | null>(null);

export function InspirationProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(inspirationReducer, initialState);
	const stateRef = useRef(state);
	stateRef.current = state;
	const { isLoggedIn } = useAuth();

	/**
	 * 加载今日打卡状态
	 */
	const loadToday = useCallback(async () => {
		dispatch({ type: "SET_LOADING", payload: true });

		try {
			if (!isLoggedIn) {
				dispatch({ type: "SET_LOADING", payload: false });
				return;
			}

			const response = await checkinApi.getToday();

			if (response.hasCheckedIn && response.checkin) {
				const checkin = response.checkin;
				const mood = (checkin.mood as Mood) || "work";
				const inspiration = createInspiration(checkin.hexagram, mood);
				const meihuaResult = convertToMeihuaResult(checkin);

				dispatch({
					type: "LOAD",
					payload: {
						currentHexagram: checkin.hexagram,
						inspiration,
						meihuaResult,
						checkinId: checkin.id,
					},
				});

				// 加载该打卡的已有 AI 内容（从缓存读取，不触发新生成）
				try {
					const contentsResponse = await agentApi.getContents(checkin.id);
					if (
						contentsResponse.contents &&
						contentsResponse.contents.length > 0
					) {
						const contents = contentsResponse.contents.map((c) => ({
							scene: c.scene,
							content: c.content,
							beastName: checkin.hexagram.symbol,
							cached: c.cached,
						}));
						dispatch({ type: "SET_AGENT_CONTENTS", payload: contents });
					}
				} catch (err) {
					console.error("Failed to load agent contents:", err);
				}
			} else {
				dispatch({ type: "SET_LOADING", payload: false });
			}
		} catch (error: any) {
			console.error("Load today checkin failed:", error);
			dispatch({
				type: "SET_ERROR",
				payload: error.message || "加载打卡状态失败",
			});
		}
	}, [isLoggedIn]);

	/**
	 * 生成单个场景的 AI 建议（按需调用，一次只请求一个场景）
	 */
	const generateAgentContent = useCallback(
		async (checkinId: string, scene: AgentScene) => {
			const currentState = stateRef.current;

			if (
				currentState.agentContents.some((c) => c.scene === scene && c.content)
			) {
				return;
			}
			if (currentState.generatingScene === scene) {
				return;
			}

			dispatch({ type: "SET_GENERATING_SCENE", payload: scene });

			try {
				const result = await agentApi.generate(checkinId, scene);

				if (!result.content) {
					Taro.showToast({
						title: result.message || "今日已领取，请明天再来",
						icon: "none",
					});
					dispatch({ type: "SET_GENERATING_SCENE", payload: null });
					return;
				}

				dispatch({
					type: "ADD_AGENT_CONTENT",
					payload: {
						scene: result.scene,
						content: result.content!,
						beastName: result.beastName || "",
						cached: result.cached ?? false,
					},
				});
			} catch (err) {
				console.error(`Failed to generate ${scene}:`, err);
				dispatch({ type: "SET_GENERATING_SCENE", payload: null });
			}
		},
		[],
	);

	/**
	 * 打卡 - 直接调用 API 完成
	 */
	const handleCheckIn = useCallback(
		async (mood?: string) => {
			dispatch({ type: "SET_LOADING", payload: true });
			dispatch({ type: "SET_ERROR", payload: null });

			try {
				const result = await checkinApi.create(mood);
				const checkin = result.checkin;
				const actualMood = (checkin.mood as Mood) || "work";
				const inspiration = createInspiration(checkin.hexagram, actualMood);
				const meihuaResult = convertToMeihuaResult(checkin);

				dispatch({
					type: "LOAD",
					payload: {
						currentHexagram: checkin.hexagram,
						inspiration,
						meihuaResult,
						checkinId: checkin.id,
					},
				});

				// 打卡成功后只加载第一个场景（suitable_for），其余按需
				generateAgentContent(checkin.id, "suitable_for");
			} catch (error: any) {
				console.error("Checkin failed:", error);
				dispatch({ type: "SET_ERROR", payload: error.message || "打卡失败" });
				throw error;
			}
		},
		[isLoggedIn, generateAgentContent],
	);

	const selectMood = useCallback(
		(mood: Mood) => {
			if (!state.currentHexagram) return;
			const inspiration = createInspiration(state.currentHexagram, mood);
			dispatch({ type: "SELECT_MOOD", payload: { mood, inspiration } });
		},
		[state.currentHexagram],
	);

	const resetCheckIn = useCallback(() => {
		dispatch({ type: "RESET" });
	}, []);

	const value: InspirationContextValue = {
		...state,
		loadToday,
		selectMood,
		handleCheckIn,
		resetCheckIn,
		generateAgentContent,
	};

	return (
		<InspirationContext.Provider value={value}>
			{children}
		</InspirationContext.Provider>
	);
}

export function useInspiration(): InspirationContextValue {
	const context = useContext(InspirationContext);
	if (!context) {
		throw new Error(
			"useInspiration must be used within an InspirationProvider",
		);
	}
	return context;
}
