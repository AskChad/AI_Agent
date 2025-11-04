/**
 * Test Database Connection API Route
 *
 * Test route to verify Supabase connection is working.
 * Visit: http://localhost:3000/api/test-db
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    logger.info('Testing database connection...')

    const supabase = createClient()

    // Test 1: Check if we can connect
    const { data: connection, error: connectionError } = await supabase
      .from('accounts')
      .select('count')
      .limit(1)

    if (connectionError) {
      logger.error('Database connection failed', connectionError)
      return errorResponse(
        'DATABASE_ERROR',
        'Failed to connect to database',
        connectionError,
        500
      )
    }

    // Test 2: List all tables
    const { data: tables, error: tablesError } = await supabase
      .rpc('_list_tables')
      .catch(() => ({
        data: null,
        error: null, // Ignore if function doesn't exist
      }))

    // Test 3: Create a test account
    const testAccountName = `Test Account ${Date.now()}`

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .insert({
        account_name: testAccountName,
        ghl_location_id: `test-${Date.now()}`,
      })
      .select()
      .single()

    if (accountError) {
      logger.error('Failed to create test account', accountError)
      return errorResponse(
        'DATABASE_ERROR',
        'Failed to create test account',
        accountError,
        500
      )
    }

    // Test 4: Create account settings for the test account
    const { data: settings, error: settingsError } = await supabase
      .from('account_settings')
      .insert({
        account_id: account.id,
      })
      .select()
      .single()

    if (settingsError) {
      logger.error('Failed to create account settings', settingsError)
    }

    // Test 5: Query the account back
    const { data: queriedAccount, error: queryError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', account.id)
      .single()

    if (queryError) {
      logger.error('Failed to query account', queryError)
    }

    // Test 6: Delete the test account (cleanup)
    const { error: deleteError } = await supabase
      .from('accounts')
      .delete()
      .eq('id', account.id)

    if (deleteError) {
      logger.warn('Failed to delete test account (manual cleanup needed)', {
        accountId: account.id,
      })
    }

    logger.info('Database tests completed successfully!')

    return successResponse({
      message: 'Database connection successful!',
      tests: {
        connection: '✅ Connected',
        insert: account ? '✅ Insert works' : '❌ Insert failed',
        settings: settings ? '✅ Settings created' : '❌ Settings failed',
        query: queriedAccount ? '✅ Query works' : '❌ Query failed',
        delete: !deleteError ? '✅ Delete works' : '❌ Delete failed',
      },
      test_account: {
        created: account,
        queried: queriedAccount,
        deleted: !deleteError,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Database test failed', error)

    return errorResponse(
      'INTERNAL_ERROR',
      'An error occurred while testing the database',
      error instanceof Error ? error.message : error,
      500
    )
  }
}
