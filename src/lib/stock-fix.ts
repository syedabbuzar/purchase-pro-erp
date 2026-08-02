import { stockApi } from "./services";
import type { InvoiceItem } from "./types";

/**
 * Stock correction helpers.
 *
 * The backend writes stock ledger movements itself, but two of its paths move
 * stock twice:
 *  1. Invoice update  -> it inserts a "Update Restore" entry AND deletes the old
 *     "Invoice : <no>" sale entries, restoring the old quantity twice.
 *  2. Deleting an already-cancelled invoice -> the cancel already restored the
 *     quantity, and the delete removes the sale entries, restoring it again.
 *
 * These helpers post exactly ONE compensating adjustment per affected item so
 * the net stock movement stays mathematically correct:
 *   rollback once, apply once — never twice.
 */
type QtyItem = Pick<InvoiceItem, "productId" | "boxes" | "pieces">;

async function compensate(items: QtyItem[], note: string) {
  const byProduct = new Map<string, { boxes: number; pieces: number }>();
  for (const it of items) {
    const key = String(it.productId);
    const cur = byProduct.get(key) || { boxes: 0, pieces: 0 };
    // One product = one corrective movement (never a second stock row).
    cur.boxes += it.boxes || 0;
    cur.pieces += it.pieces || 0;
    byProduct.set(key, cur);
  }
  for (const [productId, q] of byProduct) {
    if (!q.boxes && !q.pieces) continue;
    await stockApi.adjust({ productId, boxes: -q.boxes, pieces: -q.pieces, note });
  }
}

/** Cancels the duplicate restore produced by an invoice update. */
export const fixEditRestore = (items: QtyItem[], number: string) =>
  compensate(items, `Edit rollback correction : ${number}`);

/** Cancels the duplicate restore when deleting an already-cancelled invoice. */
export const fixCancelledDelete = (items: QtyItem[], number: string) =>
  compensate(items, `Delete restore correction : ${number}`);
