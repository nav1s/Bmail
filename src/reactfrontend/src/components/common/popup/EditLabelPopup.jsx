import Popup from "./Popup";
import EditLabelContent from "./forms/EditLabelContent";

/**
 * EditLabelPopup
 *
 * A wrapper modal for label editing logic.
 * Uses EditLabelContent as the form inside a popup dialog.
 *
 * Props:
 * - label: the label to edit (must contain at least id and name)
 * - onSave: function(label) — called with updated label object
 * - onClose: function() — closes the popup
 */
export default function EditLabelPopup({ label, onSave, onClose }) {
  return (
    <Popup onClose={onClose} className="edit-label-popup">
      <EditLabelContent
        label={label}
        onSave={onSave}
        onClose={onClose}
      />
    </Popup>
  );
}
