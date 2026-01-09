export default function PlayIcon({ color = 'currentColor', size = 16, className = '', onClick, title, onMouseEnter, onMouseLeave }) {
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
      <path
        d="M4 2.5 L4 13.5 L13 8 Z"
        fill={color}
      />
    </svg>
  );
}
