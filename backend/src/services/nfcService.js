const didService = require('./didService');
const crypto = require('crypto');

// In-memory storage for NFC mappings
const nfcMappings = new Map();

class NFCService {
  constructor() {
    this.initializeMockData();
  }

  // Initialize with mock NFC data
  initializeMockData() {
    const mockNFCData = [
      {
        uid: '04A1B2C3D4E5F6',
        did: 'did:iota:test:student1',
        cardType: 'MIFARE Classic',
        lastSeen: new Date().toISOString(),
        status: 'active'
      },
      {
        uid: '04B2C3D4E5F6A7',
        did: 'did:iota:test:student2',
        cardType: 'MIFARE Classic',
        lastSeen: new Date().toISOString(),
        status: 'active'
      },
      {
        uid: '04C3D4E5F6A7B8',
        did: 'did:iota:test:student3',
        cardType: 'MIFARE Classic',
        lastSeen: new Date().toISOString(),
        status: 'active'
      }
    ];

    mockNFCData.forEach(nfc => {
      nfcMappings.set(nfc.uid, nfc);
    });
  }

  // Get student by NFC UID
  async getStudentByNFC(uid) {
    try {
      const nfcData = nfcMappings.get(uid);
      if (!nfcData) {
        return null;
      }

      // Update last seen timestamp
      nfcData.lastSeen = new Date().toISOString();
      nfcMappings.set(uid, nfcData);

      // Get student information
      const student = await didService.getStudentByDID(nfcData.did);
      if (!student) {
        return null;
      }

      return {
        ...student,
        nfcData: {
          uid: nfcData.uid,
          cardType: nfcData.cardType,
          lastSeen: nfcData.lastSeen,
          status: nfcData.status
        }
      };
    } catch (error) {
      console.error('Error getting student by NFC:', error);
      throw new Error('Failed to get student by NFC');
    }
  }

  // Register NFC card with DID
  async registerNFC(nfcUid, did) {
    try {
      // Validate NFC UID format
      if (!this.validateNFCUID(nfcUid)) {
        throw new Error('Invalid NFC UID format');
      }

      // Check if NFC UID already registered
      if (nfcMappings.has(nfcUid)) {
        throw new Error('NFC UID already registered');
      }

      // Verify student exists
      const student = await didService.getStudentByDID(did);
      if (!student) {
        throw new Error('Student not found');
      }

      // Create NFC mapping
      const nfcData = {
        uid: nfcUid,
        did: did,
        cardType: this.detectCardType(nfcUid),
        lastSeen: new Date().toISOString(),
        status: 'active',
        registeredAt: new Date().toISOString()
      };

      nfcMappings.set(nfcUid, nfcData);

      return {
        success: true,
        nfcData: nfcData,
        student: student
      };
    } catch (error) {
      console.error('Error registering NFC:', error);
      throw error;
    }
  }

  // Detect NFC card type based on UID
  detectCardType(uid) {
    // Basic card type detection based on UID length and format
    if (uid.length === 14 && uid.startsWith('04')) {
      return 'MIFARE Classic';
    } else if (uid.length === 8) {
      return 'MIFARE Ultralight';
    } else if (uid.length === 16) {
      return 'MIFARE DESFire';
    } else {
      return 'Unknown';
    }
  }

  // Validate NFC UID format
  validateNFCUID(uid) {
    // Basic validation for NFC UID
    const uidPattern = /^[0-9A-F]{8,16}$/i;
    return uidPattern.test(uid);
  }

  // Get all NFC mappings
  async getAllNFCMappings() {
    try {
      const mappings = [];
      
      for (const [uid, nfcData] of nfcMappings.entries()) {
        const student = await didService.getStudentByDID(nfcData.did);
        mappings.push({
          ...nfcData,
          student: student ? {
            name: student.name,
            email: student.email
          } : null
        });
      }

      return mappings;
    } catch (error) {
      console.error('Error getting NFC mappings:', error);
      throw new Error('Failed to get NFC mappings');
    }
  }

  // Update NFC card status
  async updateNFCStatus(uid, status) {
    try {
      const nfcData = nfcMappings.get(uid);
      if (!nfcData) {
        throw new Error('NFC card not found');
      }

      nfcData.status = status;
      nfcData.lastUpdated = new Date().toISOString();
      nfcMappings.set(uid, nfcData);

      return nfcData;
    } catch (error) {
      console.error('Error updating NFC status:', error);
      throw error;
    }
  }

  // Deactivate NFC card
  async deactivateNFC(uid) {
    try {
      return await this.updateNFCStatus(uid, 'inactive');
    } catch (error) {
      console.error('Error deactivating NFC:', error);
      throw error;
    }
  }

  // Reactivate NFC card
  async reactivateNFC(uid) {
    try {
      return await this.updateNFCStatus(uid, 'active');
    } catch (error) {
      console.error('Error reactivating NFC:', error);
      throw error;
    }
  }

  // Get NFC card statistics
  async getNFCStats() {
    try {
      const mappings = Array.from(nfcMappings.values());
      const totalCards = mappings.length;
      const activeCards = mappings.filter(m => m.status === 'active').length;
      const inactiveCards = mappings.filter(m => m.status === 'inactive').length;

      // Count card types
      const cardTypes = {};
      mappings.forEach(mapping => {
        const type = mapping.cardType;
        cardTypes[type] = (cardTypes[type] || 0) + 1;
      });

      return {
        totalCards,
        activeCards,
        inactiveCards,
        cardTypes,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting NFC stats:', error);
      throw new Error('Failed to get NFC statistics');
    }
  }

  // Search NFC cards
  async searchNFC(query) {
    try {
      const results = [];
      
      for (const [uid, nfcData] of nfcMappings.entries()) {
        const student = await didService.getStudentByDID(nfcData.did);
        
        if (student) {
          const searchText = `${uid} ${student.name} ${student.email}`.toLowerCase();
          if (searchText.includes(query.toLowerCase())) {
            results.push({
              ...nfcData,
              student: {
                name: student.name,
                email: student.email
              }
            });
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error searching NFC:', error);
      throw new Error('Failed to search NFC cards');
    }
  }

  // Generate mock NFC UID for testing
  generateMockNFCUID() {
    const uid = crypto.randomBytes(7).toString('hex').toUpperCase();
    return `04${uid}`;
  }

  // Simulate NFC card read
  async simulateNFCCardRead(uid) {
    try {
      const student = await this.getStudentByNFC(uid);
      if (!student) {
        throw new Error('NFC card not registered');
      }

      // Simulate reading delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        uid: uid,
        student: student,
        readAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error simulating NFC read:', error);
      throw error;
    }
  }

  // Get NFC card history
  async getNFCHistory(uid) {
    try {
      const nfcData = nfcMappings.get(uid);
      if (!nfcData) {
        throw new Error('NFC card not found');
      }

      // In a real implementation, this would fetch from a database
      const history = [
        {
          action: 'registered',
          timestamp: nfcData.registeredAt,
          details: 'Card registered to student'
        },
        {
          action: 'last_seen',
          timestamp: nfcData.lastSeen,
          details: 'Last card read'
        }
      ];

      if (nfcData.lastUpdated) {
        history.push({
          action: 'status_updated',
          timestamp: nfcData.lastUpdated,
          details: `Status changed to ${nfcData.status}`
        });
      }

      return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Error getting NFC history:', error);
      throw new Error('Failed to get NFC history');
    }
  }
}

module.exports = new NFCService(); 