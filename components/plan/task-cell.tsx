"use client";

export default function TaskCell({ text }: { text: string }) {
  return (
    <div className="p-3 bg-white border border-gray-300 rounded-lg shadow-sm text-xs text-gray-800 hover:bg-gray-50 transition">
      {text}
    </div>
  );
}
