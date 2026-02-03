export function sanitizeTextInput(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }

  return text
    // Remove null bytes and control characters (except newlines and tabs)
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Trim leading/trailing whitespace
    .trim();
}

/**
 * Validates that text contains reasonable content
 * Checks for suspicious patterns that might indicate abuse
 */
export function validateTextContent(text: string): { valid: boolean; reason?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, reason: 'Text cannot be empty' };
  }

  // Check for extremely long words (potential DoS)
  const words = text.split(/\s+/);
  const maxWordLength = 100;
  for (const word of words) {
    if (word.length > maxWordLength) {
      return { valid: false, reason: `Word exceeds maximum length of ${maxWordLength} characters` };
    }
  }

  // Check for excessive repetition (potential spam/DoS)
  const repetitionPattern = /(.{10,})\1{5,}/;
  if (repetitionPattern.test(text)) {
    return { valid: false, reason: 'Text contains excessive repetition' };
  }

  // Check for reasonable character diversity (avoid single character spam)
  if (text.length > 100) {
    const uniqueChars = new Set(text.toLowerCase().replace(/\s/g, '')).size;
    const diversityRatio = uniqueChars / text.length;
    if (diversityRatio < 0.1) {
      return { valid: false, reason: 'Text lacks sufficient character diversity' };
    }
  }

  return { valid: true };
}

/**
 * Rate limiting helper using localStorage
 * Tracks request timestamps to prevent abuse
 */
class RateLimiter {
  private readonly key = 'resume_analyzer_rate_limit';
  private readonly maxRequests = 10;
  private readonly windowMs = 60 * 1000; // 1 minute

  canMakeRequest(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return true; // Server-side or no storage, allow
    }

    try {
      const stored = localStorage.getItem(this.key);
      if (!stored) {
        return true;
      }

      const timestamps: number[] = JSON.parse(stored);
      const now = Date.now();
      
      // Filter out timestamps outside the time window
      const recentRequests = timestamps.filter(
        (timestamp) => now - timestamp < this.windowMs
      );

      if (recentRequests.length >= this.maxRequests) {
        return false;
      }

      // Update storage with recent requests
      localStorage.setItem(this.key, JSON.stringify(recentRequests));
      return true;
    } catch {
      // If storage fails, allow request (fail open)
      return true;
    }
  }

  recordRequest(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    try {
      const stored = localStorage.getItem(this.key);
      const timestamps: number[] = stored ? JSON.parse(stored) : [];
      const now = Date.now();

      // Add current timestamp
      timestamps.push(now);

      // Keep only recent timestamps
      const recentRequests = timestamps.filter(
        (timestamp) => now - timestamp < this.windowMs
      );

      localStorage.setItem(this.key, JSON.stringify(recentRequests));
    } catch {
      // Silently fail - rate limiting is best effort
    }
  }

  getRemainingRequests(): number {
    if (typeof window === 'undefined' || !window.localStorage) {
      return this.maxRequests;
    }

    try {
      const stored = localStorage.getItem(this.key);
      if (!stored) {
        return this.maxRequests;
      }

      const timestamps: number[] = JSON.parse(stored);
      const now = Date.now();
      const recentRequests = timestamps.filter(
        (timestamp) => now - timestamp < this.windowMs
      );

      return Math.max(0, this.maxRequests - recentRequests.length);
    } catch {
      return this.maxRequests;
    }
  }

  getTimeUntilReset(): number {
    if (typeof window === 'undefined' || !window.localStorage) {
      return 0;
    }

    try {
      const stored = localStorage.getItem(this.key);
      if (!stored) {
        return 0;
      }

      const timestamps: number[] = JSON.parse(stored);
      if (timestamps.length === 0) {
        return 0;
      }

      const oldestRequest = Math.min(...timestamps);
      const resetTime = oldestRequest + this.windowMs;
      const now = Date.now();

      return Math.max(0, resetTime - now);
    } catch {
      return 0;
    }
  }
}

export const rateLimiter = new RateLimiter();
