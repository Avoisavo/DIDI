import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Smartphone,
  CreditCard,
  Activity
} from 'lucide-react';

const NFCReader = () => {
  const [isNFCSupported, setIsNFCSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastRead, setLastRead] = useState(null);
  const [mockNFCUID, setMockNFCUID] = useState('04A1B2C3D4E5F6');
  const queryClient = useQueryClient();

  // Check NFC support on component mount
  useEffect(() => {
    checkNFCSupport();
  }, []);

  const checkNFCSupport = () => {
    if ('NDEFReader' in window) {
      setIsNFCSupported(true);
    } else {
      setIsNFCSupported(false);
      console.log('Web NFC API not supported in this browser');
    }
  };

  // Mutation for marking attendance
  const markAttendanceMutation = useMutation(
    (nfcUid) => axios.post('/api/attendance/mark', { nfcUid }),
    {
      onSuccess: (response) => {
        const { data } = response;
        setLastRead({
          success: true,
          nfcUid: data.attendance?.record?.nfcUid || mockNFCUID,
          student: data.attendance?.student,
          timestamp: new Date().toISOString(),
          attendanceCount: data.attendance?.attendanceCount,
          attendancePercentage: data.attendance?.attendancePercentage,
          certificateIssued: data.attendance?.certificateIssued
        });
        
        toast.success(`Attendance marked successfully! ${data.attendance?.attendancePercentage}% attendance`);
        
        // Invalidate and refetch relevant queries
        queryClient.invalidateQueries('stats');
        queryClient.invalidateQueries('attendance');
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.error || 'Failed to mark attendance';
        setLastRead({
          success: false,
          nfcUid: mockNFCUID,
          error: errorMessage,
          timestamp: new Date().toISOString()
        });
        toast.error(errorMessage);
      }
    }
  );

  // Start NFC scanning
  const startNFCScan = async () => {
    if (!isNFCSupported) {
      toast.error('NFC not supported in this browser');
      return;
    }

    try {
      setIsScanning(true);
      
      // Request NFC permission
      const ndef = new NDEFReader();
      
      await ndef.scan();
      
      ndef.addEventListener("reading", ({ message, serialNumber }) => {
        console.log("NFC Tag detected:", serialNumber);
        handleNFCTagRead(serialNumber);
      });

      ndef.addEventListener("readingerror", () => {
        console.log("NFC reading error");
        toast.error('Error reading NFC tag');
        setIsScanning(false);
      });

      toast.success('NFC scanning started. Tap a card to mark attendance.');
    } catch (error) {
      console.error('NFC scanning error:', error);
      toast.error('Failed to start NFC scanning');
      setIsScanning(false);
    }
  };

  // Stop NFC scanning
  const stopNFCScan = () => {
    setIsScanning(false);
    toast.info('NFC scanning stopped');
  };

  // Handle NFC tag read
  const handleNFCTagRead = (nfcUid) => {
    setIsScanning(false);
    markAttendanceMutation.mutate(nfcUid);
  };

  // Mock NFC read for testing
  const handleMockNFCRead = () => {
    setIsScanning(true);
    
    // Simulate NFC reading delay
    setTimeout(() => {
      setIsScanning(false);
      markAttendanceMutation.mutate(mockNFCUID);
    }, 1500);
  };

  // Generate random mock NFC UID
  const generateMockNFCUID = () => {
    const mockUIDs = [
      '04A1B2C3D4E5F6',
      '04B2C3D4E5F6A7', 
      '04C3D4E5F6A7B8',
      '04D4E5F6A7B8C9',
      '04E5F6A7B8C9D0'
    ];
    const randomUID = mockUIDs[Math.floor(Math.random() * mockUIDs.length)];
    setMockNFCUID(randomUID);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">NFC Reader</h1>
        <p className="text-gray-600">
          Use NFC cards to mark student attendance. Tap a card to automatically record attendance.
        </p>
      </div>

      {/* NFC Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* NFC Support Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            {isNFCSupported ? (
              <Wifi className="w-6 h-6 text-green-500" />
            ) : (
              <WifiOff className="w-6 h-6 text-red-500" />
            )}
            <h3 className="text-lg font-semibold text-gray-900">NFC Support</h3>
          </div>
          <p className="text-gray-600 mb-4">
            {isNFCSupported 
              ? 'Web NFC API is supported in this browser'
              : 'Web NFC API is not supported. Use mock mode for testing.'
            }
          </p>
          {!isNFCSupported && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    NFC is not supported in this browser. You can use the mock mode below to test the system.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scanning Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Activity className={`w-6 h-6 ${isScanning ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
            <h3 className="text-lg font-semibold text-gray-900">Scanning Status</h3>
          </div>
          <p className="text-gray-600 mb-4">
            {isScanning ? 'Scanning for NFC cards...' : 'Ready to scan'}
          </p>
          <div className="flex space-x-3">
            {isNFCSupported && (
              <button
                onClick={isScanning ? stopNFCScan : startNFCScan}
                disabled={markAttendanceMutation.isLoading}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  isScanning
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isScanning ? 'Stop Scanning' : 'Start Scanning'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mock NFC Testing */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Smartphone className="w-5 h-5 mr-2" />
          Mock NFC Testing
        </h3>
        <p className="text-gray-600 mb-4">
          Test the attendance system with mock NFC cards. This simulates the NFC reading process.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="form-label">Mock NFC UID</label>
            <input
              type="text"
              value={mockNFCUID}
              onChange={(e) => setMockNFCUID(e.target.value)}
              className="form-input"
              placeholder="Enter NFC UID"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={generateMockNFCUID}
              className="btn-secondary w-full"
            >
              Generate Random UID
            </button>
          </div>
        </div>

        <button
          onClick={handleMockNFCRead}
          disabled={isScanning || markAttendanceMutation.isLoading}
          className="btn-primary w-full md:w-auto"
        >
          {markAttendanceMutation.isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="spinner w-4 h-4"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Simulate NFC Read</span>
            </div>
          )}
        </button>
      </div>

      {/* Last Read Result */}
      {lastRead && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Last Read Result</h3>
          
          {lastRead.success ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-700 font-medium">Attendance Marked Successfully</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">NFC UID</p>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{lastRead.nfcUid}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Student</p>
                  <p className="font-medium">{lastRead.student?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Attendance Count</p>
                  <p className="font-medium">{lastRead.attendanceCount || 0} sessions</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Attendance Percentage</p>
                  <p className="font-medium">{lastRead.attendancePercentage || 0}%</p>
                </div>
              </div>

              {lastRead.certificateIssued && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="ml-2 text-green-800 font-medium">
                      Certificate of Completion issued!
                    </span>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500">
                Timestamp: {new Date(lastRead.timestamp).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 font-medium">Error Reading NFC</span>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-800">{lastRead.error}</p>
              </div>

              <div className="text-xs text-gray-500">
                Timestamp: {new Date(lastRead.timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="space-y-2 text-blue-800">
          <p>1. <strong>Real NFC:</strong> Click "Start Scanning" and tap an NFC card to the device</p>
          <p>2. <strong>Mock Testing:</strong> Use the mock NFC testing section to simulate card reads</p>
          <p>3. <strong>Attendance:</strong> Each successful read marks attendance for the student</p>
          <p>4. <strong>Certificates:</strong> Students with 80%+ attendance automatically receive certificates</p>
        </div>
      </div>
    </div>
  );
};

export default NFCReader; 