import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { exportBackup, importBackup, downloadBlob } from "@/lib/backup";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/settings/backup")({
  component: Backup,
  head: () => ({ meta: [{ title: "Backup — STAR ENTERPRISES" }] }),
});

function Backup() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"replace" | "merge">("merge");

  const doExport = async () => {
    const blob = await exportBackup();
    downloadBlob(blob, `star-erp-backup-${format(new Date(), "yyyy-MM-dd-HHmm")}.json`);
    toast.success("Backup downloaded");
  };

  const doImport = async (file: File) => {
    if (mode === "replace" && !confirm("Replace ALL current data with backup contents? This cannot be undone.")) return;
    const text = await file.text();
    try {
      await importBackup(text, mode);
      toast.success("Backup restored — reload the page to see everything.");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">Backup & Restore</h1>
      <Card>
        <CardHeader><CardTitle>Export</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">Download a single JSON file with everything: products, customers, invoices, stock, purchases, users, and settings. Do this daily.</p>
          <Button onClick={doExport}>Download Backup JSON</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Import</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <label className="flex items-center gap-2"><input type="radio" checked={mode === "merge"} onChange={() => setMode("merge")} />Merge (add missing, keep existing)</label>
            <label className="flex items-center gap-2"><input type="radio" checked={mode === "replace"} onChange={() => setMode("replace")} />Replace (wipe & restore)</label>
          </div>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])} />
          <Button onClick={() => fileRef.current?.click()}>Choose Backup File...</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Data Location</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          All data lives in this browser (IndexedDB). Clearing site data will wipe it. Download a backup regularly.
        </CardContent>
      </Card>
    </div>
  );
}
