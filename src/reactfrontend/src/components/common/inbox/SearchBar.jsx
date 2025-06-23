import React from "react";

export default function SearchBar({ query, setQuery }) {
  return (
    <input
      type="text"
      className="search-bar"
      placeholder="Search mails..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
