import LabelItem from "./LabelItem";

/**
 * LabelList
 * Displays a list of labels.
 *
 * Props:
 * - title: optional string
 * - labels: array of label objects
 * - selected: currently selected label (object)
 * - onSelect: function(label)
 * - onMenuClick: function(label)
 */
export default function LabelList({
  title,
  labels,
  selected,
  onSelect,
  onMenuClick,
}) {
  return (
    <div>
      {title && <p className="label-section-title">{title}</p>}
      <ul className="label-list">
        {labels.map((label) => (
          <LabelItem
            key={label.id}
            label={label}
            selected={selected}
            onSelect={onSelect}
            onMenu={onMenuClick}
            showMenu={!!onMenuClick}
          />
        ))}
      </ul>
    </div>
  );
}
