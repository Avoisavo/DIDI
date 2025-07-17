# Quick Start Guide

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Modern web browser with NFC support (Chrome, Edge, or Safari on iOS)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd decentralized-attendance-system
   ```

2. **Run the setup script**
   ```bash
   ./setup.sh
   ```

   This will install all dependencies for:
   - Backend (Node.js)
   - Frontend (React)
   - Smart contracts (Move)

## Starting the Application

### Option 1: Quick Start (All Services)
```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
cd frontend && npm start

# Terminal 3: Deploy contracts (optional for demo)
cd contracts && npm run deploy
```

### Option 2: Step by Step

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will start on `http://localhost:8000`

2. **Start the Frontend Application**
   ```bash
   cd frontend
   npm start
   ```
   The frontend will start on `http://localhost:3000`

3. **Deploy Smart Contracts (Optional)**
   ```bash
   cd contracts
   npm run deploy
   ```

## Using the Application

### 1. Dashboard Overview
- Navigate to `http://localhost:3000`
- View system statistics and analytics
- Monitor real-time attendance data

### 2. Student Registration
- Go to the "Students" page
- Click "Add Student"
- Enter student details and NFC UID
- System generates a DID automatically

### 3. NFC Attendance Marking
- Go to the "NFC Reader" page
- Click "Start Scanning" (if NFC supported)
- Or use "Mock NFC Testing" for demo
- Tap/scan NFC card to mark attendance

### 4. View Attendance Records
- Go to the "Attendance" page
- View individual student attendance
- Check attendance percentages
- Monitor certificate eligibility

### 5. Certificate Management
- Go to the "Credentials" page
- View certificate status for all students
- Issue certificates for eligible students (80%+ attendance)
- Generate QR codes for verification

## Demo Data

The system comes with mock data for testing:

**Students:**
- Alice Johnson (DID: did:iota:test:student1, NFC: 04A1B2C3D4E5F6)
- Bob Smith (DID: did:iota:test:student2, NFC: 04B2C3D4E5F6A7)
- Carol Davis (DID: did:iota:test:student3, NFC: 04C3D4E5F6A7B8)

**Mock NFC UIDs for Testing:**
- 04A1B2C3D4E5F6
- 04B2C3D4E5F6A7
- 04C3D4E5F6A7B8
- 04D4E5F6A7B8C9
- 04E5F6A7B8C9D0

## Testing NFC Functionality

### Real NFC Cards
1. Ensure your browser supports Web NFC API
2. Use Chrome or Edge on Android
3. Grant NFC permissions when prompted
4. Tap physical NFC cards

### Mock NFC Testing
1. Go to NFC Reader page
2. Use the "Mock NFC Testing" section
3. Enter or generate mock NFC UIDs
4. Click "Simulate NFC Read"

## API Endpoints

### Health Check
```bash
GET http://localhost:8000/health
```

### Student Management
```bash
POST http://localhost:8000/api/did/create
GET http://localhost:8000/api/did/:did
GET http://localhost:8000/api/admin/students
```

### Attendance
```bash
POST http://localhost:8000/api/attendance/mark
GET http://localhost:8000/api/attendance/:did
GET http://localhost:8000/api/attendance/:did/percentage
```

### Credentials
```bash
GET http://localhost:8000/api/credentials/:did
POST http://localhost:8000/api/credentials/issue
```

### NFC
```bash
GET http://localhost:8000/api/nfc/:uid
POST http://localhost:8000/api/nfc/register
```

## Troubleshooting

### Backend Issues
```bash
# Check if port 8000 is available
lsof -i :8000

# Restart backend
cd backend && npm run dev
```

### Frontend Issues
```bash
# Clear cache and restart
cd frontend && npm start

# Check for dependency issues
npm install
```

### NFC Issues
- Ensure HTTPS or localhost (NFC requires secure context)
- Check browser compatibility
- Grant necessary permissions
- Use mock mode for testing

### Smart Contract Issues
```bash
# Check Aptos CLI installation
aptos --version

# Initialize Aptos project
cd contracts && aptos init
```

## Development

### Project Structure
```
├── backend/           # Node.js backend server
├── frontend/          # React frontend application
├── contracts/         # Move smart contracts
├── docs/             # Documentation
├── setup.sh          # Setup script
└── README.md         # Main documentation
```

### Key Files
- `backend/src/index.js` - Main server file
- `frontend/src/App.js` - Main React app
- `contracts/sources/attendance_system.move` - Smart contract
- `frontend/src/pages/NFCReader.js` - NFC functionality

### Environment Variables
Create `.env` files in backend and frontend directories:

**Backend (.env)**
```
PORT=8000
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:8000
```

## Next Steps

1. **Customize the System**
   - Modify attendance thresholds
   - Add custom fields to student records
   - Implement additional analytics

2. **Deploy to Production**
   - Set up proper database
   - Configure HTTPS
   - Deploy smart contracts to mainnet
   - Set up monitoring

3. **Extend Functionality**
   - Add multi-course support
   - Implement mobile app
   - Add advanced reporting
   - Integrate with existing systems

## Support

For issues and questions:
- Check the documentation in `/docs`
- Review the architecture guide
- Test with mock data first
- Ensure all prerequisites are met 