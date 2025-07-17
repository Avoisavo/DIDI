import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  Award, 
  Wifi, 
  Settings, 
  Menu, 
  X,
  Activity
} from 'lucide-react';

const Navbar = ({ healthStatus, stats }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Attendance', href: '/attendance', icon: Calendar },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Credentials', href: '/credentials', icon: Award },
    { name: 'NFC Reader', href: '/nfc', icon: Wifi },
    { name: 'Admin', href: '/admin', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-900">Attendance System</h1>
                <p className="text-xs text-gray-500">IOTA Blockchain</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Status Indicators */}
          <div className="hidden md:flex items-center space-x-4">
            {/* API Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${healthStatus === 'OK' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">API</span>
            </div>

            {/* Stats */}
            {stats && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{stats.totalStudents || 0} Students</span>
                <span>{stats.studentsWithCertificates || 0} Certificates</span>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Mobile Status */}
            <div className="px-3 py-2 border-t border-gray-200 mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${healthStatus === 'OK' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>API Status</span>
                </div>
                {stats && (
                  <div className="text-right">
                    <div>{stats.totalStudents || 0} Students</div>
                    <div>{stats.studentsWithCertificates || 0} Certificates</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 