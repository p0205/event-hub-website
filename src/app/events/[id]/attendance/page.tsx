// src/app/events/[id]/attendance/page.tsx
'use client'; // This is a client component for interactivity and data fetching

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation'; // To get event ID from URL
import Link from 'next/link'; // If needed

// We no longer need a client-side QR generation library like qrcode.react
// import QRCode from 'qrcode.react';

// You might need a helper to trigger file downloads, or use pure JS like shown in handleDownloadQRCode
// import { downloadFile } from '@/utils/download';

// Assuming you have participant and session data structures defined elsewhere
// You might need to fetch these as part of the event details
// import { Participant } from '@/types/participant'; // Reuse Participant interface from Participants page
// import { Session } from '@/types/event'; // Assuming a Session interface exists, likely within your event data structure

// Assuming a CSS Module for attendance page specific styles
import styles from './attendance.module.css'; // Create this CSS module


// Define the structure for an attendance record
interface AttendanceRecord {
    participantId: string; // Link to the participant
    sessionId: string; // Link to the session
    timestamp: string; // When attendance was marked (ISO string or similar)
    method: 'QR' | 'Manual'; // How attendance was recorded
    // Add other relevant fields, e.g., location, etc.
}

// Define a structure to combine participant info with their attendance status for a given session
interface ParticipantAttendanceStatus {
    // Include relevant participant details you want to display
    id: string;
    name: string;
    email: string;
    faculty: string; // Include faculty for context in the list
    course: string; // Include course
    year: number; // Include year

    // Attendance status for the selected session
    attended: boolean;
    attendanceTime?: string; // Timestamp if attended
    attendanceMethod?: 'QR' | 'Manual'; // Method if attended
}

// Define the structure for a Session, assuming it comes from event data and includes QR code URL
interface Session {
    id: string;
    name: string;
    date: string; // e.g., 'YYYY-MM-DD'
    startTime: string; // e.g., 'HH:mm'
    endTime?: string; // e.g., 'HH:mm'
    venueId: string;
    qrCodeUrl?: string; // <-- Assuming your backend provides this URL
    // Add other session details
}

// Define a simplified Event structure assuming it contains sessions and participants
interface EventDetails {
    id: string;
    name: string;
    sessions: Session[];
    participants: any[]; // Assuming participant structure matches what's needed for ParticipantAttendanceStatus
    // Add other event details
}

// --- Define Mock Data ---

const mockEventParticipants = [
    { id: 'p1', name: 'Alice Smith', email: 'alice.s@example.com', faculty: 'Engineering', course: 'ME', year: 3 },
    { id: 'p2', name: 'Bob Johnson', email: 'bob.j@example.com', faculty: 'Science', course: 'Physics', year: 2 },
    { id: 'p3', name: 'Charlie Brown', email: 'charlie.b@example.com', faculty: 'Arts', course: 'History', year: 4 },
    { id: 'p4', name: 'David Green', email: 'david.g@example.com', faculty: 'Engineering', course: 'EE', year: 3 },
    { id: 'p5', name: 'Eve Adams', email: 'eve.a@example.com', faculty: 'Science', course: 'Chemistry', year: 1 },
    { id: 'p6', name: 'Frank White', email: 'frank.w@example.com', faculty: 'Arts', course: 'Sociology', year: 2 },
    { id: 'p7', name: 'Grace Black', email: 'grace.b@example.com', faculty: 'Engineering', course: 'ME', year: 4 },
    { id: 'p8', name: 'Heidi Blue', email: 'heidi.b@example.com', faculty: 'Science', course: 'Biology', year: 3 },
    { id: 'p9', name: 'Ivan Red', email: 'ivan.r@example.com', faculty: 'Arts', course: 'Literature', year: 1 },
    { id: 'p10', name: 'Judy Grey', email: 'judy.g@example.com', faculty: 'Engineering', course: 'EE', year: 2 },
];

const mockSessions: Session[] = [
    {
        id: 's1',
        name: 'Morning Session',
        date: '2025-05-01',
        startTime: '09:00',
        endTime: '12:00',
        venueId: 'v1',
        // Mock QR code URL (replace with actual mock URLs or data URLs)
        qrCodeUrl: 'https://via.placeholder.com/256/0000FF/FFFFFF?text=QR+S1', // Example placeholder image URL
        // qrCodeUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0QRQAgIaCWu7XDjbAAAAAElFTkSuQmCC' // Example base64 data URL
    },
    {
        id: 's2',
        name: 'Afternoon Session',
        date: '2025-05-01',
        startTime: '13:00',
        endTime: '16:00',
        venueId: 'v1',
         qrCodeUrl: 'https://via.placeholder.com/256/FF0000/FFFFFF?text=QR+S2',
    },
     {
        id: 's3',
        name: 'Evening Session',
        date: '2025-05-01',
        startTime: '19:00',
        endTime: '21:00',
        venueId: 'v2',
         qrCodeUrl: 'https://via.placeholder.com/256/00FF00/FFFFFF?text=QR+S3',
    },
];

const mockAttendanceRecords: AttendanceRecord[] = [
    // Attendance for Session 1 (s1)
    { participantId: 'p1', sessionId: 's1', timestamp: new Date('2025-05-01T09:05:00Z').toISOString(), method: 'QR' },
    { participantId: 'p3', sessionId: 's1', timestamp: new Date('2025-05-01T09:10:00Z').toISOString(), method: 'QR' },
    { participantId: 'p5', sessionId: 's1', timestamp: new Date('2025-05-01T09:15:00Z').toISOString(), method: 'Manual' },
    { participantId: 'p7', sessionId: 's1', timestamp: new Date('2025-05-01T09:20:00Z').toISOString(), method: 'QR' },

    // Attendance for Session 2 (s2)
    { participantId: 'p1', sessionId: 's2', timestamp: new Date('2025-05-01T13:02:00Z').toISOString(), method: 'QR' },
    { participantId: 'p2', sessionId: 's2', timestamp: new Date('2025-05-01T13:08:00Z').toISOString(), method: 'Manual' },
    { participantId: 'p4', sessionId: 's2', timestamp: new Date('2025-05-01T13:12:00Z').toISOString(), method: 'QR' },
    { participantId: 'p6', sessionId: 's2', timestamp: new Date('2025-05-01T13:18:00Z').toISOString(), method: 'QR' },
];


// Combine mock data into a mock event structure
const mockEvent: EventDetails = {
    id: 'mock-event-1', // This ID won't be used for fetching, but matches the route params
    name: 'Mock Event with Attendance',
    sessions: mockSessions,
    participants: mockEventParticipants, // Include participants directly in event data
};

// --- End Mock Data ---


export default function EventAttendancePage() {
    const params = useParams();
    const eventId = params.id as string; // Get event ID from route params

    // --- State for data and loading ---
    const [event, setEvent] = useState<EventDetails | null>(null); // State to hold event details (including sessions and participants)
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]); // State for raw attendance records
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- State for UI interactions ---
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null); // State for the currently selected session in the dropdown

    // We don't need an isMounted state specifically for QR code generation anymore
    // But keeping it might be useful for other client-side logic if needed.
    // const [isMounted, setIsMounted] = useState(false);


    // --- Data Fetching ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // TODO: Replace with your actual API calls to fetch event details and attendance records
                // Assume fetching event details also brings sessions (with qrCodeUrl) and the list of registered participants
                // Example API calls:
                // const [eventResponse, attendanceResponse] = await Promise.all([
                //     fetch(`/api/events/${eventId}`), // Fetches event, sessions (with qrCodeUrl), and registered participants
                //     fetch(`/api/events/${eventId}/attendance-records`), // Fetches attendance records for the event
                // ]);

                // if (!eventResponse.ok) throw new Error('Failed to fetch event details');
                // if (!attendanceResponse.ok) throw new Error('Failed to fetch attendance records');

                // const eventData: EventDetails = await eventResponse.json();
                // const attendanceData: AttendanceRecord[] = await attendanceResponse.json();

                // Use mock data directly
                const eventData: EventDetails = mockEvent;
                const attendanceData: AttendanceRecord[] = mockAttendanceRecords;

                setEvent(eventData);
                setAttendanceRecords(attendanceData);

                // Set the default selected session to the first one if sessions exist
                if (eventData.sessions && eventData.sessions.length > 0) {
                    setSelectedSessionId(eventData.sessions[0].id);
                }

                setEvent(eventData);
                setAttendanceRecords(attendanceData);

                // Set the default selected session to the first one if sessions exist
                if (eventData.sessions && eventData.sessions.length > 0) {
                    setSelectedSessionId(eventData.sessions[0].id);
                }

            } catch (e: any) {
                console.error("Failed to fetch attendance data:", e);
                setError(`Failed to load attendance data: ${e.message || 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // We don't strictly need setIsMounted(true) here for QR code anymore
        // But keep it if other client-side features require it
        // setIsMounted(true);

    }, [eventId]); // Rerun if eventId changes


    // --- Derived Data (useMemo for performance) ---

    // Get the currently selected session object from the event data
    const selectedSession = useMemo(() => {
        if (!event || !selectedSessionId) return null;
        return event.sessions?.find(session => session.id === selectedSessionId) as Session | undefined;
    }, [event, selectedSessionId]);


    // Generate the data structure for the attendance list table
    // Combines participant information with their attendance status for the selected session
    const participantAttendanceList = useMemo<ParticipantAttendanceStatus[]>(() => {
        if (!event || !event.participants || !selectedSessionId) return [];

        const recordsForSelectedSession = attendanceRecords.filter(record => record.sessionId === selectedSessionId);
        const attendedParticipantIds = new Set(recordsForSelectedSession.map(record => record.participantId));

        return event.participants.map((participant: any) => { // Assume participant structure is available in event data
            const attended = attendedParticipantIds.has(participant.id);
            const attendanceRecord = recordsForSelectedSession.find(record => record.participantId === participant.id);

            return {
                id: participant.id,
                name: participant.name,
                email: participant.email,
                faculty: participant.faculty, // Include these from participant data
                course: participant.course,
                year: participant.year,

                attended: attended,
                attendanceTime: attendanceRecord?.timestamp,
                attendanceMethod: attendanceRecord?.method,
            };
        });
        // Optional: Add default sorting to this list if needed
        // .sort((a, b) => a.name.localeCompare(b.name)); // Example: Sort by name
    }, [event, attendanceRecords, selectedSessionId]); // Recalculate if event, records, or selected session changes


    // --- Handlers ---

    // Handle session selection change in the dropdown
    const handleSessionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSessionId = event.target.value;
        setSelectedSessionId(newSessionId);

        // If switching sessions, and QR code URL wasn't already available in event.sessions,
        // you might need to fetch the QR code URL specifically for the new session here.
        // Example:
        // if (newSessionId) {
        //    fetch(`/api/events/${eventId}/sessions/${newSessionId}/qrcode-url`)
        //      .then(res => res.json())
        //      .then(data => { /* Update state or event data with the new QR URL */ });
        // }
    };

    // Handle downloading the fetched QR code image
    const handleDownloadQRCode = () => {
        if (!selectedSession || !selectedSession.qrCodeUrl) {
             console.error("No QR code URL available to download.");
             // TODO: Provide user feedback
             return;
        }

        // Use the fetched URL to trigger download
        const link = document.createElement('a');
        link.href = selectedSession.qrCodeUrl;
        // Set the download filename (extract from URL or use session name)
        const filename = selectedSession.qrCodeUrl.split('/').pop() || `attendance-qr-${selectedSession.name.replace(/\s+/g, '_') || selectedSession.id}.png`;
        link.download = filename;

        // Append the link to the body, click it, and then remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    // Handle manually marking attendance for a participant
    const handleManualAttendance = (participantId: string, currentlyAttended: boolean) => {
        console.log(`Attempting to manually mark participant ${participantId} for session ${selectedSessionId}`);
        if (!selectedSessionId) {
            console.error("No session selected for manual attendance.");
            // TODO: Provide user feedback
            return;
        }

        // Determine the action: mark as attended or mark as not attended
        const action = currentlyAttended ? 'unmark' : 'mark'; // Decide if you're marking or unmarking
        const newAttendedStatus = !currentlyAttended; // The status it will become

        // TODO: Implement API call to record manual attendance
        // Example: fetch(`/api/events/${eventId}/attendance/manual`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         participantId,
        //         sessionId: selectedSessionId,
        //         action: action, // 'mark' or 'unmark'
        //         timestamp: new Date().toISOString(), // Record time on manual mark
        //         method: 'Manual',
        //     })
        // });

        // After a successful API call (within the .then() or try block):
        // You should update the component's state (`attendanceRecords`) to reflect the change.
        // This will cause `participantAttendanceList` to recalculate and the UI to update.
        // Example of optimistic update (update state immediately, revert on error):
        /*
        // Find and update the specific record or add a new one
        setAttendanceRecords(prevRecords => {
            const updatedRecords = prevRecords.filter(r => !(r.participantId === participantId && r.sessionId === selectedSessionId)); // Remove existing record for this session/participant
            if (newAttendedStatus) {
                // Add the new record if marking as attended
                updatedRecords.push({
                     participantId: participantId,
                     sessionId: selectedSessionId,
                     timestamp: new Date().toISOString(), // Use actual time from backend if possible
                     method: 'Manual',
                });
            }
            return updatedRecords; // Return the new array
        });

        // Then make the actual API call and handle success/error (e.g., revert state on error)
        */
        console.log(`Simulating API call to ${action} participant ${participantId}'s attendance.`);
        // TODO: Implement the actual API call and state update logic here.
    };


     // Handle exporting attendance data (e.g., as CSV)
    const handleExportAttendance = () => {
        console.log("Exporting attendance data for event:", eventId);
        // TODO: Implement logic to fetch and format attendanceRecords into CSV or other format
        // This might be a separate API endpoint that returns a CSV file directly.
        // Example: window.open(`/api/events/${eventId}/attendance/export-csv`);
    };


    // --- Render Logic ---
    if (loading) {
        return (
            <div className="page-content-wrapper">
                <h2 className="page-title">Attendance</h2>
                <p className="loading-message">Loading attendance data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-content-wrapper">
                <h2 className="page-title">Attendance</h2>
                <p className="error-message">Error: {error}</p>
            </div>
        );
    }

    const sessionsExist = event && event.sessions && event.sessions.length > 0;
    const participantsRegistered = event && event.participants && event.participants.length > 0;


    return (
        <div className="page-content-wrapper"> {/* Wrapper for padding/spacing */}
            {/* --- Page Title --- */}
            <h2 className="page-title">Attendance</h2>

            {/* --- Session Selection Card --- */}
            {/* Show session selection only if there are sessions */}
            {sessionsExist ? (
                <div className="form-container"> {/* Reuse form-container for card styling */}
                    <h3>Select Session</h3>
                    <div className="form-group"> {/* Reuse form-group for layout */}
                        <label htmlFor="sessionSelect">Choose a session:</label>
                        <select id="sessionSelect" value={selectedSessionId || ''} onChange={handleSessionChange}>
                            {/* Add a default option if no session is selected */}
                            {!selectedSessionId && <option value="">-- Select a Session --</option>}
                            {event.sessions.map((session: Session) => (
                                <option key={session.id} value={session.id}>
                                    {session.name} ({session.date} {session.startTime}) {/* Display session name, date, time */}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            ) : (
                 //{/* Message if no sessions exist */}
                  <div className="form-container">
                      <p className="no-events-message">No sessions found for this event. Attendance tracking is session-based.</p>
                  </div>
            )}


            {/* --- Attendance QR Code Section --- */}
            {/* Show QR code section only if a session is selected and the QR code URL is available */}
            {selectedSession && selectedSession.qrCodeUrl ? (
                <div className="form-container"> {/* Reuse form-container */}
                    <h3>Attendance QR Code for {selectedSession.name}</h3>
                    <div className={styles["qr-code-section"]}> {/* Use CSS Module for layout of QR and button */}
                        {/* Container for the QR code image */}
                        <div className={styles["qr-code-container"]}>
                            {/* Use <img> tag to display the QR code from the backend URL */}
                            <img
                                src={selectedSession.qrCodeUrl}
                                alt={`QR Code for ${selectedSession.name}`}
                                // Set a fixed size or use CSS for size
                                style={{ width: 256, height: 256 }}
                            />
                        </div>
                         {/* Download button, enabled only if QR URL is available */}
                         <button className="button-secondary" onClick={handleDownloadQRCode} disabled={!selectedSession.qrCodeUrl}>
                            Download QR Code (PNG)
                        </button>
                    </div>
                </div>
            ) : selectedSession && !selectedSession.qrCodeUrl ? (
                 //{/* Message/Placeholder if session selected but QR URL is not available */}
                 <div className="form-container">
                     <h3>Attendance QR Code for {selectedSession.name}</h3>
                     <p>Generating or fetching QR code...</p> {/* Message while waiting for QR URL */}
                 </div>
            ) : sessionsExist && !selectedSession ? (
                //{/* Message if sessions exist but none is selected */}
                 <div className="form-container">
                    <h3>Attendance QR Code</h3>
                    <p>Please select a session to generate the attendance QR code.</p>
                 </div>
            ) : null /* Don't show QR section if no sessions exist */}


            {/* --- Participants Attendance List Section --- */}
            {/* Show attendance list only if a session is selected AND participants are registered */}
             {selectedSession && participantsRegistered ? (
                <div className="form-container"> {/* Reuse form-container */}
                    {/* Display count of attended vs total participants for the selected session */}
                    <h3>Attendance List for {selectedSession.name} ({participantAttendanceList.filter(p => p.attended).length} / {participantAttendanceList.length} Attended)</h3>

                     {/* Optional: Add Search/Filter for the list if it can be long */}
                     {/* <div className="form-group"> <input type="text" placeholder="Search participants..." /> </div> */}

                    {participantAttendanceList.length === 0 ? (
                        // Message if the list is empty after filtering/fetching
                        <p className="no-events-message">No participants found for this session.</p>
                    ) : (
                        <div className={styles["attendance-list-container"]}> {/* Use CSS Module for table container layout */}
                             <table className={styles["attendance-table"]}> {/* Use CSS Module for table styles */}
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Faculty</th> {/* Added Faculty column */}
                                        <th>Course</th> {/* Added Course column */}
                                        <th>Year</th> {/* Added Year column */}
                                        <th>Attended</th> {/* Indicates Yes/No */}
                                        <th>Attendance Time</th> {/* When they attended */}
                                        <th>Method</th> {/* How they attended (QR/Manual) */}
                                        <th>Actions</th> {/* For manual marking */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {participantAttendanceList.map(participant => (
                                        //{/* Apply a class for attended rows for visual distinction */}
                                        <tr key={participant.id} className={participant.attended ? styles["attended-row"] : ''}>
                                            <td>{participant.name}</td>
                                            <td>{participant.email}</td>
                                            <td>{participant.faculty}</td> {/* Display Faculty */}
                                            <td>{participant.course}</td> {/* Display Course */}
                                            <td>{participant.year}</td> {/* Display Year */}
                                            <td>{participant.attended ? 'Yes' : 'No'}</td>
                                            <td>{participant.attended ? participant.attendanceTime ? new Date(participant.attendanceTime).toLocaleString() : 'N/A' : '-'}</td> {/* Format time, handle undefined */}
                                             <td>{participant.attended ? participant.attendanceMethod || 'N/A' : '-'}</td> {/* Display method, handle undefined */}
                                            <td>
                                                {/* Manual Attendance Marking Button */}
                                                {/* Text changes based on current attendance status */}
                                                <button
                                                    className="button-secondary" // Reuse button style from globals.css
                                                    onClick={() => handleManualAttendance(participant.id, participant.attended)} // Pass current attended status
                                                >
                                                    {participant.attended ? 'Mark as Not Attended' : 'Mark as Attended Manually'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : selectedSession && !participantsRegistered ? (
                 //{/* Message if a session is selected but no participants are registered */}
                  <div className="form-container">
                     <h3>Attendance List for {selectedSession.name}</h3>
                     <p>No participants registered for this event.</p>
                  </div>
            ) : participantsRegistered && !selectedSession ? (
                //{/* Message if participants exist but no session is selected */}
                 <div className="form-container">
                    <h3>Attendance List</h3>
                    <p>Please select a session to view the attendance list.</p>
                 </div>
            ) : null /* Don't show list section if no sessions and no participants */}

             {/* Case: No sessions AND no participants at all for the event */}
             {!sessionsExist && !participantsRegistered && (
                   <div className="form-container">
                      <h3>Attendance</h3>
                      <p className="no-events-message">No sessions or registered participants found for this event.</p>
                   </div>
             )}


            {/* --- Export Attendance Data Button --- */}
            {/* Show export button only if there's attendance data to potentially export */}
            {/* You might want to check if sessionsExist && participantsRegistered as well */}
            {attendanceRecords.length > 0 && (
                 <div className="form-container"> {/* Reuse form-container */}
                     <h3>Export Attendance</h3>
                     <button className="button-primary" onClick={handleExportAttendance}>
                         Export All Attendance Data (CSV)
                     </button>
                     {/* You might want options here, e.g., Export All Sessions, Export Selected Session */}
                 </div>
            )}

        </div>
    );
}