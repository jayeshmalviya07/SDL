import { useState } from "react";

export default function DateRangeFilter({ onFilter }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <input
        type="date"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2"
      />
      <input
        type="date"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2"
      />
      <button
        onClick={() => onFilter(start, end)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
      >
        Download Report
      </button>
    </div>
  );
}
