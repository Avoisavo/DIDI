# Decentralized Attendance System

A blockchain-based attendance tracking system built on IOTA tech stack with Move smart contracts, NFC cards, and DIDs.

## Features

- **DID-based Identity**: Each student has a unique Decentralized Identifier (DID)
- **NFC Integration**: NFC cards linked to student DIDs for attendance tracking
- **Move Smart Contracts**: On-chain attendance recording and verification
- **Verifiable Credentials**: Automatic certificate generation when 80% attendance is reached
- **Full-Stack Solution**: Complete frontend, backend, and blockchain integration

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Blockchain    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Move)        │
│                 │    │                 │    │                 │
│ - NFC Reader    │    │ - DID Manager   │    │ - Attendance    │
│ - Attendance UI │    │ - NFC Mapping   │    │ - Credentials   │
│ - Credentials   │    │ - API Gateway   │    │ - Smart Contract│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Project Structure

```
├── contracts/         # Move smart contracts
├── backend/           # Node.js backend server
├── frontend/          # React frontend application
├── did-simulator/     # DID creation and management
├── nfc-simulator/     # NFC card simulation
└── docs/              # Documentation
```

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   cd contracts && npm install
   cd ../backend && npm install
   cd ../frontend && npm install
   ```

2. **Start Development Environment**
   ```bash
   # Terminal 1: Start Move blockchain (Aptos devnet)
   cd contracts && npm run dev
   
   # Terminal 2: Start backend server
   cd backend && npm run dev
   
   # Terminal 3: Start frontend
   cd frontend && npm start
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Move Explorer: https://explorer.aptoslabs.com/

## Smart Contract Functions

- `markAttendance(did: address, timestamp: u64)`: Record attendance for a student
- `getAttendance(did: address): vector<u64>`: Get attendance timestamps for a student
- `issueCertificate(did: address)`: Issue completion certificate when 80% threshold is met
- `getCertificate(did: address): bool`: Check if student has earned certificate

## API Endpoints

- `POST /api/attendance/mark` - Mark attendance via NFC
- `GET /api/attendance/:did` - Get attendance records
- `POST /api/did/create` - Create new student DID
- `GET /api/credentials/:did` - Get student credentials

## Technologies Used

- **Blockchain**: Aptos Move (compatible with IOTA)
- **Backend**: Node.js, Express, IOTA Identity SDK
- **Frontend**: React, Web NFC API
- **Identity**: IOTA Identity Framework
- **Credentials**: W3C Verifiable Credentials 