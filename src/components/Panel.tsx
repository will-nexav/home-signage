

interface PanelProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export default function Panel({ children, style, className }: PanelProps) {
  return (
    <div
      className={className}
      style={{
        border: '1px solid rgba(201,168,107,0.18)',
        borderRadius: 14,
        background: 'linear-gradient(160deg,#1e1710 0%,#14100b 80%)',
        boxShadow: 'inset 0 1px 0 rgba(236,212,155,0.05), 0 4px 24px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
