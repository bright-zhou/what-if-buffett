interface StatCardProps {
  title: string;
  values: [number, number, number];
  formatter: (v: number) => string;
  labels: [string, string, string];
  deltaFormatted?: string;
  deltaSign?: number;
}

export function StatCard({ title, values, formatter, labels, deltaFormatted, deltaSign }: StatCardProps) {
  const showDelta = deltaFormatted && deltaSign !== undefined && deltaSign !== 0;

  return (
    <div style={{
      background: '#1e293b', borderRadius: 8, padding: 12,
      flex: 1,
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>
      <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {values.map((v, i) => {
          const isUser = i === 2;
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>{labels[i]}</span>
              <span style={{
                fontSize: 15, fontWeight: 700,
                color: ['#64748b', '#3b82f6', '#f59e0b'][i],
                display: 'flex', alignItems: 'baseline', gap: 4,
              }}>
                {formatter(v)}
                {isUser && showDelta && (
                  <span style={{
                    color: deltaSign! > 0 ? '#22c55e' : '#ef4444',
                    fontSize: 11,
                    fontWeight: 600,
                    animation: deltaSign! > 0 ? 'pulseGreen 0.4s ease' : 'pulseRed 0.4s ease',
                  }}>
                    {deltaSign! > 0 ? '▲' : '▼'}{deltaFormatted}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
