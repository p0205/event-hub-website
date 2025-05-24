// src/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';


// Import the navigation items configuration
import navigationItems from '@/config/sidebarConfig'; // Adjust import path

import { useRouter } from 'next/navigation';
import { authService } from '@/services';
import { useAuth } from '@/context/AuthContext'

export default function Sidebar() {
  const { checkAuth } = useAuth(); // Get user and loading state from AuthContext
  const pathname = usePathname(); // Get current path to highlight active link
  const router = useRouter();

  const handleLogout = async () => {
    if (confirm("Are you sure to sign out?")) {
      try {
        await authService.signOut();
        // Clear auth state and redirect
        router.replace('/sign-in');
        checkAuth();
        // Or redirect to login page

      } catch (error) {
        console.error('Sign out failed:', error);
      }
    }
  };

  return (
    <aside className="narrow-sidebar flex flex-col h-full">
      {/* Main Navigation */}
      <nav className="flex-grow">
        <ul className="sidebar-nav-list">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));

            return (
              <li key={item.href} className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                <Link href={item.href} className="sidebar-nav-link">
                  <span className="sidebar-nav-icon">{item.icon}</span>
                  <span className="sidebar-nav-text">{item.label}</span>
                </Link>
              </li>
            );
          }
          )}
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


