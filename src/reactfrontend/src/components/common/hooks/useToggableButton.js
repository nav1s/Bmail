import { useEffect, useState } from "react";
import {
  attachLabelToMail,
  detachLabelFromMail
} from "../../../services/mailService";

/**
 * useToggableLabel
 * Encapsulates the toggle state and behavior for a mail label.
 *
 * @param {object} params
 * @param {string} params.mailId - ID of the mail
 * @param {string} params.labelId - ID of the label
 * @param {boolean} params.initialState - whether label is attached
 * @param {function} params.onLabelChange - callback after toggle
 */
export default function useToggableLabel({
  mailId,
  labelId,
  initialState,
  onLabelChange
}) {
  const [active, setActive] = useState(initialState);

  useEffect(() => {
    setActive(initialState);
  }, [initialState]);

  const toggleLabel = async (e) => {
    e.stopPropagation();
    try {
      if (active) {
        await detachLabelFromMail(mailId, labelId);
      } else {
        await attachLabelToMail(mailId, labelId);
      }
      setActive(!active);
      onLabelChange();
    } catch (err) {
      console.error(`Label toggle failed (mail: ${mailId}, label: ${labelId})`, err);
    }
  };

  return { active, toggleLabel };
}
