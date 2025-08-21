import MarkdownTestCase from './MarkdownTestCase.jsx';

export default function MarkdownTestResults({ testResult, caption }) {
  if (!testResult) {
    return null;
  }

  // Handle evaluation errors
  if (!testResult.success && testResult.error) {
    return (
      <div style={{
        marginTop: '8px',
        padding: '12px',
        background: '#fef2f2',
        border: '1px solid #dc2626',
        borderRadius: '4px',
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: '13px',
        color: '#b91c1c'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Test Error</div>
        <div>{testResult.error}</div>
      </div>
    );
  }

  // Handle "no test" case
  if (testResult.message) {
    return (
      <div style={{
        marginTop: '8px',
        padding: '8px',
        background: '#f3f4f6',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        {testResult.message}
      </div>
    );
  }

  const { results, type, success } = testResult;

  // Overall status header
  const statusColor = success ? '#15803d' : '#b91c1c';
  const statusBg = success ? '#dcfce7' : '#fef2f2';

  return (
    <div style={{ marginTop: '8px' }}>
      {/* Overall status */}
      <div style={{
        padding: '4px 8px',
        background: statusBg,
        borderRadius: '4px 4px 0 0',
        fontSize: '12px',
        fontWeight: 'bold',
        color: statusColor,
        textAlign: 'center'
      }}>
        {type === 'function' ? 'Function Tests' : 'Value Test'} {success ? '✓' : '✗'}
      </div>

      {/* Individual test cases */}
      <div style={{
        border: `1px solid ${success ? '#16a34a' : '#dc2626'}`,
        borderTop: 'none',
        borderRadius: '0 0 4px 4px',
        padding: '8px'
      }}>
        {results.map((result, i) => {
          let testCaption = caption;

          // Generate default captions if none provided
          if (!testCaption) {
            if (type === 'function') {
              testCaption = 'f({input}) should return {expected}';
            } else {
              testCaption = 'Should equal {expected}';
            }
          }

          return (
            <MarkdownTestCase
              key={i}
              testResult={result}
              caption={testCaption}
              showInput={type === 'function'}
              showExpected={true}
            />
          );
        })}
      </div>
    </div>
  );
}
