import { useRef, useState } from "react";
import Popup from "./Popup";
import MailViewerContent from "./forms/MailViewerContent";
import LabelsPopup from "./LabelsPopup";
import "../../../styles/Popup.css";

/**
 * MailViewerPopup
 * Combines the mail viewer with the label popup logic.
 */
export default function MailViewerPopup({ mail, onClose, loadMails }) {
  const [showLabels, setShowLabels] = useState(false);
  const labelsRef = useRef(null);

  const toggleLabels = () => {
    setShowLabels((prev) => !prev);
  };

  return (
    <Popup onClose={onClose} extraRefs={[labelsRef]}>
      <div className="popup-header">
        <h3 className="popup-title">{mail.subject}</h3>
        <button class="labels-close-btn" onClick={toggleLabels}>
          🏷️ Labels
        </button>
      </div>

      <MailViewerContent mail={mail} />

      {showLabels && (
        <LabelsPopup
          mail={mail}
          onClose={toggleLabels}
          onLabelChange={loadMails}
        />
      )}
    </Popup>
  );
}
