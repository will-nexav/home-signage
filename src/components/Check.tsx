

interface CheckProps {
  done: boolean;
  size?: number;
  variant?: 'quest' | 'habit';
  onClick?: () => void;
}

export default function Check({ done, size = 22, variant = 'quest', onClick }: CheckProps) {
  const cls = done
    ? (variant === 'habit' ? 'chk chk-habit' : 'chk chk-done')
    : 'chk';

  return (
    <button
      className={cls}
      style={{ width: size, height: size, flexShrink: 0 }}
      onClick={onClick}
      type="button"
    >
      {done && (
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 12 12">
          <path d="M2 6l3 3 5-5" stroke="rgba(0,0,0,0.7)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
