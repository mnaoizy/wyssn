import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="container max-w-5xl mx-auto py-10 px-4 sm:px-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="space-y-8">
        <section>
          <Skeleton className="h-7 w-32 mb-3" />
          <div className="rounded-md border border-gray-200 p-5 bg-white shadow-sm">
            <div className="mb-3">
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-5 w-64" />
            </div>
          </div>
        </section>

        <section>
          <Skeleton className="h-7 w-32 mb-3" />
          <div className="text-center mb-6">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-5 w-80 mx-auto" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 border rounded-lg">
                <Skeleton className="h-7 w-32 mb-2" />
                <Skeleton className="h-5 w-48 mb-4" />
                <Skeleton className="h-9 w-full mb-4" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <Skeleton className="h-10 w-full mt-6" />
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-3 w-48 mx-auto mt-2" />
          </div>
        </section>
      </div>
    </div>
  )
}
