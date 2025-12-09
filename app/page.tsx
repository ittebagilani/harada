import Link from "next/link";
import { GridBackground } from "@/components/grid-bg";

export default function Home() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-linear-to-br from-white via-stone-50 to-white safe-area flex items-center justify-center px-6 py-16">
      <GridBackground />
      <div className="relative z-10 text-center space-y-6 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Welcome to</p>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-stone-900">grid64</h1>
        <p className="text-stone-600 text-lg md:text-xl">
          Turn your goals into daily actions with a clear, minimalist system.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/set-goal">
            <button className="btn-primary px-6 py-3">Set a goal</button>
          </Link>
          <Link href="/dashboard">
            <button className="btn-ghost px-6 py-3">Go to dashboard</button>
          </Link>
        </div>
      </div>
    </section>
  );
}
