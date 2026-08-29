import { Card, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export function EventListSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading events">
      {Array.from({ length: 6 }, (_, index) => (
        <Card className="p-5 sm:p-6" key={index}>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="size-5 rounded-full" />
          </div>
          <Skeleton className="mt-5 h-3 w-24" />
          <Skeleton className="mt-3 h-7 w-4/5" />
          <Skeleton className="mt-2 h-7 w-3/5" />
          <CardContent className="mt-5 space-y-3 border-t border-line px-0 pb-0 pt-5">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
