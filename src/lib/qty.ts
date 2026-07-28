// Convert total pieces into Boxes + Loose Pieces using product's pieces-per-box.
// Never show raw pieces when complete boxes can be formed.
export function piecesToBoxes(totalPieces: number, boxSize: number) {
  const bs = Math.max(1, boxSize || 1);
  const tp = Math.max(0, Math.floor(totalPieces || 0));
  const boxes = Math.floor(tp / bs);
  const pieces = tp - boxes * bs;
  return { boxes, pieces, totalPieces: tp };
}

export function formatQty(totalPieces: number, boxSize: number): string {
  const { boxes, pieces } = piecesToBoxes(totalPieces, boxSize);
  if (boxes > 0 && pieces > 0) return `${boxes} Box + ${pieces} Pcs`;
  if (boxes > 0) return `${boxes} Box`;
  return `${pieces} Pcs`;
}