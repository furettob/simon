import type { UnknownAction, ThunkDispatch } from "@reduxjs/toolkit";
import { getSuccessThreshold, generateCompleteSequence } from "./sequence";

// ==================== TYPES / CONSTANTS ====================
export type AppDispatch = ThunkDispatch<SimonState, undefined, UnknownAction>;

export const GAME_STATUS = {
  IDLE: "IDLE",
  SHOWING: "SHOWING",
  WAITING: "WAITING",
} as const;

export const GAME_MODE = {
  OFF: "OFF",
  2: 2,
  1: 1,
  3: 3,
} as const;

export const SKILL_LEVEL = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
} as const;

export const COLORS = ["red", "blue", "yellow", "green"] as const;
export const COLORS_EMOJI = ["🔴", "🟢", "🟡", "🔵"] as const;
export type ColorIndex = 0 | 1 | 2 | 3;

// ==================== ACTION TYPES ====================
const SET_STATUS = "SET_STATUS";
const ADD_PLAYER_INPUT_TO_SEQUENCE = "ADD_PLAYER_INPUT_TO_SEQUENCE";
const CHECK_INPUT = "CHECK_INPUT";
const SET_NEXT_SEQUENCE_TO_BE_PLAYED = "SET_NEXT_SEQUENCE_TO_BE_PLAYED";
const RESET_PLAYER_SEQUENCE = "RESET_PLAYER_SEQUENCE";
const RESET_GAME = "RESET_GAME";
const SET_ACTIVE_BUTTON = "SET_ACTIVE_BUTTON";
const SET_SKILL_LEVEL = "SET_SKILL_LEVEL";
const SET_GAME_MODE = "SET_GAME_MODE";
const SET_TIMEOUT_REF = "SET_TIMEOUT_REF";
const SET_ACTIVE_BUTTON_TIMEOUT_REF = "SET_ACTIVE_BUTTON_TIMEOUT_REF";
const SET_LONGEST_SEQUENCE = "SET_LONGEST_SEQUENCE";

// ==================== ACTION CREATORS ====================
export const setStatus = (status: SimonState["gameStatus"]) => ({
  type: SET_STATUS,
  payload: status,
});
export const resetPlayerSequence = () => ({
  type: RESET_PLAYER_SEQUENCE,
});
export const addPlayerInputToSequence = (colorIndex: ColorIndex) => ({
  type: ADD_PLAYER_INPUT_TO_SEQUENCE,
  payload: colorIndex,
});
export const checkInput = () => ({ type: CHECK_INPUT });
export const setNewSequenceToBePlayed = (newSequenceLength?: number) => ({
  type: SET_NEXT_SEQUENCE_TO_BE_PLAYED,
  payload: newSequenceLength,
});
export const resetGame = () => ({ type: RESET_GAME });
export const setActiveButton = (colorIndex: number | null) => ({
  type: SET_ACTIVE_BUTTON,
  payload: colorIndex,
});
export const setSkillLevel = (newSkillLevel: SimonState["skillLevel"]) => ({
  type: SET_SKILL_LEVEL,
  payload: newSkillLevel,
});
export const setGameMode = (newGameMode: SimonState["gameMode"]) => ({
  type: SET_GAME_MODE,
  payload: newGameMode,
});
export const setActiveButtonTimeoutRef = (
  activeButtonTimeoutRef: SimonState["activeButtonTimeoutRef"],
) => ({
  type: SET_ACTIVE_BUTTON_TIMEOUT_REF,
  payload: activeButtonTimeoutRef,
});
export const setTimeoutRef = (timeoutRef: SimonState["timeoutRef"]) => ({
  type: SET_ACTIVE_BUTTON_TIMEOUT_REF,
  payload: timeoutRef,
});
export const setTLongestSequence = (longestSequence: ColorIndex[]) => ({
  type: SET_LONGEST_SEQUENCE,
  payload: longestSequence,
});

// ==================== INITIAL STATE ====================
export type SimonState = {
  gameStatus: keyof typeof GAME_STATUS;
  completeSequence: ColorIndex[];
  sequenceLength: number;
  playerSequence: ColorIndex[];
  longestSequence: ColorIndex[];
  skillLevel: keyof typeof SKILL_LEVEL;
  gameMode: keyof typeof GAME_MODE;
  activeButton: number | null;
  timeoutRef: number | undefined;
  activeButtonTimeoutRef: number | undefined;
};

export const initialState: SimonState = {
  gameStatus: "IDLE",
  completeSequence: [],
  sequenceLength: 0,
  playerSequence: [],
  longestSequence: [],
  skillLevel: 2,
  gameMode: 1,
  activeButton: null,
  timeoutRef: undefined,
  activeButtonTimeoutRef: undefined,
};

// ==================== ACTION TYPES ====================
type SimonAction =
  | { type: typeof SET_STATUS; payload: SimonState["gameStatus"] }
  | { type: typeof ADD_PLAYER_INPUT_TO_SEQUENCE; payload: ColorIndex }
  | { type: typeof CHECK_INPUT }
  | { type: typeof SET_NEXT_SEQUENCE_TO_BE_PLAYED; payload?: number }
  | { type: typeof RESET_GAME }
  | { type: typeof SET_ACTIVE_BUTTON; payload: number | null }
  | { type: typeof SET_SKILL_LEVEL; payload: SimonState["skillLevel"] }
  | { type: typeof SET_GAME_MODE; payload: SimonState["gameMode"] }
  | {
      type: typeof SET_LONGEST_SEQUENCE;
      payload: SimonState["longestSequence"];
    }
  | { type: typeof SET_ACTIVE_BUTTON_TIMEOUT_REF; payload: number }
  | { type: typeof SET_TIMEOUT_REF; payload: number }
  | { type: typeof RESET_PLAYER_SEQUENCE };

export const simonReducer = (
  state: SimonState = initialState,
  action: SimonAction,
): SimonState => {
  if (state === undefined) {
    return state;
  }

  switch (action.type) {
    case SET_STATUS:
      return {
        ...state,
        gameStatus: action.payload,
      };

    case SET_ACTIVE_BUTTON:
      return {
        ...state,
        activeButton: action.payload,
      };

    case ADD_PLAYER_INPUT_TO_SEQUENCE: {
      return {
        ...state,
        playerSequence: [...state.playerSequence, action.payload],
      };
    }

    case RESET_PLAYER_SEQUENCE: {
      return {
        ...state,
        playerSequence: [],
      };
    }

    case SET_NEXT_SEQUENCE_TO_BE_PLAYED: {
      const completeSequence =
        state.completeSequence.length === 0
          ? generateCompleteSequence(
              getSuccessThreshold({ skillLevel: state.skillLevel }),
            )
          : state.completeSequence;
      return {
        ...state,
        completeSequence,
        sequenceLength: action.payload || state.sequenceLength + 1,
        playerSequence: [],
      };
    }

    case RESET_GAME: {
      const { skillLevel, gameMode } = state;
      return {
        ...initialState,
        skillLevel,
        gameMode,
      };
    }

    case SET_SKILL_LEVEL:
      return {
        ...state,
        skillLevel: action.payload,
      };

    case SET_GAME_MODE: {
      const { skillLevel, gameMode } = state;
      const additionalProp =
        action.payload === "OFF"
          ? {
              ...initialState,
              skillLevel,
              gameMode,
            }
          : {};
      return {
        ...state,
        ...additionalProp,
        gameMode: action.payload,
      };
    }

    case SET_TIMEOUT_REF:
      return {
        ...state,
        timeoutRef: action.payload,
      };

    case SET_ACTIVE_BUTTON_TIMEOUT_REF:
      return {
        ...state,
        activeButtonTimeoutRef: action.payload,
      };

    case SET_LONGEST_SEQUENCE:
      return {
        ...state,
        longestSequence: action.payload,
      };

    default:
      return state;
  }
};
