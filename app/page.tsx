"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GridBackground } from "@/components/grid-bg";

export default function Home() {
  const [value, setValue] = useState("");
  const MIN_CHARS = 3;
  const router = useRouter();

  const handleClick = () => {
    if (value.length >= MIN_CHARS) {
      localStorage.setItem("pendingGoal", value);
      router.push("/onboarding");
    }
  };

  return (
    <section className="relative bg-[#f5f5f3] min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <GridBackground />
      <div className="flex flex-col items-center gap-8 -mt-10 relative z-10">
        <h1 className="text-black text-8xl">grid64</h1>

        {/* divider */}
        {/* <div className="w-24 h-[1px] bg-neutral-300 mb-2" /> */}
        <p className="text-2xl text-black font-semibold">enter your dream.</p>

        {/* input */}
        <Input
          type="text"
          placeholder="i want to be rich"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="
    w-[400px] 
    text-lg                     
    bg-transparent
    border-0 
    border-b 
    border-black 
    rounded-none 
    shadow-none
    focus-visible:ring-0
    focus-visible:border-black
    placeholder:text-neutral-500 text-black font-semio px-1 py-2
  "
        />

        <Button
          onClick={handleClick}
          disabled={value.length < MIN_CHARS}
          className="w-[200px] text-lg cursor-pointer rounded-xs hover:bg-transparent hover:text-black transition-colors hover:border-gray-700 hover:border"
        >
          achieve this goal
        </Button>
      </div>

      {/* footer */}
      <footer className="absolute bottom-4 text-neutral-900 text-base">
        © 2025 grid64 — built for the best
      </footer>
    </section>
  );
}
