import { useState, useEffect } from "react";
import { configureStore } from "@reduxjs/toolkit";

import "./App.css";
// ==================== CONSTANTS ====================
const GAME_STATUS = {
  IDLE: "IDLE",
  SHOWING: "SHOWING",
  WAITING: "WAITING",
  CHECKING: "CHECKING",
  SUCCESS: "SUCCESS",
  GAME_OVER: "GAME_OVER",
};

const COLORS = ["red", "green", "blue", "yellow"];

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
const startGame = () => ({ type: START_GAME });
const setStatus = (status) => ({ type: SET_STATUS, payload: status });
const playerInput = (colorIndex) => ({
  type: READ_PLAYER_INPUT,
  payload: colorIndex,
});
const checkInput = () => ({ type: CHECK_INPUT });
const nextLevel = () => ({ type: NEXT_LEVEL });
const gameOver = () => ({ type: GAME_OVER });
const resetGame = () => ({ type: RESET_GAME });
const setActiveButton = (colorIndex) => ({
  type: SET_ACTIVE_BUTTON,
  payload: colorIndex,
});
const toggleStrictMode = () => ({ type: TOGGLE_STRICT_MODE });
const replaySequence = () => ({ type: REPLAY_SEQUENCE });

// ==================== INITIAL STATE ====================
const initialState = {
  gameStatus: GAME_STATUS.IDLE,
  sequence: [],
  playerSequence: [],
  score: 0,
  strictMode: false,
  activeButton: null,
  highScore: 0,
};

// ==================== REDUCER ====================
const simonReducer = (state = initialState, action) => {
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

// ==================== CREATE STORE ====================
const store = configureStore({ reducer: simonReducer });

// ==================== HELPER FUNCTIONS ====================
const playSound = (colorIndex: number) => {
  const frequencies = [329.63, 261.63, 220, 164.81]; // E4, C4, A3, E3
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequencies[colorIndex];
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.5,
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ==================== REACT COMPONENT ====================
const SimonGame = () => {
  const [state, setState] = useState(store.getState());

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState(store.getState());
    });
    return unsubscribe;
  }, []);

  const {
    gameStatus,
    sequence,
    playerSequence,
    score,
    strictMode,
    activeButton,
    highScore,
  } = state;

  // Show sequence when status changes to SHOWING
  useEffect(() => {
    if (gameStatus === GAME_STATUS.SHOWING) {
      showSequence();
    }
  }, [gameStatus, sequence.length]);

  // Handle SUCCESS status
  useEffect(() => {
    if (gameStatus === GAME_STATUS.SUCCESS) {
      const timer = setTimeout(() => {
        store.dispatch(nextLevel());
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameStatus]);

  const showSequence = async () => {
    await sleep(500); // Initial delay

    for (let i = 0; i < sequence.length; i++) {
      const colorIndex = sequence[i];

      // Light up button
      store.dispatch(setActiveButton(colorIndex));
      playSound(colorIndex);

      await sleep(600); // Button stays lit

      // Turn off button
      store.dispatch(setActiveButton(null));

      await sleep(200); // Gap between buttons
    }

    // After showing sequence, wait for player
    store.dispatch(setStatus(GAME_STATUS.WAITING));
  };

  const handleButtonClick = (colorIndex) => {
    if (gameStatus !== GAME_STATUS.WAITING) return;

    // Visual and audio feedback
    store.dispatch(setActiveButton(colorIndex));
    playSound(colorIndex);

    setTimeout(() => {
      store.dispatch(setActiveButton(null));
    }, 300);

    // Record player input
    store.dispatch(playerInput(colorIndex));

    // Check the input
    setTimeout(() => {
      store.dispatch(checkInput());
    }, 100);
  };

  const getStatusMessage = () => {
    switch (gameStatus) {
      case GAME_STATUS.IDLE:
        return "Press Start to Begin";
      case GAME_STATUS.SHOWING:
        return "Watch the sequence...";
      case GAME_STATUS.WAITING:
        return "Your turn!";
      case GAME_STATUS.SUCCESS:
        return "Correct! Next level...";
      case GAME_STATUS.GAME_OVER:
        return `Game Over! Final Score: ${score}`;
      default:
        return "";
    }
  };

  return (
    <div>
      <h1>Simon Game</h1>

      <div>
        <p>Level: {sequence.length}</p>
        <p>Score: {score}</p>
        <p>High Score: {highScore}</p>
        <p>
          Status: {getStatusMessage()} - {gameStatus}
        </p>
        <p>Strict Mode: {strictMode ? "ON" : "OFF"}</p>
      </div>

      <div>
        {COLORS.map((color, index) => (
          <button
            key={color}
            onClick={() => handleButtonClick(index)}
            disabled={gameStatus !== GAME_STATUS.WAITING}
            style={{
              backgroundColor: color,
              opacity: activeButton === index ? 1 : 0.6,
              width: "100px",
              height: "100px",
              margin: "5px",
            }}
          >
            {color}
          </button>
        ))}
      </div>

      <div>
        <button
          onClick={() => store.dispatch(startGame())}
          disabled={
            gameStatus !== GAME_STATUS.IDLE &&
            gameStatus !== GAME_STATUS.GAME_OVER
          }
        >
          Start Game
        </button>

        <button onClick={() => store.dispatch(resetGame())}>Reset</button>

        <button onClick={() => store.dispatch(toggleStrictMode())}>
          Toggle Strict Mode
        </button>

          <button onClick={() => store.dispatch(replaySequence())} disabled={gameStatus !== GAME_STATUS.WAITING && gameStatus !== GAME_STATUS.SHOWING}>
            Replay Sequence
          </button>
      </div>

      <div>
        <h3>Debug Info:</h3>
        <p>Sequence: {sequence.map((i) => COLORS[i]).join(", ")}</p>
        <p>Player Input: {playerSequence.map((i) => COLORS[i]).join(", ")}</p>
      </div>
    </div>
  );
};

export default SimonGame;
