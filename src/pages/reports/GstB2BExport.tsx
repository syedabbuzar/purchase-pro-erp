import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

function GstB2BExport() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">GST B2B Export</h1>
      <Card>
        <CardContent className="p-10 flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
          <BarChart3 className="h-10 w-10 opacity-50" />
          <div className="text-lg font-semibold text-foreground">No report available</div>
          <p className="text-sm max-w-md">
            B2B export data will be available once backend integration is complete.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default GstB2BExport;