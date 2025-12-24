import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Sparkles, Home, LayoutDashboard, FileText, Video, User, CreditCard, LogOut, Menu, X } from 'lucide-react';

const NavBar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Interview', path: '/interview', icon: <Video className="w-5 h-5" /> },
    { name: 'Resume', path: '/resume-analysis', icon: <FileText className="w-5 h-5" /> },
  ];

  const userMenuItems = [
    { name: 'Profile', path: '/profile', icon: <User className="w-5 h-5" /> },
    { name: 'Subscription', path: '/subscription', icon: <CreditCard className="w-5 h-5" /> },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              AI Interview Pro
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => navigate(item.path)}
                className="text-gray-700 hover:text-purple-700 hover:bg-purple-50 flex items-center space-x-2"
              >
                {item.icon}
                <span>{item.name}</span>
              </Button>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                
                {/* User Dropdown */}
                <div className="relative group">
                  <Button
                    variant="ghost"
                    className="w-10 h-10 rounded-full p-0 overflow-hidden border-2 border-purple-200 hover:border-purple-400"
                  >
                    <img 
                      src={user.picture || `https://ui-avatars.com/api/?name=${user.name}&background=7c3aed&color=fff`} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </Button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-purple-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      {userMenuItems.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          className="w-full px-4 py-3 text-left hover:bg-purple-50 flex items-center space-x-3 text-gray-700 hover:text-purple-700"
                        >
                          {item.icon}
                          <span>{item.name}</span>
                        </button>
                      ))}
                      <hr className="my-2 border-purple-100" />
                      <button
                        onClick={onLogout}
                        className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center space-x-3 text-red-600"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-gray-700 hover:text-purple-700 hover:bg-purple-50 flex items-center space-x-2"
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Button>
              ))}
              <hr className="my-2 border-purple-100" />
              {userMenuItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-gray-700 hover:text-purple-700 hover:bg-purple-50 flex items-center space-x-2"
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Button>
              ))}
              <Button
                variant="ghost"
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
