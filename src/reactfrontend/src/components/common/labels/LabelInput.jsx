import React from "react";

export default function LabelInput({ value, onChange, onAdd }) {
  return (
    <div className="label-input-wrapper">
      <input
        type="text"
        className="label-input"
        placeholder="New label name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button className="btn small" onClick={onAdd}>Add</button>
    </div>
  );
}
