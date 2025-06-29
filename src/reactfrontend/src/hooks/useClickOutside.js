import { useEffect } from "react";

/**
 * Detect clicks outside the given ref and call the handler.
 * @param {object} ref - React ref object
 * @param {function} handler - Function to call on outside click
 */
export default function useClickOutside(ref, handler) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler]);
}
