import { type CSSProperties } from "react";

export default interface HighlightCondition {
  propertyId: string;
  value: unknown;
  style: CSSProperties;
  columnId?: string; // Optional, if provided, applies the style to the specific column only
}
