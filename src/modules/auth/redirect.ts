// src/modules/auth/redirect.ts

/**
 * Validates that a redirect path is strictly same-origin and safe.
 * Rejects protocol-relative URLs (//evil.com), backslash escapes (/\\evil.com),
 * cross-origin targets, and self-referencing login loops.
 */
export function isSafeRedirect(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;

  // Must start with a single forward slash, and not double slash or backslash
  if (!url.startsWith('/') || url.startsWith('//') || url.startsWith('/\\')) {
    return false;
  }

  try {
    const parsed = new URL(url, window.location.origin);
    // Must be strictly same origin
    if (parsed.origin !== window.location.origin) {
      return false;
    }
    // Disallow redirecting back to /login to prevent infinite loops
    if (parsed.pathname === '/login') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
