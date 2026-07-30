import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card>
      <CardContent className="p-6 text-sm">
        <div className="font-medium text-destructive">Failed to load data</div>
        <div className="text-muted-foreground mt-1">{message}</div>
        {onRetry && (
          <button className="mt-3 text-primary underline" onClick={onRetry}>
            Retry
          </button>
        )}
      </CardContent>
    </Card>
  );
}