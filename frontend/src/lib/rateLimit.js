/**
 * Debounce: Delays the execution of a function until after a specified wait time 
 * has elapsed since it was last called. Useful for search, form submissions.
 * @param {Function} func - The function to debounce
 * @param {number} delayMs - Delay in milliseconds (default: 300)
 * @returns {Function} - Debounced function
 */
export function debounce(func, delayMs = 300) {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delayMs);
  };
}

/**
 * Throttle: Ensures a function is called at most once every specified interval.
 * Useful for scroll events, window resize, or rapid button clicks.
 * @param {Function} func - The function to throttle
 * @param {number} intervalMs - Interval in milliseconds (default: 1000)
 * @returns {Function} - Throttled function
 */
export function throttle(func, intervalMs = 1000) {
  let lastCallTime = 0;
  return function throttled(...args) {
    const now = Date.now();
    if (now - lastCallTime >= intervalMs) {
      lastCallTime = now;
      func(...args);
    }
  };
}

/**
 * Debounced async function wrapper: prevents rapid repeated API calls.
 * Useful for form submissions, search API calls.
 * @param {Function} asyncFunc - Async function to debounce
 * @param {number} delayMs - Delay in milliseconds (default: 300)
 * @returns {Function} - Debounced async function
 */
export function debounceAsync(asyncFunc, delayMs = 300) {
  let timeoutId;
  let lastPromise = null;

  return async function debouncedAsync(...args) {
    clearTimeout(timeoutId);
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          lastPromise = asyncFunc(...args);
          const result = await lastPromise;
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delayMs);
    });
  };
}

/**
 * Simple rate limiter: Allows function to be called at most N times per interval.
 * @param {Function} func - Function to rate limit
 * @param {number} maxCalls - Maximum number of calls (default: 1)
 * @param {number} intervalMs - Time window in milliseconds (default: 1000)
 * @returns {Function} - Rate-limited function
 */
export function rateLimit(func, maxCalls = 1, intervalMs = 1000) {
  let callCount = 0;
  let windowStart = Date.now();

  return function rateLimited(...args) {
    const now = Date.now();

    // Reset window if interval has passed
    if (now - windowStart >= intervalMs) {
      callCount = 0;
      windowStart = now;
    }

    // Execute if under limit
    if (callCount < maxCalls) {
      callCount++;
      return func(...args);
    }

    // Otherwise, return undefined or reject
    return undefined;
  };
}

/**
 * Create a request deduplicator: If a request is pending, return existing promise 
 * instead of making a new one.
 * @param {Function} asyncFunc - Async function to deduplicate
 * @returns {Function} - Deduplicated async function
 */
export function deduplicate(asyncFunc) {
  const pendingRequests = new Map();

  return async function deduplicated(...args) {
    const key = JSON.stringify(args); // Simple cache key

    // If already pending, return existing promise
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key);
    }

    // Create and cache the promise
    const promise = asyncFunc(...args)
      .finally(() => {
        // Remove from cache after completion
        pendingRequests.delete(key);
      });

    pendingRequests.set(key, promise);
    return promise;
  };
}
