import useLabelManager from "../hooks/useLabelManager";
import LabelManagerView from "./LabelManagerView";

/**
 * LabelManager
 * Glue component that uses hook and passes data to view.
 */
export default function LabelManager({ onSelect, selectedLabel }) {
  const manager = useLabelManager();

  return (
    <LabelManagerView
      {...manager}
      selectedLabel={selectedLabel}
      onSelect={onSelect}
    />
  );
}

