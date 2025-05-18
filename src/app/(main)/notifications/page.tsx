// src/app/notifications/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link'; // If notifications link to other pages (e.g., event details)

// Assuming a data structure for a Notification
interface Notification {
    id: string;
    userId: string; // The user the notification is for
    message: string; // The main text of the notification
    timestamp: string; // ISO string for when the notification occurred
    isRead: boolean; // Whether the user has read it
    type: 'event_invite' | 'event_update' | 'event_status' | 'message' | 'reminder' | 'report_available' | 'other'; // Type of notification
    linkUrl?: string; // Optional URL to navigate to when clicked
    // Add other relevant data, eg:
    // eventId?: string; // If related to a specific event
    // senderId?: string; // If from a specific user
}


// Assuming a CSS Module for notifications page specific styles
import styles from './notifications.module.css'; // Create this CSS module


// --- Define Mock Data ---

// Mock data for a list of notifications
const mockNotifications: Notification[] = [
    {
        id: 'notif-1', userId: 'user-1', message: 'You have been invited to "Project Kickoff".',
        timestamp: '2025-04-20T10:00:00Z', isRead: false, type: 'event_invite', linkUrl: '/events/project-kickoff-id/overview'
    },
     {
        id: 'notif-2', userId: 'user-1', message: 'The "Annual Conference" budget report is now available.',
        timestamp: '2025-04-20T09:30:00Z', isRead: false, type: 'report_available', linkUrl: '/events/annual-conference-id/reports'
    },
    {
        id: 'notif-3', userId: 'user-1', message: 'Your event "Client Workshop" has been approved.',
        timestamp: '2025-04-19T18:00:00Z', isRead: true, type: 'event_status', linkUrl: '/events/client-workshop-id/overview'
    },
     {
        id: 'notif-4', userId: 'user-1', message: 'Reminder: Team Sync meeting tomorrow at 10 AM.',
        timestamp: '2025-04-19T09:00:00Z', isRead: true, type: 'reminder',
    },
    {
        id: 'notif-5', userId: 'user-1', message: 'New message from Alice Wonderland.',
        timestamp: '2025-04-18T15:00:00Z', isRead: true, type: 'message', linkUrl: '/messages/alice-id' // Example link to messages
    },
];
// --- End Mock Data ---


export default function NotificationsPage() {
    // --- State for data and loading ---
    const [notifications, setNotifications] = useState<Notification[]>([]);// State to hold notifications
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- State for managing actions ---
    const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
    const [isClearingAll, setIsClearingAll] = useState(false);


    // --- Data Loading (using Mock Data) ---
    // Simulate fetching notifications for the current user
    useEffect(() => {
        const loadMockNotifications = async () => {
            setLoading(true);
            setError(null);
            try {
                // Simulate a network request delay
                await new Promise(resolve => setTimeout(resolve, 500));

                // Use mock data (filter by user ID if necessary, though mock data is for one user)
                const data: Notification[] = mockNotifications; // In real app: filter by logged-in userId
                setNotifications(data);

            } catch (e: any) {
                console.error("Error loading notifications:", e);
                setError(`Failed to load notifications: ${e.message || 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };

        loadMockNotifications();

    }, []); // Effect runs only once on mount for the current user


    // --- Handlers ---

    // Handle marking a single notification as read/unread
    const handleMarkAsRead = async (notificationId: string, isRead: boolean) => {
        console.log(`Simulating marking notification ${notificationId} as ${isRead ? 'read' : 'unread'}`);

        // TODO: Implement API call to update notification status
        // Example: fetch(`/api/notifications/${notificationId}`, {
        //     method: 'PATCH', // Or PUT
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ isRead: isRead }),
        // });


        // --- Simulate State Update ---
        try {
             // await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

             setNotifications(prevNotifications =>
                prevNotifications.map(notif =>
                    notif.id === notificationId ? { ...notif, isRead: isRead } : notif
                )
             );
             console.log("Simulated successful mark as read/unread.");
        } catch (e: any) {
             console.error("Simulated mark as read/unread error:", e);
             // TODO: Show user feedback for error
        }
        // --- End Simulate State Update ---
    };

    // Handle deleting a single notification
     const handleDeleteNotification = async (notificationId: string) => {
         console.log(`Simulating deleting notification ${notificationId}`);

         // TODO: Add confirmation dialog before deleting

         // TODO: Implement API call to delete notification
         // Example: fetch(`/api/notifications/${notificationId}`, {
         //     method: 'DELETE',
         // });

         // --- Simulate State Update ---
         try {
              // await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

             setNotifications(prevNotifications =>
                prevNotifications.filter(notif => notif.id !== notificationId)
             );
             console.log("Simulated successful notification deletion.");
         } catch (e: any) {
             console.error("Simulated delete notification error:", e);
             // TODO: Show user feedback for error
         }
         // --- End Simulate State Update ---
     };

    // Handle marking all notifications as read
    const handleMarkAllAsRead = async () => {
        if (notifications.every(notif => notif.isRead)) {
             console.log("All notifications already read.");
             // TODO: Show user feedback
            return; // No action needed if all are already read
        }

        setIsMarkingAllRead(true);
        console.log("Simulating marking all notifications as read...");

        // TODO: Implement API call to mark all as read
        // Example: fetch(`/api/notifications/mark-all-read`, { method: 'POST' });


        // --- Simulate State Update ---
        try {
             await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay

             setNotifications(prevNotifications =>
                prevNotifications.map(notif => ({ ...notif, isRead: true }))
             );
             console.log("Simulated successful mark all as read.");
        } catch (e: any) {
             console.error("Simulated mark all as read error:", e);
             // TODO: Show user feedback for error
        } finally {
             setIsMarkingAllRead(false);
        }
        // --- End Simulate State Update ---
    };

    // Handle clearing all notifications
    const handleClearAllNotifications = async () => {
         if (notifications.length === 0) {
              console.log("No notifications to clear.");
              // TODO: Show user feedback
             return; // No action needed if list is empty
         }

         // TODO: Add confirmation dialog before clearing all

        setIsClearingAll(true);
        console.log("Simulating clearing all notifications...");

        // TODO: Implement API call to clear all notifications
        // Example: fetch(`/api/notifications`, { method: 'DELETE' });


        // --- Simulate State Update ---
        try {
             await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay

             setNotifications([]); // Clear the list
             console.log("Simulated successful clear all notifications.");
        } catch (e: any) {
             console.error("Simulated clear all notifications error:", e);
             // TODO: Show user feedback for error
        } finally {
             setIsClearingAll(false);
        }
        // --- End Simulate State Update ---
    };


    // Helper to format timestamp
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        // Example formatting: "Apr 20, 2025, 10:00 AM" or relative time "2 hours ago"
        // Using toLocaleString for a basic format
        return date.toLocaleString();
    };


    // --- Render Logic ---
    if (loading) {
        return (
            <div className="page-content-wrapper">
                <h2 className="page-title">Notifications</h2>
                <p className="loading-message">Loading notifications...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-content-wrapper">
                <h2 className="page-title">Notifications</h2>
                <p className="error-message">Error: {error}</p>
            </div>
        );
    }

     const hasNotifications = notifications && notifications.length > 0;
     const hasUnreadNotifications = notifications.some(notif => !notif.isRead);


    return (
        <div className="page-content-wrapper"> {/* Reuse existing wrapper for padding/spacing */}
            {/* --- Page Title --- */}
            <h2 className="page-title">Notifications</h2>

            {/* --- Notification Management Actions --- */}
             {/* Only show if there are notifications to manage */}
             {hasNotifications && (
                 <div className="form-container" style={{ marginBottom: '20px' }}> {/* Reuse form-container */}
                      <h3>Manage Notifications</h3>
                      <div className={styles["notification-actions"]}> {/* Use CSS Module for layout */}
                          {/* Mark All as Read Button */}
                          <button
                             className="button-secondary" // Reuse button style
                             onClick={handleMarkAllAsRead}
                              disabled={isMarkingAllRead || isClearingAll || !hasUnreadNotifications} // Disable if already all read or other actions in progress
                          >
                              {isMarkingAllRead ? 'Marking...' : 'Mark All as Read'}
                          </button>

                          {/* Clear All Button */}
                           <button
                             className="button-secondary" // Reuse button style
                             onClick={handleClearAllNotifications}
                              disabled={isClearingAll || isMarkingAllRead} // Disable if other actions in progress
                              style={{ marginLeft: '10px' }}
                          >
                              {isClearingAll ? 'Clearing...' : 'Clear All'}
                          </button>

                           {/* Optional: Filter/Sort Dropdowns */}
                           {/* <div className={styles["filter-sort-controls"]}>
                                // Filter by Type, Read Status
                                // Sort by Date
                           </div> */}
                      </div>
                 </div>
             )}


            {/* --- List of Notifications --- */}
             <div className="form-container"> {/* Reuse form-container */}
                 <h3>Notifications ({hasNotifications ? notifications.length : 0})</h3>

                 {hasNotifications ? (
                      <div className={styles["notification-list"]}> {/* Use CSS Module for list layout */}
                          {notifications.map(notif => (
                              // Use a div or Link based on if the notification has an action/link
                               <div
                                   key={notif.id}
                                   className={`${styles["notification-item"]} ${!notif.isRead ? styles["unread"] : ''}`} // Apply 'unread' class if not read
                                   // Add onClick if the entire item is clickable (e.g., navigates to linkUrl and marks as read)
                                   // onClick={() => { if (notif.linkUrl) { window.location.href = notif.linkUrl; handleMarkAsRead(notif.id, true); } else if (!notif.isRead) { handleMarkAsRead(notif.id, true); } }}
                                   // style={{ cursor: notif.linkUrl || !notif.isRead ? 'pointer' : 'default' }} // Indicate clickability
                               >
                                   {/* Unread Indicator (Optional) */}
                                    {!notif.isRead && <span className={styles["unread-indicator"]}></span>} {/* Use CSS Module */}

                                   {/* Notification Content */}
                                   <div className={styles["notification-content"]}> {/* Use CSS Module */}
                                       <p className={styles["notification-message"]}>{notif.message}</p> {/* Use CSS Module */}
                                       <p className={styles["notification-timestamp"]}>{formatTimestamp(notif.timestamp)}</p> {/* Use CSS Module */}
                                   </div>

                                   {/* Notification Actions (Read/Delete/Link) */}
                                    <div className={styles["notification-item-actions"]}> {/* Use CSS Module */}
                                        {/* Mark as Read/Unread Button */}
                                        <button
                                            className="button-secondary button-small" // Reuse button style, maybe a small variant
                                            onClick={() => handleMarkAsRead(notif.id, !notif.isRead)} // Toggle read status
                                        >
                                            {notif.isRead ? 'Mark as Unread' : 'Mark as Read'}
                                        </button>

                                        {/* View/Action Button (if linkUrl exists) */}
                                         {notif.linkUrl && (
  
                                                 <Link href={notif.linkUrl} passHref  className="button-secondary button-small" style={{ marginLeft: '5px' }}>
                                                      {notif.type === 'event_invite' ? 'View Invitation' : notif.type === 'report_available' ? 'View Report' : 'View'}
                                                 </Link>
                                           
                                         )}


                                         {/* Delete Button */}
                                          <button
                                            className="button-secondary button-small" // Reuse button style
                                            onClick={() => handleDeleteNotification(notif.id)}
                                             style={{ marginLeft: '5px' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                               </div>
                           ))}
                       </div>
                 ) : (
                      <p className="no-events-message">No notifications yet.</p> 
                 )}
             </div>


        </div>
    );
}