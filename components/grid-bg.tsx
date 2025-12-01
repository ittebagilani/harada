"use client";

import React from "react";

export function GridBackground() {
  return (
    <div className="absolute inset-0 z-0">
      {/* Grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundSize: "40px 40px",
          backgroundImage: `
            linear-gradient(to right, #e4e4e7 1px, transparent 1px),
            linear-gradient(to bottom, #e4e4e7 1px, transparent 1px)
          `,
        }}
      />

      {/* Optional dark mode */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          backgroundImage: `
            linear-gradient(to right, #262626 1px, transparent 1px),
            linear-gradient(to bottom, #262626 1px, transparent 1px)
          `,
        }}
      />

      {/* Optional subtle noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, rgba(0,0,0,0.04) 0%, transparent 70%),
            radial-gradient(circle at 70% 70%, rgba(0,0,0,0.04) 0%, transparent 70%),
            repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 2px)
          `,
          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
}
