import { playSound } from "./sound";

// ==================== CONSTANTS ====================
export const GAME_STATUS = {
  IDLE: "IDLE",
  SHOWING: "SHOWING",
  WAITING: "WAITING",
  CHECKING: "CHECKING",
  SUCCESS: "SUCCESS",
  GAME_OVER: "GAME_OVER",
};

export const COLORS = ["red", "green", "blue", "yellow"];

// ==================== ACTION TYPES ====================
const START_GAME = "START_GAME";
const SET_STATUS = "SET_STATUS";
const READ_PLAYER_INPUT = "READ_PLAYER_INPUT";
const CHECK_INPUT = "CHECK_INPUT";
const ADD_STEP_TO_SEQUENCE = "ADD_STEP_TO_SEQUENCE";
const GAME_OVER = "GAME_OVER";
const RESET_GAME = "RESET_GAME";
const SET_ACTIVE_BUTTON = "SET_ACTIVE_BUTTON";
const TOGGLE_STRICT_MODE = "TOGGLE_STRICT_MODE";
const REPLAY_SEQUENCE = "REPLAY_SEQUENCE";

// ==================== HELPERS ====================
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// TODO: make this a thunk
const lightUpButton = async (colorIndex: number, dispatch) => {
  // Light up button
  playSound(colorIndex);
  dispatch(setActiveButton(colorIndex));

  await sleep(600); // Button stays lit

  // Turn off button
  dispatch(setActiveButton(null));

  await sleep(200); // Gap between buttons
};

// TODO: make this a thunk
const playSequence = async (sequence: number[], dispatch) => {
  // Show the sequence
  await sleep(500); // Initial delay

  for (let i = 0; i < sequence.length; i++) {
    await lightUpButton(sequence[i], dispatch);
  }
};
export const waitThunk =
  ({ currentPlayerSequenceLength }: { currentPlayerSequenceLength: number }) =>
  async (dispatch, getState) => {
    dispatch(setStatus(GAME_STATUS.WAITING));
    const { sequence: currentSequence, playerSequence } = getState();
    setTimeout(() => {
      console.log("TIMEOUT!!!");
      // TODO: better condition to detect inactivity
      if (
        playerSequence.length <= currentPlayerSequenceLength &&
        getState().sequence.length <= currentSequence.length
      ) {
        console.log("GAME OVER TRIGGERED BY TIMEOUT: ", {
          currentSequenceLength: currentSequence.length,
          currentPlayerSequenceLength,
          playerSequenceLength: playerSequence.length,
        });
        dispatch({ type: GAME_OVER });
      }
    }, 5000);
  };

export const playNewLevelThunk = () => async (dispatch, getState) => {
  // Set up the game with first/new color
  dispatch({ type: ADD_STEP_TO_SEQUENCE });

  // Get the updated state with the new sequence
  const { sequence } = getState();

  await playSequence(sequence, dispatch);

  // After showing sequence, set status to waiting
  dispatch(waitThunk({ currentPlayerSequenceLength: 0 }));
};
export const handleClickColorButtonThunk =
  (colorIndex: number) => async (dispatch, getState) => {
    await lightUpButton(colorIndex, dispatch);

    // Record player input
    dispatch(playerInput(colorIndex));

    // Check the input
    await sleep(100);

    const { sequence, playerSequence, strictMode } = getState();
    const currentIndex = playerSequence.length - 1;

    // Check if current input is wrong
    if (playerSequence[currentIndex] !== sequence[currentIndex]) {
      if (strictMode) {
        dispatch({ type: GAME_OVER });
      } else {
        // Non-strict mode: replay the sequence
        dispatch({ type: SET_STATUS, payload: GAME_STATUS.GAME_OVER });
      }
    }

    // Correct input - check if sequence is complete
    if (playerSequence.length === sequence.length) {
      await sleep(1200);
      dispatch(playNewLevelThunk());
      return;
    }

    // Correct but sequence not complete
    dispatch(waitThunk({ currentPlayerSequenceLength: playerSequence.length }));
  };
// ==================== ACTION CREATORS ====================
export const setStatus = (status) => ({ type: SET_STATUS, payload: status });
export const playerInput = (colorIndex) => ({
  type: READ_PLAYER_INPUT,
  payload: colorIndex,
});
export const checkInput = () => ({ type: CHECK_INPUT });
export const addStepToSequence = () => ({ type: ADD_STEP_TO_SEQUENCE });
export const gameOver = () => ({ type: GAME_OVER });
export const resetGame = () => ({ type: RESET_GAME });
export const setActiveButton = (colorIndex) => ({
  type: SET_ACTIVE_BUTTON,
  payload: colorIndex,
});
export const toggleStrictMode = () => ({ type: TOGGLE_STRICT_MODE });
export const replaySequence = () => ({ type: REPLAY_SEQUENCE });

// ==================== INITIAL STATE ====================
export type SimonState = {
  gameStatus: string;
  sequence: number[];
  playerSequence: number[];
  score: number;
  strictMode: boolean;
  activeButton: number | null;
};

export const initialState = {
  gameStatus: GAME_STATUS.IDLE,
  sequence: [],
  playerSequence: [],
  score: 0,
  strictMode: false,
  activeButton: null,
};

// ==================== REDUCER ====================
export const simonReducer = (state, action) => {
  console.log("Reducer action:", action, state);
  switch (action.type) {
    case START_GAME:
      const firstColor = Math.floor(Math.random() * 4);
      return {
        ...state,
        gameStatus: GAME_STATUS.SHOWING,
        sequence: [firstColor],
        playerSequence: [],
        score: 0,
      };

    case SET_STATUS:
      return {
        ...state,
        gameStatus: action.payload,
      };

    // TODO: move it in React state?
    case SET_ACTIVE_BUTTON:
      return {
        ...state,
        activeButton: action.payload,
      };

    case READ_PLAYER_INPUT:
      if (state.gameStatus !== GAME_STATUS.WAITING) {
        return state;
      }

      const newPlayerSequence = [...state.playerSequence, action.payload];

      return {
        ...state,
        playerSequence: newPlayerSequence,
        gameStatus: GAME_STATUS.CHECKING,
      };

      // Correct but sequence not complete
      return {
        ...state,
        gameStatus: GAME_STATUS.WAITING,
      };

    case ADD_STEP_TO_SEQUENCE:
      const nextColor = Math.floor(Math.random() * 4);
      const nextSequence = [...state.sequence, nextColor];

      return {
        ...state,
        gameStatus: GAME_STATUS.SHOWING,
        sequence: nextSequence,
        playerSequence: [],
      };

    case REPLAY_SEQUENCE:
      return {
        ...state,
        gameStatus: GAME_STATUS.SHOWING,
        playerSequence: [],
      };

    case GAME_OVER:
      return {
        ...state,
        gameStatus: GAME_STATUS.GAME_OVER,
      };

    case RESET_GAME:
      return {
        ...initialState,
      };

    case TOGGLE_STRICT_MODE:
      return {
        ...state,
        strictMode: !state.strictMode,
      };

    default:
      return state;
  }
};
