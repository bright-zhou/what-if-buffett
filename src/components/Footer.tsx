interface FooterProps { onReset: () => void }

export function Footer({ onReset }: FooterProps) {
  return (
    <footer style={{ textAlign: 'center', padding: '16px 0', color: '#64748b', fontSize: 12 }}>
      <button onClick={onReset} style={{
        background: '#334155', color: '#e2e8f0', border: 'none',
        padding: '8px 20px', borderRadius: 6, cursor: 'pointer', marginBottom: 12,
      }}>
        重置为巴菲特实际值
      </button>
      <p style={{ margin: 0 }}>数据来源: Berkshire Hathaway Annual Reports (1965-2025)</p>
      <p style={{ margin: '4px 0 0' }}>
        "投资第一条规则：不要亏钱。第二条规则：永远记住第一条。" — Warren Buffett
      </p>
    </footer>
  );
}
