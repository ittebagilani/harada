"use client";

interface DashboardClientProps {
  userName: string;
}

export default function DashboardClient({ userName }: DashboardClientProps) {
  return (
    <div className="flex">
      <h1 className="text-[200px] font-thin tracking-tight flex mx-auto mt-20">
        dashboard
      </h1>

      <p className="absolute top-10 left-10 text-lg">
        Welcome, {userName}
      </p>
    </div>
  );
}