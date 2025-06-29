/**
 * ComposePopupForm
 * Form layout for composing email inside a popup.
 */
export default function ComposePopupForm({
  form,
  onChange,
  onSend,
  onDraft,
  onCancel,
}) {
  return (
    <form onSubmit={onSend}>
      <input
        name="to"
        placeholder="To"
        value={form.to}
        onChange={onChange}
        required
      />
      <input
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={onChange}
        required
      />
      <textarea
        name="body"
        placeholder="Body"
        value={form.body}
        onChange={onChange}
        required
      />
      <button type="submit">Send</button>
      <button type="button" onClick={onDraft}>
        Save as Draft
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}
