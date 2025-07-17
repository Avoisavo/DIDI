import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

// Components
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Students from './pages/Students';
import Credentials from './pages/Credentials';
import NFCReader from './pages/NFCReader';
import Admin from './pages/Admin';
import LoadingSpinner from './components/LoadingSpinner';

// API functions
const api = {
  health: () => axios.get('/health'),
  stats: () => axios.get('/api/admin/stats'),
};

function App() {
  // Check API health
  const { data: healthData, isLoading: healthLoading, error: healthError } = useQuery(
    'health',
    api.health,
    {
      refetchInterval: 30000, // Check every 30 seconds
      retry: 3,
    }
  );

  // Get system stats
  const { data: statsData, isLoading: statsLoading } = useQuery(
    'stats',
    api.stats,
    {
      refetchInterval: 60000, // Refresh every minute
      retry: 3,
    }
  );

  // Show error toast if API is down
  React.useEffect(() => {
    if (healthError) {
      toast.error('Backend API is not responding. Please check the server.');
    }
  }, [healthError]);

  if (healthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        healthStatus={healthData?.data?.status}
        stats={statsData?.data?.stats}
      />
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/students" element={<Students />} />
          <Route path="/credentials" element={<Credentials />} />
          <Route path="/nfc" element={<NFCReader />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 text-sm">
              © 2024 Decentralized Attendance System. Built with IOTA & Move.
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${healthData?.data?.status === 'OK' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  API: {healthData?.data?.status || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 