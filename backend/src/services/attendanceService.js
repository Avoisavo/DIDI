const didService = require('./didService');
const crypto = require('crypto');

// In-memory storage for attendance records
const attendanceRecords = new Map();

class AttendanceService {
  constructor() {
    this.initializeMockData();
  }

  // Initialize with some mock attendance data
  initializeMockData() {
    const mockAttendance = [
      {
        did: 'did:iota:test:student1',
        records: [
          { timestamp: Date.now() - 86400000 * 7, sessionId: 1 }, // 7 days ago
          { timestamp: Date.now() - 86400000 * 5, sessionId: 2 }, // 5 days ago
          { timestamp: Date.now() - 86400000 * 3, sessionId: 3 }, // 3 days ago
          { timestamp: Date.now() - 86400000 * 1, sessionId: 4 }, // 1 day ago
        ]
      },
      {
        did: 'did:iota:test:student2',
        records: [
          { timestamp: Date.now() - 86400000 * 6, sessionId: 1 },
          { timestamp: Date.now() - 86400000 * 4, sessionId: 2 },
          { timestamp: Date.now() - 86400000 * 2, sessionId: 3 },
        ]
      },
      {
        did: 'did:iota:test:student3',
        records: [
          { timestamp: Date.now() - 86400000 * 8, sessionId: 1 },
          { timestamp: Date.now() - 86400000 * 6, sessionId: 2 },
          { timestamp: Date.now() - 86400000 * 4, sessionId: 3 },
          { timestamp: Date.now() - 86400000 * 2, sessionId: 4 },
          { timestamp: Date.now() - 86400000 * 1, sessionId: 5 },
        ]
      }
    ];

    mockAttendance.forEach(attendance => {
      attendanceRecords.set(attendance.did, attendance.records);
    });
  }

  // Mark attendance by NFC UID
  async markAttendanceByNFC(nfcUid) {
    try {
      // Get student by NFC UID
      const student = await didService.getStudentByNFC(nfcUid);
      if (!student) {
        throw new Error('Student not found for NFC UID');
      }

      return await this.markAttendanceByDID(student.did);
    } catch (error) {
      console.error('Error marking attendance by NFC:', error);
      throw error;
    }
  }

  // Mark attendance by DID
  async markAttendanceByDID(did) {
    try {
      // Verify student exists
      const student = await didService.getStudentByDID(did);
      if (!student) {
        throw new Error('Student not found');
      }

      const currentTime = Date.now();
      const currentDay = Math.floor(currentTime / (24 * 60 * 60 * 1000));

      // Check if already attended today
      const existingRecords = attendanceRecords.get(did) || [];
      const todayRecord = existingRecords.find(record => {
        const recordDay = Math.floor(record.timestamp / (24 * 60 * 60 * 1000));
        return recordDay === currentDay;
      });

      if (todayRecord) {
        throw new Error('Attendance already marked for today');
      }

      // Create new attendance record
      const newRecord = {
        timestamp: currentTime,
        sessionId: this.getNextSessionId(),
        transactionHash: crypto.randomBytes(32).toString('hex') // Mock transaction hash
      };

      // Add to records
      existingRecords.push(newRecord);
      attendanceRecords.set(did, existingRecords);

      // Update student attendance count
      await didService.updateAttendanceCount(did, existingRecords.length);

      // Check if certificate should be issued (80% attendance)
      const attendancePercentage = this.calculateAttendancePercentage(did);
      if (attendancePercentage >= 80 && !student.certificateIssued) {
        await didService.issueCertificate(did);
      }

      // In a real implementation, this would call the Move smart contract
      await this.callSmartContract('mark_attendance', [did, currentTime]);

      return {
        success: true,
        record: newRecord,
        attendanceCount: existingRecords.length,
        attendancePercentage: attendancePercentage,
        certificateIssued: attendancePercentage >= 80
      };
    } catch (error) {
      console.error('Error marking attendance by DID:', error);
      throw error;
    }
  }

  // Get attendance records for a student
  async getAttendance(did) {
    try {
      const records = attendanceRecords.get(did) || [];
      const student = await didService.getStudentByDID(did);

      return {
        did,
        student: student ? {
          name: student.name,
          email: student.email,
          nfcUid: student.nfcUid
        } : null,
        records: records.map(record => ({
          ...record,
          date: new Date(record.timestamp).toISOString()
        })),
        totalSessions: records.length,
        attendancePercentage: this.calculateAttendancePercentage(did)
      };
    } catch (error) {
      console.error('Error getting attendance:', error);
      throw new Error('Failed to get attendance records');
    }
  }

  // Get attendance percentage for a student
  async getAttendancePercentage(did) {
    try {
      return this.calculateAttendancePercentage(did);
    } catch (error) {
      console.error('Error calculating attendance percentage:', error);
      throw new Error('Failed to calculate attendance percentage');
    }
  }

  // Calculate attendance percentage
  calculateAttendancePercentage(did) {
    const records = attendanceRecords.get(did) || [];
    const totalPossibleSessions = 10; // Assuming 10 total sessions
    const attendedSessions = records.length;
    
    return totalPossibleSessions > 0 ? Math.round((attendedSessions / totalPossibleSessions) * 100) : 0;
  }

  // Get next session ID
  getNextSessionId() {
    // In a real implementation, this would be managed by the smart contract
    return Math.floor(Math.random() * 1000) + 1;
  }

  // Mock smart contract call
  async callSmartContract(functionName, args) {
    // In a real implementation, this would call the Move smart contract
    console.log(`Mock smart contract call: ${functionName}`, args);
    
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return { 
      success: true, 
      transactionHash: crypto.randomBytes(32).toString('hex'),
      blockNumber: Math.floor(Math.random() * 1000000)
    };
  }

  // Get system statistics
  async getSystemStats() {
    try {
      const allStudents = await didService.getAllStudents();
      const totalStudents = allStudents.length;
      let totalAttendance = 0;
      let studentsWithCertificates = 0;

      for (const student of allStudents) {
        const records = attendanceRecords.get(student.did) || [];
        totalAttendance += records.length;
        
        if (student.certificateIssued) {
          studentsWithCertificates++;
        }
      }

      const averageAttendance = totalStudents > 0 ? totalAttendance / totalStudents : 0;
      const overallAttendancePercentage = totalStudents > 0 ? 
        Math.round((totalAttendance / (totalStudents * 10)) * 100) : 0;

      return {
        totalStudents,
        totalAttendance,
        averageAttendance: Math.round(averageAttendance * 100) / 100,
        studentsWithCertificates,
        overallAttendancePercentage,
        totalSessions: 10, // Assuming 10 total sessions
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      throw new Error('Failed to get system statistics');
    }
  }

  // Get attendance history for all students
  async getAttendanceHistory() {
    try {
      const history = [];
      
      for (const [did, records] of attendanceRecords.entries()) {
        const student = await didService.getStudentByDID(did);
        if (student) {
          history.push({
            did,
            studentName: student.name,
            attendanceCount: records.length,
            attendancePercentage: this.calculateAttendancePercentage(did),
            lastAttendance: records.length > 0 ? 
              new Date(records[records.length - 1].timestamp).toISOString() : null,
            certificateIssued: student.certificateIssued
          });
        }
      }

      return history.sort((a, b) => b.attendanceCount - a.attendanceCount);
    } catch (error) {
      console.error('Error getting attendance history:', error);
      throw new Error('Failed to get attendance history');
    }
  }

  // Validate attendance record
  validateAttendanceRecord(record) {
    if (!record.timestamp || typeof record.timestamp !== 'number') {
      return false;
    }
    
    if (!record.sessionId || typeof record.sessionId !== 'number') {
      return false;
    }

    // Check if timestamp is not in the future
    if (record.timestamp > Date.now()) {
      return false;
    }

    return true;
  }
}

module.exports = new AttendanceService(); 