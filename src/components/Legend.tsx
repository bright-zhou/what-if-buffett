export function Legend() {
  const items = [
    { color: '#3b82f6', label: '巴菲特实际' },
    { color: '#64748b', label: '标普500' },
    { color: '#f59e0b', label: '你的假设' },
  ];
  return (
    <div style={{ display: 'flex', gap: 20, justifyContent: 'center', padding: '8px 0' }}>
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: item.color }} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
