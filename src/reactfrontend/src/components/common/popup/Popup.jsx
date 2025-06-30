import { useRef, useEffect } from "react";
import "../../../styles/Popup.css";

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
 * @param {Object} style - Optional inline styles for popup positioning
 */
export default function Popup({ onClose, className = "", children, extraRefs = [], style = {} }) {
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

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    document.body.style.position = "relative";
    return () => {
      document.body.style.position = "";
    };
  }, []);

  return (
    <div className="popup-backdrop">
      <div
        ref={popupRef}
        className={`popup-content ${className}`}
        style={style}
      >
        {/* Close "×" button */}
        <button
          style={{ position: "absolute", left: "10px", top: "10px" }}
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
