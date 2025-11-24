import { useEffect, useRef, useState } from "react";
import { mdiClose, mdiTableLargePlus } from "@mdi/js";
import Icon from "@mdi/react";
import type DialogItem from "../models/DialogItem";
import BaseButton from "../../BaseButton";
import { useDialogsActions } from "../../../stores/dialogsStore";

interface DialogWrapperProps {
  dialogItem: DialogItem;
}

const DialogWrapper: React.FC<DialogWrapperProps> = ({ dialogItem }) => {
  const [position, setPosition] = useState(dialogItem.position);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);

  const { closeDialog } = useDialogsActions();

  const constrainPosition = (
    x: number,
    y: number,
    dialogWidth: number,
    dialogHeight: number
  ): { x: number; y: number } => {
    const maxX = window.innerWidth - dialogWidth;
    const maxY = window.innerHeight - dialogHeight;

    return {
      x: Math.min(Math.max(0, x), maxX),
      y: Math.min(Math.max(0, y), maxY),
    };
  };

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      e.target === e.currentTarget ||
      (e.target as HTMLElement).closest(".dialog-header")
    ) {
      setIsDragging(true);
      const rect = dialogRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    }
  };

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dialogRect = dialogRef.current?.getBoundingClientRect();
      if (!dialogRect) return;

      const newPosition = constrainPosition(
        e.clientX - dragOffset.x,
        e.clientY - dragOffset.y,
        dialogRect.width,
        dialogRect.height
      );

      setPosition(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const onClose = () => {
    closeDialog(dialogItem.id);
  };

  return (
    <div
      ref={dialogRef}
      className="fixed shadow-2xl bg-white  rounded-md z-50 border border-gray-300"
      style={{
        left: position.x,
        top: position.y,
        width: `${300}px`,
        cursor: isDragging ? "grabbing" : "default",
        userSelect: isDragging ? "none" : "text",
      }}
    >
      <div
        className="dialog-header flex justify-between items-center px-3 py-1 cursor-grab bg-gray-50 rounded-t-md border-b border-gray-200"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center">
          <Icon path={mdiTableLargePlus} color="#5588b4" size={1}></Icon>
          <p className="text-sm font-semibold ml-2 ">{dialogItem.title}</p>
        </div>

        {/* <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <Icon path={mdiClose} size={0.8} />
        </button> */}
        <BaseButton
          icon={mdiClose}
          className="bg-white rounded-3xl hover:bg-gray-200"
          onClick={onClose}
          small
        ></BaseButton>
      </div>

      <div className="p-4 max-h-[calc(80vh-3rem)] overflow-y-auto">
        {dialogItem.dialogImplementation}
      </div>
    </div>
  );
};

export default DialogWrapper;
