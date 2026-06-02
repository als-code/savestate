export function Badge({ tone = 'neutral', className = '', children }) {
  const tones = {
    neutral: 'bg-gray-600/30 text-gray-200',
    pending: 'bg-gray-600/30 text-gray-200',
    playing: 'bg-blue-600/30 text-blue-200',
    tested: 'bg-violet-600/25 text-violet-200',
    completed: 'bg-emerald-600/30 text-emerald-200',
    abandoned: 'bg-retro-danger/20 text-red-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${tones[tone] || tones.neutral} ${className}`}
    >
      {children}
    </span>
  );
}

