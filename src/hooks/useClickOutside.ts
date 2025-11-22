import { useEffect, type RefObject } from "react";

export default function useClickOutside(
  ref: RefObject<HTMLElement | null> | RefObject<HTMLElement>[],
  callback: () => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (Array.isArray(ref)) {
        // Check if click was outside ALL refs (logical AND)
        const isOutside = ref.every(
          (singleRef) => !singleRef.current?.contains(event.target as Node)
        );

        if (isOutside && event.target) {
          callback();
        }
      }
      // Handle single ref
      else if (
        ref.current &&
        event.target &&
        !ref.current.contains(event.target as Node)
      ) {
        callback();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}
