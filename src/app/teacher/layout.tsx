'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Users, BarChart2, ChevronDown, LogOut, FileText } from 'lucide-react';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) {
      router.push('/login');
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (!user.roles || !user.roles.includes('TEACHER')) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        router.push('/login');
      }
    } catch (e) {
      router.push('/login');
    }
  }, [router]);

  const navigation = [
    { name: 'Students', href: '/teacher/students', icon: Users },
    { name: 'Reports', href: '/teacher/reports', icon: BarChart2 },
    { name: 'Offline Exams', href: '/teacher/offline-exams', icon: FileText },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Logo */}
          <div className="p-6 flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <BookOpen size={20} />
            </div>
            <span className="font-semibold text-gray-800 text-sm leading-tight">
              Learning Assessment <br /> Platform
            </span>
          </div>

          {/* Navigation */}
          <nav className="px-4 py-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Global Top Navbar */}
        <header className="bg-white border-b border-gray-100 h-16 shrink-0 flex items-center justify-between px-5 z-30">
          
          <div className="flex items-center md:hidden">
            <div className="font-extrabold text-gray-900 text-[14px] leading-tight flex items-center gap-2">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm">
                <BookOpen size={14} strokeWidth={2.5} />
              </div>
              <span>LAT</span>
            </div>
          </div>

          {/* Profile Block (Right aligned) */}
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 md:hover:bg-gray-200/50 p-1.5 pr-3 rounded-full transition-colors">
              <div className="text-right flex flex-col justify-center hidden sm:flex">
                <span className="text-sm font-bold text-gray-900 leading-none">Teacher Profile</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Teacher</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm">
                TP
              </div>
              <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
            </div>

            <button 
              onClick={handleLogout}
              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors ml-2 flex items-center gap-2"
              title="Sign Out"
            >
              <LogOut size={18} />
              <span className="text-sm font-bold hidden sm:block">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
