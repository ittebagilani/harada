"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Onboarding() {
  const router = useRouter();
  const [isFading, setIsFading] = useState(false);

  const handleYes = () => {
    setIsFading(true);
    setTimeout(() => {
      router.push("/start/0");
    }, 800);
  };

  return (
    <div 
      className={`min-h-screen bg-stone-50 flex items-center justify-center px-6 py-12 transition-opacity duration-700 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="max-w-md w-full">
        <div className="text-center space-y-16">
          {/* Header */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-light tracking-tight text-stone-900">
              before we begin
            </h1>
            <p className="text-base text-stone-600 font-light tracking-wide leading-relaxed">
              it's important to note that no app will work. unless you do.
            </p>
          </div>

          {/* Main content */}
          <div className="space-y-10">
            <h2 className="text-2xl md:text-3xl font-light text-stone-900 tracking-tight leading-snug">
              you will now be asked 36 questions.
              <br />
              answer with absolute honesty.
            </h2>

            <div className="flex flex-col gap-4">
              <Button
                onClick={handleYes}
                size="lg"
                className="bg-stone-900 hover:bg-stone-800 text-white px-8 py-6 text-base font-light tracking-wide transition-colors duration-200 cursor-pointer"
              >
                let's do it.
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 text-center pt-8 border-stone-200">
          <p className="text-sm text-stone-400 tracking-widest font-light">
            grid64 © 2025
          </p>
        </div>
      </div>
    </div>
  );
}