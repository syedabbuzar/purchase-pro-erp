import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

function Gstr3b() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">GSTR-3B</h1>
      <Card>
        <CardContent className="p-10 flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
          <ClipboardList className="h-10 w-10 opacity-50" />
          <div className="text-lg font-semibold text-foreground">No report available</div>
          <p className="text-sm max-w-md">
            GSTR-3B summary will be generated after backend integration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Gstr3b;