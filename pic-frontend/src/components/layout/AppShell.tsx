import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Compass, Plus, BookOpen, MessageCircle, History, Bell, User, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { UserAvatar } from '@/components/user/UserAvatar';

const navItems = [
  { to: '/discover', icon: <Compass size={20} />, label: 'Discover' },
  { to: '/create-pic', icon: <Plus size={20} />, label: 'Create PIC' },
  { to: '/my-pics', icon: <BookOpen size={20} />, label: 'My PICs' },
  { to: '/messages', icon: <MessageCircle size={20} />, label: 'Messages' },
  { to: '/passed', icon: <History size={20} />, label: 'Passed' },
];

const mobileNav = [
  { to: '/discover', icon: <Compass size={22} />, label: 'Discover' },
  { to: '/create-pic', icon: <Plus size={22} />, label: 'Create' },
  { to: '/messages', icon: <MessageCircle size={22} />, label: 'Messages' },
  { to: '/passed', icon: <History size={22} />, label: 'Passed' },
  { to: '/profile', icon: <User size={22} />, label: 'Profile' },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { currentUser, logout, unreadNotifications } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex flex-col">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-yellow-100 border-r-2 border-black px-4 py-6">
          {/* Logo */}
          <NavLink to="/discover" className="flex items-center gap-2 px-2 mb-8">
            <span className="text-2xl font-black text-black tracking-tight">PIC<span className="text-pink-500">!</span></span>
            <span className="text-xs font-bold text-gray-700 leading-tight">Partner<br />In Crime</span>
          </NavLink>

          {/* Nav */}
          <nav className="flex-1 space-y-1" aria-label="Main navigation">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive ? 'bg-yellow-300 text-black border-2 border-black shadow-[3px_3px_0px_#000]' : 'text-gray-800 hover:bg-white hover:text-black'}`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}

            {/* Notifications */}
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive ? 'bg-yellow-300 text-black border-2 border-black shadow-[3px_3px_0px_#000]' : 'text-gray-800 hover:bg-white hover:text-black'}`
              }
            >
              <span className="relative">
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </span>
              Notifications
            </NavLink>
          </nav>

          {/* User */}
          {currentUser && (
            <div className="border-t-2 border-black pt-4 mt-4">
              <NavLink to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-yellow-200 transition-colors">
                <UserAvatar user={currentUser} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{currentUser.name}</p>
                  <p className="text-xs text-gray-400 truncate">{currentUser.location}</p>
                </div>
              </NavLink>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors w-full mt-1"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-yellow-100 border-b-2 border-black h-14 flex items-center px-4 justify-between">
      <span className="text-xl font-black text-black tracking-tight">PIC<span className="text-pink-500">!</span></span>
        <NavLink to="/notifications" className="relative p-2 text-gray-500 hover:text-gray-900">
          <Bell size={20} />
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadNotifications}
            </span>
          )}
        </NavLink>
      </div>

      {/* Main */}
      <main className="flex-1 lg:pl-64 pt-14 lg:pt-0 pb-20 lg:pb-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-yellow-100 border-t-2 border-black" aria-label="Mobile navigation">
        <div className="flex items-center justify-around h-16">
          {mobileNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all
                ${isActive ? 'text-black font-extrabold' : 'text-gray-600 hover:text-black'}`
              }
            >
              {item.to === '/create-pic'
                ? <span className="w-10 h-10 bg-pink-400 text-black rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center">{item.icon}</span>
                : item.icon
              }
              {item.to !== '/create-pic' && item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
