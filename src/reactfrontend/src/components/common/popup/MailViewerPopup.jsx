import { useRef } from "react";
import Popup from "./Popup";
import MailViewerContent from "./forms/MailViewerContent";
import LabelsPopupContent from "./forms/LabelsPopupContent";
import useMailViewerPopup from "../hooks/useMailViewerPopup";

/**
 * MailViewerPopup
 * Combines the mail viewer with the label popup logic.
 */
export default function MailViewerPopup({ mail, onClose }) {
  const {
    showLabels,
    toggleLabels,
    labels,
    selectedLabels,
    toggleLabel,
    saveLabels,
    labelsRef
  } = useMailViewerPopup(mail);

  return (
    <Popup onClose={onClose} extraRefs={[labelsRef]}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>{mail.subject}</h3>
        <button onClick={toggleLabels}>⋮</button>
      </div>

      <MailViewerContent mail={mail} />

      {showLabels && (
        <LabelsPopupContent
          labels={labels}
          selected={selectedLabels}
          onToggle={toggleLabel}
          onSave={saveLabels}
          onClose={toggleLabels}
        />
      )}
    </Popup>
  );
}
