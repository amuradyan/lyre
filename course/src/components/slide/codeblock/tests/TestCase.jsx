export default function TestCase({
  input,
  inputLabel,
  expected,
  actual,
  passed,
  error,
  message,
  color,
  functionName
}) {
  const displayColor = color || (error ? '#f85149' : (passed ? '#2ea043' : '#f85149'));

  const formatValue = (val) => {
    if (val === null) return 'null';
    if (val === undefined) return 'undefined';
    if (typeof val === 'string') return `"${val}"`;
    if (typeof val === 'number' && Math.abs(val) < 1e-10) return '0';
    if (Array.isArray(val)) return `[${val.map(formatValue).join(', ')}]`;
    return JSON.stringify(val);
  };

  let displayMessage;
  if (message) {
    displayMessage = message;
  } else if (error) {
    displayMessage = `Error: ${error}`;
  } else {
    const actualPart = actual !== undefined ? formatValue(actual) : '?';
    const expectedPart = expected !== undefined ? formatValue(expected) : '';
    const comparison = passed ? '=' : '≠';

    if (expectedPart) {
      displayMessage = `${actualPart} ${comparison} ${expectedPart}`;
    } else {
      displayMessage = actualPart;
    }
  }

  const formatInputs = (input) => {
    if (Array.isArray(input)) {
      return input.map(formatValue).join(', ');
    }
    return formatValue(input);
  };

  const fnName = functionName || 'f';
  const inputDisplay = inputLabel || (input !== undefined ? `${fnName}(${formatInputs(input)}):` : '');
  const inputWidth = inputDisplay ? Math.max(inputDisplay.length * 8 + 20, 60) : 0;

  return (
    <div style={{
      padding: '8px 0',
      background: '#f1f3f4',
      display: 'flex',
      alignItems: 'center',
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: '13px'
    }}>
      {inputDisplay && (
        <span style={{
          textAlign: 'center',
          padding: '0 10px',
          whiteSpace: 'nowrap',
          width: `${inputWidth}px`,
          display: 'inline-block',
          color: displayColor,
        }}>
          {inputDisplay}
        </span>
      )}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        textAlign: 'center'
      }}>
        <span style={{ color: displayColor }}>{displayMessage}</span>
      </div>
    </div>
  );
}
