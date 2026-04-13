'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables, type ChartData, type ChartType, type ChartTypeRegistry, type Plugin, type TooltipItem } from 'chart.js';
import ChartDataLabels, { type Context as DatalabelsContext } from 'chartjs-plugin-datalabels';
import { fmt, fmtDollarFull } from '@/lib/data';

Chart.register(...registerables, ChartDataLabels);

Chart.defaults.font.family = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(27, 58, 92, 0.95)';
Chart.defaults.plugins.tooltip.titleFont = { size: 13, weight: 'bold' };
Chart.defaults.plugins.tooltip.bodyFont = { size: 12 };
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.displayColors = true;
Chart.defaults.plugins.tooltip.boxPadding = 4;
Chart.defaults.plugins.tooltip.caretSize = 6;

// Custom plugin: draws leader lines from small pie/doughnut segments to outside labels
const leaderLinePlugin: Plugin = {
  id: 'pieLeaderLines',
  afterDraw(chart: Chart) {
    const meta = chart.getDatasetMeta(0);
    const chartType = 'type' in chart.config ? chart.config.type : undefined;
    if (!meta || chartType !== 'doughnut' && chartType !== 'pie') return;

    const dataset = chart.data.datasets[0];
    if (!dataset) return;
    const total = (dataset.data as number[]).reduce((s: number, v: number) => s + v, 0);
    if (total === 0) return;

    const ctx = chart.ctx;
    const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
    const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;

    // Collect all label positions to avoid collisions
    const labels: { x: number; y: number; text: string[]; color: string; anchor: 'start' | 'end'; midAngle: number; pct: number; arcX: number; arcY: number }[] = [];

    meta.data.forEach((element, i: number) => {
      const arc = element as unknown as { startAngle: number; endAngle: number; outerRadius: number };
      const value = (dataset.data as number[])[i];
      const pct = (value / total) * 100;

      // Large segments (>=5%) already have datalabels — skip them
      if (pct >= 5) return;

      const startAngle = arc.startAngle;
      const endAngle = arc.endAngle;
      const midAngle = (startAngle + endAngle) / 2;

      const outerRadius = arc.outerRadius;
      // Point on arc edge
      const arcX = centerX + Math.cos(midAngle) * outerRadius;
      const arcY = centerY + Math.sin(midAngle) * outerRadius;

      // Label position — pushed out further
      const labelRadius = outerRadius + 45;
      const labelX = centerX + Math.cos(midAngle) * labelRadius;
      const labelY = centerY + Math.sin(midAngle) * labelRadius;

      const dollars = value >= 1e6 ? '$' + (value / 1e6).toFixed(1) + 'M'
        : value >= 1e3 ? '$' + (value / 1e3).toFixed(0) + 'K'
        : fmtDollarFull(value);

      const label = chart.data.labels?.[i] || '';
      const anchor = labelX > centerX ? 'start' as const : 'end' as const;

      labels.push({
        x: labelX, y: labelY,
        text: [`${label}: ${dollars}`, `${pct.toFixed(1)}%`],
        color: (Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[i] : dataset.backgroundColor) as string || '#1B3A5C',
        anchor, midAngle, pct,
        arcX, arcY,
      });
    });

    // Resolve vertical collisions — space labels apart
    labels.sort((a, b) => a.y - b.y);
    const minSpacing = 22;
    for (let i = 1; i < labels.length; i++) {
      const prev = labels[i - 1];
      const curr = labels[i];
      if (curr.y - prev.y < minSpacing) {
        curr.y = prev.y + minSpacing;
      }
    }

    // Draw
    labels.forEach(lbl => {
      // Leader line: arc edge -> elbow -> label
      const firstArc = meta.data[0] as unknown as { outerRadius: number };
      const elbowX = centerX + Math.cos(lbl.midAngle) * (firstArc.outerRadius + 20);
      const elbowY = centerY + Math.sin(lbl.midAngle) * (firstArc.outerRadius + 20);

      ctx.save();
      ctx.strokeStyle = lbl.color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(lbl.arcX, lbl.arcY);
      ctx.lineTo(elbowX, elbowY);
      ctx.lineTo(lbl.x, lbl.y);
      ctx.stroke();

      // Dot at arc edge
      ctx.fillStyle = lbl.color;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(lbl.arcX, lbl.arcY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Label text
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#1B3A5C';
      ctx.font = 'bold 10px -apple-system,BlinkMacSystemFont,sans-serif';
      ctx.textAlign = lbl.anchor;
      ctx.textBaseline = 'middle';
      const textX = lbl.x + (lbl.anchor === 'start' ? 4 : -4);
      ctx.fillText(lbl.text[0], textX, lbl.y - 6);
      ctx.font = '9px -apple-system,BlinkMacSystemFont,sans-serif';
      ctx.fillStyle = '#7f8c9b';
      ctx.fillText(lbl.text[1], textX, lbl.y + 7);
      ctx.restore();
    });
  }
};

Chart.register(leaderLinePlugin);

// Custom plugin: adds a subtle drop-shadow behind the tooltip
const tooltipShadowPlugin: Plugin = {
  id: 'tooltipShadow',
  beforeTooltipDraw(chart: Chart) {
    const ctx = chart.ctx;
    ctx.save();
    ctx.shadowColor = 'rgba(27, 58, 92, 0.25)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
  },
  afterTooltipDraw(chart: Chart) {
    chart.ctx.restore();
  },
};

Chart.register(tooltipShadowPlugin);

/* eslint-disable @typescript-eslint/no-explicit-any -- Chart.js deep-merge requires dynamic property access */
type ChartOptions = Record<string, any>;

interface Props {
  type: 'bar' | 'doughnut' | 'line' | 'pie' | 'bubble' | 'scatter' | 'radar';
  data: object;
  options?: ChartOptions;
  plugins?: Plugin[];
  height?: number;
}

export default function ClientChart({ type, data, options = {}, plugins = [], height = 300 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const isDoughnutOrPie = type === 'doughnut' || type === 'pie';

    const defaultDatalabels = isDoughnutOrPie
      ? {
          display: (ctx: DatalabelsContext) => {
            // Only show built-in datalabels for segments >= 5%
            // Smaller segments get leader-line labels from the custom plugin
            const dataset = ctx.chart.data.datasets[ctx.datasetIndex];
            const total = (dataset.data as number[]).reduce((sum: number, v: number) => sum + v, 0);
            const value = (dataset.data as number[])[ctx.dataIndex];
            return (value / total) >= 0.05;
          },
          anchor: 'end' as const,
          align: 'end' as const,
          offset: 14,
          color: '#1B3A5C',
          font: { weight: 'bold' as const, size: 11 },
          formatter: (value: number, ctx: DatalabelsContext) => {
            const dataset = ctx.chart.data.datasets[ctx.datasetIndex];
            const total = (dataset.data as number[]).reduce((sum: number, v: number) => sum + v, 0);
            const pct = ((value / total) * 100).toFixed(1);
            const dollars = value >= 1e6
              ? '$' + (value / 1e6).toFixed(1) + 'M'
              : value >= 1e3
                ? '$' + (value / 1e3).toFixed(0) + 'K'
                : fmtDollarFull(value);
            return `${dollars}\n${pct}%`;
          },
        }
      : { display: false };

    const defaultTooltip = isDoughnutOrPie
      ? {
          callbacks: {
            label: (ctx: TooltipItem<ChartType>) => {
              const dataset = ctx.chart.data.datasets[ctx.datasetIndex];
              const total = (dataset.data as number[]).reduce((sum: number, v: number) => sum + v, 0);
              const value = ctx.raw as number;
              const pct = ((value / total) * 100).toFixed(1);
              const dollars = value >= 1e6 ? '$' + (value / 1e6).toFixed(2) + 'M'
                : fmtDollarFull(value);
              return `${ctx.label}: ${dollars} (${pct}%)`;
            },
          },
        }
      : {
          callbacks: {
            label: (ctx: TooltipItem<ChartType>) => {
              const label = ctx.dataset.label || '';
              const value = ctx.parsed?.y ?? ctx.raw;
              if (typeof value !== 'number') return label ? `${label}: ${value}` : String(value);
              // Detect dollar-based datasets by label or axis configuration
              const isDollar = /dollar|revenue|budget|expense|cost|amount|spend|income|reserve|\$/i.test(label)
                || /dollar|revenue|budget|expense|cost|amount|spend|income|reserve|\$/i.test(String(ctx.chart.data.labels?.[ctx.dataIndex] || ''));
              const formatted = isDollar
                ? fmtDollarFull(value)
                : fmt(value);
              return label ? `${label}: ${formatted}` : formatted;
            },
          },
        };

    const isBar = type === 'bar';

    const defaultHover = {
      mode: 'nearest' as const,
      intersect: true,
    };

    const defaultElements = isBar
      ? {
          bar: {
            borderWidth: 0,
            borderSkipped: false as const,
          },
        }
      : {};

    const mergedOptions = {
      responsive: true,
      maintainAspectRatio: false,
      hover: defaultHover,
      elements: defaultElements,
      plugins: {
        legend: isDoughnutOrPie
          ? { display: true, position: 'right' as const, labels: { usePointStyle: true, pointStyle: 'circle', padding: 8, font: { size: 10 } } }
          : { display: false },
        datalabels: defaultDatalabels,
        tooltip: defaultTooltip,
      },
      ...(isDoughnutOrPie ? {
        layout: { padding: { top: 50, bottom: 50, left: 60, right: 60 } },
      } : {}),
      ...options,
    };

    // Deep-merge plugin options so page-level overrides extend rather than replace defaults
    const incomingPlugins = (options as ChartOptions)?.plugins || {};
    (mergedOptions as ChartOptions).plugins = {
      ...mergedOptions.plugins,
      ...incomingPlugins,
      datalabels: { ...defaultDatalabels, ...incomingPlugins.datalabels },
      tooltip: { ...defaultTooltip, ...incomingPlugins.tooltip, callbacks: { ...(defaultTooltip as ChartOptions).callbacks, ...incomingPlugins.tooltip?.callbacks } },
    };

    // Deep-merge hover and elements so page-level overrides extend defaults
    const incomingHover = (options as ChartOptions)?.hover || {};
    (mergedOptions as ChartOptions).hover = { ...defaultHover, ...incomingHover };

    const incomingElements = (options as ChartOptions)?.elements || {};
    (mergedOptions as ChartOptions).elements = {
      ...defaultElements,
      ...incomingElements,
      ...(isBar ? { bar: { ...(defaultElements as ChartOptions).bar, ...incomingElements.bar } } : {}),
    };

    chartRef.current = new Chart(canvasRef.current, {
      type,
      data: data as ChartData<keyof ChartTypeRegistry>,
      options: mergedOptions as ChartOptions,
      plugins,
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [type, data, options, plugins]);

  return (
    <div style={{ height, position: 'relative' }} role="img" aria-label={`${type} chart`}>
      <canvas ref={canvasRef} />
    </div>
  );
}
