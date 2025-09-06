export default interface CommentData {
  propertyId: string;
  value: unknown;
  date: Date;
  formatDateFunction?: (date: Date) => string; // Optional function to format the date
  author?: string;
  columnId?: string; // Optional, if provided, applies the style to the specific column only
  text: string; // The comment text
}
