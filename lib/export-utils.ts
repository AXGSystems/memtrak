/** Download data as CSV file */
export function exportCSV(headers: string[], rows: (string | number)[][], filename: string) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      const str = String(cell);
      return str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Print a specific element's content in a new window */
export function printContent(title: string, html: string) {
  const safeTitle = title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><title>${safeTitle}</title><style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #2c3e50; max-width: 900px; margin: 0 auto; }
    h1 { color: #1B3A5C; border-bottom: 2px solid #8CC63F; padding-bottom: 8px; font-size: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 12px 0; }
    th { background: #1B3A5C; color: white; padding: 8px 12px; text-align: left; }
    td { padding: 8px 12px; border-bottom: 1px solid #e1e5ea; }
    tr:nth-child(even) { background: #f8f9fa; }
    strong { color: #1B3A5C; }
    .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 10px; color: #888; }
  </style></head><body>
    <h1>${safeTitle}</h1>
    ${html}
    <div class="footer">ALTA DASH 2.0 | Generated: ${new Date().toLocaleString()} | Internal — ALTA Staff Only</div>
  </body></html>`);
  w.document.close();
  setTimeout(() => { w.print(); w.close(); }, 500);
}
