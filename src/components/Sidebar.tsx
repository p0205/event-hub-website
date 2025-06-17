// src/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';

// Import the navigation items configuration
import navigationItems, { SidebarNavItem } from '@/config/sidebarConfig';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'

// Define valid roles type
type ValidRole = 'ADMIN' | 'EVENT ORGANIZER' | 'Participant' | 'Guest';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    if (confirm("Are you sure to sign out?")) {
      try {
        await signOut();
      } catch (error) {
        console.error('Sign out failed:', error);
      }
    }
  };

  // Filter navigation items based on user role
  const filteredNavigationItems = navigationItems.filter(item => {
    // If no roles specified, item is accessible to all
    if (!item.roles) return true;
    
    // If user has no role, only show items with no role restriction
    if (!user?.role) return false;
    
    // Ensure user role is a valid role type
    const userRole = user.role as ValidRole;
    
    // Check if user's role is in the allowed roles
    return item.roles.includes(userRole);
  });

  return (
    <aside className="narrow-sidebar flex flex-col h-full">
      {/* Main Navigation */}
      <nav className="flex-grow">
        <ul className="sidebar-nav-list">
          {filteredNavigationItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));

            return (
              <li key={item.href} className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                <Link href={item.href} className="sidebar-nav-link">
                  <span className="sidebar-nav-icon">{item.icon}</span>
                  <span className="sidebar-nav-text">{item.label}</span>
                </Link>
              </li>
            );
          })}
          {/* Divider */}
          <div className="border-t border-gray-300 my-2"></div>
          <button
            onClick={handleLogout}
            className="sidebar-nav-item sign-out-button w-full flex flex-col items-center py-3"
          >
            <span className="sidebar-nav-icon mb-1"><FaSignOutAlt /></span>
            <span className="sidebar-nav-text text-sm">Logout</span>
          </button>
        </ul>
      </nav>
    </aside>
  );
}


