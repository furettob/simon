import type { ColorIndex } from "./simonReducer";

export const getSuccessThreshold = ({
  skillLevel,
}: {
  skillLevel: number;
}): number => {
  switch (skillLevel) {
    case 1:
      return 8;
    case 2:
      return 8;
    case 3:
      return 20;
    case 4:
      return 31;
    default:
      return 8;
  }
};

export const getPaceDescription = ({
  skillLevel,
}: {
  skillLevel: number;
}): string => {
  switch (skillLevel) {
    case 1:
      return "Paced";
    case 2:
      return "Quick";
    case 3:
      return "Fast";
    case 4:
      return "Blast speed";
    default:
      return "Quick";
  }
};

export const generateCompleteSequence = (sequenceLength: number): ColorIndex[] => {
  const newSequence: ColorIndex[] = [];
  for (let i = 0; i < sequenceLength; i++) {
    newSequence.push(Math.floor(Math.random() * 4) as ColorIndex)
  } 
  return newSequence;
};

export const LONGEST_SEQUENCE_MEMORY_KEY = "simonLongSeq2";

export const getLongestSequenceInMemory = ({
  longestSequenceInState,
}: {
  longestSequenceInState: number[];
}) => {
  return longestSequenceInState.length > 0
    ? longestSequenceInState
    : (JSON.parse(
        localStorage.getItem(LONGEST_SEQUENCE_MEMORY_KEY) || "[]",
      ) as number[]);
};
