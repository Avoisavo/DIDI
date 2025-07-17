# Decentralized Attendance System - Architecture

## Overview

This system implements a decentralized attendance tracking solution using IOTA blockchain technology, NFC cards, and Decentralized Identifiers (DIDs). The architecture follows a microservices pattern with clear separation of concerns.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │   Dashboard │ │   NFC       │ │  Students   │ │ Credentials │ │
│  │             │ │   Reader    │ │             │ │             │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Node.js)                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │   DID       │ │ Attendance  │ │    NFC      │ │ Credential  │ │
│  │  Service    │ │  Service    │ │   Service   │ │  Service    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Blockchain (Move/Aptos)                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Attendance Smart Contract                      │ │
│  │  • markAttendance()                                        │ │
│  │  • getAttendance()                                         │ │
│  │  • issueCertificate()                                      │ │
│  │  • registerStudent()                                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Frontend (React)

**Technology Stack:**
- React 18
- React Router for navigation
- React Query for state management
- Tailwind CSS for styling
- Chart.js for analytics
- Web NFC API for NFC reading

**Key Features:**
- Real-time dashboard with analytics
- NFC card reader interface
- Student management interface
- Credential verification
- Responsive design

**Pages:**
- **Dashboard**: Overview with statistics and charts
- **NFC Reader**: NFC card scanning and attendance marking
- **Students**: Student registration and management
- **Attendance**: Attendance records and history
- **Credentials**: Certificate management and verification
- **Admin**: System administration and analytics

### 2. Backend (Node.js)

**Technology Stack:**
- Express.js framework
- IOTA Identity SDK (mocked for demo)
- In-memory storage (can be replaced with database)
- RESTful API design

**Services:**

#### DID Service
- Manages Decentralized Identifiers
- Student registration with DID creation
- DID validation and verification
- Mock IOTA Identity integration

#### Attendance Service
- Handles attendance marking
- Attendance record management
- Percentage calculations
- Smart contract integration

#### NFC Service
- NFC card management
- UID mapping to DIDs
- Card type detection
- NFC simulation for testing

#### Credential Service
- Verifiable credential creation
- Certificate issuance
- Credential verification
- QR code generation

### 3. Smart Contracts (Move)

**Technology Stack:**
- Move language
- Aptos blockchain (compatible with IOTA)
- Event-driven architecture

**Key Functions:**

```move
// Core attendance functions
public entry fun mark_attendance(account: &signer, did: vector<u8>)
public entry fun mark_attendance_by_nfc(account: &signer, nfc_uid: vector<u8>)
public fun get_attendance(did: vector<u8>): vector<u64>

// Student management
public entry fun register_student(account: &signer, did: vector<u8>, nfc_uid: vector<u8>)

// Certificate management
public fun has_certificate(did: vector<u8>): bool
public fun get_attendance_percentage(did: vector<u8>): u64
```

## Data Flow

### 1. Student Registration
```
1. Admin creates student via frontend
2. Backend generates DID (mock IOTA Identity)
3. Student registered with NFC UID mapping
4. Smart contract updated with student data
```

### 2. Attendance Marking
```
1. Student taps NFC card
2. Frontend reads NFC UID via Web NFC API
3. Backend receives NFC UID
4. Backend maps UID to DID
5. Smart contract marks attendance
6. Frontend updates with confirmation
```

### 3. Certificate Issuance
```
1. System checks attendance percentage (80% threshold)
2. Automatic certificate generation
3. Verifiable credential created
4. QR code generated for verification
5. Certificate stored on blockchain
```

## Security Features

### 1. DID-based Identity
- Decentralized identifiers for students
- Cryptographic verification
- No central authority dependency

### 2. Blockchain Immutability
- Attendance records stored on-chain
- Tamper-proof audit trail
- Transparent verification

### 3. NFC Security
- Unique UID per card
- Secure mapping to DIDs
- Anti-replay protection

### 4. Credential Verification
- Cryptographic signatures
- QR code verification
- Blockchain-based validation

## Scalability Considerations

### 1. Horizontal Scaling
- Stateless backend services
- Load balancer support
- Database sharding ready

### 2. Blockchain Optimization
- Batch transactions
- Event-driven updates
- Efficient storage patterns

### 3. Frontend Performance
- React Query caching
- Lazy loading
- Progressive web app features

## Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   CDN/Static    │    │   Database      │
│                 │    │   Assets        │    │   (Optional)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (React App)   │    │   (Node.js)     │    │   (Aptos)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Development Workflow

### 1. Local Development
```bash
# Install dependencies
./setup.sh

# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm start

# Deploy contracts
cd contracts && npm run deploy
```

### 2. Testing
- Unit tests for services
- Integration tests for API
- Smart contract testing
- NFC simulation testing

### 3. Deployment
- Docker containerization
- Environment configuration
- CI/CD pipeline
- Monitoring and logging

## Future Enhancements

### 1. Advanced Features
- Multi-course support
- Advanced analytics
- Mobile app
- Offline support

### 2. Integration
- Learning Management Systems
- Student Information Systems
- Third-party credential providers

### 3. Blockchain Features
- Cross-chain compatibility
- Advanced smart contracts
- Token-based incentives
- DAO governance

## Technology Decisions

### Why IOTA?
- Zero-fee transactions
- Scalable architecture
- Green blockchain
- DID support

### Why Move?
- Type safety
- Resource-oriented programming
- Formal verification
- Aptos compatibility

### Why React?
- Component reusability
- Large ecosystem
- Performance optimization
- Developer experience

### Why Node.js?
- JavaScript ecosystem
- Fast development
- Rich package ecosystem
- Microservices support 