import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DebugData } from '../lib/types'

interface DebugPanelProps {
  debugData: DebugData | null
  isLoading: boolean
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ debugData, isLoading }) => {
  return (
    <div className="w-full h-full max-h-screen overflow-auto">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Live Inspector</h2>
          <p className="text-gray-300">Watch requests in real-time</p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 min-h-[400px] max-h-[600px] overflow-auto">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full min-h-[300px]"
              >
                <div className="text-center">
                  <div className="flex space-x-1 mb-4 justify-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  </div>
                  <p className="text-gray-300">
                    {debugData?.method === 'zk' ? 'Generating proof...' : 'Processing...'}
                  </p>
                </div>
              </motion.div>
            )}

            {!isLoading && !debugData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-full min-h-[300px]"
              >
                <div className="text-center max-w-sm">
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="text-xl font-medium text-gray-200 mb-2">Ready to Monitor</h3>
                  <p className="text-gray-400 text-sm">
                    Try either authentication method to see the network requests
                  </p>
                </div>
              </motion.div>
            )}

            {!isLoading && debugData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300 text-sm font-mono">
                    POST /auth/{debugData.method === 'zk' ? 'zk-' : ''}{debugData.mode}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    debugData.method === 'traditional' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-blue-500 text-white'
                  }`}>
                    {debugData.method === 'traditional' ? 'Traditional' : 'Zero-Knowledge'}
                  </span>
                </div>
                
                <div className="bg-gray-900 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">Request</h4>
                    <div className="text-xs text-gray-400 font-mono">
                      {JSON.stringify(debugData.request).length} bytes
                    </div>
                  </div>
                  
                  <div className="bg-black rounded-lg p-3 max-h-48 overflow-auto">
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                      {JSON.stringify(debugData.request, null, 2)}
                    </pre>
                  </div>
                  
                  <div className={`mt-3 p-3 rounded-lg text-xs ${
                    debugData.method === 'traditional'
                      ? 'bg-orange-900/50 text-orange-200'
                      : 'bg-blue-900/50 text-blue-200'
                  }`}>
                    {debugData.method === 'traditional' ? (
                      <>🔓 Password transmitted in plain text</>
                    ) : (
                      <>🔒 Password stays private - only proof sent</>
                    )}
                  </div>
                </div>

                {debugData.response && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900 rounded-xl p-4"
                  >
                    <h4 className="text-white font-medium mb-3">Response</h4>
                    <div className="bg-black rounded-lg p-3 max-h-32 overflow-auto">
                      <pre className="text-xs text-blue-400 font-mono whitespace-pre-wrap">
                        {JSON.stringify(debugData.response, null, 2)}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}