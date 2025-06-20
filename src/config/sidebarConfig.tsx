// src/config/sidebarNavConfig.ts
import React from 'react'; // Still need React for JSX compilation in some setups
// Import the IconType as well, although it's not used directly in the interface,
// it might help TS understand the imports are component types.
import { FaHome, FaCalendarAlt, FaUsers, FaChartBar, FaCog, FaDollarSign,FaUser, FaChartLine, FaCalendarPlus } from 'react-icons/fa';


// Define the structure for a navigation item
interface SidebarNavItem {
    href: string; // The path to navigate to
    icon: React.ReactNode; // <-- Correct type: React.ReactNode (Represents the JSX element)
    label: string; // The text label for the link - THIS IS REQUIRED
    roles?: ('ADMIN' | 'EVENT ORGANIZER' | 'Participant' | 'Guest')[];
}

// Define the navigation items with icons, labels, and role restrictions
const navigationItems: SidebarNavItem[] = [
    // Using the imported components as JSX elements (values)
    { label: 'Home', href: '/', icon: <FaHome />, roles: ['EVENT ORGANIZER', 'Participant'] },
    { label: 'Dashboard', href: '/dashboard', icon: <FaChartLine />, roles: ['ADMIN'] },
    { label: 'Create Event', href: '/create-event', icon: <FaCalendarPlus />, roles: [ 'EVENT ORGANIZER', 'Participant'] },
    { label: 'My Events', href: '/my-events', icon: <FaCalendarAlt />, roles: [ 'EVENT ORGANIZER', 'Participant'] },
    // { label: 'Notifications', href: '/notifications', icon: <FaBell />, roles: ['Admin', 'Event Organizer', 'Participant'] },
   
    { label: 'Budgets', href: '/budgets', icon: <FaDollarSign />, roles: ['ADMIN'] },
    { label: 'Roles', href: '/roles', icon: <FaUser />, roles: ['ADMIN'] },
    { label: 'Reports', href: '/reports', icon: <FaChartBar />, roles: ['ADMIN'] },
    { label: 'Users', href: '/users', icon: <FaUsers />, roles: ['ADMIN'] },
   
    // { label: 'Settings', href: '/settings', icon: <FaCog />, roles: ['ADMIN', 'EVENT ORGANIZER', 'Participant'] },
    // Add back the Participant and Guest specific items
];

// Export the array of all navigation items
export default navigationItems;

// Export the interface using 'export type'
export type { SidebarNavItem };