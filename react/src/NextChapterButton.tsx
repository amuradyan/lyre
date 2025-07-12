interface NextChapterButtonProps {
  allTestsPassed: boolean;
}

export default function NextChapterButton({ allTestsPassed }: NextChapterButtonProps) {
  const handleClick = () => {
    if (allTestsPassed) {
      alert('Congratulations! Moving to next chapter...');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center font-semibold transition-all duration-200"
      style={{
        gap: '8px',
        marginTop: '24px',
        padding: '12px 24px',
        background: allTestsPassed ? '#2563eb' : '#f3f4f6',
        border: 'none',
        color: allTestsPassed ? 'white' : '#9ca3af',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 600,
        cursor: allTestsPassed ? 'pointer' : 'not-allowed'
      }}
      onMouseEnter={(e) => {
        if (allTestsPassed) {
          e.currentTarget.style.background = '#1d4ed8';
        }
      }}
      onMouseLeave={(e) => {
        if (allTestsPassed) {
          e.currentTarget.style.background = '#2563eb';
        }
      }}
      disabled={!allTestsPassed}
    >
      Next Chapter
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
        <path d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
