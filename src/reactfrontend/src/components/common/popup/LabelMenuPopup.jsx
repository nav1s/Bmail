import Popup from "./Popup";
import LabelMenuContent from "./forms/LabelMenuContent";

/**
 * LabelMenuPopup
 * Wraps LabelMenuContent inside reusable Popup.
 */
export default function LabelMenuPopup({ label, onEdit, onDelete, onClose }) {
  return (
    <Popup onClose={onClose} className="label-menu-popup">
      <LabelMenuContent
        label={label}
        onEdit={onEdit}
        onDelete={onDelete}
        onClose={onClose}
      />
    </Popup>
  );
}
