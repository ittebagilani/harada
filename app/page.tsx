import Link from "next/link";
import { GridBackground } from "@/components/grid-bg";

function FaintGridPreview() {
  // 8x8 = 64 cells. We render it very faint as a watermark.
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none opacity-[0.08]"
    >
      <div className="h-full w-full grid grid-cols-8 grid-rows-8">
        {Array.from({ length: 64 }).map((_, i) => (
          <div
            key={i}
            className="border border-stone-400/40"
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <section className="relative min-h-screen overflow-hidden  safe-area flex items-center justify-center px-6 py-16">
      <GridBackground />

      {/* White container */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="relative overflow-hidden rounded-2xl bg-white/50 backdrop-blur-md border border-stone-200 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.25)] px-8 py-10 sm:px-12 sm:py-12 text-center">
          {/* faint grid watermark inside container */}
          <FaintGridPreview />

          <div className="relative z-10 space-y-7">
            {/* Eyebrow */}
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
              Welcome to
            </p>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-stone-900">
              grid64
            </h1>

            {/* Divider */}
            <div className="mx-auto w-20 h-px bg-stone-200" />

            {/* Concrete promise */}
            <p className="text-stone-900 text-lg leading-relaxed">
              Turn one goal into a structured system of daily actions —
              <br className="hidden sm:block" />
              not a vague to-do list.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/set-goal" className="w-full sm:w-auto">
                <button className="btn-primary px-6 py-3 w-full sm:w-auto cursor-pointer">
                  Set a goal
                </button>
              </Link>

              {/* Demoted dashboard CTA */}
              <Link href="/dashboard" className="w-full sm:w-auto">
                <button className="btn-ghost px-6 py-3 w-full sm:w-auto cursor-pointer text-stone-600">
                  Already have a plan?
                </button>
              </Link>
            </div>

            {/* Minimal how-it-works */}
            <p className="text-sm text-stone-500 tracking-wide pt-2">
              Set a goal → Answer a few questions → Get a daily action grid
            </p>

            {/* Credibility anchor */}
            <p className="text-xs text-stone-400">
              Inspired by the Harada Method
            </p>
          </div>
        </div>

      
      </div>
    </section>
  );
}
