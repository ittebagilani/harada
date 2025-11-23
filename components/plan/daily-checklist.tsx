"use client";

import { useState } from "react";

export default function DailyChecklist({ grid }: { grid: string[][] }) {
  const flat = grid.flat();
  const [checked, setChecked] = useState<boolean[]>(Array(flat.length).fill(false));

  const toggle = (i: number) => {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">
        Today&apos;s Actions
      </h2>

      <div className="flex flex-col gap-3">
        {flat.map((task, i) => (
          <label
            key={i}
            className="flex items-center gap-3 cursor-pointer text-gray-800"
          >
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={() => toggle(i)}
              className="w-4 h-4"
            />
            {task}
          </label>
        ))}
      </div>
    </div>
  );
}
