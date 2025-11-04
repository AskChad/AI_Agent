/**
 * Environment Variable Validation
 *
 * Validates that all required environment variables are set
 * and provides helpful error messages.
 */

import { logger } from './logger'

interface EnvValidationResult {
  valid: boolean
  missing: string[]
  warnings: string[]
}

/**
 * Required environment variables
 */
const REQUIRED_VARS = {
  // Supabase (required for database)
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase project URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Supabase anonymous key',
  SUPABASE_SERVICE_ROLE_KEY: 'Supabase service role key',

  // OpenAI (required for AI functionality)
  OPENAI_API_KEY: 'OpenAI API key',
} as const

/**
 * Optional but recommended environment variables
 */
const OPTIONAL_VARS = {
  // Anthropic (Phase 2)
  ANTHROPIC_API_KEY: 'Anthropic API key',

  // GoHighLevel (Phase 3)
  GHL_CLIENT_ID: 'GoHighLevel client ID',
  GHL_CLIENT_SECRET: 'GoHighLevel client secret',
  GHL_REDIRECT_URI: 'GoHighLevel OAuth redirect URI',

  // Token Manager (Phase 3)
  TOKEN_MANAGER_API_KEY: 'Token Manager API key',
  TOKEN_MANAGER_URL: 'Token Manager URL',
} as const

/**
 * Validate environment variables
 */
export function validateEnvironment(): EnvValidationResult {
  const missing: string[] = []
  const warnings: string[] = []

  // Check required variables
  Object.entries(REQUIRED_VARS).forEach(([key, description]) => {
    if (!process.env[key]) {
      missing.push(`${key} (${description})`)
    }
  })

  // Check optional variables
  Object.entries(OPTIONAL_VARS).forEach(([key, description]) => {
    if (!process.env[key]) {
      warnings.push(`${key} (${description}) - Optional but recommended`)
    }
  })

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  }
}

/**
 * Validate and throw if environment is invalid
 */
export function requireValidEnvironment(): void {
  const result = validateEnvironment()

  if (!result.valid) {
    const errorMessage = [
      '❌ Missing required environment variables:',
      '',
      ...result.missing.map((v) => `  - ${v}`),
      '',
      'Please add these to your .env.local file.',
      'See .env.local.template for an example.',
    ].join('\n')

    logger.error('Environment validation failed', new Error(errorMessage))
    throw new Error(errorMessage)
  }

  if (result.warnings.length > 0) {
    logger.warn('Missing optional environment variables:', {
      warnings: result.warnings,
    })
  }

  logger.info('✅ Environment validation passed')
}

/**
 * Check if specific feature is available
 */
export function isFeatureAvailable(feature: 'openai' | 'anthropic' | 'ghl' | 'tokenManager'): boolean {
  switch (feature) {
    case 'openai':
      return !!process.env.OPENAI_API_KEY

    case 'anthropic':
      return !!process.env.ANTHROPIC_API_KEY

    case 'ghl':
      return !!(
        process.env.GHL_CLIENT_ID &&
        process.env.GHL_CLIENT_SECRET &&
        process.env.GHL_REDIRECT_URI
      )

    case 'tokenManager':
      return !!(
        process.env.TOKEN_MANAGER_API_KEY &&
        process.env.TOKEN_MANAGER_URL
      )

    default:
      return false
  }
}

/**
 * Get environment info (safe for logging - no secrets)
 */
export function getEnvironmentInfo() {
  return {
    node_env: process.env.NODE_ENV,
    app_url: process.env.NEXT_PUBLIC_APP_URL,
    features: {
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      openai: isFeatureAvailable('openai'),
      anthropic: isFeatureAvailable('anthropic'),
      ghl: isFeatureAvailable('ghl'),
      tokenManager: isFeatureAvailable('tokenManager'),
    },
  }
}
