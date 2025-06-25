import { useEffect } from "react";
import EditLabelContent from "./forms/EditLabelContent";
import "../../../styles/LabelsPopup.css";

/**
 * EditLabelPopup
 * A centered modal for editing a label.
 */
export default function EditLabelPopup({ label, onSave, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="popup-backdrop">
      <div className="popup-content" style={{ maxWidth: "400px" }}>
        <EditLabelContent label={label} onSave={onSave} onClose={onClose} />
      </div>
    </div>
  );
}
