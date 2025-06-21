import { useEffect, useState } from "react";
import { getLabels } from "../../../services/labelService";

/**
 * Custom hook to load and manage labels.
 */
export default function useLabels() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLabels()
      .then(setLabels)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { labels, loading, error };
}
