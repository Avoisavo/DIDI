const didService = require('./didService');
const attendanceService = require('./attendanceService');
const crypto = require('crypto');

// In-memory storage for credentials
const credentials = new Map();

class CredentialService {
  constructor() {
    this.initializeMockData();
  }

  // Initialize with mock credential data
  initializeMockData() {
    const mockCredentials = [
      {
        did: 'did:iota:test:student1',
        credentialId: 'credential:attendance:student1:001',
        type: 'CertificateOfCompletion',
        issuedAt: new Date().toISOString(),
        issuer: 'did:iota:test:university',
        subject: {
          did: 'did:iota:test:student1',
          name: 'Alice Johnson',
          email: 'alice.johnson@university.edu'
        },
        claims: {
          courseName: 'Blockchain Development',
          attendancePercentage: 80,
          totalSessions: 8,
          requiredSessions: 10,
          completionDate: new Date().toISOString()
        },
        proof: {
          type: 'Ed25519Signature2020',
          created: new Date().toISOString(),
          verificationMethod: 'did:iota:test:university#key-1',
          proofPurpose: 'assertionMethod',
          signature: crypto.randomBytes(64).toString('hex')
        },
        status: 'valid'
      }
    ];

    mockCredentials.forEach(credential => {
      credentials.set(credential.did, credential);
    });
  }

  // Get credentials for a student
  async getCredentials(did) {
    try {
      const student = await didService.getStudentByDID(did);
      if (!student) {
        throw new Error('Student not found');
      }

      const credential = credentials.get(did);
      const attendancePercentage = await attendanceService.getAttendancePercentage(did);

      return {
        did,
        student: {
          name: student.name,
          email: student.email
        },
        credential: credential || null,
        attendancePercentage,
        eligibleForCertificate: attendancePercentage >= 80 && !credential
      };
    } catch (error) {
      console.error('Error getting credentials:', error);
      throw new Error('Failed to get credentials');
    }
  }

  // Issue certificate for a student
  async issueCertificate(did) {
    try {
      const student = await didService.getStudentByDID(did);
      if (!student) {
        throw new Error('Student not found');
      }

      // Check if already has certificate
      const existingCredential = credentials.get(did);
      if (existingCredential) {
        throw new Error('Certificate already issued');
      }

      // Check attendance percentage
      const attendancePercentage = await attendanceService.getAttendancePercentage(did);
      if (attendancePercentage < 80) {
        throw new Error('Insufficient attendance for certificate (minimum 80% required)');
      }

      // Get attendance records
      const attendance = await attendanceService.getAttendance(did);

      // Create verifiable credential
      const credential = this.createVerifiableCredential(did, student, attendance);

      // Store credential
      credentials.set(did, credential);

      // Update student record
      await didService.issueCertificate(did);

      return {
        success: true,
        credential: credential,
        message: 'Certificate issued successfully'
      };
    } catch (error) {
      console.error('Error issuing certificate:', error);
      throw error;
    }
  }

  // Create a verifiable credential
  createVerifiableCredential(did, student, attendance) {
    const credentialId = `credential:attendance:${did.split(':').pop()}:${Date.now()}`;
    const issuedAt = new Date().toISOString();

    const credential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1'
      ],
      id: credentialId,
      type: ['VerifiableCredential', 'CertificateOfCompletion'],
      issuer: {
        id: 'did:iota:test:university',
        name: 'University Blockchain Program'
      },
      issuanceDate: issuedAt,
      credentialSubject: {
        id: did,
        name: student.name,
        email: student.email,
        courseName: 'Blockchain Development with IOTA',
        attendancePercentage: attendance.attendancePercentage,
        totalSessions: attendance.totalSessions,
        requiredSessions: 10,
        completionDate: issuedAt,
        programDescription: 'Advanced course in blockchain development using IOTA technology stack'
      },
      proof: {
        type: 'Ed25519Signature2020',
        created: issuedAt,
        verificationMethod: 'did:iota:test:university#key-1',
        proofPurpose: 'assertionMethod',
        signature: crypto.randomBytes(64).toString('hex')
      }
    };

    return credential;
  }

  // Verify a credential
  async verifyCredential(credential) {
    try {
      // In a real implementation, this would verify the cryptographic proof
      // For demo purposes, we'll do basic validation
      
      if (!credential.id || !credential.type || !credential.issuer || !credential.credentialSubject) {
        return { valid: false, error: 'Invalid credential structure' };
      }

      if (!credential.proof || !credential.proof.signature) {
        return { valid: false, error: 'Missing proof' };
      }

      // Check if credential exists in our storage
      const storedCredential = credentials.get(credential.credentialSubject.id);
      if (!storedCredential || storedCredential.id !== credential.id) {
        return { valid: false, error: 'Credential not found in registry' };
      }

      return { valid: true, message: 'Credential verified successfully' };
    } catch (error) {
      console.error('Error verifying credential:', error);
      return { valid: false, error: 'Verification failed' };
    }
  }

  // Revoke a credential
  async revokeCredential(did) {
    try {
      const credential = credentials.get(did);
      if (!credential) {
        throw new Error('Credential not found');
      }

      credential.status = 'revoked';
      credential.revokedAt = new Date().toISOString();
      credentials.set(did, credential);

      return {
        success: true,
        credential: credential,
        message: 'Credential revoked successfully'
      };
    } catch (error) {
      console.error('Error revoking credential:', error);
      throw error;
    }
  }

  // Get all credentials
  async getAllCredentials() {
    try {
      const allCredentials = [];
      
      for (const [did, credential] of credentials.entries()) {
        const student = await didService.getStudentByDID(did);
        allCredentials.push({
          ...credential,
          student: student ? {
            name: student.name,
            email: student.email
          } : null
        });
      }

      return allCredentials;
    } catch (error) {
      console.error('Error getting all credentials:', error);
      throw new Error('Failed to get credentials');
    }
  }

  // Get credential statistics
  async getCredentialStats() {
    try {
      const allCredentials = Array.from(credentials.values());
      const totalCredentials = allCredentials.length;
      const validCredentials = allCredentials.filter(c => c.status === 'valid').length;
      const revokedCredentials = allCredentials.filter(c => c.status === 'revoked').length;

      // Calculate average attendance percentage
      const totalAttendancePercentage = allCredentials.reduce((sum, c) => 
        sum + (c.credentialSubject?.attendancePercentage || 0), 0);
      const averageAttendancePercentage = totalCredentials > 0 ? 
        Math.round(totalAttendancePercentage / totalCredentials) : 0;

      return {
        totalCredentials,
        validCredentials,
        revokedCredentials,
        averageAttendancePercentage,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting credential stats:', error);
      throw new Error('Failed to get credential statistics');
    }
  }

  // Generate credential QR code data
  generateCredentialQR(credential) {
    try {
      // In a real implementation, this would generate a QR code
      // For demo purposes, we'll return the credential data as JSON
      return {
        qrData: JSON.stringify(credential),
        qrUrl: `https://example.com/verify/${credential.id}`,
        message: 'Scan this QR code to verify the credential'
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Export credential as PDF (mock)
  async exportCredentialAsPDF(did) {
    try {
      const credential = credentials.get(did);
      if (!credential) {
        throw new Error('Credential not found');
      }

      // In a real implementation, this would generate a PDF
      // For demo purposes, we'll return mock PDF data
      return {
        success: true,
        pdfUrl: `https://example.com/credentials/${did}/certificate.pdf`,
        filename: `certificate_${did.split(':').pop()}.pdf`,
        message: 'Certificate exported successfully'
      };
    } catch (error) {
      console.error('Error exporting credential:', error);
      throw new Error('Failed to export credential');
    }
  }

  // Check if student is eligible for certificate
  async checkEligibility(did) {
    try {
      const student = await didService.getStudentByDID(did);
      if (!student) {
        throw new Error('Student not found');
      }

      const attendancePercentage = await attendanceService.getAttendancePercentage(did);
      const existingCredential = credentials.get(did);

      return {
        did,
        student: {
          name: student.name,
          email: student.email
        },
        attendancePercentage,
        hasCertificate: !!existingCredential,
        eligible: attendancePercentage >= 80 && !existingCredential,
        requiredAttendance: 80,
        sessionsNeeded: Math.max(0, 8 - (await attendanceService.getAttendance(did)).totalSessions)
      };
    } catch (error) {
      console.error('Error checking eligibility:', error);
      throw new Error('Failed to check eligibility');
    }
  }
}

module.exports = new CredentialService(); 