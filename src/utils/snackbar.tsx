import type { SnackbarProps } from "@/components/SnackbarProvider/SnackbarProvider";
import type { SimonState } from "./simonReducer";

export const snackbarInfoKeys = {
  off: "off",
  longest: "longest",
  idleHint: "idleHiont",
  gameMode: "gameMode",
  last: "last",
  gameOver: "gameOver",
  gameOverTimeout: "gameOverTimeout"
};

export const getSnackbarInfo = ({
  snackbarKey,
  nextStepColor,
  gameMode,
}: {
  snackbarKey: keyof typeof snackbarInfoKeys;
  nextStepColor?: 1 | 2 | 3 | 4;
  gameMode?: SimonState["gameMode"];
}): SnackbarProps | null => {
  switch (snackbarKey) {
    case "off":
      return {
        content: "No need to turn the game off, it has no real batteries 🔋",
        severity: "info",
      };
    case "longest":
      return { content: "Playing your record sequence!", severity: "info" };
    case "idleHint":
      return { content: "Press Start", severity: "info" };
    case "gameMode": {
      if (gameMode !== undefined) {
        switch (gameMode) {
          case 1:
            return {
              content: <div><b>Hardcore</b>: Game Over at the 1st error 🔥</div>,
              severity: "info",
            };
          case 2:
            return {
              content: <div><b>Training</b>: error will set you back a few levels ↩️</div>,
              severity: "info",
            };
          case 3:
            return {
              content: <div><b>Easy</b>: Simon repeats the sequence when you make a mistake 👍</div>,
              severity: "info",
            };
        }
      }
      break;
    }
    case "last":
      return { content: "Re-playing current level 🔁", severity: "info" };
    case "gameOver": {
      if (nextStepColor) {
        return {
          content: `Game Over, correct step was ${nextStepColor}`,
          severity: "error",
        };
      }
      break;
    }
    case "gameOverTimeout": {
      if (nextStepColor) {
        return {
          content: `Timeout! Correct step was ${nextStepColor}`,
          severity: "error",
        };
      }
      break;
    }
  }
  return null;
};
