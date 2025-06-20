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
 */
export default function Popup({ onClose, className = "", children }) {
  const popupRef = useRef();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

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
