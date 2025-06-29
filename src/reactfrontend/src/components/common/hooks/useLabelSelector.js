import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLabels } from "../services/labelService";

/**
 * useLabelSelector
 * Handles label fetching and label selection logic.
 */
export default function useLabelSelector() {
  const [labels, setLabels] = useState([]);
  const { labelName } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getLabels();
        setLabels(result);
      } catch (err) {
        console.error("Failed to fetch labels", err);
      }
    };
    load();
  }, []);

  const handleSelect = (label) => {
    navigate(`/mails/${label}`);
  };

  return { labels, selectedLabel: labelName, handleSelect };
}
