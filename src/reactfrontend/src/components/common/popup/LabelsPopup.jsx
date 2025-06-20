import Popup from "./Popup";
import LabelsPopupContent from "./forms/LabelsPopupContent";
import useLabelsPopup from "../hooks/useLabelsPopup";

/**
 * LabelsPopup
 * Popup for assigning labels to a mail item
 */
export default function LabelsPopup({ mail, onClose, onUpdate }) {
  const {
    customLabels,
    selectedLabels,
    toggleLabel,
    saveLabels,
  } = useLabelsPopup(mail, onUpdate);

  return (
    <Popup onClose={onClose} className="labels-popup">
      <LabelsPopupContent
        labels={customLabels}
        selected={selectedLabels}
        onToggle={toggleLabel}
        onSave={saveLabels}
        onClose={onClose}
      />
    </Popup>
  );
}
