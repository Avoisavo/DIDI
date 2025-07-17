import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { 
  Settings, 
  BarChart3, 
  Users, 
  Calendar, 
  Award, 
  Activity,
  TrendingUp,
  Database,
  Shield,
  Zap
} from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Admin = () => {
  // Fetch system statistics
  const { data: statsData, isLoading: statsLoading } = useQuery(
    'admin-stats',
    () => axios.get('/api/admin/stats'),
    {
      refetchInterval: 30000,
    }
  );

  // Fetch students data
  const { data: studentsData, isLoading: studentsLoading } = useQuery(
    'admin-students',
    () => axios.get('/api/admin/students'),
    {
      refetchInterval: 60000,
    }
  );

  const stats = statsData?.data?.stats || {};
  const students = studentsData?.data?.students || [];

  // Chart data
  const attendanceTrendData = {
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

  const attendanceTrendOptions = {
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

  const certificateStatusData = {
    labels: ['Certificates Issued', 'Eligible', 'In Progress'],
    datasets: [
      {
        data: [
          stats.studentsWithCertificates || 0,
          students.filter(s => !s.certificateIssued && (s.attendanceCount || 0) >= 8).length,
          students.filter(s => !s.certificateIssued && (s.attendanceCount || 0) < 8).length
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const certificateStatusOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Certificate Status Distribution',
      },
    },
  };

  const attendanceDistributionData = {
    labels: ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'],
    datasets: [
      {
        label: 'Number of Students',
        data: [
          students.filter(s => Math.round(((s.attendanceCount || 0) / 10) * 100) <= 20).length,
          students.filter(s => {
            const pct = Math.round(((s.attendanceCount || 0) / 10) * 100);
            return pct > 20 && pct <= 40;
          }).length,
          students.filter(s => {
            const pct = Math.round(((s.attendanceCount || 0) / 10) * 100);
            return pct > 40 && pct <= 60;
          }).length,
          students.filter(s => {
            const pct = Math.round(((s.attendanceCount || 0) / 10) * 100);
            return pct > 60 && pct <= 80;
          }).length,
          students.filter(s => Math.round(((s.attendanceCount || 0) / 10) * 100) > 80).length,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 101, 101, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 101, 101, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const attendanceDistributionOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Attendance Distribution',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-md p-6 card-hover">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const SystemStatusCard = ({ title, status, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-2 rounded-full ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${status === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className={`text-sm font-medium ${status === 'Online' ? 'text-green-600' : 'text-red-600'}`}>
          {status}
        </span>
      </div>
    </div>
  );

  if (statsLoading || studentsLoading) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          System administration and analytics overview
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={stats.totalStudents || 0}
          icon={Users}
          color="bg-blue-500"
          subtitle="Registered students"
        />
        <StatCard
          title="Total Attendance"
          value={stats.totalAttendance || 0}
          icon={Calendar}
          color="bg-green-500"
          subtitle="Sessions attended"
        />
        <StatCard
          title="Certificates Issued"
          value={stats.studentsWithCertificates || 0}
          icon={Award}
          color="bg-purple-500"
          subtitle="80%+ attendance"
        />
        <StatCard
          title="Avg Attendance"
          value={`${stats.overallAttendancePercentage || 0}%`}
          icon={TrendingUp}
          color="bg-orange-500"
          subtitle="System average"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Attendance Trend Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Line data={attendanceTrendData} options={attendanceTrendOptions} />
        </div>

        {/* Certificate Status Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Doughnut data={certificateStatusData} options={certificateStatusOptions} />
        </div>
      </div>

      {/* Attendance Distribution Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <Bar data={attendanceDistributionData} options={attendanceDistributionOptions} />
      </div>

      {/* System Status */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SystemStatusCard
            title="Blockchain"
            status="Online"
            icon={Database}
            color="bg-green-500"
          />
          <SystemStatusCard
            title="NFC Reader"
            status="Online"
            icon={Zap}
            color="bg-blue-500"
          />
          <SystemStatusCard
            title="DID Registry"
            status="Online"
            icon={Shield}
            color="bg-purple-500"
          />
          <SystemStatusCard
            title="API Server"
            status="Online"
            icon={Activity}
            color="bg-orange-500"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        
        <div className="space-y-4">
          {students.slice(0, 5).map((student, index) => (
            <div key={student.did} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {student.attendanceCount || 0} sessions
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round(((student.attendanceCount || 0) / 10) * 100)}% attendance
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {students.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activity</p>
          </div>
        )}
      </div>

      {/* System Information */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Technology Stack</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• IOTA Identity Framework</li>
              <li>• Move Smart Contracts (Aptos)</li>
              <li>• Web NFC API</li>
              <li>• React Frontend</li>
              <li>• Node.js Backend</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Features</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Decentralized Identity (DID)</li>
              <li>• NFC Card Integration</li>
              <li>• Blockchain Attendance Tracking</li>
              <li>• Verifiable Credentials</li>
              <li>• Real-time Analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin; 