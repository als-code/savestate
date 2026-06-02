export function getCoverUrl(cover) {
  if (!cover) return null;
  const v = String(cover).trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  return `${import.meta.env.VITE_FILES_URL}/${v}`;
}

