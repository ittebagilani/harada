"use client";

import TaskCell from "./task-cell";

export default function GridDisplay({ grid }: { grid: string[][] }) {
  return (
    <div className="grid grid-cols-8 gap-2 max-w-5xl mx-auto">
      {grid.map((row, i) =>
        row.map((cell, j) => (
          <TaskCell key={`${i}-${j}`} text={cell} />
        ))
      )}
    </div>
  );
}
