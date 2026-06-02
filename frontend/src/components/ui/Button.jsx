export function Button({ variant = 'primary', className = '', children, ...props }) {
  const variants = {
    primary: 'bg-retro-accent text-retro-bg hover:bg-retro-accent-muted',
    secondary:
      'border border-retro-border/80 bg-retro-surface/70 backdrop-blur hover:border-retro-accent/60 hover:bg-retro-surface',
    danger: 'bg-retro-danger text-white hover:opacity-90',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-card px-4 py-2 text-sm font-medium shadow-soft transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

