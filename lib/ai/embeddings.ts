/**
 * Embedding Generation Utilities
 *
 * Generate vector embeddings using OpenAI's ada-002 model.
 * Embeddings are used for:
 * - Semantic search of conversation history
 * - RAG knowledge base search
 */

import { openai } from './openai-client'
import { config } from '@/lib/config'
import { logger } from '@/lib/logger'

/**
 * Generate embedding for a single text
 */
export async function createEmbedding(text: string): Promise<number[]> {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty')
    }

    logger.debug('Generating embedding...', {
      textLength: text.length,
      model: config.ai.openai.embeddingModel,
    })

    const response = await openai.embeddings.create({
      model: config.ai.openai.embeddingModel,
      input: text,
      encoding_format: 'float',
    })

    const embedding = response.data[0].embedding

    logger.debug('Embedding generated successfully', {
      dimensions: embedding.length,
      tokensUsed: response.usage.total_tokens,
    })

    return embedding
  } catch (error) {
    logger.error('Failed to generate embedding', error, {
      textPreview: text.slice(0, 100),
    })
    throw error
  }
}

/**
 * Generate embeddings for multiple texts (batch)
 */
export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    if (texts.length === 0) {
      return []
    }

    // Filter out empty texts
    const validTexts = texts.filter((t) => t && t.trim().length > 0)

    if (validTexts.length === 0) {
      return []
    }

    logger.debug('Generating batch embeddings...', {
      count: validTexts.length,
      model: config.ai.openai.embeddingModel,
    })

    const response = await openai.embeddings.create({
      model: config.ai.openai.embeddingModel,
      input: validTexts,
      encoding_format: 'float',
    })

    const embeddings = response.data.map((item) => item.embedding)

    logger.debug('Batch embeddings generated successfully', {
      count: embeddings.length,
      tokensUsed: response.usage.total_tokens,
    })

    return embeddings
  } catch (error) {
    logger.error('Failed to generate batch embeddings', error, {
      textCount: texts.length,
    })
    throw error
  }
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have the same dimensions')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Test embedding generation
 */
export async function testEmbedding(): Promise<{
  success: boolean
  embedding?: number[]
  dimensions?: number
  error?: string
}> {
  try {
    const testText = 'This is a test message for embedding generation.'

    logger.info('Testing embedding generation...')

    const embedding = await createEmbedding(testText)

    logger.info('Embedding test successful', {
      dimensions: embedding.length,
    })

    return {
      success: true,
      embedding,
      dimensions: embedding.length,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Embedding test failed', error)

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Prepare text for embedding (cleanup and truncation)
 */
export function prepareTextForEmbedding(
  text: string,
  maxLength: number = 8000
): string {
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, ' ').trim()

  // Truncate if too long (OpenAI has ~8k token limit for embeddings)
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength) + '...'
    logger.debug('Text truncated for embedding', {
      originalLength: text.length,
      truncatedLength: cleaned.length,
    })
  }

  return cleaned
}
