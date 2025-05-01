
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ username }) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-blue-600 text-xl font-bold">Admin Portal</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-500">
                Signed in as <span className="text-gray-900">{username}</span>
              </span>
              
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
