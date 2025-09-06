import { useRef, useState, useEffect } from "react";

interface UsePopupParams {
  isInteractionDisabled: () => boolean;
  canOpenCell: () => boolean;
  onOpen: () => void;
  onClose: () => void;
  timeoutDuration?: number;
}

interface UseCellPopupReturn {
  isMouseOverPopup: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  handlePopupMouseEnter: () => void;
  handlePopupMouseLeave: () => void;
}

export function useCellPopup({
  isInteractionDisabled,
  canOpenCell,
  onOpen,
  onClose,
  timeoutDuration = 500,
}: UsePopupParams): UseCellPopupReturn {
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const popupLeaveTimer = useRef<NodeJS.Timeout | null>(null);
  const [isMouseOverPopup, setIsMouseOverPopup] = useState(false);

  const handleMouseEnter = () => {
    if (canOpenCell()) {
      hoverTimer.current = setTimeout(onOpen, timeoutDuration);
    }
  };

  const handleMouseLeave = () => {
    if (!isInteractionDisabled()) {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      popupLeaveTimer.current = setTimeout(onClose, timeoutDuration);
    }
  };

  const handlePopupMouseEnter = () => {
    setIsMouseOverPopup(true);
    if (popupLeaveTimer.current) clearTimeout(popupLeaveTimer.current);
  };

  const handlePopupMouseLeave = () => {
    setIsMouseOverPopup(false);
    if (!isInteractionDisabled()) {
      popupLeaveTimer.current = setTimeout(onClose, timeoutDuration);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      if (popupLeaveTimer.current) clearTimeout(popupLeaveTimer.current);
    };
  }, []);

  return {
    isMouseOverPopup,
    handleMouseEnter,
    handleMouseLeave,
    handlePopupMouseEnter,
    handlePopupMouseLeave,
  };
}
