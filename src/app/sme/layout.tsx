'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, LayoutDashboard, FileQuestion, FileText, Users, BarChart2, Activity, ChevronDown, Menu, X, Clock } from 'lucide-react';

import { LogOut } from 'lucide-react';

const MENU_GROUPS = [
  {
    title: 'MAIN',
    items: [
      { name: 'Generate Questions', href: '/sme/questions/generate', icon: FileQuestion },
      { name: 'Review Questions', href: '/sme/questions/review', icon: FileText },
      { name: 'Generation History', href: '/sme/reports', icon: Clock },
      { name: 'Quality Report', href: '/sme/reports/quality', icon: Activity },
    ],
  },
];

export default function SmeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="flex fixed inset-0 bg-[#f4f7fb] text-gray-900 overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop fixed, Mobile sliding drawer) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-gray-100 flex flex-col justify-between 
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Logo */}
          <div className="p-6 pb-4 flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center space-x-3">
              <div className="bg-[#1e40af] text-white p-2 rounded-xl shadow-sm">
                <BookOpen size={20} strokeWidth={2.5} />
              </div>
              <span className="font-extrabold text-gray-900 text-[14px] leading-tight tracking-tight">
                Learning Assessment <br /> Platform
              </span>
            </div>
            {/* Close button on Mobile */}
            <button 
              className="md:hidden text-gray-400 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Groups */}
          <div className="px-4 py-6 space-y-8">
            {MENU_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  {group.title}
                </h3>
                <nav className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                          isActive
                            ? 'bg-[#eff4ff] text-[#2563eb] shadow-sm'
                            : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-gray-900'
                        }`}
                      >
                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#2563eb]' : 'text-[#94a3b8] group-hover:text-gray-900 transition-colors'} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Global Top Navbar */}
        <header className="bg-white border-b border-[#e2e8f0] h-16 shrink-0 flex items-center justify-between px-5 z-30">
          
          {/* Hamburger Menu (Mobile Only) */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="ml-3 font-extrabold text-gray-900 text-[14px] leading-tight flex items-center gap-2">
              <div className="bg-[#1e40af] text-white p-1.5 rounded-lg shadow-sm">
                <BookOpen size={14} strokeWidth={2.5} />
              </div>
              <span>LAT</span>
            </div>
          </div>

          {/* Profile Block (Right aligned) */}
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 md:hover:bg-gray-200/50 p-1.5 pr-3 rounded-full transition-colors">
              <div className="text-right flex flex-col justify-center hidden sm:flex">
                <span className="text-sm font-bold text-gray-900 leading-none">Subject Expert</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">SME</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-gray-400">
                <Users size={16} />
              </div>
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
        <div className="flex-1 overflow-y-auto w-full p-5">
          {children}
        </div>
      </main>
    </div>
  );
}
