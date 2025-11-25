"use client";

import { UserButton } from "@clerk/nextjs";

interface DashboardClientProps {
  userName: string;
}

export default function DashboardClient({ userName }: DashboardClientProps) {
  return (
    <>
      <div className="flex">
        {/* <h1 className="text-[200px] font-thin tracking-tight flex mx-auto mt-20">
          dashboard
        </h1> */}

        <p className="text-lg mx-auto">Welcome, {userName}</p>
        <div className="">

        <UserButton />
        </div>
      </div>
    </>
  );
}
