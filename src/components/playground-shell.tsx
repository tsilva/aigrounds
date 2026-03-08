import Link from "next/link";
import { type ReactNode } from "react";
import { type ActivePlayground } from "@/lib/playgrounds";

type PlaygroundShellProps = {
  module: ActivePlayground;
  children: ReactNode;
};

export function PlaygroundShell({
  module,
  children,
}: PlaygroundShellProps) {
  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,251,239,0.96),rgba(255,241,217,0.9)_45%,rgba(214,236,229,0.88))] p-8 shadow-[0_20px_60px_rgba(41,37,36,0.12)] sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-stone-500 transition-colors hover:text-stone-900"
              >
                <span>AI Grounds</span>
                <span className="text-stone-400">/</span>
                <span>{module.title}</span>
              </Link>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.06em] text-stone-950 sm:text-6xl">
                {module.title}
              </h1>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-stone-500">
                {module.kicker}
              </p>
              <p className="max-w-2xl text-lg leading-8 text-stone-700">
                {module.summary}
              </p>
            </div>

            <div className="float-panel rounded-[1.75rem] border border-stone-900/8 bg-white/70 p-5 shadow-[0_18px_50px_rgba(68,64,60,0.12)] backdrop-blur lg:max-w-sm">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
                Learning goals
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-stone-700">
                {module.learningGoals.map((goal) => (
                  <p key={goal}>{goal}</p>
                ))}
              </div>
            </div>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
