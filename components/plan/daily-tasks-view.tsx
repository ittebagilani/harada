type Props = {
  tasks: { id: number; label: string }[];
};

export default function DailyTasksView({ tasks }: Props) {
  return (
    <div className="space-y-4">
      {tasks.map((t) => (
        <div
          key={t.id}
          className="p-4 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-lg font-medium"
        >
          {t.label}
        </div>
      ))}
    </div>
  );
}
