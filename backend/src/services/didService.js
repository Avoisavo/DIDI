const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// Mock IOTA Identity implementation for hackathon demo
class MockIotaIdentity {
  constructor() {
    this.dids = new Map();
  }

  // Generate a mock DID
  createDid() {
    const did = `did:iota:${crypto.randomBytes(16).toString('hex')}`;
    const document = {
      id: did,
      controller: did,
      verificationMethod: [{
        id: `${did}#key-1`,
        type: 'Ed25519VerificationKey2018',
        controller: did,
        publicKeyBase58: crypto.randomBytes(32).toString('base64')
      }],
      authentication: [`${did}#key-1`],
      assertionMethod: [`${did}#key-1`],
      keyAgreement: [`${did}#key-1`],
      capabilityInvocation: [`${did}#key-1`],
      capabilityDelegation: [`${did}#key-1`]
    };
    
    this.dids.set(did, document);
    return { did, document };
  }

  // Verify a DID (mock implementation)
  verifyDid(did) {
    return this.dids.has(did);
  }

  // Get DID document
  getDidDocument(did) {
    return this.dids.get(did);
  }
}

// Initialize mock IOTA Identity
const mockIotaIdentity = new MockIotaIdentity();

// Mock data for students
const students = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@university.edu',
    did: 'did:iota:alice123',
    nfcUid: 'A1B2C3D4',
    department: 'Computer Science',
    enrollmentDate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@university.edu',
    did: 'did:iota:bob456',
    nfcUid: 'E5F6G7H8',
    department: 'Mathematics',
    enrollmentDate: '2024-01-20'
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@university.edu',
    did: 'did:iota:carol789',
    nfcUid: 'I9J0K1L2',
    department: 'Physics',
    enrollmentDate: '2024-01-25'
  }
];

// Initialize students with DIDs
students.forEach(student => {
  if (!student.did) {
    const { did } = mockIotaIdentity.createDid();
    student.did = did;
  }
});

class DIDService {
  constructor() {
    this.students = students;
  }

  // Create a new DID for a student
  async createDID(studentData) {
    try {
      const { did, document } = mockIotaIdentity.createDid();
      
      const student = {
        id: uuidv4(),
        name: studentData.name,
        email: studentData.email,
        did: did,
        nfcUid: studentData.nfcUid,
        department: studentData.department,
        enrollmentDate: new Date().toISOString().split('T')[0],
        didDocument: document
      };

      this.students.push(student);
      
      return {
        success: true,
        student,
        did,
        document
      };
    } catch (error) {
      console.error('Error creating DID:', error);
      return {
        success: false,
        error: 'Failed to create DID'
      };
    }
  }

  // Get all students with their DIDs
  async getAllStudents() {
    return {
      success: true,
      students: this.students.map(student => ({
        id: student.id,
        name: student.name,
        email: student.email,
        did: student.did,
        nfcUid: student.nfcUid,
        department: student.department,
        enrollmentDate: student.enrollmentDate
      }))
    };
  }

  // Get student by DID
  async getStudentByDID(did) {
    const student = this.students.find(s => s.did === did);
    if (!student) {
      return {
        success: false,
        error: 'Student not found'
      };
    }
    
    return {
      success: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        did: student.did,
        nfcUid: student.nfcUid,
        department: student.department,
        enrollmentDate: student.enrollmentDate
      }
    };
  }

  // Get student by NFC UID
  async getStudentByNFCUid(nfcUid) {
    const student = this.students.find(s => s.nfcUid === nfcUid);
    if (!student) {
      return {
        success: false,
        error: 'Student not found'
      };
    }
    
    return {
      success: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        did: student.did,
        nfcUid: student.nfcUid,
        department: student.department,
        enrollmentDate: student.enrollmentDate
      }
    };
  }

  // Verify DID
  async verifyDID(did) {
    const isValid = mockIotaIdentity.verifyDid(did);
    return {
      success: true,
      isValid,
      did
    };
  }

  // Get DID document
  async getDIDDocument(did) {
    const document = mockIotaIdentity.getDidDocument(did);
    if (!document) {
      return {
        success: false,
        error: 'DID document not found'
      };
    }
    
    return {
      success: true,
      document
    };
  }

  // Update student information
  async updateStudent(studentId, updates) {
    const studentIndex = this.students.findIndex(s => s.id === studentId);
    if (studentIndex === -1) {
      return {
        success: false,
        error: 'Student not found'
      };
    }

    this.students[studentIndex] = {
      ...this.students[studentIndex],
      ...updates
    };

    return {
      success: true,
      student: this.students[studentIndex]
    };
  }

  // Delete student
  async deleteStudent(studentId) {
    const studentIndex = this.students.findIndex(s => s.id === studentId);
    if (studentIndex === -1) {
      return {
        success: false,
        error: 'Student not found'
      };
    }

    const deletedStudent = this.students.splice(studentIndex, 1)[0];
    return {
      success: true,
      student: deletedStudent
    };
  }
}

module.exports = new DIDService(); 