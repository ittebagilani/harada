"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [value, setValue] = useState("");
  const MIN_CHARS = 3;

  return (
    <>
      {/* <Navbar /> */}
      <section className="bg-[#f5f5f3] h-[90vh] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-10 -mt-30">
          <h1 className="text-black text-8xl font-['Hira']">grid64</h1>

          <Input
            type="text"
            placeholder="i want to be rich"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-[400px]"
          />

          <Link
            href={value.length >= MIN_CHARS ? "/intro" : ""}
            className="w-[200px]"
          >
            <Button
              variant="outline"
              size="lg"
              disabled={value.length < MIN_CHARS}
              className="w-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              achieve this goal
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
