export default interface TableItem {
  [key: string]: string | number | Array<any> | undefined;
  section?: string; // Optional section property
}
