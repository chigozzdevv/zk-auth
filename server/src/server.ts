import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'

const app = express()
const PORT = process.env.PORT || 8000

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))

// Serve circuit files statically
app.use('/circuits', express.static('client/public/circuits'))

app.use('/api/auth', authRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.all('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.use((error: any, req: any, res: any, next: any) => {
  console.error('Server error:', error)
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`)
})