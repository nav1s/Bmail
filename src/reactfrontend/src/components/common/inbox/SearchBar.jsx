import React from "react";

export default function SearchBar({ query, setQuery }) {
  return (
    <input
      type="text"
      placeholder="Search mails..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
