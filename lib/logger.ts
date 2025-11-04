/**
 * Logger Utility
 *
 * Simple logging utility with timestamps and context.
 * Replace with more sophisticated logging (e.g., Winston, Pino) in production.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatMessage(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    const contextStr = context ? `\n${JSON.stringify(context, null, 2)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  info(message: string, context?: LogContext) {
    console.log(this.formatMessage('info', message, context))
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context))
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = error instanceof Error
      ? { ...context, error: error.message, stack: error.stack }
      : { ...context, error }

    console.error(this.formatMessage('error', message, errorContext))
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context))
    }
  }

  /**
   * Log function execution time
   */
  async timeAsync<T>(
    label: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now()
    try {
      const result = await fn()
      const duration = Date.now() - start
      this.debug(`${label} completed in ${duration}ms`)
      return result
    } catch (error) {
      const duration = Date.now() - start
      this.error(`${label} failed after ${duration}ms`, error)
      throw error
    }
  }
}

export const logger = new Logger()
