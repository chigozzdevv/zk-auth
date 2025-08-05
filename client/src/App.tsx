import { useState } from 'react'
import { Layout } from './components/Layout'
import { AuthForm } from './components/AuthForm'
import { DebugPanel } from './components/DebugPanel'
import type { DebugData } from './lib/types'

function App() {
  const [debugData, setDebugData] = useState<DebugData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Layout>
      <div className="min-h-screen flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-md">
            <AuthForm 
              onDebugData={setDebugData}
              onLoading={setIsLoading}
            />
          </div>
        </div>
        
        <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6 lg:p-8 overflow-hidden">
          <div className="w-full max-w-lg">
            <DebugPanel 
              debugData={debugData}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default App