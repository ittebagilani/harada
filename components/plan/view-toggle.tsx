type Props = {
  view: "grid" | "daily";
  setView: (v: "grid" | "daily") => void;
};

export default function ViewToggle({ view, setView }: Props) {
  return (
    <div className="flex justify-center gap-4">
      <button
        onClick={() => setView("grid")}
        className={`px-4 py-2 rounded-lg border ${
          view === "grid"
            ? "bg-black text-white dark:bg-white dark:text-black"
            : "bg-neutral-200 dark:bg-neutral-800 dark:text-white"
        }`}
      >
        Grid
      </button>

      <button
        onClick={() => setView("daily")}
        className={`px-4 py-2 rounded-lg border ${
          view === "daily"
            ? "bg-black text-white dark:bg-white dark:text-black"
            : "bg-neutral-200 dark:bg-neutral-800 dark:text-white"
        }`}
      >
        Daily Tasks
      </button>
    </div>
  );
}
