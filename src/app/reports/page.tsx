// src/app/reports/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link'; // To link to individual event reports pages

// Assuming a basic Event interface for listing reportable events
interface ReportableEvent {
    id: string;
    name: string;
    completionDate: string; // Date when the event was completed
    // Add other relevant event details for the list (e.g., participant count, budget summary)
    totalParticipants?: number;
    totalBudgetAllocated?: number;
    totalBudgetSpent?: number;
}

// Assuming data for the top-level dashboard summary (if applicable)
interface OverallReportsDashboard {
    totalCompletedEvents: number;
    overallParticipantCount: number;
    overallBudgetSpent: number;
    // Add other aggregate metrics
}


// Assuming a CSS Module for reports page specific styles
import styles from './reports.module.css'; // Create this CSS module


// --- Define Mock Data ---

// Mock data for a list of completed events with reports available
const mockReportableEvents: ReportableEvent[] = [
    {
        id: 'mock-event-completed-1',
        name: 'Annual Conference 2024',
        completionDate: '2024-11-15',
        totalParticipants: 350,
        totalBudgetAllocated: 50000,
        totalBudgetSpent: 48500,
    },
    {
        id: 'mock-event-completed-2',
        name: 'Quarterly Workshop Q3',
        completionDate: '2024-09-30',
        totalParticipants: 80,
        totalBudgetAllocated: 10000,
        totalBudgetSpent: 11500, // Example of budget exceeding
    },
    {
        id: 'mock-event-completed-3',
        name: 'Team Building Retreat',
        completionDate: '2024-08-20',
        totalParticipants: 50,
        totalBudgetAllocated: 8000,
        totalBudgetSpent: 7800,
    },
];

// Mock data for the overall dashboard summary
const mockOverallDashboard: OverallReportsDashboard = {
    totalCompletedEvents: mockReportableEvents.length,
    overallParticipantCount: mockReportableEvents.reduce((sum, event) => sum + (event.totalParticipants || 0), 0),
    overallBudgetSpent: mockReportableEvents.reduce((sum, event) => sum + (event.totalBudgetSpent || 0), 0),
};

// --- End Mock Data ---


export default function ReportsPage() {
    // --- State for data and loading ---
    const [overallDashboard, setOverallDashboard] = useState<OverallReportsDashboard | null>(null);
    const [reportableEvents, setReportableEvents] = useState<ReportableEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- State for Filtering/Sorting (Optional) ---
    // const [sortBy, setSortBy] = useState('completionDate');
    // const [filterBy, setFilterBy] = useState('all');


    // --- Data Loading (using Mock Data) ---
    // Simulate fetching data for the reports overview
    useEffect(() => {
        const loadMockReportOverviewData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Simulate a network request delay
                await new Promise(resolve => setTimeout(resolve, 500));

                // Use mock data
                setOverallDashboard(mockOverallDashboard);
                setReportableEvents(mockReportableEvents);

            } catch (e: any) {
                console.error("Error loading report overview data:", e);
                setError(`Failed to load report overview data: ${e.message || 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };

        loadMockReportOverviewData();

    }, []); // Effect runs only once on mount for the overview


    // --- Derived Data (if implementing filtering/sorting) ---
    // const filteredAndSortedEvents = useMemo(() => {
    //   // Apply filtering and sorting logic to reportableEvents state
    //   return reportableEvents; // Placeholder
    // }, [reportableEvents, sortBy, filterBy]);


    // --- Handlers (Optional Filtering/Sorting) ---
    // const handleSortChange = (e) => setSortBy(e.target.value);
    // const handleFilterChange = (e) => setFilterBy(e.target.value);

    // --- Handlers (Placeholder for Customization) ---
    // const handleOpenCustomization = () => {
    //     console.log("Opening global report customization options.");
    //     // TODO: Implement modal or navigation for global customization
    // };


    // --- Render Logic ---
    if (loading) {
        return (
            <div className="page-content-wrapper">
                <h2 className="page-title">Reports</h2>
                <p className="loading-message">Loading reports overview...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-content-wrapper">
                <h2 className="page-title">Reports</h2>
                <p className="error-message">Error: {error}</p>
            </div>
        );
    }

     const hasReportableEvents = reportableEvents && reportableEvents.length > 0;


    return (
        <div className="page-content-wrapper"> {/* Reuse existing wrapper for padding/spacing */}
            {/* --- Page Title --- */}
            <h2 className="page-title">Reports</h2>

            {/* --- Overall Dashboard Summary (Optional) --- */}
             {overallDashboard && (
                 <div className="form-container"> {/* Reuse form-container for card styling */}
                     <div className={styles["dashboard-header"]}> {/* Use CSS Module for layout */}
                         <h3>Overall Summary</h3>
                          {/* Placeholder for Global Customization Button */}
                          {/* <button className="button-secondary" onClick={handleOpenCustomization}>
                              Customize Global Reports
                          </button> */}
                     </div>
                      <div className={styles["dashboard-summary"]}> {/* Use CSS Module for layout */}
                          <div className={styles["summary-item"]}> {/* Use CSS Module */}
                              <h4>Total Completed Events</h4>
                              <p>{overallDashboard.totalCompletedEvents}</p>
                          </div>
                           <div className={styles["summary-item"]}> {/* Use CSS Module */}
                               <h4>Overall Participants</h4>
                               <p>{overallDashboard.overallParticipantCount}</p>
                           </div>
                            <div className={styles["summary-item"]}> {/* Use CSS Module */}
                                <h4>Overall Budget Spent</h4>
                                <p>${overallDashboard.overallBudgetSpent.toFixed(2)}</p>
                           </div>
                           {/* Add other summary items */}
                      </div>
                 </div>
             )}

            {/* --- List of Reportable Events --- */}
             <div className="form-container"> {/* Reuse form-container */}
                 <h3>Reportable Events ({hasReportableEvents ? reportableEvents.length : 0})</h3>

                  {/* Optional: Filtering/Sorting Controls */}
                   {/* {hasReportableEvents && (
                       <div className={styles["event-list-controls"]}>
                            // Filter by year, event type, etc.
                            // Sort by completion date, name, etc.
                            <div className="form-group"> // Reuse form-group
                                 <label htmlFor="sortBy">Sort By:</label>
                                 <select id="sortBy" value={sortBy} onChange={handleSortChange}>
                                     <option value="completionDate">Completion Date</option>
                                     <option value="name">Name</option>
                                      // Add other sort options
                                 </select>
                            </div>
                             // Add filter inputs/selects
                       </div>
                   )} */}


                 {hasReportableEvents ? (
                     <div className={styles["reportable-events-list"]}> {/* Use CSS Module for list layout */}
                         {reportableEvents.map(event => (
                             // Use Link to navigate to the event-specific reports page
                             <Link key={event.id} href={`/events/${event.id}/reports`} className={styles["reportable-event-item"]}> {/* Use CSS Module, Link acts as block */}
                                  {/* Event Name and Completion Date */}
                                  <div className={styles["event-details"]}> {/* Use CSS Module */}
                                     <div className={styles["event-name"]}>{event.name}</div> {/* Use CSS Module */}
                                     <div className={styles["event-date"]}>Completed: {new Date(event.completionDate).toLocaleDateString()}</div> {/* Use CSS Module */}
                                  </div>

                                  {/* Optional: Quick Stats */}
                                   {/* <div className={styles["event-stats"]}> // Use CSS Module
                                       <p>Participants: {event.totalParticipants}</p>
                                       <p>Budget Spent: ${event.totalBudgetSpent?.toFixed(2)}</p>
                                   </div> */}

                                  {/* Action/Link Indicator */}
                                   <div className={styles["view-reports-link"]}> {/* Use CSS Module */}
                                      View Reports &rarr; {/* Right arrow icon */}
                                   </div>
                             </Link>
                         ))}
                     </div>
                 ) : (
                      <p className="no-events-message">No completed events with reports available yet.</p>
                 )}
             </div>

             {/* Placeholder for Custom Report Generation Section (Optional) */}
              {/* This section could contain options to define criteria and generate a custom report */}
              {/* <div className="form-container">
                   <h3>Generate Custom Report</h3>
                   // Add form elements for selecting events, date ranges, data points, etc.
                    // Button to trigger custom report generation
                    // <button className="button-primary">Generate</button>
              </div> */}

        </div>
    );
}