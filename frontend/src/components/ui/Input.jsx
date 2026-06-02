export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded border border-retro-border bg-retro-bg px-3 py-2 text-gray-100 placeholder:text-gray-500 focus:border-retro-accent focus:outline-none focus:ring-1 focus:ring-retro-accent ${className}`}
      {...props}
    />
  );
}

