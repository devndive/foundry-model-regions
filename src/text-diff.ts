// Minimal LCS line diff, rendered like a unified diff body (" " kept, "-"
// removed, "+" added). Used only to make a drift issue human-readable; the
// drift decision itself is a plain text inequality.

export function diffLines(oldText: string, newText: string): string {
  const a = oldText.length > 0 ? oldText.split("\n") : [];
  const b = newText.length > 0 ? newText.split("\n") : [];
  const m = a.length;
  const n = b.length;

  const lcs: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0),
  );
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const out: string[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      out.push(` ${a[i]}`);
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      out.push(`-${a[i]}`);
      i++;
    } else {
      out.push(`+${b[j]}`);
      j++;
    }
  }
  while (i < m) out.push(`-${a[i++]}`);
  while (j < n) out.push(`+${b[j++]}`);

  return out.join("\n");
}
