interface DragPreviewProps {
  text: string;
}

const DragPreview: React.FC<DragPreviewProps> = ({ text }) => (
  <div
    style={{
      padding: "8px 20px",
      background: "#1976d2",
      position: "absolute",
      top: "-1000px",
      left: "-1000px",
      color: "#fff",
      borderRadius: "4px",
      fontWeight: "semi-bold",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      fontSize: "15px",
      pointerEvents: "none",
      opacity: 1,
    }}
  >
    {text}
  </div>
);

export default DragPreview;
