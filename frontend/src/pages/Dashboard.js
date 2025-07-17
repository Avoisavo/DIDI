import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, 
  Calendar, 
  Award, 
  TrendingUp, 
  Activity,
  Plus,
  Wifi,
  BarChart3
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  // Fetch system statistics
  const { data: statsData, isLoading: statsLoading } = useQuery(
    'stats',
    () => axios.get('/api/admin/stats'),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Fetch recent attendance
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery(
    'recent-attendance',
    () => axios.get('/api/admin/students'),
    {
      refetchInterval: 60000, // Refresh every minute
    }
  );

  const stats = statsData?.data?.stats || {};
  const students = attendanceData?.data?.students || [];

  // Mock attendance data for charts
  const attendanceChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
    datasets: [
      {
        label: 'Average Attendance %',
        data: [85, 88, 92, 87, 90, 94, 89, 91],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const attendanceChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weekly Attendance Trends',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const certificateChartData = {
    labels: ['Certificates Issued', 'Pending'],
    datasets: [
      {
        data: [stats.studentsWithCertificates || 0, (stats.totalStudents || 0) - (stats.studentsWithCertificates || 0)],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const certificateChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Certificate Status',
      },
    },
  };

  const StatCard = ({ title, value, icon: Icon, color, link }) => {
    const content = (
      <div className={`bg-white rounded-lg shadow-md p-6 card-hover ${link ? 'cursor-pointer' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );

    return link ? <Link to={link}>{content}</Link> : content;
  };

  const QuickActionCard = ({ title, description, icon: Icon, link, color }) => (
    <Link to={link} className="block">
      <div className="bg-white rounded-lg shadow-md p-6 card-hover">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Overview of the decentralized attendance system
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={stats.totalStudents || 0}
          icon={Users}
          color="bg-blue-500"
          link="/students"
        />
        <StatCard
          title="Total Attendance"
          value={stats.totalAttendance || 0}
          icon={Calendar}
          color="bg-green-500"
          link="/attendance"
        />
        <StatCard
          title="Certificates Issued"
          value={stats.studentsWithCertificates || 0}
          icon={Award}
          color="bg-purple-500"
          link="/credentials"
        />
        <StatCard
          title="Avg Attendance %"
          value={`${stats.overallAttendancePercentage || 0}%`}
          icon={TrendingUp}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Attendance Trend Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Line data={attendanceChartData} options={attendanceChartOptions} />
        </div>

        {/* Certificate Status Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Doughnut data={certificateChartData} options={certificateChartOptions} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard
            title="Mark Attendance"
            description="Use NFC to mark student attendance"
            icon={Wifi}
            link="/nfc"
            color="bg-blue-500"
          />
          <QuickActionCard
            title="Add Student"
            description="Register a new student with DID"
            icon={Plus}
            link="/students"
            color="bg-green-500"
          />
          <QuickActionCard
            title="View Reports"
            description="Check attendance reports and analytics"
            icon={BarChart3}
            link="/admin"
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        
        {attendanceLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="spinner w-6 h-6"></div>
          </div>
        ) : students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Student</th>
                  <th className="table-header-cell">DID</th>
                  <th className="table-header-cell">Attendance</th>
                  <th className="table-header-cell">Status</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {students.slice(0, 5).map((student) => (
                  <tr key={student.did} className="table-row">
                    <td className="table-cell">
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-gray-500">{student.email}</div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {student.did}
                      </code>
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
                        <span className="badge badge-success">Certificate Issued</span>
                      ) : (student.attendanceCount || 0) >= 8 ? (
                        <span className="badge badge-warning">Eligible for Certificate</span>
                      ) : (
                        <span className="badge badge-info">In Progress</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activity</p>
          </div>
        )}
        
        {students.length > 5 && (
          <div className="mt-4 text-center">
            <Link to="/students" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all students →
            </Link>
          </div>
        )}
      </div>

      {/* System Status */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Blockchain: Connected</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">NFC Reader: Ready</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">DID Registry: Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 