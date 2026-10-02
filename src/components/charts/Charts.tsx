import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCompactCurrency, formatCurrency } from '@/utils/format';

const AXIS = { stroke: '#52525b', fontSize: 11, tickLine: false, axisLine: false } as const;
const GRID = <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />;

interface TipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color?: string; payload: Record<string, unknown> }>;
  label?: string;
  money?: boolean;
  suffix?: string;
}
function ChartTooltip({ active, payload, label, money, suffix }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-ink-950/95 px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-semibold text-white">{label}</p>
      {payload
        .filter((p) => p.value)
        .map((p) => (
          <p key={p.name} className="text-zinc-300">
            <span className="mr-1.5 inline-block size-2 rounded-full" style={{ background: p.color ?? '#e11d2e' }} />
            {money ? formatCurrency(p.value) : `${p.value}${suffix ?? ''}`}
          </p>
        ))}
    </div>
  );
}

export function MovementChart({ data }: { data: { hour: string; value: number; peak: boolean }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        {GRID}
        <XAxis dataKey="hour" {...AXIS} />
        <YAxis {...AXIS} />
        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<ChartTooltip suffix=" acessos" />} />
        <Bar dataKey="value" name="Acessos" radius={[6, 6, 0, 0]} maxBarSize={42}>
          {data.map((d) => (
            <Cell key={d.hour} fill={d.peak ? '#e11d2e' : '#3f3f46'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function NewStudentsChart({ data }: { data: { month: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gNew" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e11d2e" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#e11d2e" stopOpacity={0} />
          </linearGradient>
        </defs>
        {GRID}
        <XAxis dataKey="month" {...AXIS} />
        <YAxis {...AXIS} />
        <Tooltip content={<ChartTooltip suffix=" novos alunos" />} />
        <Area type="monotone" dataKey="value" name="Novos" stroke="#e11d2e" strokeWidth={2.5} fill="url(#gNew)" dot={{ r: 3, fill: '#e11d2e', strokeWidth: 0 }} activeDot={{ r: 5 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RevenueChart({ data }: { data: { month: string; receita: number; projecao: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        {GRID}
        <XAxis dataKey="month" {...AXIS} />
        <YAxis {...AXIS} tickFormatter={(v: number) => formatCompactCurrency(v)} width={60} />
        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<ChartTooltip money />} />
        <Bar dataKey="receita" name="Receita" stackId="a" fill="#e11d2e" radius={[6, 6, 0, 0]} maxBarSize={38} />
        <Bar dataKey="projecao" name="Projeção" stackId="a" fill="#3f3f46" radius={[6, 6, 0, 0]} maxBarSize={38} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const PIE_COLORS = ['#e11d2e', '#f4f4f5', '#71717a', '#3f3f46'];

export function MethodDonut({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative size-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={3} stroke="none">
              {data.map((d, i) => (
                <Cell key={d.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip money />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] tracking-widest text-zinc-500 uppercase">Total</span>
          <span className="font-display text-lg font-semibold text-white">{formatCompactCurrency(total)}</span>
        </div>
      </div>
      <ul className="w-full space-y-3">
        {data.map((d, i) => (
          <li key={d.name}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-zinc-300">
                <span className="size-2.5 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {d.name}
              </span>
              <span className="font-semibold text-white tabular-nums">{formatCurrency(d.value)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full" style={{ width: `${(d.value / total) * 100}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
