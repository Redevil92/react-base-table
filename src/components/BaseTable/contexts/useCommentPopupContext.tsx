import { createContext, useContext, useState } from "react";
import type CellCoordinate from "../models/CellCordinate";

interface CommentPopupContextType {
  openCommentCell?: CellCoordinate;
  setOpenCommentCell: (cell: CellCoordinate | undefined) => void;
  username?: string;
  setUsername?: (username: string) => void;
}

const CommentPopupContext = createContext<CommentPopupContextType | undefined>(
  undefined
);

export const useCommentPopupContext = () => {
  const ctx = useContext(CommentPopupContext);
  if (!ctx)
    throw new Error(
      "useCommentPopupContext must be used within CommentPopupProvider"
    );
  return ctx;
};

export const CommentPopupProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [openCommentCell, setOpenCommentCell] = useState<
    CellCoordinate | undefined
  >();

  const [username, setUsername] = useState<string>("");
  return (
    <CommentPopupContext.Provider
      value={{ openCommentCell, setOpenCommentCell, username, setUsername }}
    >
      {children}
    </CommentPopupContext.Provider>
  );
};
