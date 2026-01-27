import {
  intervalMap,
  playColorButtonSound,
  playGameOverSequence,
  playSuccessSequence,
} from "./sound";
import type { UnknownAction, ThunkDispatch } from "@reduxjs/toolkit";

// ==================== TYPES ====================
type AppDispatch = ThunkDispatch<SimonState, undefined, UnknownAction>;

// ==================== CONSTANTS ====================
export const GAME_STATUS = {
  OFF: "OFF",
  IDLE: "IDLE",
  SHOWING: "SHOWING",
  WAITING: "WAITING",
  SUCCESS: "SUCCESS",
};

export const COLORS = ["red", "green", "blue", "yellow"];

// ==================== ACTION TYPES ====================
const START_GAME = "START_GAME";
const SET_STATUS = "SET_STATUS";
const ADD_PLATER_INPUT_TO_SEQUENCE = "ADD_PLATER_INPUT_TO_SEQUENCE";
const CHECK_INPUT = "CHECK_INPUT";
const ADD_STEP_TO_SEQUENCE = "ADD_STEP_TO_SEQUENCE";
const RESET_GAME = "RESET_GAME";
const SET_ACTIVE_BUTTON = "SET_ACTIVE_BUTTON";
const TOGGLE_SKILL_LEVEL = "TOGGLE_SKILL_LEVEL";
const SET_TIMEOUT_REF = "SET_TIMEOUT_REF";

// ==================== HELPERS ====================
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const lightUpButtonThunk =
  ({
    colorIndex,
    skillLevel,
  }: {
    colorIndex: number;
    skillLevel: number;
  }) =>
  async (dispatch: AppDispatch) => {
    // Light up button
    dispatch(setActiveButton(colorIndex));
    playColorButtonSound({ colorIndex, skillLevel });

    await sleep(intervalMap[skillLevel - 1] * 1000); // Button stays lit

    // Turn off button
    dispatch(setActiveButton(null));

    await sleep(200); // Gap between buttons
  };

export const playSequenceThunk =
  ({
    sequence,
    skillLevel,
  }: {
    sequence: number[];
    skillLevel: number;
  }) =>
  async (dispatch: AppDispatch) => {
    // Show the sequence
    await sleep(500); // Initial delay

    for (let i = 0; i < sequence.length; i++) {
      await dispatch(
        lightUpButtonThunk({ colorIndex: sequence[i], skillLevel })
      );
    }
  };
export const waitThunk =
  () => async (dispatch: AppDispatch, getState: () => SimonState) => {
    dispatch(setStatus(GAME_STATUS.WAITING));
    const { sequence, playerSequence, timeoutRef } = getState();

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
    }, 5000);

    dispatch({ type: SET_TIMEOUT_REF, payload: gameOverTimeout });
  };
export const gameOverThunk =
  (colorIndex: number | null) => async (dispatch: AppDispatch) => {
    // TODO: what the real game do when timeout? In terms of user feedback?
    dispatch({ type: SET_STATUS, payload: GAME_STATUS.SHOWING });
    console.log("Game Over! ", colorIndex);
    playGameOverSequence();
    for (let i = 0; i < 3; i++) {
      dispatch(setActiveButton(colorIndex));
      await sleep(200);
      dispatch(setActiveButton(null));
      await sleep(100);
    }
    dispatch(resetGame());
    dispatch({ type: SET_STATUS, payload: GAME_STATUS.IDLE });
  };

export const successThunk =
  () => async (dispatch: AppDispatch, getState: () => SimonState) => {
    const { activeButton } = getState();
    console.log("Game Over! ", activeButton);
    dispatch({ type: SET_STATUS, payload: GAME_STATUS.SHOWING });
    playSuccessSequence();
    setActiveButton(null);
    await sleep(100);
    setActiveButton(activeButton);
    await sleep(100);
    setActiveButton(null);
    await sleep(100);
    setActiveButton(activeButton);
    await sleep(100);
    setActiveButton(null);
    dispatch(resetGame());
    dispatch({ type: SET_STATUS, payload: GAME_STATUS.IDLE });
  };

export const playNewLevelThunk =
  () => async (dispatch: AppDispatch, getState: () => SimonState) => {
    console.log("Starting new level...");
    const { gameStatus } = getState();
    if (gameStatus === GAME_STATUS.SHOWING) {
      return;
    }
    console.log("Starting new level...");
    dispatch(setStatus(GAME_STATUS.SHOWING));
    await sleep(1000); // Pause before new level

    // Set up the game with first/new color
    dispatch(addStepToSequence());

    // Get the updated state with the new sequence
    const { sequence, skillLevel } = getState();

    dispatch(playSequenceThunk({ sequence, skillLevel }));

    // After showing sequence, set status to waiting
    dispatch(waitThunk());
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

    // Check if current input is wrong
    if (playerSequence[currentIndex] !== sequence[currentIndex]) {
      // TODO: introduce strictMode AKA gameMode
      dispatch(gameOverThunk(colorIndex));
      return;
    }

    await dispatch(lightUpButtonThunk(
      { colorIndex, skillLevel: getState().skillLevel }
    ));

    // Correct input - check if sequence is complete
    if (playerSequence.length === sequence.length) {
      if (sequence.length === 8) {
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
export const toggleSkillLevel = () => ({ type: TOGGLE_SKILL_LEVEL });

// ==================== INITIAL STATE ====================
export type SimonState = {
  gameStatus: string;
  sequence: number[];
  playerSequence: number[];
  score: number;
  skillLevel: 1 | 2 | 3 | 4;
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
  | { type: typeof TOGGLE_SKILL_LEVEL }
  | { type: typeof SET_TIMEOUT_REF; payload: number };

export const initialState = {
  gameStatus: GAME_STATUS.IDLE,
  sequence: [],
  playerSequence: [],
  score: 0,
  skillLevel: 4,
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
        score: 0,
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

    case TOGGLE_SKILL_LEVEL:
      return {
        ...state,
        // TODO: create util to derive new skillLevel
        skillLevel:
          state.skillLevel === 4
            ? 1
            : ((state.skillLevel + 1) as 1 | 2 | 3 | 4),
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
