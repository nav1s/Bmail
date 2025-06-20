import Popup from "./Popup";
import EditLabelContent from "./forms/EditLabelContent";

/**
 * EditLabelPopup
 * Wrapper modal for label rename logic.
 */
export default function EditLabelPopup({ label, onSave, onClose }) {
  return (
    <Popup onClose={onClose} className="edit-label-popup">
      <EditLabelContent label={label} onSave={onSave} onClose={onClose} />
    </Popup>
  );
}
