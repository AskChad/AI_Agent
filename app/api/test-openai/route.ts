/**
 * Test OpenAI API Route
 *
 * Tests OpenAI connection and embedding generation.
 * Visit: http://localhost:3000/api/test-openai
 */

import { NextResponse } from 'next/server'
import { testOpenAIConnection } from '@/lib/ai/openai-client'
import { testEmbedding, createEmbedding, cosineSimilarity } from '@/lib/ai/embeddings'
import { successResponse, errorResponse } from '@/lib/api-response'
import { logger } from '@/lib/logger'

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    logger.info('Testing OpenAI integration...')

    // Test 1: Connection
    const connectionTest = await testOpenAIConnection()

    if (!connectionTest.success) {
      return errorResponse(
        'OPENAI_CONNECTION_FAILED',
        'Failed to connect to OpenAI API',
        { error: connectionTest.error },
        500
      )
    }

    // Test 2: Embedding generation
    const embeddingTest = await testEmbedding()

    if (!embeddingTest.success) {
      return errorResponse(
        'EMBEDDING_GENERATION_FAILED',
        'Failed to generate embeddings',
        { error: embeddingTest.error },
        500
      )
    }

    // Test 3: Similarity calculation
    const text1 = 'Hello, how can I help you today?'
    const text2 = 'Hi, I need assistance please.'
    const text3 = 'The weather is nice today.'

    const [embedding1, embedding2, embedding3] = await Promise.all([
      createEmbedding(text1),
      createEmbedding(text2),
      createEmbedding(text3),
    ])

    const similarity12 = cosineSimilarity(embedding1, embedding2)
    const similarity13 = cosineSimilarity(embedding1, embedding3)
    const similarity23 = cosineSimilarity(embedding2, embedding3)

    logger.info('OpenAI tests completed successfully')

    return successResponse({
      message: 'OpenAI integration working correctly!',
      tests: {
        connection: {
          status: '✅ Connected',
          models: connectionTest.models,
        },
        embedding: {
          status: '✅ Embeddings working',
          dimensions: embeddingTest.dimensions,
          model: 'text-embedding-ada-002',
        },
        similarity: {
          status: '✅ Similarity calculation working',
          examples: {
            similar_texts: {
              text1: text1,
              text2: text2,
              similarity: similarity12.toFixed(4),
              note: 'Should be high (~0.7-0.9) - both are greetings',
            },
            dissimilar_texts: {
              text1: text1,
              text3: text3,
              similarity: similarity13.toFixed(4),
              note: 'Should be lower - different topics',
            },
          },
        },
      },
    })
  } catch (error) {
    logger.error('OpenAI test failed', error)

    return errorResponse(
      'INTERNAL_ERROR',
      'An error occurred while testing OpenAI',
      error instanceof Error ? error.message : 'Unknown error',
      500
    )
  }
}
