import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Award, 
  Search, 
  Download,
  Eye,
  Copy,
  CheckCircle,
  XCircle,
  QrCode
} from 'lucide-react';
import QRCode from 'qrcode.react';

const Credentials = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCredential, setSelectedCredential] = useState(null);
  const queryClient = useQueryClient();

  // Fetch credentials data
  const { data: credentialsData, isLoading } = useQuery(
    'credentials',
    () => axios.get('/api/admin/students'),
    {
      refetchInterval: 30000,
    }
  );

  // Issue certificate mutation
  const issueCertificateMutation = useMutation(
    (did) => axios.post('/api/credentials/issue', { did }),
    {
      onSuccess: () => {
        toast.success('Certificate issued successfully!');
        queryClient.invalidateQueries('credentials');
        queryClient.invalidateQueries('stats');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to issue certificate');
      }
    }
  );

  const students = credentialsData?.data?.students || [];

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const CredentialModal = ({ student }) => {
    const [credentialData, setCredentialData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchCredential = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/credentials/${student.did}`);
        setCredentialData(response.data.credentials);
      } catch (error) {
        console.error('Error fetching credential:', error);
      }
      setLoading(false);
    };

    React.useEffect(() => {
      if (student) {
        fetchCredential();
      }
    }, [student]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Credential Details - {student.name}</h3>
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="spinner w-6 h-6"></div>
            </div>
          ) : credentialData ? (
            <div className="space-y-6">
              {credentialData.credential ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-green-800">Certificate Issued</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Issued on {new Date(credentialData.credential.issuanceDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-blue-800">Attendance: {credentialData.attendancePercentage}%</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Meets 80% requirement for certificate
                      </p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-3">Credential Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600">Credential ID</label>
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1">
                            {credentialData.credential.id}
                          </code>
                          <button
                            onClick={() => copyToClipboard(credentialData.credential.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600">Course Name</label>
                        <p className="font-medium">{credentialData.credential.credentialSubject?.courseName}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600">Completion Date</label>
                        <p className="font-medium">
                          {new Date(credentialData.credential.credentialSubject?.completionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-3">QR Code</h4>
                    <div className="flex justify-center">
                      <QRCode 
                        value={JSON.stringify(credentialData.credential)}
                        size={128}
                        level="M"
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Scan to verify credential
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <XCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-2">No certificate issued yet</p>
                  <p className="text-gray-400 text-sm">
                    {credentialData.attendancePercentage >= 80 
                      ? 'Student is eligible for certificate' 
                      : `Student needs ${80 - credentialData.attendancePercentage}% more attendance`
                    }
                  </p>
                  {credentialData.attendancePercentage >= 80 && (
                    <button
                      onClick={() => issueCertificateMutation.mutate(student.did)}
                      disabled={issueCertificateMutation.isLoading}
                      className="btn-primary mt-4"
                    >
                      {issueCertificateMutation.isLoading ? 'Issuing...' : 'Issue Certificate'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Failed to load credential data</p>
          )}
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setSelectedCredential(null)}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Credentials</h1>
        <p className="text-gray-600">
          Manage verifiable credentials and certificates
        </p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button className="btn-secondary flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Credentials Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner w-8 h-8"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Student</th>
                  <th className="table-header-cell">Attendance %</th>
                  <th className="table-header-cell">Certificate Status</th>
                  <th className="table-header-cell">Issued Date</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredStudents.map((student) => {
                  const attendancePercentage = Math.round(((student.attendanceCount || 0) / 10) * 100);
                  const isEligible = attendancePercentage >= 80;
                  
                  return (
                    <tr key={student.did} className="table-row">
                      <td className="table-cell">
                        <div>
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-gray-500">{student.email}</div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                attendancePercentage >= 80 ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${attendancePercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{attendancePercentage}%</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        {student.certificateIssued ? (
                          <span className="badge badge-success">Issued</span>
                        ) : isEligible ? (
                          <span className="badge badge-warning">Eligible</span>
                        ) : (
                          <span className="badge badge-info">In Progress</span>
                        )}
                      </td>
                      <td className="table-cell">
                        {student.certificateIssuedAt ? (
                          <span className="text-sm text-gray-600">
                            {new Date(student.certificateIssuedAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Not issued</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedCredential(student)}
                            className="btn-primary text-sm"
                          >
                            View Details
                          </button>
                          {isEligible && !student.certificateIssued && (
                            <button
                              onClick={() => issueCertificateMutation.mutate(student.did)}
                              disabled={issueCertificateMutation.isLoading}
                              className="btn-success text-sm"
                            >
                              Issue
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredStudents.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">No credentials found</p>
            <p className="text-gray-400 text-sm">
              {searchTerm ? 'Try adjusting your search terms' : 'Students need 80% attendance to be eligible for certificates'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedCredential && <CredentialModal student={selectedCredential} />}
    </div>
  );
};

export default Credentials; 