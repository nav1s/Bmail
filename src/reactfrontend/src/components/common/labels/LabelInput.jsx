export default function LabelInput({ value, onChange, onAdd }) {
  return (
    <div className="label-input-wrapper">
      <input
        className="label-input"
        type="text"
        placeholder="New label name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button className="label-add-btn" onClick={onAdd}>
        Add
      </button>
    </div>
  );
}
