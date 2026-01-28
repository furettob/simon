export const intervalType = {
  buttonFeedback: "buttonFeedback",
  betweenSteps: "betweenSteps",
  gameOverTimeout: "gameOverTimeout",
  pauseBeforeNextLevel: "pauseBeforeNextLevel",
  shortFeedback: "shortFeedback",
  glimpseFeedback: "glimpseFeedback",
  shortPause: "shortPause",
} as const;

export type IntervalType = keyof typeof intervalType;

const buttonFeedbackIntervals = [1000, 750, 500, 300]; // Speed up sound decay based on skill level
const betweenStepsIntervals = [250, 200, 150, 100]; // Speed up sound decay based on skill level
const gameOverTimeoutIntervals = [5000, 4000, 3000, 2000]; // Speed up sound decay based on skill level

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
    default:
      return 500; // Default interval
  }
};
