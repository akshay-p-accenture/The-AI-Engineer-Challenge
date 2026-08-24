import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <div className="hidden w-[280px] shrink-0 flex-col gap-3 border-r border-white/[0.06] p-4 lg:flex">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-[85%]" />
          <Skeleton className="h-9 w-[70%]" />
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex h-14 items-center border-b border-white/[0.06] px-5">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-6">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-4 w-72" />
          <div className="mt-6 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
        <div className="p-6">
          <Skeleton className="mx-auto h-28 w-full max-w-3xl rounded-[22px]" />
        </div>
      </div>
    </div>
  );
}
