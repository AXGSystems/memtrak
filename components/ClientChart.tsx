'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables, type ChartData, type ChartTypeRegistry, type Plugin } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables, ChartDataLabels);

// Dark theme defaults
Chart.defaults.font.family = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.color = '#8899aa';
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(10, 22, 40, 0.95)';
Chart.defaults.plugins.tooltip.titleFont = { size: 13, weight: 'bold' };
Chart.defaults.plugins.tooltip.titleColor = '#e2e8f0';
Chart.defaults.plugins.tooltip.bodyFont = { size: 12 };
Chart.defaults.plugins.tooltip.bodyColor = '#c0cad8';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.15)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.cornerRadius = 10;
Chart.defaults.plugins.tooltip.padding = 14;
Chart.defaults.plugins.tooltip.displayColors = true;
Chart.defaults.plugins.tooltip.boxPadding = 4;
Chart.defaults.plugins.tooltip.caretSize = 6;

/* eslint-disable @typescript-eslint/no-explicit-any */
type ChartOptions = Record<string, any>;

interface Props {
  type: 'bar' | 'doughnut' | 'line' | 'pie' | 'bubble' | 'scatter' | 'radar';
  data: object;
  options?: ChartOptions;
  plugins?: Plugin[];
  height?: number;
  onPointClick?: (label: string, value: number, datasetLabel: string) => void;
}

export default function ClientChart({ type, data, options = {}, plugins = [], height = 300, onPointClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const isDoughnutOrPie = type === 'doughnut' || type === 'pie';

    // For doughnuts: disable datalabels entirely (use legend instead), clean look
    const defaultDatalabels = isDoughnutOrPie
      ? { display: false }
      : { display: false };

    const defaultTooltip = isDoughnutOrPie
      ? {
          callbacks: {
            label: (ctx: any) => {
              const dataset = ctx.chart.data.datasets[ctx.datasetIndex];
              const total = (dataset.data as number[]).reduce((sum: number, v: number) => sum + v, 0);
              const value = ctx.raw as number;
              const pct = ((value / total) * 100).toFixed(1);
              return `${ctx.label}: ${value.toLocaleString()} (${pct}%)`;
            },
          },
        }
      : {};

    const mergedOptions: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: isDoughnutOrPie
          ? { display: true, position: 'bottom' as const, labels: { color: '#8899aa', usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 11 } } }
          : { display: false },
        datalabels: defaultDatalabels,
        tooltip: defaultTooltip,
      },
      ...(isDoughnutOrPie ? {
        layout: { padding: { top: 10, bottom: 10, left: 10, right: 10 } },
        cutout: '60%',
      } : {}),
      ...options,
    };

    // Deep-merge plugin options
    const incomingPlugins = (options as ChartOptions)?.plugins || {};
    (mergedOptions as ChartOptions).plugins = {
      ...mergedOptions.plugins,
      ...incomingPlugins,
      datalabels: { ...defaultDatalabels, ...incomingPlugins.datalabels },
      tooltip: { ...defaultTooltip, ...incomingPlugins.tooltip, callbacks: { ...(defaultTooltip as ChartOptions).callbacks, ...incomingPlugins.tooltip?.callbacks } },
    };

    // Deep-merge scales for dark grid
    if (!isDoughnutOrPie && !options.scales) {
      (mergedOptions as ChartOptions).scales = {
        y: { grid: { color: '#1e3350' }, ticks: { color: '#8899aa' } },
        x: { grid: { display: false }, ticks: { color: '#8899aa' } },
      };
    }

    const chart = new Chart(canvasRef.current, {
      type,
      data: data as ChartData<keyof ChartTypeRegistry>,
      options: mergedOptions as ChartOptions,
      plugins,
    });

    chartRef.current = chart;

    // Click handler
    if (onPointClick) {
      const handler = (event: MouseEvent) => {
        const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
        if (elements.length > 0) {
          const el = elements[0];
          const dsLabel = chart.data.datasets[el.datasetIndex]?.label || '';
          const label = String(chart.data.labels?.[el.index] || '');
          const value = (chart.data.datasets[el.datasetIndex]?.data[el.index] as number) || 0;
          onPointClick(label, value, dsLabel);
        }
      };
      canvasRef.current.addEventListener('click', handler);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [type, data, options, plugins, onPointClick]);

  return (
    <div style={{ height, position: 'relative', width: '100%' }} role="img" aria-label={`${type} chart`}>
      <canvas ref={canvasRef} style={{ cursor: onPointClick ? 'pointer' : 'default' }} />
    </div>
  );
}
