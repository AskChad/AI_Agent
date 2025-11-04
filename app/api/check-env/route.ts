/**
 * Environment Check API Route
 *
 * Validates environment variables and reports status.
 * Visit: http://localhost:3000/api/check-env
 */

import { NextResponse } from 'next/server'
import { validateEnvironment, getEnvironmentInfo } from '@/lib/validate-env'
import { successResponse, errorResponse } from '@/lib/api-response'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    logger.info('Checking environment configuration...')

    const validation = validateEnvironment()
    const envInfo = getEnvironmentInfo()

    if (!validation.valid) {
      return errorResponse(
        'INVALID_CONFIGURATION',
        'Missing required environment variables',
        {
          missing: validation.missing,
          warnings: validation.warnings,
        },
        500
      )
    }

    return successResponse({
      status: 'valid',
      message: 'All required environment variables are set',
      environment: envInfo,
      warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
    })
  } catch (error) {
    logger.error('Environment check failed', error)

    return errorResponse(
      'INTERNAL_ERROR',
      'Failed to check environment',
      error instanceof Error ? error.message : 'Unknown error',
      500
    )
  }
}
