import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8" role="status" aria-label="Loading">
      <Skeleton className="h-9 w-72" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[4/3]" />
            <Skeleton className="mt-3 h-4 w-24" />
            <Skeleton className="mt-2 h-5 w-full" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
