import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { 
  Calendar, 
  Search, 
  Filter,
  Download,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

const Attendance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch attendance data
  const { data: attendanceData, isLoading } = useQuery(
    'attendance-history',
    () => axios.get('/api/admin/students'),
    {
      refetchInterval: 30000,
    }
  );

  const students = attendanceData?.data?.students || [];

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StudentAttendanceModal = ({ student }) => {
    const [attendanceRecords, setAttendanceRecords] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchAttendanceRecords = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/attendance/${student.did}`);
        setAttendanceRecords(response.data.attendance);
      } catch (error) {
        console.error('Error fetching attendance records:', error);
      }
      setLoading(false);
    };

    React.useEffect(() => {
      if (student) {
        fetchAttendanceRecords();
      }
    }, [student]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Attendance Records - {student.name}</h3>
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="spinner w-6 h-6"></div>
            </div>
          ) : attendanceRecords ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                  <p className="text-lg font-semibold">{attendanceRecords.totalSessions}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Attendance %</p>
                  <p className="text-lg font-semibold">{attendanceRecords.attendancePercentage}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold">
                    {attendanceRecords.attendancePercentage >= 80 ? 'Eligible for Certificate' : 'In Progress'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Session History</h4>
                <div className="space-y-2">
                  {attendanceRecords.records && attendanceRecords.records.length > 0 ? (
                    attendanceRecords.records.map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="font-medium">Session {record.sessionId}</p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(record.date), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Transaction</p>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {record.transactionHash?.substring(0, 8)}...
                          </code>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No attendance records found</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Failed to load attendance records</p>
          )}
          
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
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance</h1>
        <p className="text-gray-600">
          View and manage student attendance records
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
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button className="btn-secondary flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
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
                  <th className="table-header-cell">Attendance Sessions</th>
                  <th className="table-header-cell">Percentage</th>
                  <th className="table-header-cell">Last Attendance</th>
                  <th className="table-header-cell">Status</th>
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
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{student.attendanceCount || 0} / 10</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.round(((student.attendanceCount || 0) / 10) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(((student.attendanceCount || 0) / 10) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {student.lastAttendance ? 
                            format(new Date(student.lastAttendance), 'MMM dd, yyyy') : 
                            'Never'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      {student.certificateIssued ? (
                        <span className="badge badge-success">Certificate Issued</span>
                      ) : (student.attendanceCount || 0) >= 8 ? (
                        <span className="badge badge-warning">Eligible for Certificate</span>
                      ) : (
                        <span className="badge badge-info">In Progress</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="btn-primary text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredStudents.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">No attendance records found</p>
            <p className="text-gray-400 text-sm">
              {searchTerm ? 'Try adjusting your search terms' : 'Start marking attendance to see records'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedStudent && <StudentAttendanceModal student={selectedStudent} />}
    </div>
  );
};

export default Attendance; 