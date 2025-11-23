"use client";

export default function GoalHeader() {
  // Later you will fetch user goal from DB or context
  const goal = "Get into Architecture School";

  return (
    <div className="text-center">
      <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
        {goal}
      </h1>
      <p className="text-gray-600 mt-2 text-lg">
        Your 64-step Japanese improvement plan
      </p>
    </div>
  );
}
