"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Download } from "lucide-react";

interface Cell {
  text: string;
  color: string;
  taskId?: string;
  pillarId?: string;
}

interface EditingCell {
  row: number;
  col: number;
}

const COLORS = [
  "bg-red-300", // 0
  "bg-blue-400", // 1
  "bg-lime-300", // 2
  "bg-purple-300", // 3
  "bg-red-400", // 4
  "bg-teal-300", // 5
  "bg-yellow-400", // 6
  "bg-orange-300", // 7
];

const ResultsPage = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadOrGeneratePlan();
  }, []);

  const loadOrGeneratePlan = async () => {
    try {
      const tasksResponse = await fetch("/api/tasks");
      const tasksData = await tasksResponse.json();

      if (
        tasksData.tasksData &&
        tasksData.tasksData.length > 0 &&
        tasksData.tasksData[0].tasks.length > 0
      ) {
        const newGrid = createGridFromTasks(tasksData.tasksData);
        setGrid(newGrid);
        setIsLoading(false);
      } else {
        setIsGenerating(true);
        const generateResponse = await fetch("/api/generate-plan", {
          method: "POST",
        });

        if (generateResponse.ok) {
          const newTasksResponse = await fetch("/api/tasks");
          const newTasksData = await newTasksResponse.json();
          const newGrid = createGridFromTasks(newTasksData.tasksData);
          setGrid(newGrid);
        } else {
          alert("Failed to generate plan. Please try again.");
        }
        setIsGenerating(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error loading plan:", error);
      alert("Failed to load plan. Please refresh the page.");
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const createGridFromTasks = (tasksData: any[]) => {
    // Initialize grid with empty cells
    const grid: Cell[][] = [];

    for (let row = 0; row < 9; row++) {
      const gridRow: Cell[] = [];
      for (let col = 0; col < 9; col++) {
        gridRow.push({ text: "next", color: "bg-gray-200" });
      }
      grid.push(gridRow);
    }

    // Map each pillar to its grid position
    const pillarPositions = [
      {
        pillarIdx: 0,
        cells: [
          [0, 0],
          [0, 1],
          [0, 2],
          [1, 0],
          [1, 2],
          [2, 0],
          [2, 1],
          [2, 2],
        ],
      },
      {
        pillarIdx: 1,
        cells: [
          [0, 3],
          [0, 4],
          [0, 5],
          [1, 3],
          [1, 5],
          [2, 3],
          [2, 4],
          [2, 5],
        ],
      },
      {
        pillarIdx: 2,
        cells: [
          [0, 6],
          [0, 7],
          [0, 8],
          [1, 6],
          [1, 8],
          [2, 6],
          [2, 7],
          [2, 8],
        ],
      },
      {
        pillarIdx: 3,
        cells: [
          [3, 0],
          [3, 1],
          [3, 2],
          [4, 0],
          [4, 2],
          [5, 0],
          [5, 1],
          [5, 2],
        ],
      },
      {
        pillarIdx: 4,
        cells: [
          [3, 6],
          [3, 7],
          [3, 8],
          [4, 6],
          [4, 8],
          [5, 6],
          [5, 7],
          [5, 8],
        ],
      },
      {
        pillarIdx: 5,
        cells: [
          [6, 0],
          [6, 1],
          [6, 2],
          [7, 0],
          [7, 2],
          [8, 0],
          [8, 1],
          [8, 2],
        ],
      },
      {
        pillarIdx: 6,
        cells: [
          [6, 3],
          [6, 4],
          [6, 5],
          [7, 3],
          [7, 5],
          [8, 3],
          [8, 4],
          [8, 5],
        ],
      },
      {
        pillarIdx: 7,
        cells: [
          [6, 6],
          [6, 7],
          [6, 8],
          [7, 6],
          [7, 8],
          [8, 6],
          [8, 7],
          [8, 8],
        ],
      },
    ];

    // Fill in tasks
    pillarPositions.forEach(({ pillarIdx, cells }) => {
      const pillarData = tasksData[pillarIdx];
      if (!pillarData) return;

      cells.forEach((cell, taskIdx) => {
        const [row, col] = cell;
        const task = pillarData.tasks[taskIdx];

        grid[row][col] = {
          text: task ? task.content : "next",
          color: COLORS[pillarIdx],
          taskId: task?.id,
          pillarId: pillarData.pillarId,
        };
      });
    });

    // Fill center cell
    grid[4][4] = { text: "MAIN", color: "bg-gray-200" };

    // Fill milestone cells with pillar names
    if (tasksData[0])
      grid[1][1] = { text: tasksData[0].pillarTitle, color: "bg-gray-200" };
    if (tasksData[1])
      grid[1][4] = { text: tasksData[1].pillarTitle, color: "bg-gray-200" };
    if (tasksData[2])
      grid[1][7] = { text: tasksData[2].pillarTitle, color: "bg-gray-200" };
    if (tasksData[3])
      grid[4][1] = { text: tasksData[3].pillarTitle, color: "bg-gray-200" };
    if (tasksData[4])
      grid[4][7] = { text: tasksData[4].pillarTitle, color: "bg-gray-200" };
    if (tasksData[5])
      grid[7][1] = { text: tasksData[5].pillarTitle, color: "bg-gray-200" };
    if (tasksData[6])
      grid[7][4] = { text: tasksData[6].pillarTitle, color: "bg-gray-200" };
    if (tasksData[7])
      grid[7][7] = { text: tasksData[7].pillarTitle, color: "bg-gray-200" };

    // Fill remaining center cells
    const centerCells = [
      [3, 3],
      [3, 4],
      [3, 5],
      [4, 3],
      [4, 5],
      [5, 3],
      [5, 4],
      [5, 5],
    ];

    centerCells.forEach(([row, col]) => {
      if (grid[row][col].text === "next") {
        grid[row][col] = { text: "next", color: "bg-pink-300" };
      }
    });

    return grid;
  };

  const exportAsPNG = async () => {
    if (!gridRef.current) return;

    setIsExporting(true);

    try {
      // Dynamically import html2canvas
      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(gridRef.current, {
        logging: false,
        width: gridRef.current.offsetWidth,
        height: gridRef.current.offsetHeight,
      } as any); // Use 'as any' to bypass type checking

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `grid64-plan-${
            new Date().toISOString().split("T")[0]
          }.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error("Error exporting:", error);
      alert("Failed to export grid. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setEditingCell({ row: rowIndex, col: colIndex });
  };

  const handleTextChange = (
    rowIndex: number,
    colIndex: number,
    newText: string
  ) => {
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

  if (isLoading || isGenerating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 text-lg font-light">
            {isGenerating
              ? "Generating your personalized plan..."
              : "Loading..."}
          </p>
          <p className="text-gray-500 text-sm">
            This may take up to 30 seconds
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl md:text-5xl font-serif text-gray-800">
            your personalized grid
          </h1>

          <button
            onClick={exportAsPNG}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded hover:bg-stone-800 transition-all duration-200 font-light disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            {isExporting ? "Exporting..." : "Export as PNG"}
          </button>
        </div>

        <div ref={gridRef} className="bg-white p-8 rounded-lg shadow-sm">
          <div className="space-y-2">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-2">
                {row.map((cell, colIndex) => (
                  <div
                    key={colIndex}
                    className={`${cell.color} flex-1 min-h-[80px] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden rounded`}
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
                        className="w-full h-full bg-transparent text-center text-sm font-serif outline-none border-2 border-gray-800 px-2"
                      />
                    ) : (
                      <span className="text-sm font-serif text-center px-2 py-2 leading-tight">
                        {cell.text}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex justify-center gap-4">
          <Link href="/pillars">
            <button className="px-8 py-3 rounded border border-stone-300 text-stone-900 hover:border-stone-400 hover:bg-stone-100 transition-all duration-200 text-base font-light">
              Edit Pillars
            </button>
          </Link>

          <Link href="/dashboard">
            <button className="px-8 py-3 rounded bg-stone-900 text-white hover:bg-stone-800 transition-all duration-200 text-base font-light">
              Continue to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
