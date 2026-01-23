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
const SHOW_SEQUENCE = "SHOW_SEQUENCE";
const SET_STATUS = "SET_STATUS";
const READ_PLAYER_INPUT = "READ_PLAYER_INPUT";
const CHECK_INPUT = "CHECK_INPUT";
const NEXT_LEVEL = "NEXT_LEVEL";
const GAME_OVER = "GAME_OVER";
const RESET_GAME = "RESET_GAME";
const SET_ACTIVE_BUTTON = "SET_ACTIVE_BUTTON";
const TOGGLE_STRICT_MODE = "TOGGLE_STRICT_MODE";
const REPLAY_SEQUENCE = "REPLAY_SEQUENCE";

// ==================== ACTION CREATORS ====================
export const startGame = () => ({ type: START_GAME });
export const setStatus = (status) => ({ type: SET_STATUS, payload: status });
export const playerInput = (colorIndex) => ({
  type: READ_PLAYER_INPUT,
  payload: colorIndex,
});
export const checkInput = () => ({ type: CHECK_INPUT });
export const nextLevel = () => ({ type: NEXT_LEVEL });
export const gameOver = () => ({ type: GAME_OVER });
export const resetGame = () => ({ type: RESET_GAME });
export const setActiveButton = (colorIndex) => ({
  type: SET_ACTIVE_BUTTON,
  payload: colorIndex,
});
export const toggleStrictMode = () => ({ type: TOGGLE_STRICT_MODE });
export const replaySequence = () => ({ type: REPLAY_SEQUENCE });

// ==================== INITIAL STATE ====================
export const initialState = {
  gameStatus: GAME_STATUS.IDLE,
  sequence: [],
  playerSequence: [],
  score: 0,
  strictMode: false,
  activeButton: null,
  highScore: 0,
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

    case CHECK_INPUT:
      const { sequence, playerSequence, strictMode, score, highScore } = state;
      const currentIndex = playerSequence.length - 1;

      // Check if current input is wrong
      if (playerSequence[currentIndex] !== sequence[currentIndex]) {
        if (strictMode) {
          return {
            ...state,
            gameStatus: GAME_STATUS.GAME_OVER,
            highScore: Math.max(highScore, score),
          };
        } else {
          // Non-strict mode: replay the sequence
          return {
            ...state,
            gameStatus: GAME_STATUS.SHOWING,
            playerSequence: [],
          };
        }
      }

      // Correct input - check if sequence is complete
      if (playerSequence.length === sequence.length) {
        return {
          ...state,
          gameStatus: GAME_STATUS.SUCCESS,
          score: score + sequence.length * 10,
        };
      }

      // Correct but sequence not complete
      return {
        ...state,
        gameStatus: GAME_STATUS.WAITING,
      };

    case NEXT_LEVEL:
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
        highScore: Math.max(state.highScore, state.score),
      };

    case RESET_GAME:
      return {
        ...initialState,
        highScore: state.highScore,
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
