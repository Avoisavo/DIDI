import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Users, 
  Plus, 
  Search, 
  UserPlus,
  CreditCard,
  Copy,
  Eye,
  Edit
} from 'lucide-react';

const Students = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nfcUid: ''
  });

  // Fetch students
  const { data: studentsData, isLoading } = useQuery(
    'students',
    () => axios.get('/api/admin/students'),
    {
      refetchInterval: 30000,
    }
  );

  // Create student mutation
  const createStudentMutation = useMutation(
    (studentData) => axios.post('/api/did/create', studentData),
    {
      onSuccess: () => {
        toast.success('Student created successfully!');
        setIsModalOpen(false);
        setFormData({ name: '', email: '', nfcUid: '' });
        queryClient.invalidateQueries('students');
        queryClient.invalidateQueries('stats');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create student');
      }
    }
  );

  const students = studentsData?.data?.students || [];

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.did.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nfcUid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    createStudentMutation.mutate(formData);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const generateMockNFCUID = () => {
    const mockUIDs = [
      '04A1B2C3D4E5F6',
      '04B2C3D4E5F6A7',
      '04C3D4E5F6A7B8',
      '04D4E5F6A7B8C9',
      '04E5F6A7B8C9D0'
    ];
    const randomUID = mockUIDs[Math.floor(Math.random() * mockUIDs.length)];
    setFormData({ ...formData, nfcUid: randomUID });
  };

  const StudentModal = ({ student }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Student Details</h3>
        
        <div className="space-y-4">
          <div>
            <label className="form-label">Name</label>
            <p className="font-medium">{student.name}</p>
          </div>
          
          <div>
            <label className="form-label">Email</label>
            <p className="font-medium">{student.email}</p>
          </div>
          
          <div>
            <label className="form-label">DID</label>
            <div className="flex items-center space-x-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1">
                {student.did}
              </code>
              <button
                onClick={() => copyToClipboard(student.did)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div>
            <label className="form-label">NFC UID</label>
            <div className="flex items-center space-x-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1">
                {student.nfcUid || 'Not assigned'}
              </code>
              {student.nfcUid && (
                <button
                  onClick={() => copyToClipboard(student.nfcUid)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div>
            <label className="form-label">Attendance</label>
            <p className="font-medium">{student.attendanceCount || 0} sessions</p>
          </div>
          
          <div>
            <label className="form-label">Certificate Status</label>
            {student.certificateIssued ? (
              <span className="badge badge-success">Issued</span>
            ) : (
              <span className="badge badge-info">Not Issued</span>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setSelectedStudent(null)}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const CreateStudentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Add New Student</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter student name"
              required
            />
          </div>
          
          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter student email"
              required
            />
          </div>
          
          <div>
            <label className="form-label">NFC UID</label>
            <div className="flex space-x-2">
              <input
                type="text"
                name="nfcUid"
                value={formData.nfcUid}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter NFC UID"
                required
              />
              <button
                type="button"
                onClick={generateMockNFCUID}
                className="btn-secondary whitespace-nowrap"
              >
                Generate
              </button>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={createStudentMutation.isLoading}
              className="btn-primary flex-1"
            >
              {createStudentMutation.isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="spinner w-4 h-4"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Student'
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Students</h1>
        <p className="text-gray-600">
          Manage student registrations, DIDs, and NFC card mappings
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
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Students Table */}
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
                  <th className="table-header-cell">DID</th>
                  <th className="table-header-cell">NFC Card</th>
                  <th className="table-header-cell">Attendance</th>
                  <th className="table-header-cell">Certificate</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredStudents.map((student) => (
                  <tr key={student.did} className="table-row">
                    <td className="table-cell">
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-gray-500">{student.email}</div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {student.did}
                        </code>
                        <button
                          onClick={() => copyToClipboard(student.did)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="table-cell">
                      {student.nfcUid ? (
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-green-500" />
                          <code className="text-xs bg-green-100 px-2 py-1 rounded">
                            {student.nfcUid}
                          </code>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not assigned</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium">
                          {student.attendanceCount || 0} sessions
                        </div>
                        <div className="text-xs text-gray-500">
                          ({Math.round(((student.attendanceCount || 0) / 10) * 100)}%)
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {student.certificateIssued ? (
                        <span className="badge badge-success">Issued</span>
                      ) : (student.attendanceCount || 0) >= 8 ? (
                        <span className="badge badge-warning">Eligible</span>
                      ) : (
                        <span className="badge badge-info">In Progress</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => copyToClipboard(student.did)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Copy DID"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredStudents.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">No students found</p>
            <p className="text-gray-400 text-sm">
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first student to get started'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {isModalOpen && <CreateStudentModal />}
      {selectedStudent && <StudentModal student={selectedStudent} />}
    </div>
  );
};

export default Students; 