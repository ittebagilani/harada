"use client";

import Link from "next/link";
import { useState } from "react";


interface Cell {
  text: string;
  color: string;
}

interface EditingCell {
  row: number;
  col: number;

}

const ResultsPage = () => {
  const initialGrid: Cell[][] = [
    [
      { text: "next", color: "bg-red-300" },
      { text: "next", color: "bg-red-300" },
      { text: "next", color: "bg-red-300" },
      { text: "next", color: "bg-blue-400" },
      { text: "next", color: "bg-blue-400" },
      { text: "next", color: "bg-blue-400" },
      { text: "next", color: "bg-lime-300" },
      { text: "next", color: "bg-lime-300" },
      { text: "next", color: "bg-lime-300" },
    ],
    [
      { text: "next", color: "bg-red-300" },
      { text: "No 1", color: "bg-gray-200" },
      { text: "next", color: "bg-red-300" },
      { text: "next", color: "bg-blue-400" },
      { text: "No 2", color: "bg-gray-200" },
      { text: "next", color: "bg-blue-400" },
      { text: "next", color: "bg-lime-300" },
      { text: "No 3", color: "bg-gray-200" },
      { text: "next", color: "bg-lime-300" },
    ],
    [
      { text: "next", color: "bg-red-300" },
      { text: "next", color: "bg-red-300" },
      { text: "next", color: "bg-red-300" },
      { text: "next", color: "bg-blue-400" },
      { text: "next", color: "bg-blue-400" },
      { text: "next", color: "bg-blue-400" },
      { text: "next", color: "bg-lime-300" },
      { text: "next", color: "bg-lime-300" },
      { text: "next", color: "bg-lime-300" },
    ],
    [
      { text: "next", color: "bg-purple-300" },
      { text: "next", color: "bg-purple-300" },
      { text: "next", color: "bg-purple-300" },
      { text: "next", color: "bg-pink-300" },
      { text: "next", color: "bg-blue-400" },
      { text: "next", color: "bg-yellow-300" },
      { text: "next", color: "bg-red-400" },
      { text: "next", color: "bg-red-400" },
      { text: "next", color: "bg-red-400" },
    ],
    [
      { text: "next", color: "bg-purple-300" },
      { text: "No 4", color: "bg-gray-200" },
      { text: "next", color: "bg-purple-300" },
      { text: "next", color: "bg-pink-300" },
      { text: "MAIN", color: "bg-gray-200" },
      { text: "next", color: "bg-red-400" },
      { text: "next", color: "bg-red-400" },
      { text: "No 5", color: "bg-gray-200" },
      { text: "next", color: "bg-red-400" },
    ],
    [
      { text: "next", color: "bg-purple-300" },
      { text: "next", color: "bg-purple-300" },
      { text: "next", color: "bg-purple-300" },
      { text: "next", color: "bg-teal-400" },
      { text: "next", color: "bg-orange-400" },
      { text: "next", color: "bg-orange-300" },
      { text: "next", color: "bg-red-400" },
      { text: "next", color: "bg-red-400" },
      { text: "next", color: "bg-red-400" },
    ],
    [
      { text: "next", color: "bg-teal-300" },
      { text: "next", color: "bg-teal-300" },
      { text: "next", color: "bg-teal-300" },
      { text: "next", color: "bg-yellow-400" },
      { text: "next", color: "bg-yellow-400" },
      { text: "next", color: "bg-yellow-400" },
      { text: "next", color: "bg-orange-300" },
      { text: "next", color: "bg-orange-300" },
      { text: "next", color: "bg-orange-300" },
    ],
    [
      { text: "next", color: "bg-teal-300" },
      { text: "No 6", color: "bg-gray-200" },
      { text: "next", color: "bg-teal-300" },
      { text: "next", color: "bg-yellow-400" },
      { text: "No 7", color: "bg-gray-200" },
      { text: "next", color: "bg-yellow-400" },
      { text: "next", color: "bg-orange-300" },
      { text: "No 8", color: "bg-gray-200" },
      { text: "next", color: "bg-orange-300" },
    ],
    [
      { text: "next", color: "bg-teal-300" },
      { text: "next", color: "bg-teal-300" },
      { text: "next", color: "bg-teal-300" },
      { text: "next", color: "bg-yellow-400" },
      { text: "next", color: "bg-yellow-400" },
      { text: "next", color: "bg-yellow-400" },
      { text: "next", color: "bg-orange-300" },
      { text: "next", color: "bg-orange-300" },
      { text: "next", color: "bg-orange-300" },
    ],
  ];

  const [grid, setGrid] = useState<Cell[][]>(initialGrid);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setEditingCell({ row: rowIndex, col: colIndex });
  };

  const handleTextChange = (rowIndex: number, colIndex: number, newText: string) => {
    const newGrid = grid.map((row, rIdx) =>
      row.map((cell, cIdx) =>
        rIdx === rowIndex && cIdx === colIndex
          ? { ...cell, text: newText }
          : cell
      )
    );
    setGrid(newGrid);
  };

  const handleBlur = () => {
    setEditingCell(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-serif text-center mb-12 text-gray-800">
          your personalized grid
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="space-y-1">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1">
                {row.map((cell, colIndex) => (
                  <div
                    key={colIndex}
                    className={`${cell.color} flex-1 h-12 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {editingCell?.row === rowIndex &&
                    editingCell?.col === colIndex ? (
                      <input
                        type="text"
                        value={cell.text}
                        onChange={(e) =>
                          handleTextChange(rowIndex, colIndex, e.target.value)
                        }
                        onBlur={handleBlur}
                        autoFocus
                        className="w-full h-full bg-transparent text-center text-sm font-serif outline-none border-2 border-gray-800 px-1"
                      />
                    ) : (
                      <span className="text-sm font-serif truncate px-1">
                        {cell.text}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <Link href={"/dashboard"} className="mt-20 flex">
          <button
            onClick={() => {}}
            className="px-8 py-3 rounded-xs bg-stone-900 text-white hover:bg-stone-800 transition-all duration-200 text-base font-light cursor-pointer mx-auto"
          >
            continue
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ResultsPage;
