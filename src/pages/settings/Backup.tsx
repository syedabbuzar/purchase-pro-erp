import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Backup() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Backup</h1>
      <Card>
        <CardHeader><CardTitle>Cloud backup</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          All data now lives on the hosted backend, so local import/export backups are no longer used.
          Backups are handled on the server side.
        </CardContent>
      </Card>
    </div>
  );
}

export default Backup;
