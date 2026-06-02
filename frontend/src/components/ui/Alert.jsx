export function Alert({ variant = 'error', className = '', children }) {
  const variants = {
    error: 'border-retro-danger/50 bg-retro-danger/10 text-red-200',
    warning: 'border-retro-warning/50 bg-retro-warning/10 text-yellow-100',
    info: 'border-retro-border/80 bg-retro-surface/70 text-gray-100 backdrop-blur',
  };

  return (
    <div className={`rounded-card border px-4 py-3 text-sm shadow-soft ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

