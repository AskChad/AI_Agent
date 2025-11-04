/**
 * Error Classes and Utilities
 *
 * Custom error classes for better error handling and logging.
 */

/**
 * Base application error
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'APP_ERROR',
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 422, details)
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Invalid or expired API key') {
    super(message, 'UNAUTHORIZED', 401)
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'FORBIDDEN', 403)
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`
    super(message, 'NOT_FOUND', 404)
  }
}

/**
 * Conflict error
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409)
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  constructor(public resetAt: Date) {
    super('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429, {
      reset_at: resetAt.toISOString(),
    })
  }
}

/**
 * External service error
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(
      `${service} error: ${message}`,
      'EXTERNAL_SERVICE_ERROR',
      502,
      details
    )
  }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'DATABASE_ERROR', 500, details)
  }
}

/**
 * Check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Convert unknown error to AppError
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'INTERNAL_ERROR', 500)
  }

  return new AppError('An unknown error occurred', 'INTERNAL_ERROR', 500)
}
