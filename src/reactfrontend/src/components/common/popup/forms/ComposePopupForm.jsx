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

      <div className="button-row">
        <button type="submit" className="send-btn">Send</button>
        <button type="button" className="draft-btn" onClick={onDraft}>
          Save as Draft
        </button>
        <button type="button" className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
