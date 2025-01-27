export function extractSizeFromUrl(url: string): { size: string; baseId: string } | null {
  const match = url.match(/\/([^/]+)-(\d+)_([^/.]+)\./);
  if (!match) return null;
  return {
    baseId: match[1],
    size: match[2]
  };
} 