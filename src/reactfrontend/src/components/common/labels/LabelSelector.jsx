import LabelList from "./LabelList";
import useLabelSelector from "../../hooks/useLabelSelector";

/**
 * LabelSelector
 * Renders the label list UI using logic from useLabelSelector hook.
 */
export default function LabelSelector() {
  const { labels, selectedLabel, handleSelect } = useLabelSelector();

  return (
    <div>
      <LabelList
        labels={labels}
        selected={selectedLabel}
        onSelect={handleSelect}
      />
    </div>
  );
}
