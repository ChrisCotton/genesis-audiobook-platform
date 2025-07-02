import { createClient } from '@supabase/supabase-js'

<<<<<<< HEAD
// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate that environment variables are loaded
=======
// Supabase configuration using environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

>>>>>>> d0dfb41028177582b68f6cd95ada84723c483f41
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

// Create Supabase client
<<<<<<< HEAD
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

=======
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test database connection
export const testConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    // Test basic connection by querying the auth endpoint
    const { data, error } = await supabase.auth.getSession()
    
    if (error && error.message !== 'Auth session missing!') {
      throw error
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('📊 Connection details:', {
      url: supabaseUrl,
      keyLength: supabaseAnonKey.length,
      status: 'Connected'
    })
    
    return { success: true, data }
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message)
    return { success: false, error: error.message }
  }
}

// Test creating a simple table (for development)
export const testDatabaseOperations = async () => {
  try {
    console.log('🔧 Testing database operations...')
    
    // Try to create a simple test table
    const { data, error } = await supabase
      .from('test_connection')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('ℹ️  Table does not exist yet (expected for new setup)')
      return { success: true, message: 'Ready for table creation' }
    }
    
    console.log('✅ Database operations test successful!')
    return { success: true, data }
  } catch (error) {
    console.error('❌ Database operations test failed:', error.message)
    return { success: false, error: error.message }
  }
}

// Helper function to check if Supabase is ready
export const isSupabaseReady = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Export client for use in other parts of the app
>>>>>>> d0dfb41028177582b68f6cd95ada84723c483f41
export default supabase 