import { Header } from "@/components/Header";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[var(--radius)] bg-[#e9eef2] ${className}`} />;
}

export default function JobDetailLoading() {
  return (
    <>
      <Header />
      <main className="bg-[#f5f5f3] pb-28 pt-6">
        <div className="app-shell">
          <SkeletonBlock className="h-4 w-[180px]" />
          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_318px] gap-6 max-[1120px]:grid-cols-1">
            <div className="space-y-5">
              <section className="rounded-[var(--radius)] border border-border bg-white p-7 shadow-[var(--shadow)]">
                <div className="flex gap-4">
                  <SkeletonBlock className="h-[68px] w-[68px]" />
                  <div className="flex-1 space-y-3">
                    <SkeletonBlock className="h-4 w-[180px]" />
                    <SkeletonBlock className="h-9 w-[72%]" />
                    <SkeletonBlock className="h-8 w-[58%]" />
                  </div>
                </div>
                <SkeletonBlock className="mt-7 h-[318px] w-full" />
              </section>
              <section className="rounded-[var(--radius)] border border-border bg-white p-7 shadow-[var(--shadow)]">
                <SkeletonBlock className="h-6 w-[160px]" />
                <div className="mt-5 grid grid-cols-4 gap-3 max-[720px]:grid-cols-2">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <SkeletonBlock key={index} className="h-[74px]" />
                  ))}
                </div>
              </section>
              {Array.from({ length: 5 }).map((_, index) => (
                <section key={index} className="rounded-[var(--radius)] border border-border bg-white p-7 shadow-[var(--shadow)]">
                  <SkeletonBlock className="h-6 w-[150px]" />
                  <SkeletonBlock className="mt-5 h-4 w-full" />
                  <SkeletonBlock className="mt-3 h-4 w-[86%]" />
                  <SkeletonBlock className="mt-3 h-4 w-[66%]" />
                </section>
              ))}
            </div>
            <aside className="space-y-3 max-[720px]:hidden">
              <section className="rounded-[var(--radius)] border border-border bg-white p-5 shadow-[var(--shadow)]">
                <SkeletonBlock className="h-4 w-[80px]" />
                <SkeletonBlock className="mt-3 h-9 w-[110px]" />
                <SkeletonBlock className="mt-6 h-[160px] w-full" />
                <SkeletonBlock className="mt-5 h-12 w-full" />
              </section>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
