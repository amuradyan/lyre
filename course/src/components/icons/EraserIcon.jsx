export default function EraserIcon({ color = 'currentColor', size = 16, className = '', onClick, title }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
      title={title}
    >
      <path d="M8 5L14 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
      <path d="M10 8L15 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <path d="M9 11L14 11" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
      <rect x="1" y="3" width="7" height="10" rx="1" fill={color} transform="rotate(-8 4.5 8)" />
    </svg>
  );
}
