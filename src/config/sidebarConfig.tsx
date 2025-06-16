// src/config/sidebarNavConfig.ts
import React from 'react'; // Still need React for JSX compilation in some setups
// Import the IconType as well, although it's not used directly in the interface,
// it might help TS understand the imports are component types.
import { FaHome, FaCalendarAlt, FaUsers, FaChartBar, FaBell, FaCog, FaTicketAlt, FaSignInAlt, FaUserPlus, FaDollarSign, FaPeopleCarry, FaUserAlt, FaUser } from 'react-icons/fa';


// Define the structure for a navigation item
interface SidebarNavItem {
    href: string; // The path to navigate to
    icon: React.ReactNode; // <-- Correct type: React.ReactNode (Represents the JSX element)
    label: string; // The text label for the link - THIS IS REQUIRED
    roles?: ('Admin' | 'Event Organizer' | 'Participant' | 'Guest')[];
}

// Define the navigation items with icons, labels, and role restrictions
const navigationItems: SidebarNavItem[] = [
    // Using the imported components as JSX elements (values)
    { label: 'Home', href: '/', icon: <FaHome />, roles: ['Admin', 'Event Organizer', 'Participant'] },
    { label: 'Events', href: '/events', icon: <FaCalendarAlt />, roles: ['Admin', 'Event Organizer', 'Participant'] },
    // { label: 'Notifications', href: '/notifications', icon: <FaBell />, roles: ['Admin', 'Event Organizer', 'Participant'] },
   
    { label: 'Budgets', href: '/budgets', icon: <FaDollarSign />, roles: ['Admin'] },
    { label: 'Roles', href: '/roles', icon: <FaUser />, roles: ['Admin'] },
    { label: 'Reports', href: '/reports', icon: <FaChartBar />, roles: ['Admin'] },
    { label: 'Users', href: '/users', icon: <FaUsers />, roles: ['Admin'] },
   
    { label: 'Settings', href: '/settings', icon: <FaCog />, roles: ['Admin', 'Event Organizer', 'Participant'] },
    // Add back the Participant and Guest specific items
];

// Export the array of all navigation items
export default navigationItems;

// Export the interface using 'export type'
export type { SidebarNavItem };