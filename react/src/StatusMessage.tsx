interface StatusMessageProps {
  allTestsPassed: boolean;
}

export default function StatusMessage({ allTestsPassed }: StatusMessageProps) {
  return (
    <div style={{
      fontSize: '0.875rem',
      color: '#6b7280',
      marginTop: '8px'
    }}>
      {allTestsPassed
        ? 'All tests passed! You can proceed to the next chapter.'
        : 'Complete all tests to unlock the next chapter'
      }
    </div>
  );
}
