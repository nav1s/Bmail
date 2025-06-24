import useComposePopup from "../hooks/useComposePopup";
import ComposePopupForm from "./forms/ComposePopupForm";

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
    <ComposePopupForm
      form={form}
      onChange={handleChange}
      onSend={handleSend}
      onDraft={handleDraft}
      onCancel={onClose}
    />
  );
}
