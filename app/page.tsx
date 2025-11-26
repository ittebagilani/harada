"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [value, setValue] = useState("");
  const MIN_CHARS = 3;
  const router = useRouter();

  const handleClick = () => {
    if (value.length >= MIN_CHARS) {
      // Save to localStorage BEFORE redirect
      localStorage.setItem("pendingGoal", value);

      router.push("/onboarding"); // even if not signed in, clerk will redirect to sign-in
    }
  };

  return (
    <section className="bg-[#f5f5f3] h-[90vh] flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-10 -mt-30">
        <h1 className="text-black text-8xl font-['Hira']">grid64</h1>

        <Input
          type="text"
          placeholder="i want to be rich"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-[400px] text-lg"
        />

        <Button
          onClick={handleClick}
          disabled={value.length < MIN_CHARS}
          className="w-[200px] text-lg"
        >
          achieve this goal
        </Button>
      </div>
    </section>
  );
}
