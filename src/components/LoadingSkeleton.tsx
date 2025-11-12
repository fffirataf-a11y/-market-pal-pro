import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ListsLoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-4 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export const ScannerLoadingSkeleton = () => {
  return (
    <div className="space-y-6">
      <Card className="p-8">
        <div className="space-y-6">
          <div className="flex justify-center">
            <Skeleton className="h-24 w-24 rounded-2xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>
    </div>
  );
};

export const ProfileLoadingSkeleton = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-32 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
        </div>
      </Card>
      <Card className="p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </Card>
    </div>
  );
};