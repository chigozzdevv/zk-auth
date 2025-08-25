import * as snarkjs from 'snarkjs'
import { readFileSync } from 'fs'
import { join } from 'path'

interface ZKProof {
  pi_a: string[]
  pi_b: string[][]
  pi_c: string[]
}

interface VerificationInput {
  proof: ZKProof
  publicSignals: string[]
}

export class ZKVerifier {
  private static instance: ZKVerifier
  private verificationKey: any = null

  static getInstance(): ZKVerifier {
    if (!ZKVerifier.instance) {
      ZKVerifier.instance = new ZKVerifier()
    }
    return ZKVerifier.instance
  }

  async initialize(): Promise<void> {
    if (this.verificationKey) return

    try {
      const vkeyPath = join(process.cwd(), 'src/circuits/verification_key.json')
      this.verificationKey = JSON.parse(readFileSync(vkeyPath, 'utf8'))
    } catch (error) {
      throw new Error(`Failed to load verification key: ${error}`)
    }
  }

  async verifyProof(input: VerificationInput): Promise<boolean> {
    await this.initialize()

    try {
      console.log('Verifying proof with correct format...')
      console.log('Verification key nPublic:', this.verificationKey.nPublic)
      console.log('PublicSignals length:', input.publicSignals.length)
      console.log('PublicSignals:', input.publicSignals)

      // Use the exact same format as working examples
      const res = await snarkjs.groth16.verify(
        this.verificationKey,
        input.publicSignals,
        input.proof
      )

      console.log('Verification result:', res)
      if (res === true) {
        console.log("Verification OK")
        return true
      } else {
        console.log("Invalid proof") 
        return false
      }
    } catch (error) {
      console.error('Proof verification error:', error)
      return false
    }
  }

  hashPassword(password: string, salt: string): string {
    const passwordBigInt = this.stringToBigInt(password)
    const saltBigInt = this.stringToBigInt(salt)
    const sum = passwordBigInt + saltBigInt
    return sum.toString()
  }

  private stringToBigInt(str: string): bigint {
    // Use a simple hash: sum of character codes
    // This matches what the circuit expects
    let result = BigInt(0)
    for (let i = 0; i < str.length; i++) {
      result += BigInt(str.charCodeAt(i))
    }
    return result
  }
}