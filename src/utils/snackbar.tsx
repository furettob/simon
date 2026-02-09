import type { SnackbarProps } from "@/components/SnackbarProvider/SnackbarProvider";
import { COLORS, type ColorIndex, type SimonState } from "./simonReducer";
import { getPaceDescription, getSuccessThreshold } from "./sequence";

export const snackbarInfoKeys = {
  longest: "longest",
  idleHint: "idleHiont",
  gameMode: "gameMode",
  skillLevel: "skillLevel",
  last: "last",
  gameOver: "gameOver",
  gameOverTimeout: "gameOverTimeout",
  repeat: "repeat"
};

export const getSnackbarInfo = ({
  snackbarKey,
  nextStepColor,
  gameMode,
  skillLevel,
  sequenceLength
}: {
  snackbarKey: keyof typeof snackbarInfoKeys;
  nextStepColor?: ColorIndex;
  gameMode?: SimonState["gameMode"];
  skillLevel?: SimonState["skillLevel"]
  sequenceLength?: number
}): SnackbarProps | null => {
  switch (snackbarKey) {
    case "longest":
      return { content: "Playing your record sequence!", severity: "success" };
    case "idleHint":
      return { content: "Press Start", severity: "info" };
    case "gameMode": {
      if (gameMode !== undefined) {
        switch (gameMode) {
          case 1:
            return {
              content: <div><b>Hardcore</b> <span>Game Over at the 1st error 🔥</span></div>,
              severity: "info",
            };
          case 2:
            return {
              content: <div><b>Training</b> <span>Error will set you back a few levels ↩️</span></div>,
              severity: "info",
            };
          case 3:
            return {
              content: <div><b>Easy</b> <span>Simon repeats the sequence when you make a mistake 👍</span></div>,
              severity: "info",
            };
          case "OFF":
            return {
              content: <div><b>Bye bye</b> <span>Switching off </span></div>,
              severity: "info",
            };
        }
      }
      break;
    }
    case "skillLevel": {
      if (skillLevel !== undefined) {
            return {
              content: <div><b>Skill level {skillLevel}</b> <span>{getPaceDescription({skillLevel})} game, {getSuccessThreshold({skillLevel})} steps to win!</span></div>,
              severity: "info",
            };
        }
      break;
    }
    case "last":
      return { content: "Re-playing current level 🔁", severity: "info" };
    case "gameOver": {
      if (nextStepColor) {
        return {
          content: <div><b>Game Over</b> <span>Correct color was {COLORS[nextStepColor]}</span></div>,
          severity: "error",
        };
      }
      break;
    }
    case "gameOverTimeout": {
      if (nextStepColor) {
        return {
          content:  <div><b>Timeout!</b><span>Correct step was {nextStepColor}</span></div>,
          severity: "error",
        };
      }
      break;
    }
    case "repeat": {
      if (sequenceLength) {
        return {
          content:  <span><b>Repeat</b> sequence until step {sequenceLength}</span>,
          severity: "warning",
        };
      }
      break;
    }
  }
  return null;
};
