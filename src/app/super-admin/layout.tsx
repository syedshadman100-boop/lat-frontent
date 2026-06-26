'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuGroups, setMenuGroups] = useState<{ title: string; items: any[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await apiClient.get('/menus/my-menus');
        const menus = res.data.data || res.data; // Handle the response wrapper
        
        // Group menus by 'group' field
        const groupsMap = new Map<string, any[]>();
        menus.forEach((menu: any) => {
          if (!groupsMap.has(menu.group)) {
            groupsMap.set(menu.group, []);
          }
          groupsMap.get(menu.group)!.push({
            name: menu.title,
            href: menu.href,
            iconName: menu.icon,
          });
        });

        // Convert to array and ensure order if necessary
        const groupedArray = Array.from(groupsMap.entries()).map(([title, items]) => ({
          title,
          items,
        }));
        
        // Define a custom order for groups to match the mockup exactly
        const groupOrder = ['MAIN', 'QUESTIONS', 'ASSESSMENTS', 'USERS', 'REPORTS'];
        groupedArray.sort((a, b) => groupOrder.indexOf(a.title) - groupOrder.indexOf(b.title));

        setMenuGroups(groupedArray);
      } catch (err) {
        console.error('Failed to fetch menus', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const BookOpen = LucideIcons['BookOpen'] as any;
  const LogOut = LucideIcons['LogOut'] as any;
  const UserPlus = LucideIcons['UserPlus'] as any;
  const ChevronDown = LucideIcons['ChevronDown'] as any;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-gray-100 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Logo */}
          <div className="p-6 pb-2 flex items-center space-x-3 sticky top-0 bg-white z-10">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm">
              <BookOpen size={20} />
            </div>
            <span className="font-extrabold text-gray-900 text-[15px] leading-tight">
              Learning Assessment <br /> Platform
            </span>
          </div>

          {/* Navigation Groups */}
          <div className="px-4 py-6 space-y-6">
            {loading ? (
              <div className="flex justify-center p-4">
                <span className="text-xs text-gray-400">Loading menus...</span>
              </div>
            ) : (
              menuGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    {group.title}
                  </h3>
                  <nav className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = pathname.startsWith(item.href);
                      const Icon = (LucideIcons as any)[item.iconName] || LucideIcons.Circle;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                            isActive
                              ? 'bg-[#f0f4fc] text-[#435eea]'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#435eea]' : 'text-gray-400'} />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-100 bg-white shrink-0 flex flex-col gap-1">
          <div className="flex items-center justify-between px-2 py-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full border border-blue-100 bg-white text-blue-600 flex items-center justify-center">
                <UserPlus size={16} className="text-blue-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] text-gray-400 font-semibold uppercase tracking-wider">Super Admin</span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 mt-1 text-[13px] font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full"
          >
            <LogOut size={16} strokeWidth={2} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#f4f7fb]">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
