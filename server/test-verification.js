import * as snarkjs from 'snarkjs';
import { readFileSync } from 'fs';

async function testVerification() {
    try {
        // Test with the same inputs that are failing
        const input = {
            password: "420",
            salt: "4614", 
            expectedHash: "5034"
        };

        console.log('Testing with input:', input);

        // Load circuit files
        const wasm = readFileSync('./src/circuits/password.wasm');
        const zkey = readFileSync('./src/circuits/password_0001.zkey');
        
        console.log('Generating proof...');
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            input,
            wasm,
            zkey
        );

        console.log('Proof generated successfully');
        console.log('Public signals:', publicSignals);

        // Load verification key
        const vKey = JSON.parse(readFileSync('./src/circuits/verification_key.json'));
        console.log('Verification key loaded, nPublic:', vKey.nPublic);

        // Verify proof
        const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
        
        console.log('Verification result:', res);
        
        if (res === true) {
            console.log("✅ VERIFICATION SUCCESSFUL!");
        } else {
            console.log("❌ VERIFICATION FAILED!");
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testVerification();