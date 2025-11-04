/**
 * Supabase Client (Browser)
 *
 * Client-side Supabase client for use in React components.
 * Uses the anon key (safe for browser).
 *
 * Usage:
 * import { supabase } from '@/lib/supabase/client'
 * const { data, error } = await supabase.from('table').select()
 */

import { createBrowserClient } from '@supabase/ssr'
import { config } from '@/lib/config'

export const createClient = () => {
  return createBrowserClient(
    config.supabase.url,
    config.supabase.anonKey
  )
}

// Export a singleton instance
export const supabase = createClient()
