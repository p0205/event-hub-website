
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

    // // Determine the user's current role for filtering
    // // If not logged in or loading, treat as 'Guest'
    // const userRole = !user || loading ? 'Guest' : user.role; // Assuming user.role exists and matches roles in config

    // // Filter navigation items based on the user's role
    // const filteredNavItems = navigationItems.filter(item => {
    //     // If an item has a 'roles' array, show it ONLY if the user's role is in that array
    //     // If an item does NOT have a 'roles' array, show it to ALL authenticated users (not guests)
    //     // Guest role items are handled explicitly by checking if the user IS a Guest
    //     if (userRole === 'Guest') {
    //         // Only show items explicitly defined for 'Guest'
    //         return item.roles?.includes('Guest');
    //     } else {
    //         // For authenticated users, show items that are NOT explicitly for 'Guest'
    //         // AND either have no specific roles defined (implying visible to all auth)
    //         // OR have roles defined and the user's role is included in that list.
    //          return !item.roles?.includes('Guest') && (!item.roles || item.roles.includes(userRole));
    //     }
    // });

    // --- Render Logic ---

    // Optional: Render a minimal sidebar or spinner while loading auth status
    // if (loading) {
    //     return (
    //         <aside className={'narrow-sidebar'}>
    //              <div className={"sidebar-header"}>
    //                  <span>Loading...</span>
    //              </div>
    //              <div className={"sidebar-nav"}>
    //                  {/* Optional loading placeholders */}
    //              </div>
    //         </aside>
    //     );
    // }

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


