/**
 * Cloudflare Pages Error Handler
 * Handles errors gracefully and reports them appropriately
 */

export interface ErrorContext {
  component?: string;
  operation?: string;
  severity?: 'critical' | 'warning' | 'info';
  timestamp?: Date;
}

export class CloudflareError extends Error {
  public context: ErrorContext;
  public statusCode: number;

  constructor(message: string, statusCode: number = 500, context: ErrorContext = {}) {
    super(message);
    this.statusCode = statusCode;
    this.context = {
      timestamp: new Date(),
      severity: 'warning',
      ...context,
    };
    this.name = 'CloudflareError';
  }
}

// Global error handler
export const handleError = (error: unknown, context?: ErrorContext): void => {
  const errorContext = {
    timestamp: new Date().toISOString(),
    ...context,
  };

  if (error instanceof Error) {
    console.error(`[CloudflareError] ${error.message}`, {
      stack: error.stack,
      context: errorContext,
    });
  } else {
    console.error('[CloudflareError] Unknown error', {
      error,
      context: errorContext,
    });
  }

  // In production, you might want to send to error tracking service
  if (import.meta.env.VITE_ENVIRONMENT === 'production') {
    reportErrorToTracking(error, errorContext);
  }
};

// Report error to tracking service (Sentry, etc.)
const reportErrorToTracking = (error: unknown, context: ErrorContext): void => {
  // Placeholder for error tracking integration
  // Example: Sentry.captureException(error, { extra: context });
  try {
    // Send to your error tracking endpoint
    const errorData = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    // Beacon API for error reporting (works even on page unload)
    navigator.sendBeacon('/api/errors', JSON.stringify(errorData));
  } catch (e) {
    console.error('[CloudflareError] Failed to report error', e);
  }
};

// Handle fetch errors with retry logic
export const fetchWithRetry = async (
  url: string,
  options?: RequestInit,
  retries: number = 3,
): Promise<Response> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok && attempt < retries) {
        // Retry on non-2xx responses
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
        continue;
      }
      
      return response;
    } catch (error) {
      if (attempt === retries) {
        throw new CloudflareError(
          `Failed to fetch ${url} after ${retries} attempts`,
          503,
          { operation: 'fetchWithRetry', component: 'CloudflareErrorHandler' },
        );
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
    }
  }

  throw new CloudflareError('Fetch retry exhausted', 503);
};

// Global error event listener
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    handleError(event.error, {
      component: 'GlobalErrorHandler',
      operation: 'uncaughtError',
      severity: 'critical',
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    handleError(event.reason, {
      component: 'GlobalErrorHandler',
      operation: 'unhandledRejection',
      severity: 'critical',
    });
  });
}

export default {
  CloudflareError,
  handleError,
  fetchWithRetry,
};
