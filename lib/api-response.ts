/**
 * API Response Helpers
 *
 * Standardized response formatters for API endpoints.
 * Follows the format specified in API_ENDPOINTS.md
 */

import { NextResponse } from 'next/server'

interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  meta?: {
    timestamp: string
    request_id?: string
  }
}

interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    timestamp: string
    request_id?: string
  }
}

interface PaginationMeta {
  page: number
  per_page: number
  total_pages: number
  total_count: number
  has_more: boolean
  next_page?: number
}

interface ApiPaginatedResponse<T = any> {
  success: true
  data: T[]
  pagination: PaginationMeta
  meta?: {
    timestamp: string
    request_id?: string
  }
}

/**
 * Success response
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  )
}

/**
 * Paginated success response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  status: number = 200
): NextResponse<ApiPaginatedResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      pagination,
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  )
}

/**
 * Error response
 */
export function errorResponse(
  code: string,
  message: string,
  details?: any,
  status: number = 400
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  )
}

/**
 * Common error responses
 */
export const ApiError = {
  unauthorized: (message = 'Invalid or expired API key') =>
    errorResponse('UNAUTHORIZED', message, undefined, 401),

  forbidden: (message = 'Insufficient permissions for this operation') =>
    errorResponse('FORBIDDEN', message, undefined, 403),

  notFound: (resource = 'Resource', id?: string) =>
    errorResponse(
      'NOT_FOUND',
      id ? `${resource} with id '${id}' not found` : `${resource} not found`,
      undefined,
      404
    ),

  invalidParameters: (message: string, details?: any) =>
    errorResponse('INVALID_PARAMETERS', message, details, 400),

  validationError: (errors: any[]) =>
    errorResponse('VALIDATION_ERROR', 'Validation failed', { errors }, 422),

  conflict: (message: string) =>
    errorResponse('CONFLICT', message, undefined, 409),

  rateLimitExceeded: (resetAt: Date) =>
    errorResponse(
      'RATE_LIMIT_EXCEEDED',
      'Rate limit exceeded. Retry after the reset time.',
      { reset_at: resetAt.toISOString() },
      429
    ),

  internalError: (message = 'An internal error occurred') =>
    errorResponse('INTERNAL_ERROR', message, undefined, 500),

  serviceUnavailable: (message = 'Service temporarily unavailable') =>
    errorResponse('SERVICE_UNAVAILABLE', message, undefined, 503),
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  page: number,
  perPage: number,
  totalCount: number
): PaginationMeta {
  const totalPages = Math.ceil(totalCount / perPage)
  const hasMore = page < totalPages

  return {
    page,
    per_page: perPage,
    total_pages: totalPages,
    total_count: totalCount,
    has_more: hasMore,
    ...(hasMore && { next_page: page + 1 }),
  }
}
