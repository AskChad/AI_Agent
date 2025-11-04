/**
 * OpenAI Client
 *
 * Centralized OpenAI client configuration and utilities.
 */

import OpenAI from 'openai'
import { config } from '@/lib/config'
import { logger } from '@/lib/logger'

/**
 * Cached OpenAI client instance
 */
let _openaiClient: OpenAI | null = null

/**
 * Get OpenAI client instance (lazy initialization)
 */
export function getOpenAIClient(): OpenAI {
  if (!_openaiClient) {
    if (!config.ai.openai.apiKey) {
      throw new Error(
        'OPENAI_API_KEY is not configured. Please set it in your environment variables.'
      )
    }
    _openaiClient = new OpenAI({
      apiKey: config.ai.openai.apiKey,
    })
  }
  return _openaiClient
}

/**
 * OpenAI client getter (lazy initialization, for backward compatibility)
 */
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    const client = getOpenAIClient()
    return (client as any)[prop]
  },
})

/**
 * Test OpenAI connection
 */
export async function testOpenAIConnection(): Promise<{
  success: boolean
  models?: string[]
  error?: string
}> {
  try {
    logger.info('Testing OpenAI connection...')

    // List available models (simple API call to test connection)
    const response = await openai.models.list()
    const models = response.data
      .map((m) => m.id)
      .filter((id) => id.startsWith('gpt-'))
      .slice(0, 5)

    logger.info('OpenAI connection successful', { modelCount: models.length })

    return {
      success: true,
      models,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('OpenAI connection failed', error)

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Get available OpenAI models
 */
export async function getAvailableModels() {
  try {
    const response = await openai.models.list()
    return response.data.map((model) => ({
      id: model.id,
      created: model.created,
      owned_by: model.owned_by,
    }))
  } catch (error) {
    logger.error('Failed to fetch OpenAI models', error)
    throw error
  }
}
