import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

function Gstr1B2B() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">GSTR-1 B2B</h1>
      <Card>
        <CardContent className="p-10 flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
          <FileText className="h-10 w-10 opacity-50" />
          <div className="text-lg font-semibold text-foreground">No report available</div>
          <p className="text-sm max-w-md">
            GSTR-1 B2B will be generated automatically once backend integration is
            connected. Sample data has been removed to avoid misleading figures.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Gstr1B2B;