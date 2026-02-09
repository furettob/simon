import { getInterval, intervalType } from "./intervals";
import { playSound, type Frequence } from "./sound";
import type { UnknownAction, ThunkDispatch } from "@reduxjs/toolkit";
import {
  getSuccessThreshold,
  generateCompleteSequence,
  LONGEST_SEQUENCE_MEMORY_KEY,
  getLongestSequenceInMemory,
} from "./sequence";
import type { SnackbarProps } from "@/components/SnackbarProvider/SnackbarProvider";
import { getSnackbarInfo } from "./snackbar";
import {
  addPlayerInputToSequence,
  COLORS,
  GAME_MODE,
  GAME_STATUS,
  resetGame,
  setActiveButton,
  setActiveButtonTimeoutRef,
  setSequenceLength,
  setStatus,
  setTimeoutRef,
  setTLongestSequence,
  SKILL_LEVEL,
  type ColorIndex,
  type SimonState,
} from "./simonReducer";

// ==================== TYPES / CONSTANTS ====================
export type AppDispatch = ThunkDispatch<SimonState, undefined, UnknownAction>;

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
    dispatch(setActiveButtonTimeoutRef(activeButtonTimeoutRef));
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
  async (dispatch: AppDispatch, getState: () => SimonState) => {
    // Show the sequence
    await sleep(
      getInterval({
        intervalType: intervalType.pauseBeforeNextLevel,
        skillLevel,
      }),
    ); // Initial delay

    for (let i = 0; i < sequenceLength; i++) {
      if (getState().gameMode === GAME_MODE.OFF) {
        return;
      }
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
  (showSnackbar: (snackbarInfo: SnackbarProps | null) => void) =>
  async (dispatch: AppDispatch, getState: () => SimonState) => {
    dispatch(setStatus(GAME_STATUS.WAITING));
    const { sequenceLength, playerSequence, timeoutRef, skillLevel } =
      getState();

    clearTimeout(timeoutRef);

    const gameOverTimeout = setTimeout(
      () => {
        const {
          playerSequence: newPlayerSequence,
          sequenceLength: newGameSequenceLength,
          gameMode: currentGameMode,
        } = getState();

        if (currentGameMode === GAME_MODE.OFF) {
          return;
        }
        if (
          // Player did not submit an input in the last 5s
          newPlayerSequence.length <= playerSequence.length &&
          // Player did not advance level
          newGameSequenceLength === sequenceLength
        ) {
          dispatch(errorThunk(null, showSnackbar));
        }
      },
      getInterval({ intervalType: intervalType.gameOverTimeout, skillLevel }),
    );

    dispatch(setTimeoutRef(gameOverTimeout));
  };

export const repeatingOnErrorThunk =
  (showSnackbar: (snackbarInfo: SnackbarProps | null) => void) =>
  async (dispatch: AppDispatch, getState: () => SimonState) => {
    const { gameMode, sequenceLength: oldSequenceLength } = getState();
    if (gameMode === GAME_MODE.OFF) {
      return;
    }

    if (gameMode === 2) {
      const newSequenceLength = Math.max(
        oldSequenceLength - (oldSequenceLength % 3),
        1,
      );
      dispatch(setSequenceLength(newSequenceLength));
    }
    const { sequenceLength } = getState();
    showSnackbar(getSnackbarInfo({ snackbarKey: "repeat", sequenceLength }));
    dispatch(setStatus(GAME_STATUS.WAITING));
    dispatch(playLevelThunk(false, showSnackbar));
  };

export const errorThunk =
  (
    colorIndex: number | null,
    showSnackbar: (snackbarInfo: SnackbarProps | null) => void,
  ) =>
  async (dispatch: AppDispatch, getState: () => SimonState) => {
    // TODO: what the real game do when timeout? In terms of user feedback?
    const { gameMode } = getState();
    if (gameMode === GAME_MODE.OFF) {
      return;
    }

    dispatch(setStatus(GAME_STATUS.SHOWING));
    for (let i = 0; i < 3; i++) {
      await dispatch(
        ligtAndSoundFeedbackThunk({
          colorIndex,
          durationMs: getInterval({ intervalType: intervalType.shortFeedback }),
          frequence: "gameOver",
        }),
      );
    }

    switch (gameMode) {
      case 1: {
        dispatch(resetGame());
        break;
      }
      case 2:
      case 3: {
        dispatch(repeatingOnErrorThunk(showSnackbar));
      }
    }
  };

export const successThunk = () => async (dispatch: AppDispatch) => {
  dispatch(setStatus(GAME_STATUS.SHOWING));
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
  dispatch(setStatus(GAME_STATUS.IDLE));
};

export const playLevelThunk =
  (
    addLevel: boolean = true,
    showSnackbar: (snackbarInfo: SnackbarProps | null) => void,
  ) =>
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
      dispatch(setSequenceLength());
    }
    // Get the updated state with the new sequence
    const { completeSequence, sequenceLength } = getState();

    await dispatch(
      playSequenceThunk({ completeSequence, skillLevel, sequenceLength }),
    );

    dispatch(waitThunk(showSnackbar)); // After showing sequence, set status to waiting
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

    await dispatch(
      playSequenceThunk({
        completeSequence: longestSequenceInMemory,
        skillLevel,
        sequenceLength: longestSequenceInMemory.length,
      }),
    );

    dispatch(setStatus(GAME_STATUS.IDLE)); // After showing sequence, set status to IDLE
  };

export const handleClickColorButtonThunk =
  (
    colorIndex: ColorIndex,
    showSnackbar: (snackbarInfo: SnackbarProps | null) => void,
  ) =>
  async (dispatch: AppDispatch, getState: () => SimonState) => {
    // Record player input
    const {
      completeSequence,
      playerSequence: previousPlayerSequence,
      sequenceLength,
      gameMode,
    } = getState();
    if (
      previousPlayerSequence.length >= sequenceLength ||
      gameMode === GAME_MODE.OFF
    ) {
      return;
    }
    dispatch(addPlayerInputToSequence(colorIndex));
    const { playerSequence, skillLevel, longestSequence } = getState();

    // Check the input
    const currentIndex = playerSequence.length - 1;
    if (playerSequence[currentIndex] !== completeSequence[currentIndex]) {
      dispatch(errorThunk(colorIndex, showSnackbar));
      return;
    }

    // Possibly update longestSequence
    const longestSequenceInMemory = getLongestSequenceInMemory({
      longestSequenceInState: longestSequence,
    });
    // Update state to avoid reading from localStorage multiple times
    if (longestSequence.length === 0 && longestSequenceInMemory?.length) {
      dispatch(setTLongestSequence(longestSequenceInMemory));
    }
    // Update both state and localStorage if player reached a longer sequence
    if (playerSequence.length > longestSequenceInMemory.length) {
      localStorage.setItem(
        LONGEST_SEQUENCE_MEMORY_KEY,
        JSON.stringify(playerSequence),
      );
      dispatch(setTLongestSequence(playerSequence));
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
        dispatch(playLevelThunk(true, showSnackbar));
      }
    } else {
      dispatch(waitThunk(showSnackbar));
    }
  };
