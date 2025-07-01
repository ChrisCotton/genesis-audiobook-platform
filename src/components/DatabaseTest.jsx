import React, { useState, useEffect } from 'react'
import { testConnection, testDatabaseOperations, isSupabaseReady } from '../config/supabase'

const DatabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('checking')
  const [dbOperationsStatus, setDbOperationsStatus] = useState('pending')
  const [logs, setLogs] = useState([])

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { message, type, timestamp }])
  }

  const testSupabaseConnection = async () => {
    setConnectionStatus('testing')
    setLogs([])
    addLog('Starting Supabase connection test...', 'info')

    // Check if environment variables are loaded
    if (!isSupabaseReady()) {
      setConnectionStatus('failed')
      addLog('❌ Supabase environment variables not found', 'error')
      return
    }

    addLog('✅ Environment variables loaded', 'success')

    // Test basic connection
    const connectionResult = await testConnection()
    if (connectionResult.success) {
      setConnectionStatus('connected')
      addLog('✅ Connection test passed', 'success')
    } else {
      setConnectionStatus('failed')
      addLog(`❌ Connection failed: ${connectionResult.error}`, 'error')
      return
    }

    // Test database operations
    setDbOperationsStatus('testing')
    addLog('Testing database operations...', 'info')
    
    const dbResult = await testDatabaseOperations()
    if (dbResult.success) {
      setDbOperationsStatus('ready')
      addLog('✅ Database operations ready', 'success')
    } else {
      setDbOperationsStatus('failed')
      addLog(`❌ Database operations failed: ${dbResult.error}`, 'error')
    }
  }

  useEffect(() => {
    testSupabaseConnection()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'testing': return 'text-yellow-600 bg-yellow-100'
      case 'ready': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return '✅ Connected'
      case 'failed': return '❌ Failed'
      case 'testing': return '🔄 Testing...'
      case 'checking': return '🔍 Checking...'
      case 'ready': return '✅ Ready'
      case 'pending': return '⏳ Pending'
      default: return '❓ Unknown'
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🗄️ Database Connection Test</h2>
      
      {/* Connection Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Connection Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="font-medium">Supabase Connection</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(connectionStatus)}`}>
                {getStatusText(connectionStatus)}
              </span>
            </div>
          </div>
          <div className="p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="font-medium">Database Operations</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(dbOperationsStatus)}`}>
                {getStatusText(dbOperationsStatus)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Button */}
      <div className="mb-6">
        <button
          onClick={testSupabaseConnection}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Retest Connection
        </button>
      </div>

      {/* Logs */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Test Logs</h3>
        <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 italic">No logs yet...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-2 text-sm">
                <span className="text-gray-400">[{log.timestamp}]</span>{' '}
                <span className={
                  log.type === 'error' ? 'text-red-600' :
                  log.type === 'success' ? 'text-green-600' :
                  'text-gray-700'
                }>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Environment Info */}
      <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Environment Check</h4>
        <div className="space-y-1">
          <div>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</div>
          <div>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</div>
        </div>
      </div>
    </div>
  )
}

export default DatabaseTest 