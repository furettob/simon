import { intervalMap, playSound } from "./sound";

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
const TOGGLE_SKILL_LEVEL = "TOGGLE_SKILL_LEVEL";
const REPLAY_SEQUENCE = "REPLAY_SEQUENCE";

// ==================== HELPERS ====================
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// TODO: make this a thunk
const lightUpButton = async ({colorIndex, skillLevel}: {colorIndex: number, skillLevel: number}, dispatch ) => {
  // Light up button
  playSound({colorIndex, skillLevel}); // TODO: pass actual skillLevel
  dispatch(setActiveButton(colorIndex));

  await sleep(intervalMap[skillLevel - 1] * 1000); // Button stays lit

  // Turn off button
  dispatch(setActiveButton(null));

  await sleep(200); // Gap between buttons
};

// TODO: make this a thunk
const playSequence = async ({sequence, skillLevel}: {sequence: number[], skillLevel: number}, dispatch) => {
  // Show the sequence
  await sleep(500); // Initial delay

  for (let i = 0; i < sequence.length; i++) {
    await lightUpButton({colorIndex: sequence[i], skillLevel}, dispatch);
  }
};
export const waitThunk =
  ({ propPlayerSequenceLength }: { propPlayerSequenceLength: number }) =>
  async (dispatch, getState) => {
    dispatch(setStatus(GAME_STATUS.WAITING));
    const { sequence: oldGameSequence } = getState();
    setTimeout(() => {
    const { playerSequence, sequence: newGameSequence } = getState();
      console.log("TIMEOUT!!!");
      // TODO: better condition to detect inactivity
      if (
        // Player did not submit an input in the last 5s
        playerSequence.length <= propPlayerSequenceLength &&
        // Player did not advance level
        newGameSequence.length === oldGameSequence.length
      ) {
        console.log("GAME OVER TRIGGERED BY TIMEOUT: ", {
          currentSequenceLength: oldGameSequence.length,
          currentPlayerSequenceLength: propPlayerSequenceLength,
          playerSequenceLength: playerSequence.length,
        });
        dispatch({ type: GAME_OVER });
      }
    }, 5000);
  };

export const playNewLevelThunk = () => async (dispatch, getState) => {
  // Set up the game with first/new color
  dispatch(addStepToSequence());

  // Get the updated state with the new sequence
  const { sequence, skillLevel } = getState();

  await playSequence({sequence, skillLevel}, dispatch);

  // After showing sequence, set status to waiting
  dispatch(waitThunk({ propPlayerSequenceLength: 0 }));
};
export const handleClickColorButtonThunk =
  (colorIndex: number) => async (dispatch, getState) => {
    await lightUpButton({colorIndex, skillLevel: getState().skillLevel}, dispatch);

    // Record player input
    dispatch(playerInput(colorIndex));

    // Check the input
    await sleep(100);

    const { sequence, playerSequence } = getState();
    const currentIndex = playerSequence.length - 1;

    // Check if current input is wrong
    if (playerSequence[currentIndex] !== sequence[currentIndex]) {
      // TODO: introduce strictMode AKA gameMode if (strictMode) {
        dispatch({ type: GAME_OVER });
        return;
      // } else {
      //   // Non-strict mode: replay the sequence
      //   dispatch({ type: SET_STATUS, payload: GAME_STATUS.GAME_OVER });
      // }
    }

    // Correct input - check if sequence is complete
    if (playerSequence.length === sequence.length) {
      await sleep(1200);
      dispatch(playNewLevelThunk());
      return;
    }

    // Correct but sequence not complete
    dispatch(waitThunk({ propPlayerSequenceLength: playerSequence.length }));
  };
// ==================== ACTION CREATORS ====================
export const setStatus = (status: SimonState["gameStatus"]) => ({ type: SET_STATUS, payload: status });
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
export const toggleSkillLevel = () => ({ type: TOGGLE_SKILL_LEVEL });
export const replaySequence = () => ({ type: REPLAY_SEQUENCE });

// ==================== INITIAL STATE ====================
export type SimonState = {
  gameStatus: string;
  sequence: number[];
  playerSequence: number[];
  score: number;
  skillLevel: 1 | 2 | 3 | 4;
  activeButton: number | null;
};

export const initialState = {
  gameStatus: GAME_STATUS.IDLE,
  sequence: [],
  playerSequence: [],
  score: 0,
  skillLevel: 1,
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
        ...initialState,
        gameStatus: GAME_STATUS.GAME_OVER,
      };

    case RESET_GAME:
      return {
        ...initialState,
      };

    case TOGGLE_SKILL_LEVEL:
      return {
        ...state,
        // TODO: create util to derive new skillLevel
        skillLevel: state.skillLevel === 4 ? 1 : (state.skillLevel + 1) as 1 | 2 | 3 | 4,
      };

    default:
      return state;
  }
};
