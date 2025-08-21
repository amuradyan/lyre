export default function MarkdownTestCase({
  testResult,
  caption,
  showInput = true,
  showExpected = true
}) {
  if (!testResult) {
    return null;
  }

  const { passed, input, expected, actual, error } = testResult;

  // Determine colors based on pass/fail
  const bgColor = passed ? '#dcfce7' : '#fef2f2'; // green-100 : red-100
  const borderColor = passed ? '#16a34a' : '#dc2626'; // green-600 : red-600
  const textColor = passed ? '#15803d' : '#b91c1c'; // green-700 : red-700
  const statusIcon = passed ? '✓' : '✗';

  // Format values for display
  const formatValue = (val) => {
    if (val === null) return 'null';
    if (val === undefined) return 'undefined';
    if (typeof val === 'string') return `"${val}"`;
    return JSON.stringify(val);
  };

  // Interpolate caption with test values
  const interpolatedCaption = caption
    ?.replace('{input}', input !== undefined ? formatValue(input) : '')
    ?.replace('{expected}', formatValue(expected))
    ?.replace('{actual}', formatValue(actual))
    ?.replace('{key}', input !== undefined ? formatValue(input) : '')
    ?.replace('{value}', formatValue(expected));

  return (
    <div
      style={{
        padding: '8px 12px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: '13px',
        marginBottom: '4px'
      }}
    >
      {/* Status icon */}
      <span
        style={{
          color: textColor,
          fontWeight: 'bold',
          marginRight: '8px',
          minWidth: '16px'
        }}
      >
        {statusIcon}
      </span>

      {/* Caption or test details */}
      <div style={{ flex: 1, color: textColor }}>
        {interpolatedCaption ? (
          <span>{interpolatedCaption}</span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {showInput && input !== undefined && (
              <>
                <span>f({formatValue(input)})</span>
                <span>=</span>
              </>
            )}
            <span>{formatValue(actual)}</span>
            {showExpected && (
              <>
                <span style={{ color: passed ? textColor : '#6b7280' }}>
                  {passed ? '=' : '≠'}
                </span>
                <span>{formatValue(expected)}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error message if present */}
      {error && (
        <span style={{
          marginLeft: '8px',
          color: '#dc2626',
          fontSize: '11px',
          fontStyle: 'italic'
        }}>
          ({error})
        </span>
      )}
    </div>
  );
}
