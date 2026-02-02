export const getSuccessThreshold = ({skillLevel}: {skillLevel: number}): number => {
  switch (skillLevel) {
    case 1: return 8;
    case 2: return 8;
    case 3: return 20;
    case 4: return 3; // 31;
    default: return 8;
  }
};

export const generateCompleteSequence = (sequenceLength: number): number[] => {
  const newSequence = []
  for (let i = 0; i < sequenceLength; i++) {
     newSequence.push(Math.floor(Math.random() * 4));
  }
  return newSequence
}