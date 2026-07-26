import { db } from "./db";

export async function exportBackup(): Promise<Blob> {
  const data: Record<string, unknown[]> = {};
  for (const table of db.tables) {
    data[table.name] = await table.toArray();
  }
  const payload = { version: 1, exportedAt: Date.now(), data };
  return new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
}

export async function importBackup(json: string, mode: "replace" | "merge") {
  const parsed = JSON.parse(json);
  if (!parsed.data) throw new Error("Invalid backup file");
  await db.transaction("rw", db.tables, async () => {
    for (const table of db.tables) {
      const rows = parsed.data[table.name];
      if (!Array.isArray(rows)) continue;
      if (mode === "replace") await table.clear();
      await table.bulkPut(rows);
    }
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
