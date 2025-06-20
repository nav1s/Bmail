import Popup from "./Popup";
import ComposePopupForm from "./forms/ComposePopupForm";
import useComposePopup from "../hooks/useComposePopup";

/**
 * ComposePopup
 * Orchestrates logic + UI to send or draft an email via popup.
 */
export default function ComposePopup({ onClose, onSend, prefill }) {
  const { form, handleChange, parseForm } = useComposePopup(prefill);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(parseForm(false));
    onClose();
  };

  const handleDraft = () => {
    onSend(parseForm(true));
  };

  return (
    <Popup onClose={onClose} className="compose-popup">
      <h3>Compose Mail</h3>
      <ComposePopupForm
        form={form}
        onChange={handleChange}
        onSend={handleSubmit}
        onDraft={handleDraft}
        onCancel={onClose}
      />
    </Popup>
  );
}
