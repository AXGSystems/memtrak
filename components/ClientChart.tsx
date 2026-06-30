'use client';

import dynamic from 'next/dynamic';
import type { Plugin } from 'chart.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
type ChartOptions = Record<string, any>;

export interface ClientChartProps {
  type: 'bar' | 'doughnut' | 'line' | 'pie' | 'bubble' | 'scatter' | 'radar';
  data: object;
  options?: ChartOptions;
  plugins?: Plugin[];
  height?: number;
  onPointClick?: (label: string, value: number, datasetLabel: string) => void;
}

/**
 * Code-split boundary for chart.js.
 *
 * The actual implementation (and the entire chart.js / datalabels payload it
 * pulls in) lives in ClientChartImpl and is loaded lazily via next/dynamic
 * with ssr:false. Charts only render client-side anyway (canvas), so this
 * keeps chart.js out of every route's initial first-load JS — it is fetched
 * as its own chunk on demand when a chart is mounted. All 70+ existing import
 * sites (`import ClientChart from '@/components/ClientChart'`) keep working
 * unchanged because the default export and prop shape are preserved.
 */
const ClientChartImpl = dynamic(() => import('./ClientChartImpl'), {
  ssr: false,
  loading: () => null,
});

export default function ClientChart(props: ClientChartProps) {
  // Reserve the chart's vertical space while its lazy chunk downloads so the
  // surrounding layout does not shift when the canvas mounts (Cumulative
  // Layout Shift mitigation). The reserved minHeight matches the inner
  // ClientChartImpl wrapper height (same 300px default), so it collapses
  // cleanly once the real chart renders.
  const reservedHeight = props.height ?? 300;
  return (
    <div style={{ minHeight: reservedHeight }}>
      <ClientChartImpl {...props} />
    </div>
  );
}
