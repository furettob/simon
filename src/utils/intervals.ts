export const intervalType = {
  buttonFeedback: "buttonFeedback",
  betweenSteps: "betweenSteps",
  gameOverTimeout: "gameOverTimeout",
  pauseBeforeNextLevel: "pauseBeforeNextLevel",
  shortFeedback: "shortFeedback",
  glimpseFeedback: "glimpseFeedback",
  shortPause: "shortPause",
  snackbar: "snackbar",
} as const;

type IntervalType = keyof typeof intervalType;

const buttonFeedbackIntervals = [600, 400, 400, 250]; // Speed up sound decay based on skill level
const betweenStepsIntervals = [250, 150, 150, 100]; // Speed up sound decay based on skill level
const gameOverTimeoutIntervals = [4000, 3000, 2500, 2000]; // Speed up sound decay based on skill level

export const getInterval = ({
  intervalType,
  skillLevel,
}: {
  intervalType: IntervalType;
  skillLevel?: number;
}): number => {
  const intervalIndex = skillLevel !== undefined ? skillLevel - 1 : 0;
  switch (intervalType) {
    case "buttonFeedback":
      return buttonFeedbackIntervals[intervalIndex];
    case "betweenSteps":
      return betweenStepsIntervals[intervalIndex];
    case "gameOverTimeout":
      return gameOverTimeoutIntervals[intervalIndex];
    case "pauseBeforeNextLevel":
      return 500;
    case "shortFeedback":
      return 200;
    case "shortPause":
      return 100;
    case "glimpseFeedback":
      return 100;
    case "snackbar":
      return 4000;
    default:
      return 500; // Default interval
  }
};
