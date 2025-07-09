export const arrayMove = <T>(
  array: Array<T>,
  fromIndex: number,
  toIndex: number
) => {
  const element = array[fromIndex];
  array.splice(fromIndex, 1);
  array.splice(toIndex, 0, element);
};

export const removeDuplicates = (arr: string[]): string[] => {
  return [...new Set(arr)];
};

export const isArrayOfType = <T>(array: unknown[], type: T): boolean => {
  return array.every((item) => typeof item === type);
};

export const isNumberArray = (array: unknown[]): array is number[] => {
  return array.every((item) => typeof item === "number");
};
