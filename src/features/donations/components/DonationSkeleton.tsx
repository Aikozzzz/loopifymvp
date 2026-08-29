import { Skeleton } from '@/components/ui/Skeleton'

export function DonationSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-paper">
      <Skeleton className="aspect-[1.35/1] rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}
