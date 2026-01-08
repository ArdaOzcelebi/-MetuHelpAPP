/**
 * Production-safe logger utility
 * Automatically disables logs in production builds
 */

const isDevelopment = __DEV__;

interface Logger {
  log: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

/**
 * Create a namespaced logger for a specific module
 * @param namespace - Module name to prefix all logs
 */
export function createLogger(namespace: string): Logger {
  const prefix = `[${namespace}]`;

  return {
    log: (...args: any[]) => {
      if (isDevelopment) {
        console.log(prefix, ...args);
      }
    },
    info: (...args: any[]) => {
      if (isDevelopment) {
        console.info(prefix, ...args);
      }
    },
    warn: (...args: any[]) => {
      if (isDevelopment) {
        console.warn(prefix, ...args);
      }
    },
    error: (...args: any[]) => {
      // Always log errors, even in production
      console.error(prefix, ...args);
    },
  };
}

// Default logger for general use
export const logger = createLogger("App");
