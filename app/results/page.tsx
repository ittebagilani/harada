"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";

interface Cell {
  text: string;
  color: string;
  taskId?: string;
  pillarId?: string;
  isCenter?: boolean;
  isPillar?: boolean;
}

interface EditingCell {
  row: number;
  col: number;
}

const COLORS = [
  "bg-stone-50",     // 0
  "bg-stone-50",     // 1
  "bg-stone-50",     // 2
  "bg-stone-50",     // 3
  "bg-stone-50",     // 4
  "bg-stone-50",     // 5
  "bg-stone-50",     // 6
  "bg-stone-50",     // 7
];

const ResultsPage = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [goal, setGoal] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{row: number, col: number} | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGoal();
    loadOrGeneratePlan();
  }, []);

  const fetchGoal = async () => {
    try {
      const res = await fetch("/api/goal");
      const data = await res.json();

      if (data.goal) {
        setGoal(data.goal);
      }
    } catch (err) {
      console.error("Error fetching goal:", err);
    }
  };

  const loadOrGeneratePlan = async () => {
    try {
      const tasksResponse = await fetch("/api/tasks");
      const tasksData = await tasksResponse.json();

      if (tasksData.tasksData && tasksData.tasksData.length > 0 && tasksData.tasksData[0].tasks.length > 0) {
        const newGrid = createGridFromTasks(tasksData.tasksData, goal);
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
          const newGrid = createGridFromTasks(newTasksData.tasksData, goal);
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

  const createGridFromTasks = (tasksData: any[], goal: string | null) => {
    const grid: Cell[][] = [];
    
    for (let row = 0; row < 9; row++) {
      const gridRow: Cell[] = [];
      for (let col = 0; col < 9; col++) {
        gridRow.push({ text: "", color: "bg-white" });
      }
      grid.push(gridRow);
    }
    
    const pillarPositions = [
      { pillarIdx: 0, cells: [[0,0],[0,1],[0,2],[1,0],[1,2],[2,0],[2,1],[2,2]] },
      { pillarIdx: 1, cells: [[0,3],[0,4],[0,5],[1,3],[1,5],[2,3],[2,4],[2,5]] },
      { pillarIdx: 2, cells: [[0,6],[0,7],[0,8],[1,6],[1,8],[2,6],[2,7],[2,8]] },
      { pillarIdx: 3, cells: [[3,0],[3,1],[3,2],[4,0],[4,2],[5,0],[5,1],[5,2]] },
      { pillarIdx: 4, cells: [[3,6],[3,7],[3,8],[4,6],[4,8],[5,6],[5,7],[5,8]] },
      { pillarIdx: 5, cells: [[6,0],[6,1],[6,2],[7,0],[7,2],[8,0],[8,1],[8,2]] },
      { pillarIdx: 6, cells: [[6,3],[6,4],[6,5],[7,3],[7,5],[8,3],[8,4],[8,5]] },
      { pillarIdx: 7, cells: [[6,6],[6,7],[6,8],[7,6],[7,8],[8,6],[8,7],[8,8]] },
    ];

    pillarPositions.forEach(({ pillarIdx, cells }) => {
      const pillarData = tasksData[pillarIdx];
      if (!pillarData) return;

      cells.forEach((cell, taskIdx) => {
        const [row, col] = cell;
        const task = pillarData.tasks[taskIdx];
        
        grid[row][col] = {
          text: task ? task.content : "",
          color: COLORS[pillarIdx],
          taskId: task?.id,
          pillarId: pillarData.pillarId,
        };
      });
    });

    // Center cell with goal
    grid[4][4] = { 
      text: goal || "MAIN GOAL", 
      color: "bg-stone-900",
      isCenter: true 
    };
    
    // Pillar name cells - positioned adjacent to center (4,4)
    // Top row
    if (tasksData[0]) grid[3][3] = { text: tasksData[0].pillarTitle, color: "bg-stone-200", isPillar: true };
    if (tasksData[1]) grid[3][4] = { text: tasksData[1].pillarTitle, color: "bg-stone-200", isPillar: true };
    if (tasksData[2]) grid[3][5] = { text: tasksData[2].pillarTitle, color: "bg-stone-200", isPillar: true };
    // Middle row
    if (tasksData[3]) grid[4][3] = { text: tasksData[3].pillarTitle, color: "bg-stone-200", isPillar: true };
    if (tasksData[4]) grid[4][5] = { text: tasksData[4].pillarTitle, color: "bg-stone-200", isPillar: true };
    // Bottom row
    if (tasksData[5]) grid[5][3] = { text: tasksData[5].pillarTitle, color: "bg-stone-200", isPillar: true };
    if (tasksData[6]) grid[5][4] = { text: tasksData[6].pillarTitle, color: "bg-stone-200", isPillar: true };
    if (tasksData[7]) grid[5][5] = { text: tasksData[7].pillarTitle, color: "bg-stone-200", isPillar: true };
    
    // Also add pillar names to the original milestone positions
    if (tasksData[0]) grid[1][1] = { text: tasksData[0].pillarTitle, color: "bg-stone-200", isPillar: true };
    if (tasksData[1]) grid[1][4] = { text: tasksData[1].pillarTitle, color: "bg-stone-200", isPillar: true };
    if (tasksData[2]) grid[1][7] = { text: tasksData[2].pillarTitle, color: "bg-stone-200", isPillar: true };
    if (tasksData[3]) grid[4][1] = { text: tasksData[3].pillarTitle, color: "bg-stone-200", isPillar: true };
    if (tasksData[4]) grid[4][7] = { text: tasksData[4].pillarTitle, color: "bg-stone-200", isPillar: true };
    if (tasksData[5]) grid[7][1] = { text: tasksData[5].pillarTitle, color: "bg-stone-200", isPillar: true };
    if (tasksData[6]) grid[7][4] = { text: tasksData[6].pillarTitle, color: "bg-stone-200", isPillar: true };
    if (tasksData[7]) grid[7][7] = { text: tasksData[7].pillarTitle, color: "bg-stone-200", isPillar: true };



    return grid;
  };

  const exportAsPNG = async () => {
    if (!gridRef.current) return;

    setIsExporting(true);

    try {
      const dataUrl = await toPng(gridRef.current, {
        cacheBust: true,
        quality: 1,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `grid64-plan-${new Date()
        .toISOString()
        .split("T")[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error(error);
      alert("Failed to export PNG");
    }

    setIsExporting(false);
  };

  if (isLoading || isGenerating) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-2 border-stone-300 rounded-full animate-ping opacity-20" />
            <div className="absolute inset-0 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-2">
            <p className="text-stone-800 text-lg tracking-wide">
              {isGenerating ? "生成中" : "読み込み中"}
            </p>
            <p className="text-stone-500 text-sm font-light">
              {isGenerating ? "Crafting your personalized plan" : "Loading"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-12 animate-fadeIn">
          <div>
            <h1 className="text-5xl md:text-6xl font-light text-stone-900 tracking-tight mb-2">
              計画
            </h1>
            <p className="text-stone-500 text-sm tracking-widest uppercase">Your Personalized Grid</p>
          </div>
          
          <button
            onClick={exportAsPNG}
            disabled={isExporting}
            className="group flex items-center gap-3 px-6 py-3 bg-stone-900 text-white hover:bg-stone-800 transition-all duration-300 disabled:opacity-50 border border-stone-900"
          >
            <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300" />
            <span className="text-sm tracking-wide">{isExporting ? "Exporting..." : "Export"}</span>
          </button>
        </div>

        <div 
          ref={gridRef} 
          className="bg-white p-8 border border-stone-200 animate-slideUp"
          style={{ animationDelay: '100ms' }}
        >
          <div className="space-y-2">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-2">
                {row.map((cell, colIndex) => {
                  const isHovered = hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex;
                  
                  return (
                    <div
                      key={colIndex}
                      className={`
                        ${cell.color} 
                        flex-1 min-h-[120px] flex items-center justify-center 
                        transition-all duration-300 ease-out
                        ${cell.isCenter ? 'shadow-lg' : 'shadow-sm'}
                        ${isHovered && !cell.isCenter ? 'scale-[1.02] shadow-md' : ''}
                        ${cell.isPillar ? '' : ''}
                        overflow-hidden
                        group
                      `}
                      onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{
                        animationDelay: `${(rowIndex + colIndex) * 20}ms`
                      }}
                    >
                      <span 
                        className={`
                          text-center px-3 py-2 leading-snug
                          transition-all duration-300
                          ${cell.isCenter 
                            ? 'text-white text-xl font-light tracking-wider' 
                            : cell.isPillar 
                              ? 'text-stone-800 text-sm font-semibold tracking-widest uppercase'
                              : 'text-stone-600 text-xs font-light leading-relaxed'
                          }
                          ${isHovered && !cell.isCenter ? 'scale-105' : ''}
                        `}
                      >
                        {cell.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div 
          className="mt-12 flex justify-center gap-6 animate-fadeIn"
          style={{ animationDelay: '400ms' }}
        >
          <Link href="/pillars">
            <button className="group px-10 py-4 bg-white border border-stone-300 text-stone-900 hover:border-stone-900 hover:bg-stone-50 transition-all duration-300 text-sm tracking-wide">
              <span className="group-hover:tracking-wider transition-all duration-300">Edit Pillars</span>
            </button>
          </Link>
          
          <Link href="/dashboard">
            <button className="group px-10 py-4 bg-stone-900 text-white hover:bg-stone-800 transition-all duration-300 text-sm tracking-wide">
              <span className="group-hover:tracking-wider transition-all duration-300">Continue</span>
            </button>
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default ResultsPage;