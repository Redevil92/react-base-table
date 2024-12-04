export const alphabeticalSort = (a: string, b: string) => {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
};

export const alphabeticalSortInverse = (a: string, b: string) => {
  if (a > b) {
    return -1;
  }
  if (a < b) {
    return 1;
  }
  return 0;
};

export const numericalSort = (a: number, b: number) => {
  return a - b;
};

export const numericalSortInverse = (a: number, b: number) => {
  return b - a;
};
