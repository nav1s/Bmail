import useComposePopup from "../hooks/useComposePopup";
import "../../../styles/ComposePopup.css";

export default function ComposePopup({ prefill, onSend, onClose }) {
  const { form, handleChange, parseForm } = useComposePopup(prefill);

  const handleSend = (e) => {
    e.preventDefault();
    onSend(parseForm(false));
    onClose();
  };

  const handleDraft = () => {
    onSend(parseForm(true));
    onClose();
  };

  return (
      <div className="compose-form">
        <h3>Compose Mail</h3>
        <ComposePopupForm
          form={form}
          onChange={handleChange}
          onSend={handleSubmit}
          onDraft={handleDraft}
          onCancel={onClose}
        />
      </div>
  );
}
