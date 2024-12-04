export function getEnumKeyByEnumValue<T extends { [index: string]: string }>(
  myEnum: T,
  enumValue: string
): keyof T | null {
  const keys = Object.entries(myEnum).filter(([key]) => myEnum[key] == enumValue);
  return keys.length > 0 ? keys[0][1] : null;
}
