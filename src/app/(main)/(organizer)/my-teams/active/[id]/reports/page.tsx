// src/app/my-events/[id]/reports/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
// import Link from 'next/link';

// Assuming event data includes status (active/completed)
interface EventDetails {
    id: string;
    name: string;
    status: 'Pending Approval' | 'Active' | 'Completed' | 'Archived' | 'Cancelled'; // Example statuses
    // Add other event details
}

// Assuming report availability/details are fetched
interface ReportAvailability {
    eventId: string;
    isAttendanceReportAvailable: boolean;
    isBudgetReportAvailable: boolean;
    isFeedbackReportAvailable: boolean;
    // Add URLs for generated reports if available
    attendanceReportUrl?: string; // URL to view/download Attendance report
    budgetReportUrl?: string;     // URL to view/download Budget report
    feedbackReportUrl?: string;   // URL to view/download Feedback report
    // Add other report types or metadata
}


// Assuming a CSS Module for report page specific styles
import styles from './reports.module.css'; // Create this CSS module


// --- Define Mock Data ---

// Mock event data (need to check status)
const mockEventCompleted = {
    id: 'mock-event-1',
    name: 'Completed Event Report',
    status: 'Completed' as const, // Simulate a completed event
    // ... other event data
};

const mockEventActive = {
    id: 'mock-event-2',
    name: 'Active Event Report',
    status: 'Active' as const, // Simulate an active event
    // ... other event data
};

// Mock report availability data (depends on event status)
const mockReportAvailabilityCompleted = {
    eventId: 'mock-event-1',
    isAttendanceReportAvailable: true,
    isBudgetReportAvailable: true, // Assume budget report is always available if budget data exists
    isFeedbackReportAvailable: true, // Assume feedback report is available if feedback collected
    attendanceReportUrl: '/mock-reports/attendance-report-mock-event-1.pdf', // Mock PDF URL
    budgetReportUrl: '/mock-reports/budget-report-mock-event-1.pdf',     // Mock PDF URL
    feedbackReportUrl: '/mock-reports/feedback-report-mock-event-1.pdf',   // Mock PDF URL
};

const mockReportAvailabilityActive = {
    eventId: 'mock-event-2',
    isAttendanceReportAvailable: false,
    isBudgetReportAvailable: false, // Reports not available for active events
    isFeedbackReportAvailable: false,
    attendanceReportUrl: undefined,
    budgetReportUrl: undefined,
    feedbackReportUrl: undefined,
};

// --- End Mock Data ---


export default function EventReportsPage() {
    const params = useParams();
    const eventId = params.id as string;

    // --- State for data and loading ---
    const [event, setEvent] = useState<EventDetails | null>(null); // Event details to check status
    const [reportAvailability, setReportAvailability] = useState<ReportAvailability | null>(null); // Report availability data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- State for Customization (Placeholder) ---
    // const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
    // const [customReportOptions, setCustomReportOptions] = useState({});


    // --- Data Loading (using Mock Data) ---
    useEffect(() => {
        const loadMockReportData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Simulate fetching event details (to get status)
                // In a real app, fetch(`/api/events/${eventId}`)
                const mockEventData = eventId === 'mock-event-1' ? mockEventCompleted : mockEventActive; // Select mock based on ID
                setEvent(mockEventData);

                // Simulate fetching report availability based on event status
                // In a real app, fetch(`/api/events/${eventId}/reports/availability`)
                const mockReportData = mockEventData.status === 'Completed' ? mockReportAvailabilityCompleted : mockReportAvailabilityActive;
                setReportAvailability(mockReportData);


            } catch (e: unknown) {
                console.error("Error loading mock report data:", e);
                if (e instanceof Error) {
                    setError(`Failed to load mock report data: ${e.message || 'Unknown error'}`);
                } else {
                    setError('Failed to load mock report data: Unknown error');
                }
            } finally {
                setLoading(false);
            }
        };

        loadMockReportData();

    }, [eventId]); // Rerun if eventId changes


    // --- Handlers ---

    // Handle viewing a report (e.g., opening PDF in new tab or showing inline)
    const handleViewReport = (reportUrl: string | undefined, reportType: string) => {
        if (reportUrl) {
            console.log(`Viewing ${reportType} report: ${reportUrl}`);
            window.open(reportUrl, '_blank'); // Open URL in a new tab
            // Or implement logic to show the report inline
        } else {
            console.warn(`${reportType} report URL is not available.`);
            // TODO: Show user feedback
        }
    };

    // Handle exporting a report (often same as view URL for PDF)
    // const handleExportReport = (reportUrl: string | undefined, reportType: string) => {
    //     if (reportUrl) {
    //         console.log(`Exporting ${reportType} report: ${reportUrl}`);
    //         // Trigger download (can be same as view, or use download attribute)
    //         const link = document.createElement('a');
    //         link.href = reportUrl;
    //         link.download = `${reportType.toLowerCase().replace(/\s+/g, '-')}-event-${eventId}.pdf`; // Suggest a filename
    //         document.body.appendChild(link);
    //         link.click();
    //         document.body.removeChild(link);

    //     } else {
    //         console.warn(`${reportType} report URL is not available for export.`);
    //         // TODO: Show user feedback
    //     }
    // };

    // Handle opening customization options (Placeholder)
    // const handleOpenCustomization = () => {
    //     setIsCustomizationModalOpen(true);
    //     // TODO: Fetch current customization options if they exist
    // };

    // Handle generating a customized report (Placeholder)
    // const handleGenerateCustomReport = () => {
    //     console.log("Simulating generating custom report with options:", customReportOptions);
    //     // TODO: Implement API call to generate a custom report based on options
    //     // On success, maybe get a temporary URL or show a message that it's generating
    //     // Close modal: setIsCustomizationModalOpen(false);
    // };


    // --- Render Logic ---
    if (loading) {
        return (
            <div className="page-content-wrapper">
                <div className='page-header'>
                    <div className='page-title-section'>
                        <h2>Reports</h2>
                        <p className={'page-subtitle'}>
                            Access event reports to analyze performance and inform strategic decisions
                        </p>
                    </div>

                </div>
                <p className="loading-message">Loading report data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-content-wrapper">
                <div className='page-header'>
                    <div className='page-title-section'>
                        <h2>Reports</h2>
                        <p className={'page-subtitle'}>
                            Access event reports to analyze performance and inform strategic decisions
                        </p>
                    </div>

                </div>
                <p className="error-message">Error: {error}</p>
            </div>
        );
    }

    const isEventCompleted = event?.status === 'Completed';
    const reportsAvailable = reportAvailability && (
        reportAvailability.isAttendanceReportAvailable ||
        reportAvailability.isBudgetReportAvailable ||
        reportAvailability.isFeedbackReportAvailable
    );


    return (
        <div className="page-content-wrapper">

            <div className='page-header'>
                <div className='page-title-section'>
                    <h2>Reports</h2>
                    <p className={'page-subtitle'}>
                        Access event reports to analyze performance and inform strategic decisions
                    </p>
                </div>

            </div>

            {/* --- Report Status Notification --- */}
            <div className="form-container">
                <h3>Report Status</h3>
                {isEventCompleted ? (
                    <div>
                        <p className="success-message">This event is completed. Reports are available below.</p>
                        {/* Optional: Message if event completed but NO reports are available for some reason */}
                        {/* {!reportsAvailable && (
                             <p className="error-message">No reports are currently available for this completed event.</p>
                         )} */}
                    </div>
                ) : (
                    <p className="info-message">Reports will be generated automatically after the event is completed.</p>
                )}
            </div>


            {/* --- Available Reports Section --- */}
            {isEventCompleted && reportsAvailable && reportAvailability && ( // Only show this section if completed AND reports are available
                <div className="form-container"> {/* Reuse form-container */}
                    <h3>Available Reports</h3>
                    <div className={styles["available-reports-list"]}> {/* Use CSS Module for layout */}

                        {/* Attendance Report */}
                        {reportAvailability.isAttendanceReportAvailable && (
                            <div className={styles["report-item"]}> {/* Use CSS Module */}
                                <span>Attendance Report</span>
                                <div className={styles["report-actions"]}> {/* Use CSS Module */}
                                    {/* View/Export Button */}
                                    <button className="button-secondary" onClick={() => handleViewReport(reportAvailability.attendanceReportUrl, 'Attendance')}>
                                        View / Export PDF
                                    </button>
                                    {/* If separate View/Export buttons are needed */}
                                    {/* <button className="button-secondary" onClick={() => handleViewReport(reportAvailability.attendanceReportUrl, 'Attendance')}>View</button> */}
                                    {/* <button className="button-secondary" onClick={() => handleExportReport(reportAvailability.attendanceReportUrl, 'Attendance')} style={{ marginLeft: '5px' }}>Export PDF</button> */}
                                </div>
                            </div>
                        )}

                        {/* Budget Report */}
                        {reportAvailability.isBudgetReportAvailable && (
                            <div className={styles["report-item"]}> {/* Use CSS Module */}
                                <span>Budget Report</span>
                                <div className={styles["report-actions"]}> {/* Use CSS Module */}
                                    {/* View/Export Button */}
                                    <button className="button-secondary" onClick={() => handleViewReport(reportAvailability.budgetReportUrl, 'Budget')}>
                                        View / Export PDF
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Feedback Analysis Report */}
                        {reportAvailability.isFeedbackReportAvailable && (
                            <div className={styles["report-item"]}> {/* Use CSS Module */}
                                <span>Feedback Analysis Report</span>
                                <div className={styles["report-actions"]}> {/* Use CSS Module */}
                                    {/* View/Export Button */}
                                    <button className="button-secondary" onClick={() => handleViewReport(reportAvailability.feedbackReportUrl, 'Feedback Analysis')}>
                                        View / Export PDF
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Message if event is completed but NO reports are available */}
                        {/* This case is also handled by the main section conditional rendering,
                             but you might want a specific message here if needed. */}
                        {/* {!reportsAvailable && (
                             <p className="no-events-message">No specific reports are currently available.</p>
                         )} */}

                    </div>
                </div>
            )}
            {/* Message if event completed but no reports are available */}
            {isEventCompleted && !reportsAvailable && (
                <div className="form-container">
                    <p className="no-events-message">Reports are not yet available for this completed event.</p> {/* Message if completed but reports didn't generate/aren't ready */}
                </div>
            )}


            {/* --- Customization Section (Placeholder) --- */}
            {/* Optional: Section for Report Customization */}
            {/* <div className="form-container">
                  <h3>Custom Reports</h3>
                   // Button to open customization modal/form
                   <button className="button-primary" onClick={handleOpenCustomization}>
                       Customize Report
                   </button>
                    // Customization Modal/Form JSX would go here, controlled by state
             </div> */}

        </div>
    );
}