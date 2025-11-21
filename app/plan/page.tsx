export default function Plan() {
  const numSquares = 64;

  return (
    <section className="h-screen w-screen">
      <div className="flex flex-col h-screen gap-40">
        <h1 className="text-black flex mx-auto text-8xl font-semibold mt-20">
          el plan
        </h1>

        {/* placeholder squares */}
        <div className="grid grid-cols-8 gap-2 w-full max-w-[600px] mx-auto -mt-20">
          {Array.from({ length: numSquares }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 border border-gray-300 rounded"
            >
              <p className="text-sm text-center mt-5 ">minigoal</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
