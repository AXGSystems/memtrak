/**
 * MEMTrak Print — Opens a clean popup window with formatted content.
 * No sidebar, no navigation. Branded header. Proper layout preserved.
 */
export function memtrakPrint(title: string) {
  const main = document.querySelector('main');
  if (!main) return;

  // Clone content, strip interactive/nav elements
  const content = main.cloneNode(true) as HTMLElement;
  content.querySelectorAll('.no-print, button, input, select, textarea, [data-no-print], nav').forEach(el => el.remove());

  // Also remove the topbar clone
  const topbar = content.querySelector('.sticky');
  if (topbar) topbar.remove();

  const w = window.open('', '_blank');
  if (!w) return;

  w.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${title} — MEMTrak</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1B3A5C;
      background: white;
      padding: 40px 48px;
      max-width: 960px;
      margin: 0 auto;
      font-size: 12px;
      line-height: 1.5;
    }

    /* ── Header ── */
    .mt-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      border-bottom: 3px solid #C6A75E;
      padding-bottom: 14px;
      margin-bottom: 32px;
    }
    .mt-header h1 { font-size: 22px; font-weight: 800; color: #002D5C; margin: 0; }
    .mt-header .sub { font-size: 11px; color: #5a6d82; margin: 2px 0 0; }
    .mt-header .brand { text-align: right; }
    .mt-header .brand .org { font-size: 11px; color: #5a6d82; font-weight: 600; }
    .mt-header .brand .by { font-size: 9px; color: #9a9690; }

    /* ── Grid layout preservation ── */
    .grid { display: grid !important; gap: 12px; }
    .grid-cols-2 { grid-template-columns: repeat(2, 1fr) !important; }
    .grid-cols-3 { grid-template-columns: repeat(3, 1fr) !important; }
    .lg\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr) !important; }
    .lg\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr) !important; }
    .lg\\:grid-cols-4 { grid-template-columns: repeat(4, 1fr) !important; }
    .lg\\:grid-cols-5 { grid-template-columns: repeat(5, 1fr) !important; }
    .lg\\:grid-cols-6 { grid-template-columns: repeat(6, 1fr) !important; }
    .flex { display: flex !important; }
    .items-center { align-items: center !important; }
    .justify-between { justify-content: space-between !important; }
    .gap-2 { gap: 8px !important; }
    .gap-3 { gap: 12px !important; }
    .gap-4 { gap: 16px !important; }
    .space-y-2 > * + * { margin-top: 8px; }
    .space-y-3 > * + * { margin-top: 12px; }

    /* ── Cards ── */
    .rounded-xl, [style*="--card"] {
      background: #f8f9fb !important;
      border: 1px solid #d1d9e2 !important;
      border-radius: 10px !important;
      padding: 14px !important;
      color: #1B3A5C !important;
      page-break-inside: avoid;
    }
    .rounded-lg, .bg-white\\/5 {
      background: #f4f6f8 !important;
      border-radius: 8px !important;
      padding: 10px !important;
    }
    .border-l-4 { border-left: 4px solid #C6A75E !important; }
    .border-l-\\[\\#8CC63F\\] { border-left-color: #8CC63F !important; }

    /* ── Text ── */
    .text-white, [class*="text-white"] { color: #1B3A5C !important; }
    .text-white\\/40, .text-white\\/30, .text-white\\/50, .text-white\\/60 { color: #5a6d82 !important; }
    .font-extrabold { font-weight: 800; }
    .font-bold { font-weight: 700; }
    .text-lg { font-size: 16px; }
    .text-xl { font-size: 18px; }
    .text-2xl { font-size: 22px; }
    .text-sm { font-size: 12px; }
    .text-xs { font-size: 11px; }
    .text-\\[10px\\], .text-\\[9px\\], .text-\\[8px\\] { font-size: 10px; }
    .text-\\[11px\\] { font-size: 11px; }
    .uppercase { text-transform: uppercase; }
    .tracking-wider { letter-spacing: 0.05em; }
    .tracking-widest { letter-spacing: 0.1em; }

    /* ── Status colors (preserve on white) ── */
    .text-green-400, .text-green-600, .text-\\[\\#8CC63F\\] { color: #8CC63F !important; }
    .text-red-400, .text-red-600 { color: #D94A4A !important; }
    .text-amber-400, .text-amber-600 { color: #E8923F !important; }
    .text-blue-400, .text-blue-600 { color: #4A90D9 !important; }
    .bg-green-500\\/20, .bg-green-100 { background: rgba(140,198,63,0.12) !important; color: #6fa030 !important; }
    .bg-red-500\\/20, .bg-red-100 { background: rgba(217,74,74,0.12) !important; color: #D94A4A !important; }
    .bg-amber-500\\/20, .bg-amber-100 { background: rgba(232,146,63,0.12) !important; color: #E8923F !important; }
    .bg-blue-500\\/20, .bg-blue-100 { background: rgba(74,144,217,0.12) !important; color: #4A90D9 !important; }

    /* ── Badges ── */
    .rounded-full { border-radius: 9999px; display: inline-block; padding: 2px 8px; font-size: 10px; font-weight: 700; }

    /* ── Tables ── */
    table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 11px; }
    th { background: #1B3A5C !important; color: white !important; padding: 8px 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 7px 12px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f8f9fb; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }

    /* ── Charts ── */
    canvas { max-height: 280px !important; max-width: 100% !important; margin: 8px 0; }
    svg { max-width: 80px; }

    /* ── Spacing ── */
    .mb-6 { margin-bottom: 24px !important; }
    .mb-4 { margin-bottom: 16px !important; }
    .mb-3 { margin-bottom: 12px !important; }
    .mb-2 { margin-bottom: 8px !important; }
    .mt-3 { margin-top: 12px !important; }
    .p-3 { padding: 12px !important; }
    .p-4 { padding: 16px !important; }
    .p-5 { padding: 20px !important; }
    .p-6 { padding: 24px !important; }

    /* ── Hide animations ── */
    .stagger-children > * { opacity: 1 !important; animation: none !important; }
    .animate-pulse { animation: none !important; }

    /* ── Footer ── */
    .mt-footer {
      margin-top: 40px;
      padding-top: 14px;
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
  <div class="mt-header">
    <div>
      <h1>MEMTrak</h1>
      <div class="sub">${title} — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
    </div>
    <div class="brand">
      <div class="org">American Land Title Association</div>
      <div class="by">by AXG Systems</div>
    </div>
  </div>

  ${content.innerHTML}

  <div class="mt-footer">
    MEMTrak for American Land Title Association by AXG Systems<br>
    Printed ${new Date().toLocaleString()} — Confidential: Internal Use Only
  </div>
</body>
</html>`);

  w.document.close();
  setTimeout(() => { w.print(); }, 800);
}
