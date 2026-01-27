export const getSuccessThreshold = ({skillLevel}: {skillLevel: number}): number => {
  switch (skillLevel) {
    case 1: return 8;
    case 2: return 12;
    case 3: return 20;
    case 4: return 31;
    default: return 8;
  }
};