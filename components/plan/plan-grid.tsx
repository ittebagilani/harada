type Props = {
  tasks: { id: number; label: string }[];
};

export default function PlanGrid({ tasks }: Props) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {tasks.map((t) => (
        <div
          key={t.id}
          className="aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-lg flex items-center justify-center text-sm text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700"
        >
          {t.label}
        </div>
      ))}
    </div>
  );
}
