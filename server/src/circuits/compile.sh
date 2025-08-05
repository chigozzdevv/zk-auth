#!/bin/bash

# Circuit compilation script for password verification

echo "🔧 Compiling password verification circuit..."

# Create output directory
mkdir -p ../../client/public/circuits

# Compile circuit
echo "📝 Compiling circom circuit..."
circom password.circom --r1cs --wasm --sym --c

# Move wasm file to client
echo "📦 Moving WASM file..."
cp password_js/password.wasm ../../client/public/circuits/

# Generate witness (for testing)
echo "🧪 Generating witness..."
node password_js/generate_witness.js password_js/password.wasm input.json witness.wtns

# Powers of tau ceremony (using existing file or generate new one for smaller circuits)
echo "⚡ Setting up powers of tau..."
if [ ! -f "powersOfTau28_hez_final_10.ptau" ]; then
    echo "Downloading powers of tau file..."
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

# Generate zkey
echo "🔑 Generating proving key..."
snarkjs groth16 setup password.r1cs powersOfTau28_hez_final_10.ptau password_0000.zkey

# Contribute to ceremony (for production, this should be done properly)
echo "🎭 Contributing to ceremony..."
snarkjs zkey contribute password_0000.zkey password_0001.zkey --name="First contribution" -v -e="random entropy"

# Export verification key
echo "🔐 Exporting verification key..."
snarkjs zkey export verificationkey password_0001.zkey verification_key.json

# Move files to client
echo "📁 Moving files to client..."
cp password_0001.zkey ../../client/public/circuits/
cp verification_key.json ../../client/public/circuits/

# Clean up intermediate files
echo "🧹 Cleaning up..."
rm -rf password_cpp password_js
rm password.r1cs password.sym
rm witness.wtns password_0000.zkey

echo "✅ Circuit compilation complete!"
echo "📂 Files generated in ../../client/public/circuits/:"
echo "   - password.wasm"
echo "   - password_0001.zkey"
echo "   - verification_key.json"