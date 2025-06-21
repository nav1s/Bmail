import { useRef, useState } from "react";
import Popup from "./Popup";
import MailViewerContent from "./forms/MailViewerContent";
import LabelsPopup from "./LabelsPopup";

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
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>{mail.subject}</h3>
        <button onClick={toggleLabels}>⋮</button>
      </div>

      <MailViewerContent mail={mail} />

      {showLabels && (
        <LabelsPopup
          mailId={mail.id}
          onClose={toggleLabels}
          onLabelChange={loadMails} 
        />
      )}
    </Popup>
  );
}
