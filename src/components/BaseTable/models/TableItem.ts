export default interface TableItem {
  [key: string]: string | number | undefined;
  section?: string; // Optional section property
}
