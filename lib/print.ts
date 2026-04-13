/**
 * MEMTrak Print — Opens a clean popup window with only the content.
 * No sidebar, no metadata, no navigation. Just the data.
 */
export function memtrakPrint(title: string) {
  // Get the main content area (everything inside <main>)
  const main = document.querySelector('main');
  if (!main) return;

  // Clone the content and strip interactive elements
  const content = main.cloneNode(true) as HTMLElement;

  // Remove buttons, inputs, selects, no-print elements
  content.querySelectorAll('.no-print, button, input, select, textarea, [data-no-print]').forEach(el => el.remove());

  const w = window.open('', '_blank');
  if (!w) return;

  w.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${title} — MEMTrak</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1B3A5C;
      background: white;
      padding: 32px 40px;
      max-width: 900px;
      margin: 0 auto;
      font-size: 12px;
    }
    .print-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px solid #C6A75E;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }
    .print-header h1 { font-size: 18px; font-weight: 800; color: #002D5C; }
    .print-header .sub { font-size: 10px; color: #65615a; }
    .print-header .brand { text-align: right; }
    .print-header .brand .org { font-size: 10px; color: #65615a; }
    .print-header .brand .by { font-size: 9px; color: #9a9690; }

    /* Reset dark theme styles to light for print */
    [style*="--card"] { background: white !important; border-color: #d1d9e2 !important; }
    [style*="--card-border"] { border-color: #d1d9e2 !important; }
    [style*="--heading"], .text-white, [class*="text-white"] { color: #1B3A5C !important; }
    [style*="--text-muted"], [class*="text-white\\/"] { color: #5a6d82 !important; }
    [class*="bg-white\\/"], [class*="bg-\\[var"] { background: #f8f9fa !important; }
    [class*="border-white\\/"] { border-color: #d1d9e2 !important; }
    .text-green-400 { color: #8CC63F !important; }
    .text-red-400 { color: #D94A4A !important; }
    .text-amber-400 { color: #E8923F !important; }

    table { width: 100%; border-collapse: collapse; margin: 8px 0; }
    th { background: #1B3A5C !important; color: white !important; padding: 6px 10px; text-align: left; font-size: 10px; }
    td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
    tr:nth-child(even) td { background: #f8f9fa; }
    canvas { max-height: 300px !important; }
    svg { max-width: 100%; }

    .print-footer {
      margin-top: 32px;
      padding-top: 12px;
      border-top: 1px solid #d1d9e2;
      text-align: center;
      font-size: 9px;
      color: #9a9690;
    }

    @media print {
      body { padding: 0; }
      @page { margin: 0.5in; size: letter; }
    }
  </style>
</head>
<body>
  <div class="print-header">
    <div>
      <h1>MEMTrak</h1>
      <div class="sub">${title}</div>
    </div>
    <div class="brand">
      <div class="org">American Land Title Association</div>
      <div class="by">by AXG Systems</div>
    </div>
  </div>

  ${content.innerHTML}

  <div class="print-footer">
    MEMTrak for American Land Title Association by AXG Systems — Printed ${new Date().toLocaleString()}
  </div>
</body>
</html>`);

  w.document.close();
  setTimeout(() => { w.print(); }, 800);
}
