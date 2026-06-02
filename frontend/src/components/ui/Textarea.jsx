export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full resize-y rounded border border-retro-border bg-retro-bg px-3 py-2 text-gray-100 placeholder:text-gray-500 focus:border-retro-accent focus:outline-none focus:ring-1 focus:ring-retro-accent ${className}`}
      {...props}
    />
  );
}

