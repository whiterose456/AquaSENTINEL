import type { MetricKey } from '@/types';

interface TimelineChartProps {
  data: { date: string; value: number }[];
  metric: MetricKey;
  baseline: number;
  unit: string;
  color?: string;
  height?: number;
}

const METRIC_COLORS: Record<string, string> = {
  dissolved_oxygen: '#22d3ee',
  temperature: '#f97316',
  ph: '#a78bfa',
  turbidity: '#facc15',
  conductivity: '#38bdf8',
  biodiversity_score: '#34d399',
};

export function TimelineChart({
  data,
  metric,
  baseline,
  unit,
  height = 120,
}: TimelineChartProps) {
  if (data.length === 0) return null;

  const color = METRIC_COLORS[metric] ?? '#22d3ee';
  const values = data.map((d) => d.value);
  const allValues = [...values, baseline];
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;
  const padding = range * 0.15;
  const chartMin = min - padding;
  const chartMax = max + padding;
  const chartRange = chartMax - chartMin;

  const width = 100;
  const chartHeight = height;
  const stepX = width / (data.length - 1 || 1);

  const points = data.map((d, i) => ({
    x: i * stepX,
    y: chartHeight - ((d.value - chartMin) / chartRange) * (chartHeight - 20) - 10,
    value: d.value,
    date: d.date,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');

  const areaD = `${pathD} L ${width} ${chartHeight} L 0 ${chartHeight} Z`;
  const baselineY = chartHeight - ((baseline - chartMin) / chartRange) * (chartHeight - 20) - 10;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${chartHeight}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: `${chartHeight}px` }}
      >
        <defs>
          <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Baseline line */}
        <line
          x1="0"
          y1={baselineY}
          x2={width}
          y2={baselineY}
          stroke="#475569"
          strokeWidth="0.3"
          strokeDasharray="2 2"
        />

        {/* Area fill */}
        <path d={areaD} fill={`url(#grad-${metric})`} />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="0.8"
            fill={color}
            stroke="#0a0f1a"
            strokeWidth="0.3"
          />
        ))}

        {/* Highlight last point */}
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="1.5"
            fill={color}
            opacity="0.5"
          />
        )}
      </svg>

      <div className="flex justify-between mt-1 px-0.5">
        {data.map((d, i) => (
          <span key={i} className="text-[8px] text-slate-600">
            {d.date}
          </span>
        ))}
      </div>
    </div>
  );
}

interface MetricRowProps {
  label: string;
  values: { date: string; value: number }[];
  baseline: number;
  unit: string;
  metric: MetricKey;
}

export function MetricTimeline({ label, values, baseline, unit, metric }: MetricRowProps) {
  const latest = values[values.length - 1]?.value ?? 0;
  const first = values[0]?.value ?? 0;
  const change = latest - first;
  const changePercent = first ? ((change / first) * 100).toFixed(0) : '0';
  const isDecrease = change < 0;

  return (
    <div className="glass rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
          <p className="text-lg font-bold text-white mt-0.5">
            {latest}
            <span className="text-xs text-slate-500 ml-1">{unit}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500">vs baseline</p>
          <p
            className={`text-sm font-semibold ${
              isDecrease ? 'text-red-400' : 'text-orange-400'
            }`}
          >
            {isDecrease ? '' : '+'}
            {changePercent}%
          </p>
        </div>
      </div>
      <TimelineChart data={values} metric={metric} baseline={baseline} unit={unit} />
    </div>
  );
}
