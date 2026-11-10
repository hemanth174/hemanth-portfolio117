export function LoadingPulse({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5 font-mono text-[10px] font-bold tracking-[.24em] text-zinc-400">
      <span className="relative flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400/40" />
        <span className="relative inline-flex h-4 w-4 animate-spin rounded-full border-2 border-yellow-400/25 border-t-yellow-400" />
      </span>
      {label}
    </div>
  )
}

const bar = 'animate-pulse rounded bg-zinc-200 dark:bg-zinc-800'
const softBar = 'animate-pulse rounded bg-zinc-100 dark:bg-zinc-900'

export function EventsGridSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-7 pb-8">
      <LoadingPulse label="LOADING FIELD NOTES" />
      <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            style={{ animationDelay: `${index * 90}ms` }}
            className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="aspect-[16/10] animate-pulse bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-800" />
            <div className="space-y-3.5 p-6">
              <div className={`h-2 w-24 ${bar}`} />
              <div className={`h-5 w-3/4 ${bar}`} />
              <div className={`h-3 w-full ${softBar}`} />
              <div className={`h-3 w-5/6 ${softBar}`} />
              <div className="flex gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <div className={`h-2.5 w-24 ${softBar}`} />
                <div className={`h-2.5 w-16 ${softBar}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function EventStorySkeleton() {
  return (
    <main aria-busy="true" aria-live="polite" className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-white">
      <div className="mx-auto max-w-[1500px] px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className={`h-9 w-28 rounded-full ${softBar}`} />
          ))}
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="space-y-5">
            <div className={`h-3 w-52 ${bar}`} />
            <div className={`h-12 w-full max-w-2xl ${bar}`} />
            <div className={`h-12 w-2/3 max-w-xl ${bar}`} />
            <div className={`h-4 w-full max-w-xl ${softBar}`} />
            <div className={`h-4 w-4/5 max-w-lg ${softBar}`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className={`mb-5 h-4 w-4 rounded ${bar}`} />
                <div className={`h-2.5 w-12 ${softBar}`} />
                <div className={`mt-2 h-3 w-20 ${bar}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 space-y-4">
          <div className="flex justify-center py-2">
            <LoadingPulse label="LOADING STORY" />
          </div>
          <div className={`aspect-[16/7] max-h-[480px] w-full rounded-3xl ${bar}`} />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={`aspect-[4/3] max-h-[300px] rounded-2xl ${softBar}`} />
            ))}
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-14 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <div className={`h-3 w-32 ${bar}`} />
            <div className={`h-8 w-3/4 ${bar}`} />
            <div className={`h-3 w-full ${softBar}`} />
            <div className={`h-3 w-11/12 ${softBar}`} />
            <div className={`h-3 w-full ${softBar}`} />
            <div className={`h-3 w-2/3 ${softBar}`} />
            <div className={`mt-8 h-6 w-48 ${bar}`} />
            <div className={`h-3 w-full ${softBar}`} />
            <div className={`h-3 w-5/6 ${softBar}`} />
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className={`mb-5 h-3 w-24 ${bar}`} />
            <div className={`h-3 w-full ${softBar}`} />
            <div className={`mt-3 h-3 w-4/5 ${softBar}`} />
            <div className={`mt-3 h-3 w-3/5 ${softBar}`} />
          </div>
        </div>
      </div>
    </main>
  )
}
