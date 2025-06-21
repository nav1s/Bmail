import { useRef, useEffect } from "react";

/**
 * Popup
 * Reusable wrapper for all popout windows.
 * - Handles click-outside-to-close
 * - Displays a close (×) button
 *
 * Props:
 * @param {function} onClose - Function to call when popup should close
 * @param {string} className - Optional extra class for popup-content container
 * @param {ReactNode} children - Inner popup content
 * @param {Array} extraRefs - Additional refs to include in outside click check
 */
export default function Popup({ onClose, className = "", children, extraRefs = [] }) {
  const popupRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedOutsideAll =
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        extraRefs.every((ref) => !ref?.current?.contains(e.target));

      if (clickedOutsideAll) onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, extraRefs]);

  return (
    <div className="popup-backdrop">
      <div ref={popupRef} className={`popup-content ${className}`}>
        {/* Close "×" button */}
        <button
          className="popup-close-button"
          onClick={onClose}
          aria-label="Close popup"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
