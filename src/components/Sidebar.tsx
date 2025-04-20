// 'use client';
// import { Calendar, BarChart, Settings, LogOut } from 'lucide-react';
// import Link from 'next/link';

// export default function Sidebar() {
//   return (
//     <div className="w-64 bg-white h-screen p-4  ">
//       <nav className="space-y-4 text-sm">
//         {/* <div className="flex items-center gap-2 cursor-pointer font-semibold text-gray-600"> Dashboard</div> */}
//         <div className="text-gray-500">Home</div>
//         <div className="pl-4 text-gray-600 space-y-2">
//           <div className="font-semibold cursor-pointer">
//             <Link href="/">Dashboard</Link>
//             </div>
//         </div>
//         <div className="text-gray-500">Events</div>
//         <div className="font-semibold cursor-pointer pl-4 text-gray-600 space-y-2">
//           <div>
//           <Link href="/events/create" className="block hover:text-blue-600">Create Event</Link>            
//           </div>
//           <div>
//             <Link href="/events/pending-events">Pending Events</Link>
//           </div>
//           <div>
//             <Link href="/events/active-events">Active Events</Link>
//           </div>
//           <div>
//             <Link href="/events/completed-events">Completed Events</Link>
//           </div>
//         </div>
//         <div className="mt-4 text-gray-500">Reports</div>
//         <div className="font-semibold cursor-pointer  pl-4 text-gray-600 space-y-2">
//           <div>Generate Reports</div>
//           <div>My Reports</div>
//         </div>
//         <hr className="my-4 border-gray-300" />
//         <div className="cursor-pointer mt-6 font-semibold flex items-center gap-2 text-gray-600">Account Settings</div>
//         <div className="flex items-center gap-2 text-red-500 mt-2 cursor-pointer"><LogOut size={18}/> Logout</div>
//       </nav>
//     </div>
//   );
// }


// src/components/Sidebar.tsx
'use client'; // Use client-side navigation with Link

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // To determine active link
import React from 'react';

// Define navigation items with path and icon
const navItems = [
  { name: 'Home', href: '/', icon: '🏠' }, // Use appropriate icons
  { name: 'Events', href: '/events', icon: '📅' },
  { name: 'Reports', href: '/reports', icon: '📊' },
  { name: 'Account', href: '/account', icon: '👤' }, // Example path
  { name: 'Settings', href: '/settings', icon: '⚙️' }, // Example path
];

export default function Sidebar() {
  const pathname = usePathname(); // Get current path to highlight active link

  return (
    // The root element should have a class for styling the narrow sidebar
    <aside className="narrow-sidebar">
      <nav>
        <ul className="sidebar-nav-list">
          {navItems.map((item) => {
            // Determine if the current link is active
            // For base paths like /events, check if the current pathname starts with it
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));

            return (
              <li key={item.name} className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                <Link href={item.href} className="sidebar-nav-link">
                <span className="sidebar-nav-icon">{item.icon}</span>
                <span className="sidebar-nav-text">{item.name}</span>
                  
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}