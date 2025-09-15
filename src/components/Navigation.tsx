import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PermissionGate } from './PermissionGate';
import { 
  Home, 
  UserPlus, 
  Users, 
  GraduationCap, 
  MessageSquare, 
  Upload,
  Settings,
  LogOut,
  School,
  Shield
} from 'lucide-react';

export const Navigation = () => {
  const { user, schoolName, userRole, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Onboarding', path: '/onboarding', icon: UserPlus },
    { name: 'Parents', path: '/parents', icon: Users },
    { name: 'Students', path: '/students', icon: GraduationCap },
    { name: 'Bulk SMS', path: '/sms', icon: MessageSquare },
    { name: 'Import Data', path: '/import', icon: Upload },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Add Staff Management for owners only
  if (userRole === 'owner') {
    navItems.push({ name: 'Staff', path: '/staff', icon: Shield });
  }

  if (!user) {
    return (
      <nav className="bg-white shadow-lg border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <School className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-blue-600">School Board</span>
            </Link>
           <div className="flex space-x-3">
  <Link
    to="/auth"
    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
  >
    Login
  </Link>

  <a
    href="https://forms.gle/H6zF6gHpwS1Dv53Z6"
    target="_blank"
    rel="noopener noreferrer"
    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
  >
    Give Feedback
  </a>
</div>

          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg border-b-4 border-yellow-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <School className="h-8 w-8 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-blue-600">School Board</span>
              {schoolName && (
                <span className="text-xs text-gray-500">{schoolName}</span>
              )}
            </div>
          </Link>
          
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex space-x-3 items-center">
  <button
    onClick={signOut}
    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
  >
    <LogOut className="h-4 w-4" />
    <span className="text-sm font-medium">Logout</span>
  </button>

  <a
    href="https://forms.gle/H6zF6gHpwS1Dv53Z6"
    target="_blank"
    rel="noopener noreferrer"
    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
  >
    Give Feedback
  </a>
</div>

        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};