export const formatNumber = (
  value: number | string,
  precision: number = 5
): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return "";

  // Round to avoid floating point errors
  const multiplier = Math.pow(10, precision);
  const rounded = Math.round(num * multiplier) / multiplier;

  // Convert to string with fixed precision, then remove trailing zeros after decimal
  const formatted = rounded.toFixed(precision);
  return formatted.replace(/\.?0+$/, "");
};
