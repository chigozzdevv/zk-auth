import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../lib/db.js'
import { ZKVerifier } from '../lib/zk.js'

const router = Router()
const zkVerifier = ZKVerifier.getInstance()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

const AuthRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const ZKAuthRequestSchema = z.object({
  email: z.string().email(),
  proof: z.object({
    pi_a: z.array(z.string()),
    pi_b: z.array(z.array(z.string())),
    pi_c: z.array(z.string()),
  }),
  publicSignals: z.array(z.string()),
})

const ZKSignupRequestSchema = ZKAuthRequestSchema.extend({
  salt: z.string(),
  expectedHash: z.string(),
})

// Traditional Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = AuthRequestSchema.parse(req.body)

    const existingUser = await prisma.traditionalUser.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.traditionalUser.create({
      data: {
        email,
        password: hashedPassword
      }
    })

    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, {
      expiresIn: '24h'
    })

    res.json({
      success: true,
      message: 'Account created successfully',
      token,
      userId: user.id
    })
  } catch (error: any) {
    console.error('Traditional signup error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Signup failed'
    })
  }
})

// Traditional Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = AuthRequestSchema.parse(req.body)

    const user = await prisma.traditionalUser.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, {
      expiresIn: '24h'
    })

    res.json({
      success: true,
      message: 'Login successful',
      token,
      userId: user.id
    })
  } catch (error: any) {
    console.error('Traditional login error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    })
  }
})

// ZK Signup
router.post('/zk-signup', async (req, res) => {
  try {
    const { email, proof, publicSignals, salt, expectedHash } = ZKSignupRequestSchema.parse(req.body)

    // Debug logging
    console.log('ZK Signup request:')
    console.log('Email:', email)
    console.log('Salt:', salt)
    console.log('Expected hash from client:', expectedHash)
    console.log('Public signals:', publicSignals)
    
    // Debug: Try to extract the password from the proof input to compare hashes
    // Note: This is just for debugging - in production the password should never be logged
    console.log('=== DEBUGGING HASH CALCULATION ===')
    console.log('This is for debugging only - password should never be logged in production!')

    const existingUser = await prisma.zKUser.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      })
    }

    const verified = await zkVerifier.verifyProof({ proof, publicSignals })

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid proof'
      })
    }

    // According to Circom docs: publicSignals = [outputs, public inputs]
    // publicSignals[0] = out (circuit output: 1 if valid, 0 if not)  
    // publicSignals[1] = expectedHash (public input)
    
    // Verify that the circuit output indicates success (proof is valid)
    if (publicSignals[0] !== '1') {
      return res.status(401).json({
        success: false,
        message: 'Proof verification failed'
      })
    }
    
    // For signup: store whatever hash the client proved they can generate
    const actualHash = publicSignals[1]

    const user = await prisma.zKUser.create({
      data: {
        email,
        passwordHash: actualHash,
        salt
      }
    })

    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, {
      expiresIn: '24h'
    })

    res.json({
      success: true,
      message: 'Account created successfully',
      token,
      userId: user.id
    })
  } catch (error: any) {
    console.error('ZK signup error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Signup failed'
    })
  }
})

// ZK Login
router.post('/zk-login', async (req, res) => {
  try {
    const { email, proof, publicSignals } = ZKAuthRequestSchema.parse(req.body)

    const user = await prisma.zKUser.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // publicSignals[0] should be '1' for successful verification (output)
    if (publicSignals[0] !== '1') {
      return res.status(401).json({
        success: false,
        message: 'Proof verification failed'
      })
    }

    // publicSignals[1] should contain the expected hash (public input)
    if (publicSignals[1] !== user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    const verified = await zkVerifier.verifyProof({ proof, publicSignals })

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid proof'
      })
    }

    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, {
      expiresIn: '24h'
    })

    res.json({
      success: true,
      message: 'Login successful',
      token,
      userId: user.id
    })
  } catch (error: any) {
    console.error('ZK login error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    })
  }
})

router.get('/hash/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email)

    const user = await prisma.zKUser.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      hash: user.passwordHash,
      salt: user.salt
    })
  } catch (error: any) {
    console.error('Get hash error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get hash'
    })
  }
})

export default router