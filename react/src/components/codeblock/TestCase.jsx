export default function TestCase({ test, message, color = '#6e7681' }) {
  return (
    <div style={{
      padding: '8px 0', background: '#f6f8fa', display: 'flex', alignItems: 'center',
      fontFamily: 'IBM Plex Mono, monospace', fontSize: '13px'
    }}>
      <span style={{ textAlign: 'center', padding: '0 10px', whiteSpace: 'nowrap', width: `${test.n}!`.length * 8 + 'px', display: 'inline-block', color }}>
        {test.n}!
      </span>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center' }}>
        <span style={{ color }}>{message}</span>
      </div>
    </div>
  );
}
