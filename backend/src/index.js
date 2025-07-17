const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
require('dotenv').config();

const didService = require('./services/didService');
const attendanceService = require('./services/attendanceService');
const nfcService = require('./services/nfcService');
const credentialService = require('./services/credentialService');

const app = express();
const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Attendance System Backend'
  });
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Attendance System API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      students: 'GET /api/students',
      createStudent: 'POST /api/students',
      attendance: 'POST /api/attendance/mark',
      getAttendance: 'GET /api/attendance/:did',
      nfc: 'GET /api/nfc/:uid',
      credentials: 'GET /api/credentials/:did',
      issueCredential: 'POST /api/credentials/issue',
      admin: {
        students: 'GET /api/admin/students',
        stats: 'GET /api/admin/stats'
      }
    }
  });
});

// Students Routes
app.get('/api/students', async (req, res) => {
  try {
    const result = await didService.getAllStudents();
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json({
      success: true,
      students: result.students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ 
      error: 'Failed to fetch students',
      details: error.message 
    });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const { name, email, nfcUid, department } = req.body;
    
    if (!name || !email || !nfcUid || !department) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, email, nfcUid, department' 
      });
    }

    const result = await didService.createDID({ name, email, nfcUid, department });
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json({
      success: true,
      student: result.student,
      did: result.did,
      message: 'Student created successfully'
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ 
      error: 'Failed to create student',
      details: error.message 
    });
  }
});

app.get('/api/students/:did', async (req, res) => {
  try {
    const { did } = req.params;
    const result = await didService.getStudentByDID(did);
    
    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }
    
    res.json({
      success: true,
      student: result.student
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ 
      error: 'Failed to fetch student',
      details: error.message 
    });
  }
});

// Attendance Routes
app.post('/api/attendance/mark', async (req, res) => {
  try {
    const { nfcUid, did } = req.body;
    
    if (!nfcUid && !did) {
      return res.status(400).json({ 
        error: 'Either nfcUid or did is required' 
      });
    }

    let attendanceResult;
    if (nfcUid) {
      attendanceResult = await attendanceService.markAttendanceByNFC(nfcUid);
    } else {
      attendanceResult = await attendanceService.markAttendanceByDID(did);
    }
    
    res.json({
      success: true,
      attendance: attendanceResult,
      message: 'Attendance marked successfully'
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ 
      error: 'Failed to mark attendance',
      details: error.message 
    });
  }
});

app.get('/api/attendance/:did', async (req, res) => {
  try {
    const { did } = req.params;
    const attendance = await attendanceService.getAttendance(did);
    
    res.json({
      success: true,
      attendance: attendance
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ 
      error: 'Failed to fetch attendance',
      details: error.message 
    });
  }
});

app.get('/api/attendance/:did/percentage', async (req, res) => {
  try {
    const { did } = req.params;
    const percentage = await attendanceService.getAttendancePercentage(did);
    
    res.json({
      success: true,
      percentage: percentage
    });
  } catch (error) {
    console.error('Error fetching attendance percentage:', error);
    res.status(500).json({ 
      error: 'Failed to fetch attendance percentage',
      details: error.message 
    });
  }
});

// NFC Routes
app.get('/api/nfc/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const result = await didService.getStudentByNFCUid(uid);
    
    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }
    
    res.json({
      success: true,
      student: result.student
    });
  } catch (error) {
    console.error('Error fetching NFC data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch NFC data',
      details: error.message 
    });
  }
});

// Credential Routes
app.get('/api/credentials/:did', async (req, res) => {
  try {
    const { did } = req.params;
    const credentials = await credentialService.getCredentials(did);
    
    res.json({
      success: true,
      credentials: credentials
    });
  } catch (error) {
    console.error('Error fetching credentials:', error);
    res.status(500).json({ 
      error: 'Failed to fetch credentials',
      details: error.message 
    });
  }
});

app.post('/api/credentials/issue', async (req, res) => {
  try {
    const { did } = req.body;
    
    if (!did) {
      return res.status(400).json({ error: 'DID is required' });
    }

    const credential = await credentialService.issueCertificate(did);
    
    res.json({
      success: true,
      credential: credential,
      message: 'Certificate issued successfully'
    });
  } catch (error) {
    console.error('Error issuing credential:', error);
    res.status(500).json({ 
      error: 'Failed to issue credential',
      details: error.message 
    });
  }
});

// Admin Routes
app.get('/api/admin/students', async (req, res) => {
  try {
    const result = await didService.getAllStudents();
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json({
      success: true,
      students: result.students
    });
  } catch (error) {
    console.error('Error fetching all students:', error);
    res.status(500).json({ 
      error: 'Failed to fetch students',
      details: error.message 
    });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const stats = await attendanceService.getSystemStats();
    
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stats',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Attendance System Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Documentation: http://localhost:${PORT}/api`);
});

module.exports = app; 