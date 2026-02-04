import { getInterval, intervalType } from "./intervals";
import { playSound, type Frequence } from "./sound";
import type { UnknownAction, ThunkDispatch } from "@reduxjs/toolkit";
import {
  getSuccessThreshold,
  generateCompleteSequence,
  LONGEST_SEQUENCE_MEMORY_KEY,
  getLongestSequenceInMemory,
} from "./sequence";

// ==================== TYPES ====================
export type AppDispatch = ThunkDispatch<SimonState, undefined, UnknownAction>;

// ==================== CONSTANTS ====================
export const GAME_STATUS = {
  IDLE: "IDLE",
  SHOWING: "SHOWING",
  WAITING: "WAITING",
} as const;

export const COLORS = ["red", "blue", "yellow", "green"] as const;

// ==================== ACTION TYPES ====================
const SET_STATUS = "SET_STATUS";
const ADD_PLATER_INPUT_TO_SEQUENCE = "ADD_PLATER_INPUT_TO_SEQUENCE";
const CHECK_INPUT = "CHECK_INPUT";
const INCREASE_SEQUENCE_LENGTH = "INCREASE_SEQUENCE_LENGTH";
const RESET_GAME = "RESET_GAME";
const SET_ACTIVE_BUTTON = "SET_ACTIVE_BUTTON";
const SET_SKILL_LEVEL = "SET_SKILL_LEVEL";
const SET_GAME_MODE = "SET_GAME_MODE";
const SET_TIMEOUT_REF = "SET_TIMEOUT_REF";
const SET_ACTIVE_BUTTON_TIMEOUT_REF = "SET_ACTIVE_BUTTON_TIMEOUT_REF";
const SET_LONGEST_SEQUENCE = "SET_LONGEST_SEQUENCE";

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
  async (dispatch: AppDispatch, getState: () => SimonState) => {
    const { activeButtonTimeoutRef: stateActiveButtonTimeout } = getState();
    if (stateActiveButtonTimeout) {
      clearTimeout(stateActiveButtonTimeout);
    }
    // Light up button
    if (frequence) {
      playSound({ frequence, durationMs });
    }
    if (colorIndex !== undefined) {
      dispatch(setActiveButton(colorIndex));
    }
    const activeButtonTimeoutRef = setTimeout(() => {
      dispatch(setActiveButton(null));
    }, durationMs);
    dispatch({
      type: SET_ACTIVE_BUTTON_TIMEOUT_REF,
      payload: activeButtonTimeoutRef,
    });
    await sleep(durationMs); // Button stays lit
  };

export const playSequenceThunk =
  ({
    completeSequence,
    skillLevel,
    sequenceLength,
  }: {
    completeSequence: number[];
    skillLevel: number;
    sequenceLength: number;
  }) =>
  async (dispatch: AppDispatch) => {
    // Show the sequence
    await sleep(
      getInterval({
        intervalType: intervalType.pauseBeforeNextLevel,
        skillLevel,
      }),
    ); // Initial delay

    for (let i = 0; i < sequenceLength; i++) {
      await dispatch(
        ligtAndSoundFeedbackThunk({
          colorIndex: completeSequence[i],
          durationMs: getInterval({
            intervalType: intervalType.buttonFeedback,
            skillLevel,
          }),
          frequence: COLORS[completeSequence[i]],
        }),
      );
      await sleep(
        getInterval({ intervalType: intervalType.betweenSteps, skillLevel }),
      );
    }
  };

export const waitThunk =
  () => async (dispatch: AppDispatch, getState: () => SimonState) => {
    dispatch(setStatus(GAME_STATUS.WAITING));
    const { sequenceLength, playerSequence, timeoutRef, skillLevel } =
      getState();

    clearTimeout(timeoutRef);

    const gameOverTimeout = setTimeout(
      () => {
        const {
          playerSequence: newPlayerSequence,
          sequenceLength: newGameSequenceLength,
        } = getState();

        if (
          // Player did not submit an input in the last 5s
          newPlayerSequence.length <= playerSequence.length &&
          // Player did not advance level
          newGameSequenceLength === sequenceLength
        ) {
          dispatch(gameOverThunk(null));
        }
      },
      getInterval({ intervalType: intervalType.gameOverTimeout, skillLevel }),
    );

    dispatch({ type: SET_TIMEOUT_REF, payload: gameOverTimeout });
  };
export const gameOverThunk =
  (colorIndex: number | null) => async (dispatch: AppDispatch) => {
    // TODO: what the real game do when timeout? In terms of user feedback?
    dispatch({ type: SET_STATUS, payload: GAME_STATUS.SHOWING });
    for (let i = 0; i < 3; i++) {
      await dispatch(
        ligtAndSoundFeedbackThunk({
          colorIndex,
          durationMs: getInterval({ intervalType: intervalType.shortFeedback }),
          frequence: "gameOver",
        }),
      );
    }
    dispatch(resetGame());
    dispatch({ type: SET_STATUS, payload: GAME_STATUS.IDLE });
  };

export const successThunk = () => async (dispatch: AppDispatch) => {
  dispatch({ type: SET_STATUS, payload: GAME_STATUS.SHOWING });
  dispatch(setActiveButton(null));
  await sleep(getInterval({ intervalType: intervalType.shortPause }));

  const successFrequencies: Frequence[] = [
    "success",
    "success2",
    "success3",
    "success4",
  ];
  for (let i = 0; i < 12; i++) {
    await dispatch(
      ligtAndSoundFeedbackThunk({
        colorIndex: i % 4,
        durationMs: getInterval({ intervalType: intervalType.glimpseFeedback }),
        frequence: successFrequencies[i % 4],
      }),
    );
  }

  dispatch(resetGame());
  dispatch({ type: SET_STATUS, payload: GAME_STATUS.IDLE });
};

export const playLevelThunk =
  (addLevel: boolean = true) =>
  async (dispatch: AppDispatch, getState: () => SimonState) => {
    const { gameStatus, skillLevel, timeoutRef } = getState();
    if (timeoutRef) {
      clearInterval(timeoutRef);
    }
    if (gameStatus === GAME_STATUS.SHOWING) {
      return;
    }
    dispatch(setStatus(GAME_STATUS.SHOWING));
    // Pause before new level
    await sleep(
      getInterval({
        intervalType: intervalType.pauseBeforeNextLevel,
        skillLevel,
      }),
    );

    // Set up the game with first/new color
    if (addLevel) {
      dispatch(increaseSequenceLength());
    }
    // Get the updated state with the new sequence
    const { completeSequence, sequenceLength } = getState();

    await dispatch(
      playSequenceThunk({ completeSequence, skillLevel, sequenceLength }),
    );

    dispatch(waitThunk()); // After showing sequence, set status to waiting
  };

export const playLongestSequenceThunk =
  () => async (dispatch: AppDispatch, getState: () => SimonState) => {
    const { gameStatus, skillLevel, longestSequence } = getState();
    if (gameStatus === GAME_STATUS.SHOWING) {
      return;
    }
    const longestSequenceInMemory = getLongestSequenceInMemory({
      longestSequenceInState: longestSequence,
    });
    dispatch(setStatus(GAME_STATUS.SHOWING));
    // Pause before reproducing
    await sleep(
      getInterval({
        intervalType: intervalType.shortPause,
      }),
    );

    console.log("Repeating::: ", longestSequenceInMemory);
    await dispatch(
      playSequenceThunk({
        completeSequence: longestSequenceInMemory,
        skillLevel,
        sequenceLength: longestSequenceInMemory.length,
      }),
    );

    dispatch({ type: SET_STATUS, payload: "IDLE" }); // After showing sequence, set status to IDLE
  };

export const handleClickColorButtonThunk =
  (colorIndex: number) =>
  async (dispatch: AppDispatch, getState: () => SimonState) => {
    // Record player input
    const {
      completeSequence,
      playerSequence: previousPlayerSequence,
      sequenceLength,
    } = getState();
    if (previousPlayerSequence.length >= sequenceLength) {
      return;
    }
    dispatch(addPlayerInputToSequence(colorIndex));
    const { playerSequence, skillLevel, longestSequence } = getState();

    // Check the input
    const currentIndex = playerSequence.length - 1;
    if (playerSequence[currentIndex] !== completeSequence[currentIndex]) {
      // TODO: introduce strictMode AKA gameMode
      dispatch(gameOverThunk(colorIndex));
      return;
    }

    // Possibly update longestSequence
    const longestSequenceInMemory = getLongestSequenceInMemory({
      longestSequenceInState: longestSequence,
    });
    // Update state to avoid reading from localStorage multiple times
    if (longestSequence.length === 0 && longestSequenceInMemory?.length) {
      dispatch({
        type: SET_LONGEST_SEQUENCE,
        payload: longestSequenceInMemory,
      });
    }
    // Update both state and localStorage if player reached a longer sequence
    if (playerSequence.length > longestSequenceInMemory.length) {
      localStorage.setItem(
        LONGEST_SEQUENCE_MEMORY_KEY,
        JSON.stringify(playerSequence),
      );
      dispatch({ type: SET_LONGEST_SEQUENCE, payload: playerSequence });
    }

    dispatch(
      ligtAndSoundFeedbackThunk({
        colorIndex,
        frequence: COLORS[colorIndex],
        durationMs: getInterval({
          intervalType: intervalType.buttonFeedback,
          skillLevel,
        }),
      }),
    );

    // Correct input - check if sequence is complete
    if (playerSequence.length === sequenceLength) {
      if (sequenceLength === completeSequence.length) {
        // Wait for the last sound to finish before playing the success sequence
        await sleep(
          getInterval({
            intervalType: intervalType.buttonFeedback,
            skillLevel,
          }),
        );
        dispatch(successThunk());
      } else {
        dispatch(playLevelThunk());
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
export const increaseSequenceLength = () => ({
  type: INCREASE_SEQUENCE_LENGTH,
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

// ==================== INITIAL STATE ====================
export type SimonState = {
  gameStatus: keyof typeof GAME_STATUS;
  completeSequence: number[];
  sequenceLength: number;
  playerSequence: number[];
  longestSequence: number[];
  skillLevel: 1 | 2 | 3 | 4;
  gameMode: "OFF" | 1 | 2 | 3;
  activeButton: number | null;
  timeoutRef: number | undefined;
  activeButtonTimeoutRef: number | undefined;
};

// ==================== ACTION TYPES ====================
type SimonAction =
  | { type: typeof SET_STATUS; payload: SimonState["gameStatus"] }
  | { type: typeof ADD_PLATER_INPUT_TO_SEQUENCE; payload: number }
  | { type: typeof CHECK_INPUT }
  | { type: typeof INCREASE_SEQUENCE_LENGTH }
  | { type: typeof RESET_GAME }
  | { type: typeof SET_ACTIVE_BUTTON; payload: number | null }
  | { type: typeof SET_SKILL_LEVEL; payload: SimonState["skillLevel"] }
  | { type: typeof SET_GAME_MODE; payload: SimonState["gameMode"] }
  | {
    type: typeof SET_LONGEST_SEQUENCE;
    payload: SimonState["longestSequence"];
  }
  | { type: typeof SET_ACTIVE_BUTTON_TIMEOUT_REF; payload: number}
  | { type: typeof SET_TIMEOUT_REF; payload: number }

  
export const initialState: SimonState = {
  gameStatus: "IDLE",
  completeSequence: [],
  sequenceLength: 0,
  playerSequence: [],
  longestSequence: [],
  skillLevel: 2,
  gameMode: "OFF",
  activeButton: null,
  timeoutRef: undefined,
  activeButtonTimeoutRef: undefined,
};

// ==================== REDUCER ====================
export const simonReducer = (
  state: SimonState = initialState,
  action: SimonAction,
): SimonState => {
  if (state === undefined) {
    return state;
  }
  if (state.gameMode === "OFF") {
    if (action.type !== SET_GAME_MODE && action.type !== SET_SKILL_LEVEL) {
      return state;
    }
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

    case ADD_PLATER_INPUT_TO_SEQUENCE: {
      if (state.gameStatus !== GAME_STATUS.WAITING) {
        return state;
      }

      const newPlayerSequence = [...state.playerSequence, action.payload];

      return {
        ...state,
        playerSequence: newPlayerSequence,
      };
    }

    case INCREASE_SEQUENCE_LENGTH: {
      const completeSequence =
        state.completeSequence.length === 0
          ? generateCompleteSequence(
              getSuccessThreshold({ skillLevel: state.skillLevel }),
            )
          : state.completeSequence;
      return {
        ...state,
        gameStatus: GAME_STATUS.SHOWING,
        completeSequence,
        sequenceLength: state.sequenceLength + 1,
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
