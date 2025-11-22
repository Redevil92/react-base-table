export default interface DialogItem {
  id: string;
  title: string;
  position: { x: number; y: number };
  dialogImplementation: React.ReactNode;
}
