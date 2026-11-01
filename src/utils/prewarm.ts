// Safe pre-warming utility for cloud container apps (Railway, Replit)
// Uses mode: 'no-cors' so that the container begins waking up when user hovers or inspects
const prewarmedUrls = new Set<string>();

export function prewarmUrl(url?: string): void {
  if (!url || typeof window === 'undefined') return;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return;
  if (prewarmedUrls.has(url)) return;

  prewarmedUrls.add(url);
  try {
    fetch(url, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
      credentials: 'omit',
    }).catch(() => {
      // Ignore background pre-warm network errors
    });
  } catch {
    // Ignore fetch creation errors
  }
}
