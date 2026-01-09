export default function PauseIcon({ color = 'currentColor', size = 16, className = '', onClick, title, onMouseEnter, onMouseLeave }) {
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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <rect x="4" y="3" width="3" height="10" fill={color} />
      <rect x="9" y="3" width="3" height="10" fill={color} />
    </svg>
  );
}
