
// src/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

// Import the navigation items configuration
import navigationItems, { SidebarNavItem } from '@/config/sidebarConfig'; // Adjust import path

import { useRouter } from 'next/navigation';
import { authService } from '@/services';
import { useAuth } from '@/context/AuthContext'



export default function Sidebar() {
    const { checkAuth } = useAuth(); // Get user and loading state from AuthContext
    const pathname = usePathname(); // Get current path to highlight active link

    const router = useRouter();
    
    const handleLogout = async () => {
      if(confirm("Are you sure to sign out?")){
        try {
          await authService.signOut();
  
          // Clear auth state and redirect
           checkAuth(); 
          // Or redirect to login page
          // router.push('/sign-in');  
        } catch (error) {
          console.error('Sign out failed:', error);
        }
      }
      
    };
    
    return (
      <aside className="narrow-sidebar">
        <nav>
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
            })}
          </ul>
        </nav>
    
        {/* Logout Button */}
        <div className="sidebar-footer">
          <button 
            onClick={handleLogout} 
            className="sidebar-nav-item sign-out-button"
          >
            <span className="sidebar-nav-icon">🚪</span>
            <span className="sidebar-nav-text">Logout</span>
          </button>
        </div>
      </aside>
    );
}


