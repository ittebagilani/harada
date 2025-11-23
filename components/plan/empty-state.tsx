"use client";

import { Button } from "@/components/ui/button";

export default function EmptyState({
  onGenerate,
}: {
  onGenerate: (grid: string[][]) => void;
}) {
  const handleGenerate = () => {
    // Temporary placeholder grid (8x8)
    const sample = Array.from({ length: 8 }, (_, i) =>
      Array.from({ length: 8 }, (_, j) => `Item ${i + 1}.${j + 1}`)
    );

    onGenerate(sample);
  };

  return (
    <div className="flex flex-col items-center text-center mt-12">
      <p className="text-gray-700 text-lg mb-4">
        Generate your personalized 8×8 goal grid
      </p>

      <Button
        onClick={handleGenerate}
        className="px-6 py-3 rounded-full bg-black text-white hover:bg-neutral-800"
      >
        Generate My Grid
      </Button>
    </div>
  );
}
