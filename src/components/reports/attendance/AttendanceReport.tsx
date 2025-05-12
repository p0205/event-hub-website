// components/AttendanceReport.tsx
'use client'; // Mark as Client Component if using App Router

import React from 'react';
import styles from './AttendanceReport.module.css'; // Import CSS module

// --- Mock Data Interfaces (Matching ER Diagram Entities) ---
interface User {
    id: string;
    name: string;
    email: string;
    gender: 'Male' | 'Female' | 'Other' | 'Prefer Not to Say';
    faculty?: string; // Assuming Faculty is a string
    role: 'organizer' | 'participant' | 'admin' | 'team_member'; // Example roles
}

interface Event {
    id: string;
    name: string;
    organizerId: string; // FK to User
    startDateTime: string;
    endDateTime: string;
    expectedParticipantsNo: number;
}

interface Session {
    id: string;
    eventId: string; // FK to Event
    sessionName: string;
    startDateTime: string;
    endDateTime: string;
}

interface Registration {
    id: string;
    eventId: string; // FK to Event
    participantId: string; // FK to User (participant)
    registerDate: string;
}

interface Attendance {
    sessionId: string; // FK to Session
    registrationId: string; // FK to Registration
    checkinDateTime: string;
}

// --- Mock Data ---

const mockUsers: User[] = [
    { id: 'org-1', name: 'Event Organizer Pro', email: 'org1@example.com', gender: 'Prefer Not to Say', role: 'organizer' },
    { id: 'part-1', name: 'Alice Smith', email: 'alice@example.com', gender: 'Female', faculty: 'Computer Science', role: 'participant' },
    { id: 'part-2', name: 'Bob Johnson', email: 'bob@example.com', gender: 'Male', faculty: 'Electrical Engineering', role: 'participant' },
    { id: 'part-3', name: 'Charlie Davis', email: 'charlie@example.com', gender: 'Male', faculty: 'Computer Science', role: 'participant' },
    { id: 'part-4', name: 'Diana Miller', email: 'diana@example.com', gender: 'Female', faculty: 'Mechanical Engineering', role: 'participant' },
    { id: 'part-5', name: 'Eve Wilson', email: 'eve@example.com', gender: 'Female', faculty: 'Computer Science', role: 'participant' },
    { id: 'part-6', name: 'Frank Jones', email: 'frank@example.com', gender: 'Male', faculty: 'Electrical Engineering', role: 'participant' },
     { id: 'part-7', name: 'Grace Lee', email: 'grace@example.com', gender: 'Female', faculty: 'Computer Science', role: 'participant' },
];

const mockEvents: Event[] = [
    {
        id: 'event-1',
        name: 'Annual Tech Conference 2025',
        organizerId: 'org-1',
        startDateTime: '2025-05-19T09:00:00Z',
        endDateTime: '2025-05-21T17:00:00Z',
        expectedParticipantsNo: 100,
    }
];

const mockSessions: Session[] = [
    { id: 'sess-1a', eventId: 'event-1', sessionName: 'Opening Keynote', startDateTime: '2025-05-19T09:30:00Z', endDateTime: '2025-05-19T10:30:00Z' },
    { id: 'sess-1b', eventId: 'event-1', sessionName: 'AI in Industry Workshop', startDateTime: '2025-05-19T11:00:00Z', endDateTime: '2025-05-19T12:30:00Z' },
    { id: 'sess-1c', eventId: 'event-1', sessionName: 'Networking Lunch', startDateTime: '2025-05-19T12:30:00Z', endDateTime: '2025-05-19T13:30:00Z' },
    { id: 'sess-2a', eventId: 'event-1', sessionName: 'Future of Web Dev', startDateTime: '2025-05-20T10:00:00Z', endDateTime: '2025-05-20T11:30:00Z' },
    { id: 'sess-2b', eventId: 'event-1', sessionName: 'Closing Remarks', startDateTime: '2025-05-21T16:00:00Z', endDateTime: '2025-05-21T17:00:00Z' },
];

const mockRegistrations: Registration[] = [
    { id: 'reg-1', eventId: 'event-1', participantId: 'part-1', registerDate: '2025-04-10T10:00:00Z' }, // Alice
    { id: 'reg-2', eventId: 'event-1', participantId: 'part-2', registerDate: '2025-04-11T11:00:00Z' }, // Bob
    { id: 'reg-3', eventId: 'event-1', participantId: 'part-3', registerDate: '2025-04-12T12:00:00Z' }, // Charlie
    { id: 'reg-4', eventId: 'event-1', participantId: 'part-4', registerDate: '2025-04-13T13:00:00Z' }, // Diana
    { id: 'reg-5', eventId: 'event-1', participantId: 'part-5', registerDate: '2025-04-14T14:00:00Z' }, // Eve
    { id: 'reg-6', eventId: 'event-1', participantId: 'part-6', registerDate: '2025-04-15T15:00:00Z' }, // Frank - Registered but no attendance
];

const mockAttendance: Attendance[] = [
    // Alice (reg-1) attended Keynote, AI Workshop, Networking, Web Dev, Closing
    { sessionId: 'sess-1a', registrationId: 'reg-1', checkinDateTime: '2025-05-19T09:35:00Z' },
    { sessionId: 'sess-1b', registrationId: 'reg-1', checkinDateTime: '2025-05-19T11:05:00Z' },
    { sessionId: 'sess-1c', registrationId: 'reg-1', checkinDateTime: '2025-05-19T12:40:00Z' },
    { sessionId: 'sess-2a', registrationId: 'reg-1', checkinDateTime: '2025-05-20T10:05:00Z' },
    { sessionId: 'sess-2b', registrationId: 'reg-1', checkinDateTime: '2025-05-21T16:05:00Z' },

    // Bob (reg-2) attended Keynote, AI Workshop, Web Dev
    { sessionId: 'sess-1a', registrationId: 'reg-2', checkinDateTime: '2025-05-19T09:32:00Z' },
    { sessionId: 'sess-1b', registrationId: 'reg-2', checkinDateTime: '2025-05-19T11:10:00Z' },
    { sessionId: 'sess-2a', registrationId: 'reg-2', checkinDateTime: '2025-05-20T10:15:00Z' },

    // Charlie (reg-3) attended Keynote, Networking
    { sessionId: 'sess-1a', registrationId: 'reg-3', checkinDateTime: '2025-05-19T09:40:00Z' },
    { sessionId: 'sess-1c', registrationId: 'reg-3', checkinDateTime: '2025-05-19T12:50:00Z' },

    // Diana (reg-4) attended AI Workshop, Closing
    { sessionId: 'sess-1b', registrationId: 'reg-4', checkinDateTime: '2025-05-19T11:15:00Z' },
    { sessionId: 'sess-2b', registrationId: 'reg-4', checkinDateTime: '2025-05-21T16:10:00Z' },

    // Eve (reg-5) attended Keynote, Web Dev
    { sessionId: 'sess-1a', registrationId: 'reg-5', checkinDateTime: '2025-05-19T09:38:00Z' },
    { sessionId: 'sess-2a', registrationId: 'reg-5', checkinDateTime: '2025-05-20T10:10:00Z' },
];


// --- Helper to calculate report data ---

interface SessionAttendanceData {
    sessionId: string;
    sessionName: string;
    startDateTime: string;
    endDateTime: string;
    totalAttendees: number;
    attendanceRate: number;
}

interface DemographicsData {
    gender: { [key: string]: { count: number; percentage: number } };
    faculty: { [key: string]: { count: number; percentage: number } };
    // Add other categories here
}


const generateAttendanceReportData = (
    eventId: string,
    users: User[],
    events: Event[],
    sessions: Session[],
    registrations: Registration[],
    attendance: Attendance[]
) => {
    const event = events.find(e => e.id === eventId);
    if (!event) {
        return null; // Or throw an error
    }

    const organizer = users.find(user => user.id === event.organizerId);
    const eventRegistrations = registrations.filter(reg => reg.eventId === eventId);
    const eventSessions = sessions.filter(sess => sess.eventId === eventId);
    const eventAttendance = attendance.filter(att =>
        eventSessions.some(sess => sess.id === att.sessionId) &&
        eventRegistrations.some(reg => reg.id === att.registrationId)
    );

    const totalExpectedParticipants = event.expectedParticipantsNo;
    const totalRegisteredParticipants = eventRegistrations.length;

    const registrationFillRate = totalExpectedParticipants > 0
        ? (totalRegisteredParticipants / totalExpectedParticipants) * 100
        : 0; // Handle division by zero

    // Calculate Unique Attendees (attended at least one session)
    const uniqueAttendeesRegistrationIds = new Set(eventAttendance.map(att => att.registrationId));
    const totalUniqueAttendees = uniqueAttendeesRegistrationIds.size;

    // Get participant details for unique attendees
    const uniqueAttendeesParticipantIds = Array.from(uniqueAttendeesRegistrationIds).map(regId =>
        eventRegistrations.find(reg => reg.id === regId)?.participantId
    ).filter((id): id is string => id !== undefined); // Filter out undefined and ensure type is string

    const uniqueAttendeeUsers = users.filter(user => uniqueAttendeesParticipantIds.includes(user.id));


    const overallAttendanceRate = totalRegisteredParticipants > 0
        ? (totalUniqueAttendees / totalRegisteredParticipants) * 100
        : 0; // Handle division by zero

    // Session-Specific Attendance
    const sessionAttendanceSummary: SessionAttendanceData[] = eventSessions.map(session => {
        const sessionAttendees = eventAttendance.filter(att => att.sessionId === session.id);
        const totalSessionAttendees = sessionAttendees.length;
        const sessionAttendanceRate = totalRegisteredParticipants > 0
            ? (totalSessionAttendees / totalRegisteredParticipants) * 100
            : 0; // Use total registered as denominator

        return {
            sessionId: session.id,
            sessionName: session.sessionName,
            startDateTime: session.startDateTime,
            endDateTime: session.endDateTime,
            totalAttendees: totalSessionAttendees,
            attendanceRate: sessionAttendanceRate,
        };
    });

    // Participant Demographics for ATTENDEES (those who checked in at least once)
    const demographics: DemographicsData = {
        gender: {},
        faculty: {},
    };

    const totalAttendedForDemographics = uniqueAttendeeUsers.length; // Base for percentages

    uniqueAttendeeUsers.forEach(user => {
        // Gender
        const gender = user.gender || 'Unknown';
        demographics.gender[gender] = demographics.gender[gender] || { count: 0, percentage: 0 };
        demographics.gender[gender].count++;

        // Faculty
        const faculty = user.faculty || 'Unknown';
        demographics.faculty[faculty] = demographics.faculty[faculty] || { count: 0, percentage: 0 };
        demographics.faculty[faculty].count++;
    });

    // Calculate percentages for demographics
    Object.keys(demographics.gender).forEach(key => {
        demographics.gender[key].percentage = totalAttendedForDemographics > 0
            ? (demographics.gender[key].count / totalAttendedForDemographics) * 100
            : 0;
    });

     Object.keys(demographics.faculty).forEach(key => {
        demographics.faculty[key].percentage = totalAttendedForDemographics > 0
            ? (demographics.faculty[key].count / totalAttendedForDemographics) * 100
            : 0;
    });


    return {
        event,
        organizer,
        reportGeneratedAt: new Date().toISOString(), // Current time
        dataAsOf: new Date().toISOString(), // Assume data is current as of generation
        totalExpectedParticipants,
        totalRegisteredParticipants,
        registrationFillRate,
        totalUniqueAttendees,
        overallAttendanceRate,
        sessionAttendanceSummary,
        demographics,
    };
};

// --- Report Component ---

const AttendanceReport: React.FC = () => {
    // Generate report data using mock data for event-1
    const reportData = generateAttendanceReportData(
        'event-1',
        mockUsers,
        mockEvents,
        mockSessions,
        mockRegistrations,
        mockAttendance
    );

    if (!reportData) {
        return <div className={styles.reportContainer}>Error generating report for this event.</div>;
    }

    const {
        event,
        organizer,
        reportGeneratedAt,
        dataAsOf,
        totalExpectedParticipants,
        totalRegisteredParticipants,
        registrationFillRate,
        totalUniqueAttendees,
        overallAttendanceRate,
        sessionAttendanceSummary,
        demographics,
    } = reportData;


     // Helper to format dates nicely
    const formatDate = (isoString: string) => {
        try {
             return new Date(isoString).toLocaleString([], {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true // or false for 24-hour
            });
        } catch (e) {
            console.error("Failed to parse date:", isoString, e);
            return isoString; // Return original if parsing fails
        }
    };

     const formatTime = (isoString: string) => {
         try {
             return new Date(isoString).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true // or false for 24-hour
            });
        } catch (e) {
             console.error("Failed to parse time:", isoString, e);
            return isoString; // Return original if parsing fails
        }
     }

     const formatPercentage = (value: number) => value.toFixed(2); // Format to 2 decimal places

    return (
        <div className={styles.reportContainer}>
            <h1 className={styles.reportTitle}>Event Attendance Report: {event.name}</h1>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Section 1: Event Overview</h2>
                <div className={styles.overviewItem}><strong>Event Name:</strong> {event.name}</div>
                <div className={styles.overviewItem}><strong>Organizer:</strong> {organizer?.name || 'N/A'}</div>
                <div className={styles.overviewItem}><strong>Event Dates:</strong> {formatDate(event.startDateTime)} - {formatDate(event.endDateTime)}</div>
                <div className={styles.overviewItem}><strong>Report Generated On:</strong> {formatDate(reportGeneratedAt)}</div>
                 <div className={styles.overviewItem}><strong>Data As Of:</strong> {formatDate(dataAsOf)}</div>
                <div className={styles.overviewItem}><strong>Filters Applied:</strong> All Sessions</div> {/* Placeholder */}
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Section 2: Executive Summary</h2>
                 <table className={styles.summaryMetricsTable}>
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>Value</th>
                            <th>Definition</th> {/* Add definition column */}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Total Expected Participants</td>
                            <td>{totalExpectedParticipants}</td>
                            <td>Number of participants the event was planned for.</td>
                        </tr>
                        <tr>
                            <td>Total Registered Participants</td>
                            <td>{totalRegisteredParticipants}</td>
                            <td>Total individuals who registered for the event.</td>
                        </tr>
                        <tr>
                            <td>Registration Fill Rate</td>
                             <td>{formatPercentage(registrationFillRate)}%</td>
                            <td>Percentage of expected participants who registered. Calculated as (Total Registered / Total Expected) * 100.</td>
                        </tr>
                         <tr>
                            <td>Total Unique Attendees</td>
                            <td>{totalUniqueAttendees}</td>
                            <td>Total distinct individuals who attended at least one session.</td>
                        </tr>
                        <tr>
                            <td>Overall Attendance Rate</td>
                             <td>{formatPercentage(overallAttendanceRate)}%</td>
                            <td>Percentage of registered participants who attended at least one session. Calculated as (Total Unique Attendees / Total Registered) * 100.</td>
                        </tr>
                    </tbody>
                 </table>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Section 3: Session Attendance Summary</h2>
                <table className={styles.sessionTable}>
                    <thead>
                        <tr>
                            <th>Session Name</th>
                            <th>Date & Time</th>
                            <th>Total Attendees</th>
                            <th>Attendance Rate (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessionAttendanceSummary.map(session => (
                            <tr key={session.sessionId}>
                                <td>{session.sessionName}</td>
                                <td>
                                    {formatDate(session.startDateTime)} - {formatTime(session.endDateTime)}
                                </td>
                                <td>{session.totalAttendees}</td>
                                <td>{formatPercentage(session.attendanceRate)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 <p className={styles.definitions}>
                    * Session Attendance Rate is calculated as (Total Attendees for Session / Total Registered Participants for Event) * 100.
                 </p>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Section 4: Participant Demographics (Attendees)</h2>
                 {/* Notes on Charting */}
                 <p>
                    <em>
                        Demographic data below is based on participants who attended at least one session.
                        Bar charts for Gender and Faculty would be displayed here using a charting library (e.g., Chart.js, Recharts).
                        For visualization purposes, the data is presented in tables below.
                    </em>
                 </p>

                 {/* Gender Breakdown (Table) */}
                 <h3 className={styles.sectionTitle} style={{ marginTop: '20px' }}>Attendance by Gender</h3>
                 {Object.keys(demographics.gender).length > 0 ? (
                    <table className={styles.demographicsTable}>
                        <thead>
                            <tr>
                                <th>Gender</th>
                                <th>Count</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(demographics.gender).map(([gender, data]) => (
                                <tr key={gender}>
                                    <td>{gender}</td>
                                    <td>{data.count}</td>
                                    <td>{formatPercentage(data.percentage)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 ) : (
                    <p>No gender data available for attendees.</p>
                 )}

                 {/* Faculty Breakdown (Table) */}
                 <h3 className={styles.sectionTitle} style={{ marginTop: '20px' }}>Attendance by Faculty/Department</h3>
                 {Object.keys(demographics.faculty).length > 0 ? (
                    <table className={styles.demographicsTable}>
                        <thead>
                            <tr>
                                <th>Faculty/Department</th>
                                <th>Count</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(demographics.faculty).map(([faculty, data]) => (
                                <tr key={faculty}>
                                    <td>{faculty}</td>
                                    <td>{data.count}</td>
                                    <td>{formatPercentage(data.percentage)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 ) : (
                    <p>No faculty data available for attendees.</p>
                 )}

                {/* Example data structure for Chart.js Gender Chart */}
                 {/*
                 const genderChartData = {
                     labels: Object.keys(demographics.gender),
                     datasets: [{
                         label: 'Attendees by Gender',
                         data: Object.values(demographics.gender).map(item => item.count),
                         backgroundColor: ['#ADD8E6', '#FFB6C1', '#D3D3D3'], // Example colors
                     }]
                 };
                 // Render <Bar data={genderChartData} /> here
                 */}
            </div>

             {/* Section 5: Participant Details (Optional - Mentioned as Export) */}
             <div className={styles.section}>
                 <h2 className={styles.sectionTitle}>Section 5: Participant Details (Export)</h2>
                 <p>A detailed list of registered participants, including their attendance status for each session, would typically be available as a separate downloadable file (e.g., CSV) due to the potential volume of data.</p>
                 {/* Example of how you might link to an export API route */}
                 {/* <button>Generate Participant List (CSV)</button> */}
             </div>


             <div className={styles.definitions}>
                 <p><strong>Metric Definitions:</strong></p>
                 <div className={styles.definitionItem}><strong>Total Expected Participants:</strong> The planned capacity or target number of attendees for the event.</div>
                 <div className={styles.definitionItem}><strong>Total Registered Participants:</strong> The total number of individuals who completed the registration process for the event.</div>
                 <div className={styles.definitionItem}><strong>Registration Fill Rate:</strong> The percentage of the expected participant count that was met by registrations.</div>
                 <div className={styles.definitionItem}><strong>Total Unique Attendees:</strong> The number of distinct registered participants who were recorded as attending at least one session of the event.</div>
                 <div className={styles.definitionItem}><strong>Overall Attendance Rate:</strong> The percentage of registered participants who attended at least one session.</div>
                 <div className={styles.definitionItem}><strong>Session Attendance Rate:</strong> For a specific session, the percentage of registered participants for the *entire event* who attended that session.</div>
             </div>

        </div>
    );
};

export default AttendanceReport;