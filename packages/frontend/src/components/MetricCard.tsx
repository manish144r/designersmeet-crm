interface Props {
  label: string;
  value: string | number;
  sub?: string;
}

export function MetricCard({ label, value, sub }: Props) {
  return (
    <div className="metric-card">
      <h3 className="text-[11px] uppercase tracking-widest text-textDim mb-1.5">{label}</h3>
      <div className="text-2xl font-bold text-textc">{value}</div>
      {sub && <div className="text-xs text-ice-dim mt-1">{sub}</div>}
    </div>
  );
}
