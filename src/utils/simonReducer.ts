import { getInterval, intervalType } from "./intervals";
import {
  playSound,
  type Frequence,
} from "./sound";
import type { UnknownAction, ThunkDispatch } from "@reduxjs/toolkit";
import { getSuccessThreshold } from "./success";

// ==================== TYPES ====================
export type AppDispatch = ThunkDispatch<SimonState, undefined, UnknownAction>;

// ==================== CONSTANTS ====================
export const GAME_STATUS = {
  OFF: "OFF",
  IDLE: "IDLE",
  SHOWING: "SHOWING",
  WAITING: "WAITING",
  SUCCESS: "SUCCESS",
};

export const COLORS = ["red", "blue", "yellow",  "green"] as const;

// ==================== ACTION TYPES ====================
const START_GAME = "START_GAME";
const SET_STATUS = "SET_STATUS";
const ADD_PLATER_INPUT_TO_SEQUENCE = "ADD_PLATER_INPUT_TO_SEQUENCE";
const CHECK_INPUT = "CHECK_INPUT";
const ADD_STEP_TO_SEQUENCE = "ADD_STEP_TO_SEQUENCE";
const RESET_GAME = "RESET_GAME";
const SET_ACTIVE_BUTTON = "SET_ACTIVE_BUTTON";
const SET_SKILL_LEVEL = "SET_SKILL_LEVEL";
const SET_GAME_MODE = "SET_GAME_MODE";
const SET_TIMEOUT_REF = "SET_TIMEOUT_REF";

// ==================== HELPERS ====================
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const ligtAndSoundFeedbackThunk =
  ({
    frequence,
    colorIndex,
    durationMs,
  }: {
    frequence?: Frequence;
    colorIndex?: number | null;
    durationMs: number;
  }) =>
  async (dispatch: AppDispatch) => {
    // Light up button
    if (frequence) {
      playSound({ frequence, durationMs });
    }
    if (colorIndex !== undefined) {
      dispatch(setActiveButton(colorIndex));
    }
    await sleep(durationMs); // Button stays lit
    dispatch(setActiveButton(null));
  };

export const playSequenceThunk =
  ({ sequence, skillLevel }: { sequence: number[]; skillLevel: number }) =>
  async (dispatch: AppDispatch) => {
    // Show the sequence
    await sleep(getInterval({ intervalType: intervalType.pauseBeforeNextLevel, skillLevel })); // Initial delay

    for (let i = 0; i < sequence.length; i++) {
      console.log("Playing step ", i, " Color Index: ", sequence[i], "at ", Date.now() % 60_000);
      await dispatch(
        ligtAndSoundFeedbackThunk({
          colorIndex: sequence[i],
          durationMs: getInterval({ intervalType: intervalType.buttonFeedback, skillLevel }),
          frequence: COLORS[sequence[i]],
        }),
      );
      await sleep(getInterval({ intervalType: intervalType.betweenSteps, skillLevel }));
    }
  };

export const waitThunk =
  () => async (dispatch: AppDispatch, getState: () => SimonState) => {
    dispatch(setStatus(GAME_STATUS.WAITING));
    const { sequence, playerSequence, timeoutRef, skillLevel } = getState();

    clearTimeout(timeoutRef);

    const gameOverTimeout = setTimeout(() => {
      const { playerSequence: newPlayerSequence, sequence: newGameSequence } =
        getState();

      if (
        // Player did not submit an input in the last 5s
        newPlayerSequence.length <= playerSequence.length &&
        // Player did not advance level
        newGameSequence.length === sequence.length
      ) {
        dispatch(gameOverThunk(null));
      }
    }, getInterval({ intervalType: intervalType.gameOverTimeout, skillLevel }));

    dispatch({ type: SET_TIMEOUT_REF, payload: gameOverTimeout});
  };
export const gameOverThunk =
  (colorIndex: number | null) => async (dispatch: AppDispatch) => {
    // TODO: what the real game do when timeout? In terms of user feedback?
    dispatch({ type: SET_STATUS, payload: GAME_STATUS.SHOWING });
    for (let i = 0; i < 3; i++) {
      await dispatch(ligtAndSoundFeedbackThunk({
        colorIndex,
        durationMs: getInterval({ intervalType: intervalType.shortFeedback }),
        frequence: "gameOver",
      }));
    }
    dispatch(resetGame());
    dispatch({ type: SET_STATUS, payload: GAME_STATUS.IDLE });
  };

export const successThunk =
() => async (dispatch: AppDispatch) => {
    dispatch({ type: SET_STATUS, payload: GAME_STATUS.SHOWING });
    dispatch(setActiveButton(null));
    await sleep(getInterval({ intervalType: intervalType.shortPause }));
    
    const successFrequencies: Frequence[] = ["success", "success2", "success3", "success4"];
    for (let i = 0; i < 12; i++) {
      await dispatch(ligtAndSoundFeedbackThunk({
        colorIndex: i % 4,
        durationMs: getInterval({ intervalType: intervalType.glimpseFeedback }),
        frequence: successFrequencies[i % 4],
      }));
    }

    dispatch(resetGame());
    dispatch({ type: SET_STATUS, payload: GAME_STATUS.IDLE });
  };

export const playNewLevelThunk =
  () => async (dispatch: AppDispatch, getState: () => SimonState) => {

    const { gameStatus, skillLevel } = getState();
    if (gameStatus === GAME_STATUS.SHOWING) {
      return;
    }
    dispatch(setStatus(GAME_STATUS.SHOWING));
    await sleep(getInterval({ intervalType: intervalType.pauseBeforeNextLevel, skillLevel })); // Pause before new level

    // Set up the game with first/new color
    dispatch(addStepToSequence());
    // Get the updated state with the new sequence
    const { sequence } = getState();

    await dispatch(playSequenceThunk({ sequence, skillLevel }));

    dispatch(waitThunk()); // After showing sequence, set status to waiting
  };

export const handleClickColorButtonThunk =
  (colorIndex: number) =>
  async (dispatch: AppDispatch, getState: () => SimonState) => {
    // Record player input
    const { sequence, playerSequence: previousPlayerSequence } = getState();
    if (previousPlayerSequence.length >= sequence.length) {
      return;
    }
    dispatch(addPlayerInputToSequence(colorIndex));
    const { playerSequence } = getState();

    // Check the input
    const currentIndex = playerSequence.length - 1;
    if (playerSequence[currentIndex] !== sequence[currentIndex]) {
      // TODO: introduce strictMode AKA gameMode
      dispatch(gameOverThunk(colorIndex));
      return;
    }

    const { skillLevel } = getState();

    await dispatch(
      ligtAndSoundFeedbackThunk({
        colorIndex,
        frequence: COLORS[colorIndex],
        durationMs: getInterval({ intervalType: intervalType.buttonFeedback, skillLevel }),
      }),
    );

    // Correct input - check if sequence is complete
    if (playerSequence.length === sequence.length) {
      if (sequence.length === getSuccessThreshold({skillLevel})) {
        dispatch(successThunk());
      } else {
        dispatch(playNewLevelThunk());
      }
    } else {
      dispatch(waitThunk());
    }
  };

// ==================== ACTION CREATORS ====================
export const setStatus = (status: SimonState["gameStatus"]) => ({
  type: SET_STATUS,
  payload: status,
});
export const addPlayerInputToSequence = (colorIndex: number) => ({
  type: ADD_PLATER_INPUT_TO_SEQUENCE,
  payload: colorIndex,
});
export const checkInput = () => ({ type: CHECK_INPUT });
export const addStepToSequence = () => ({ type: ADD_STEP_TO_SEQUENCE });
export const resetGame = () => ({ type: RESET_GAME });
export const setActiveButton = (colorIndex: number | null) => ({
  type: SET_ACTIVE_BUTTON,
  payload: colorIndex,
});
export const setSkillLevel = (newSkillLevel: SimonState["skillLevel"]) => ({ type: SET_SKILL_LEVEL, payload: newSkillLevel });
export const setGameMode = (newGameMode: SimonState["gameMode"]) => ({ type: SET_GAME_MODE, payload: newGameMode });

// ==================== INITIAL STATE ====================
export type SimonState = {
  gameStatus: string;
  sequence: number[];
  playerSequence: number[];
  skillLevel: 1 | 2 | 3 | 4;
  gameMode: "OFF" | 1 | 2 | 3;
  activeButton: number | null;
  timeoutRef?: number | undefined;
};

// ==================== ACTION TYPES ====================
type SimonAction =
  | { type: typeof START_GAME }
  | { type: typeof SET_STATUS; payload: string }
  | { type: typeof ADD_PLATER_INPUT_TO_SEQUENCE; payload: number }
  | { type: typeof CHECK_INPUT }
  | { type: typeof ADD_STEP_TO_SEQUENCE }
  | { type: typeof RESET_GAME }
  | { type: typeof SET_ACTIVE_BUTTON; payload: number | null }
  | { type: typeof SET_SKILL_LEVEL; payload: SimonState["skillLevel"] }
  | { type: typeof SET_GAME_MODE; payload: SimonState["gameMode"] }
  | { type: typeof SET_TIMEOUT_REF; payload: number };

export const initialState = {
  gameStatus: GAME_STATUS.IDLE,
  sequence: [],
  playerSequence: [],
  skillLevel: 4,
  gameMode: "OFF",
  activeButton: null,
};

// ==================== REDUCER ====================
export const simonReducer = (state: SimonState, action: SimonAction) => {
  switch (action.type) {
    case START_GAME: {
      const firstColor = Math.floor(Math.random() * 4);
      return {
        ...state,
        gameStatus: GAME_STATUS.SHOWING,
        sequence: [firstColor],
        playerSequence: [],
      };
    }
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

    case ADD_PLATER_INPUT_TO_SEQUENCE: {
      if (state.gameStatus !== GAME_STATUS.WAITING) {
        console.warn("Ignoring player input, not in WAITING state");
        return state;
      }

      const newPlayerSequence = [...state.playerSequence, action.payload];

      return {
        ...state,
        playerSequence: newPlayerSequence,
      };
    }

    case ADD_STEP_TO_SEQUENCE: {
      const nextColor = Math.floor(Math.random() * 4);
      const nextSequence = [...state.sequence, nextColor];

      return {
        ...state,
        gameStatus: GAME_STATUS.SHOWING,
        sequence: nextSequence,
        playerSequence: [],
      };
    }

    case RESET_GAME: {
      const skillLevel = state.skillLevel;
      return {
        ...initialState,
        skillLevel,
      };
    }

    case SET_SKILL_LEVEL:
      return {
        ...state,
        skillLevel: action.payload,
      };

    case SET_GAME_MODE:
      return {
        ...state,
        gameMode: action.payload,
      };

    case SET_TIMEOUT_REF:
      return {
        ...state,
        timeoutRef: action.payload,
      };

    default:
      return state;
  }
};
