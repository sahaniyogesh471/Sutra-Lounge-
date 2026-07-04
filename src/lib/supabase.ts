import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pqighanrupfsugcwsuob.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxaWdoYW5ydXBmc3VnY3dzdW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNTUyMzQsImV4cCI6MjA5ODczMTIzNH0.aB8h1X58707caG3R0Uzqycqy3lk0hNnC1CHSxhpJKDw'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper to convert Supabase response to Firebase-like format
export function firebaseStyleResponse<T>(data: T | null, error: any = null) {
  if (error) {
    throw new Error(error.message || 'Database error')
  }
  return data
}
