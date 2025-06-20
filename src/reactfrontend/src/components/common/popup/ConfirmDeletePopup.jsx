import Popup from "./Popup";
import ConfirmDeleteContent from "./forms/ConfirmDeleteContent";

/**
 * ConfirmDeletePopup
 * Wrapper for confirming a label deletion inside a modal.
 */
export default function ConfirmDeletePopup({ label, onConfirm, onClose }) {
  return (
    <Popup onClose={onClose} className="confirm-delete-popup">
      <ConfirmDeleteContent label={label} onConfirm={onConfirm} onClose={onClose} />
    </Popup>
  );
}
