"use client";

export default function MobileNotice() {
  return (
    <div className="md:hidden fixed inset-0 z-50 bg-white flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-6xl mb-4">📱</div>
        <h2 className="text-2xl font-semibold text-stone-900">
          Best viewed on larger screens
        </h2>
        <p className="text-stone-600 text-base">
          This app works best on tablets and desktop devices. Please visit on a larger screen for the full experience.
        </p>
      </div>
    </div>
  );
}

