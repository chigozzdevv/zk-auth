# Zero-Knowledge Authentication System

A comprehensive demonstration of privacy-preserving authentication using zero-knowledge proofs compared to traditional authentication methods.

## 🎯 Project Overview

This project showcases the difference between traditional authentication (where passwords are sent to the server) and zero-knowledge proof authentication (where only cryptographic proofs are sent, keeping passwords private).

### Key Features

- **Side-by-side comparison** of traditional vs ZK authentication
- **Real-time request/response visualization** for educational purposes
- **Complete ZK circuit implementation** using circom and snarkjs
- **Clean, minimal UI** with smooth animations
- **Production-ready architecture** with TypeScript throughout

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   ZK Circuit    │
│   React + Vite  │◄──►│ Node.js + API   │◄──►│     circom      │
│   Tailwind CSS  │    │ Prisma + PG     │    │    snarkjs      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- circom compiler
- snarkjs CLI

### 1. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

# Install global tools
npm install -g circom snarkjs
```

### 2. Setup Database

```bash
# Create database
createdb zk_auth_db

# Setup environment
cd backend
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run db:push
npm run db:generate
```

### 3. Compile ZK Circuit

```bash
cd circuits
chmod +x compile.sh
./compile.sh
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Open http://localhost:3000 to see the application.

## 📁 Project Structure

```
zk-auth-demo/
├── frontend/                # React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── lib/           # Utilities & ZK logic
│   │   └── types/         # TypeScript definitions
│   └── public/circuits/   # Compiled ZK circuits
├── backend/                # Node.js API server
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   └── lib/           # ZK verification
│   └── prisma/           # Database schema
└── circuits/              # ZK circuit source
    └── password.circom   # Main circuit
```

## 🔐 How It Works

### Traditional Authentication
1. User enters email/password
2. **Password sent in plaintext** to server (visible in network requests)
3. Server hashes and compares with stored hash
4. Returns success/failure

### ZK Proof Authentication
1. User enters email/password
2. **Client generates ZK proof** that they know the password
3. **Only proof sent to server** (password never leaves client)
4. Server verifies proof mathematically
5. Returns success/failure

### The ZK Circuit

The circuit proves: *"I know a password P such that hash(P + salt) = stored_hash"*

```circom
template PasswordVerification() {
    signal private input password;  // Secret
    signal private input salt;      // Secret  
    signal input expectedHash;      // Public
    signal output valid;
    
    // Prove: hash(password + salt) == expectedHash
    // Without revealing password or salt
}
```

## 🎨 Features Demo

### Request Visualization
- **Traditional**: Shows actual password in request body
- **ZK Proof**: Shows cryptographic proof components
- **Side-by-side comparison** for educational impact

### Interactive Elements
- **Expandable proof details** explaining pi_a, pi_b, pi_c components
- **Circuit logic viewer** showing the actual circom code
- **Real-time proof generation** with loading states

## 🔧 Development

### Available Scripts

```bash
# Frontend
npm run dev        # Start development server
npm run build      # Build for production

# Backend  
npm run dev        # Start with hot reload
npm run build      # Compile TypeScript
npm run db:push    # Push schema changes

# Circuits
./compile.sh       # Compile circuit and generate keys
```

### Environment Variables

Create `.env` in backend directory:

```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/zk_auth_db"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
```

## 📚 Educational Value

This project demonstrates:

1. **Privacy implications** of traditional vs ZK authentication
2. **Real cryptographic implementations** (not just theory)
3. **Practical ZK circuits** with circom
4. **Production patterns** for ZK applications
5. **Security best practices** for authentication systems

## 🛡️ Security Notes

- Uses Groth16 proving system (production-ready)
- Proper salt handling for password hashing
- Secure JWT token generation
- Input validation with Zod schemas
- SQL injection protection with Prisma

## 🎓 Learning Resources

- [circom Documentation](https://docs.circom.io/)
- [snarkjs Guide](https://github.com/iden3/snarkjs)
- [Zero-Knowledge Proofs: An Illustrated Primer](https://blog.cryptographyengineering.com/2014/11/27/zero-knowledge-proofs-illustrated-primer/)

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ for educational purposes and real-world ZK applications.