// Minimal data shim for ClientChart formatting functions
export function fmt(n: number): string {
  return n.toLocaleString();
}

export function fmtDollarFull(n: number): string {
  return '$' + n.toLocaleString();
}
