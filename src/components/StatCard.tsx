interface StatCardProps {
  title: string;
  values: [number, number, number];
  formatter: (v: number) => string;
  labels?: [string, string, string];
}

export function StatCard({ title, values, formatter, labels }: StatCardProps) {
  const defaultLabels: [string, string, string] = ['巴菲特', '标普500', '你的假设'];
  const usedLabels = labels ?? defaultLabels;
  return (
    <div style={{
      background: '#1e293b', borderRadius: 10, padding: 16, flex: 1, minWidth: 200,
    }}>
      <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', gap: 16 }}>
        {values.map((v, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: ['#3b82f6', '#64748b', '#f59e0b'][i] }}>
              {formatter(v)}
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              {usedLabels[i]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
