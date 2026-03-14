import Link from "next/link";
import {
  activePlaygrounds,
  upcomingPlaygrounds,
} from "@/lib/playgrounds";

export default function Home() {
  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,251,239,0.94),rgba(250,236,208,0.88)_50%,rgba(191,225,214,0.82))] p-8 shadow-[0_24px_70px_rgba(41,37,36,0.12)] sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-stone-500">
                AI Grounds
              </p>
              <h1 className="max-w-2xl text-5xl font-semibold tracking-[-0.06em] text-stone-950 sm:text-6xl">
                Learn AI ideas by poking the algorithm until it explains
                itself.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-700">
                Each module is a self-contained playground, simulation, or
                visual explainer. Start with Attention Maps, BM25 ranking,
                Monte Carlo Tree Search, Q-learning, or Diffusion Studio and
                watch the hidden tradeoffs surface in real time.
              </p>
            </div>
            <div className="grid gap-4 rounded-[1.75rem] border border-stone-900/8 bg-white/70 p-5 backdrop-blur">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-stone-500">
                  What this app is for
                </p>
                <p className="mt-2 max-w-sm text-sm leading-7 text-stone-700">
                  Fast intuition, visible tradeoffs, and enough interaction that
                  the concept feels tangible instead of abstract.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <Link
                  href="/playgrounds/attention"
                  className="inline-flex items-center justify-center rounded-full border border-indigo-300 bg-indigo-100 px-5 py-3 text-sm font-medium text-indigo-950 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Open attention maps
                </Link>
                <Link
                  href="/playgrounds/bm25"
                  className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Open the BM25 lab
                </Link>
                <Link
                  href="/playgrounds/q-learning"
                  className="inline-flex items-center justify-center rounded-full border border-sky-300 bg-sky-100 px-5 py-3 text-sm font-medium text-sky-950 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Open Q-learning
                </Link>
                <Link
                  href="/playgrounds/diffusion"
                  className="inline-flex items-center justify-center rounded-full border border-cyan-300 bg-cyan-100 px-5 py-3 text-sm font-medium text-cyan-950 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Open Diffusion
                </Link>
                <Link
                  href="/playgrounds/mcts"
                  className="inline-flex items-center justify-center rounded-full border border-stone-900/12 bg-white px-5 py-3 text-sm font-medium text-stone-900 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Open the MCTS lab
                </Link>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="grid gap-5 md:grid-cols-2">
            {activePlaygrounds.map((playground) => (
              <article
                key={playground.slug}
                className="group overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_24px_55px_rgba(68,64,60,0.1)] backdrop-blur"
              >
                <div
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] ${playground.theme.badgeClassName}`}
                >
                  Live module
                </div>
                <div className="mt-5 space-y-3">
                  <h2 className="text-3xl font-semibold tracking-[-0.04em] text-stone-950">
                    {playground.title}
                  </h2>
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-stone-500">
                    {playground.kicker}
                  </p>
                  <p className="text-base leading-7 text-stone-700">
                    {playground.summary}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {playground.concepts.map((concept) => (
                    <span
                      key={concept}
                      className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700"
                    >
                      {concept}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-stone-200 pt-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                      Suggested time
                    </p>
                    <p className="mt-1 text-sm font-medium text-stone-800">
                      {playground.estimatedDuration}
                    </p>
                  </div>
                  <Link
                    href={`/playgrounds/${playground.slug}`}
                    className="rounded-full border border-stone-900/12 bg-stone-950 px-4 py-2 text-sm font-medium text-stone-50 transition-colors group-hover:bg-stone-800"
                  >
                    Explore
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <aside className="rounded-[1.75rem] border border-white/70 bg-stone-950 p-6 text-stone-100 shadow-[0_24px_55px_rgba(28,25,23,0.22)]">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-stone-400">
              Module system
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
              Built to grow cleanly.
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-stone-300">
              <p>Each playground has its own folder, metadata, and UI.</p>
              <p>
                Shared routing and shell components keep the app consistent
                while making future modules easy to add.
              </p>
              <p>
                Vercel deployment stays straightforward because each module is
                static plus client-side interaction.
              </p>
            </div>
          </aside>
        </section>

        {upcomingPlaygrounds.length > 0 ? (
          <section className="rounded-[1.75rem] border border-white/60 bg-white/75 p-6 shadow-[0_18px_40px_rgba(68,64,60,0.08)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-stone-500">
                  Planned next
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-stone-950">
                  The module shelf can keep expanding.
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-stone-600">
                These are still placeholders, but the list shrinks as modules
                graduate into live playgrounds.
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {upcomingPlaygrounds.map((playground) => (
                <article
                  key={playground.slug}
                  className="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50/80 p-5"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
                    Coming soon
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-stone-900">
                    {playground.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-stone-600">
                    {playground.summary}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
