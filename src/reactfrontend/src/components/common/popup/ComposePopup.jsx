import useComposePopup from "../hooks/useComposePopup";

export default function ComposePopup({ prefill, onSend, onClose }) {
  const { form, handleChange, handleFileChange, parseForm } = useComposePopup(prefill);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(parseForm(false)); // Send mail
    onClose();
  };

  const handleDraft = () => {
    onSend(parseForm(true)); // Save draft
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="to" value={form.to} onChange={handleChange} placeholder="To" />
      <input name="title" value={form.title} onChange={handleChange} placeholder="Title" />
      <textarea name="body" value={form.body} onChange={handleChange} placeholder="Body" />
      <input type="file" onChange={handleFileChange} />
      <button type="submit">Send</button>
      <button type="button" onClick={handleDraft}>Save Draft</button>
    </form>
  );
}
