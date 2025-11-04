/**
 * Health Check API Route
 *
 * Simple health check to verify the API is running.
 * Visit: http://localhost:3000/api/health
 */

import { NextResponse } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { config, validateConfig } from '@/lib/config'

export async function GET() {
  try {
    // Check if required environment variables are set
    validateConfig()

    return successResponse({
      status: 'healthy',
      message: 'AI Chat Agent API is running',
      version: '1.0.0',
      environment: config.app.env,
      timestamp: new Date().toISOString(),
      services: {
        supabase: config.supabase.url ? 'configured' : 'not configured',
        openai: config.ai.openai.apiKey ? 'configured' : 'not configured',
        anthropic: config.ai.anthropic.apiKey
          ? 'configured'
          : 'not configured',
        ghl: config.ghl.clientId ? 'configured' : 'not configured',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
