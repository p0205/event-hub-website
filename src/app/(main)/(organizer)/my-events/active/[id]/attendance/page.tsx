// src/app/my-events/[id]/attendance/page.tsx
'use client'; // This is a client component for interactivity and data fetching

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation'; // To get event ID from URL

// We no longer need a client-side QR generation library like qrcode.react
// import QRCode from 'qrcode.react';

// You might need a helper to trigger file downloads, or use pure JS like shown in handleDownloadQRCode
// import { downloadFile } from '@/utils/download';

// Assuming you have participant and session data structures defined elsewhere
// You might need to fetch these as part of the event details
// import { Participant } from '@/types/participant'; // Reuse Participant interface from Participants page
// import { Session as SessionType } from '@/types/event'; // Import the Session type with a different name to avoid conflict
import sessionService from '@/services/sessionService'; // Import your session service
import { formatDate, formatDateTime } from '@/helpers/eventHelpers';

// Assuming a CSS Module for attendance page specific styles
import styles from './attendance.module.css'; // Create this CSS module
import { Attendee, Session } from '@/types/event';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import attendanceService from '@/services/attendanceService';
import { PageData } from '@/types/api';


export default function EventAttendancePage() {
    const params = useParams();
    const eventId = Number(params.id); // Get event ID from route params (ensure it's string)
    const numericEventId = Number(eventId); // Convert to number for service calls

    // --- State for data and loading ---
    const [sessions, setSessions] = useState<Session[] | null>(null); // State to hold session details
    const [loading, setLoading] = useState(true); // Loading for initial page data
    const [error, setError] = useState<string | null>(null); // Error for initial page data

    // --- State for UI interactions ---
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null); // State for the currently selected session ID

    // --- State for QR Code Fetching/Generation ---
    const [qrCodeImageUrl, setQrCodeImageUrl] = useState<string | null>(null); // State to hold the object URL for the QR code image
    const [qrCodeLoading, setQrCodeLoading] = useState(false); // Loading for automatic QR fetch on session change
    const [qrCodeError, setQrCodeError] = useState<string | null>(null); // Error for automatic QR fetch on session change
    const [isGeneratingQr, setIsGeneratingQr] = useState(false); // Loading state for explicit generation button click

    // --- State for Generate QR Modal ---
    const [showGenerateQrModal, setShowGenerateQrModal] = useState(false);
    const [customExpiresAt, setCustomExpiresAt] = useState<string>(''); // State for the input value in the modal

    // State for participant table
    const [participants, setParticipants] = useState<Attendee[]>([]);
    const [currentPage, setCurrentPage] = useState(1); // 1-indexed for UI
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [offset, setOffset] = useState(0);

    // --- Data Fetching (Initial Page Load) ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                setSessions(await sessionService.getSessionsByEventId(Number(eventId))); // Assuming this fetches session list

                const sessionsData = await sessionService.getSessionsByEventId(Number(eventId));
                setSessions(sessionsData); // Set the sessions state here

                if (sessionsData && sessionsData.length > 0) {
                    setSelectedSessionId(sessionsData[0].id); // Select the first session by default
                } else {
                    setSelectedSessionId(null); // Ensure no session is selected if none exist
                }
            } catch (e: unknown) {
                console.error("Failed to fetch attendance data:", e);
                if (e instanceof Error) {
                    setError(`Failed to load attendance data: ${e.message || 'Unknown error'}`);
                } else {
                    setError('Failed to load attendance data: Unknown error');
                }
                setSessions(null); // Ensure sessions is null on error
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if eventId is valid
        if (eventId) {
            fetchData();
        }


        // Original Cleanup function - This one is primarily for the initial page load.
        // We'll move QR code URL cleanup to the new useEffect that manages the QR state.
        return () => {
            // Cleanup logic specific to the initial fetch or component unmount
            // Keep this if you have other resources fetched during initial load that need cleanup
        };

    }, [eventId]); // Rerun if eventId changes


    // --- Effect to Fetch QR Code when Session Changes ---
    useEffect(() => {
        console.log("Enter useEffect of session change");

        // Clear previous QR info and start loading specifically for this fetch
        setQrCodeImageUrl(null); // Clear the previous image
        setQrCodeError(null); // Clear previous errors

        // Check if we have a session selected, event ID is valid, and sessions data is loaded
        if (!selectedSessionId || !numericEventId || !sessions) {
            setQrCodeLoading(false); // Ensure loading is false if conditions aren't met
            return; // Do nothing if no session is selected or data isn't ready
        }

        console.log(selectedSession?.qrCodeImage);
        if (selectedSession?.qrCodeImage == null) {
            return;
        }


        // This effect fetches the QR code whenever the selected session changes


        setQrCodeLoading(true); // Start loading indicator for this automatic fetch

        // --- Fetch the QR code Blob ---
        const fetchQrCode = async () => {
            try {
                // Call your backend service to generate/get the QR code Blob
                const qrCodeBlob = await sessionService.generateQRCode(numericEventId, Number(selectedSessionId)); // Pass the local date-time string

                if (qrCodeBlob instanceof Blob && qrCodeBlob.size > 0) {
                    const url = URL.createObjectURL(qrCodeBlob);
                    setQrCodeImageUrl(url); // Update state with the new URL
                    setQrCodeError(null); // Clear any previous errors on success
                } else {
                    // If fetch was successful but returned no/empty blob
                    setQrCodeImageUrl(null); // Explicitly ensure image is null
                    throw new Error("Received empty or invalid response for QR code.");
                }

            } catch (e: unknown) {
                console.error("Failed to auto-fetch QR code:", e);
                if (e instanceof Error) {
                    setQrCodeError(`Failed to load QR code: ${e.message || 'Unknown error'}`);
                } else {
                    setQrCodeError('Failed to load QR code: Unknown error');
                }
                setQrCodeImageUrl(null); // Ensure QR is cleared on error
            } finally {
                setQrCodeLoading(false); // Stop loading indicator
            }
        };

        fetchQrCode(); // Execute the async fetch function

        // --- Cleanup Function ---
        // Revoke the previous object URL when the effect reruns (due to dependency change) or component unmounts
        return () => {
            console.log('useEffect cleanup (QR): potentially revoking URL', qrCodeImageUrl);
            // This cleanup function "sees" the value of qrCodeImageUrl from the render
            // when the effect *last ran*.
            if (qrCodeImageUrl) {
                URL.revokeObjectURL(qrCodeImageUrl);
            }
        };


    }, [selectedSessionId,]); // Add qrCodeImageUrl to dependencies for cleanup correctness. Also sessionService if it's not stable.

    useEffect(() => {
        fetchParticipants(currentPage, pageSize);
    }, [selectedSessionId, currentPage, pageSize]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1); // Reset to the first page on page size change
    };

    const fetchParticipants = async (page: number, size: number) => {
        setLoading(true);
        try {
            const pageIndex = page - 1; // Convert to 0-based for backend
            const data: PageData<Attendee> = await attendanceService.getCheckInParticipantsBySessionId(
                eventId,
                Number(selectedSessionId),
                pageIndex,
                size
            );
            setParticipants(data.content);
            setTotalItems(data.totalElements);
            setTotalPages(data.totalPages);
            setOffset(data.pageable.offset + 1);
        } catch (error) {
            console.error("Error fetching participants:", error);
        } finally {
            setLoading(false);
        }
    };


    // Get the currently selected session object from the sessions list
    const selectedSession = useMemo(() => {
        console.log("Enter useMemo");
        // Guard Clause 1: Check dependencies are ready
        if (!selectedSessionId || !sessions) {
            console.log("useMemo returning null because selectedSessionId or sessions is missing", { selectedSessionId, sessions });
            return null;
        }
        console.log("useMemo dependencies present. Searching sessions:", sessions, "for ID:", selectedSessionId);

        // The core logic: Find the session
        const foundSession = sessions.find(session => {
            // Log the comparison being made inside find
            console.log(`Comparing session.id (${typeof session.id}):`, session.id, `with selectedSessionId (${typeof selectedSessionId}):`, selectedSessionId, `Result: ${String(session.id) === selectedSessionId}`);
            // Ensure type-safe comparison (IDs from <option> values are strings)
            return String(session.id) === String(selectedSessionId);
        });


        console.log("Result of find:", foundSession);
        return foundSession || null; // Return found session or explicitly null if find returns undefined

    }, [selectedSessionId, sessions]);

    // // Generate the data structure for the attendance list table
    // const participantAttendanceList = useMemo<ParticipantAttendanceStatus[]>(() => {
    //     console.log("Enter useMemo for participantAttendanceList");
    //     if (!event || !event.participants || !selectedSessionId || attendanceRecords.length === 0) {
    //         console.log("useMemo participantAttendanceList returning empty array");
    //         return [];
    //     }

    //     const recordsForSelectedSession = attendanceRecords.filter(record => record.sessionId === selectedSessionId);
    //     const attendedParticipantIds = new Set(recordsForSelectedSession.map(record => record.participantId));

    //     const list = event.participants.map((participant: any) => {
    //         const attended = attendedParticipantIds.has(participant.id);
    //         const attendanceRecord = recordsForSelectedSession.find(record => record.participantId === participant.id);

    //         return {
    //             id: participant.id,
    //             name: participant.name,
    //             email: participant.email,
    //             faculty: participant.faculty,
    //             course: participant.course,
    //             year: participant.year,
    //             attended: attended,
    //             attendanceTime: attendanceRecord?.timestamp,

    //         };
    //     });
    //     console.log("useMemo participantAttendanceList result count:", list.length);
    //     return list;

    // }, [event, attendanceRecords, selectedSessionId]); // Depends on event, attendanceRecords, and selectedSessionId


    // --- Handlers ---

    // Handle session selection change in the dropdown
    const handleSessionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSessionId = event.target.value;
        console.log("Session changed to:", newSessionId);
        // This state update will trigger the NEW useEffect to fetch the QR code
        setSelectedSessionId(newSessionId);

        // Reset any specific manual generation loading/error state
        setIsGeneratingQr(false);
        // qrCodeLoading and qrCodeError are handled by the effect now
    };


    // Handle opening the Generate QR Modal
    const handleOpenGenerateQrModal = () => {
        if (!selectedSession) return;

        // Initialize the customExpiresAt input with the session's end time, formatted for datetime-local input
        // datetime-local input expects 'YYYY-MM-DDThh:mm' format
        let defaultExpiresAt = '';
        if (selectedSession.endDateTime) {
            try {
                // Parse the ISO string and format for input type="datetime-local"
                const date = new Date(selectedSession.endDateTime);
                // Check if the date is valid before formatting
                if (!isNaN(date.getTime())) {
                    // Get date parts
                    const year = date.getFullYear();
                    const month = (`0${date.getMonth() + 1}`).slice(-2); // Month is 0-indexed
                    const day = (`0${date.getDate()}`).slice(-2);
                    const hours = (`0${date.getHours()}`).slice(-2);
                    const minutes = (`0${date.getMinutes()}`).slice(-2);

                    defaultExpiresAt = `${year}-${month}-${day}T${hours}:${minutes}`;
                } else {
                    console.warn("Invalid endDateTime for formatting:", selectedSession.endDateTime);
                }
            } catch (e) {
                console.error("Error formatting endDateTime:", e);
            }
        }

        setCustomExpiresAt(defaultExpiresAt);
        setShowGenerateQrModal(true);
        setQrCodeError(null); // Clear QR errors when opening the modal
        // isGeneratingQr state is specifically for the button *inside* the modal
        setIsGeneratingQr(false);
    };
    // Handle closing the Generate QR Modal
    const handleCloseGenerateQrModal = () => {
        setShowGenerateQrModal(false);
        setCustomExpiresAt(''); // Clear input when closing
        setQrCodeError(null); // Clear any previous QR generation errors
        setIsGeneratingQr(false); // Ensure generating state is false
    };


    // Handle the actual QR code generation from the modal (using custom expiry)
    const handleGenerateQrCode = async () => {
        if (!numericEventId || !selectedSessionId) {
            console.error("Cannot generate QR: Event ID or Session ID missing.");
            // TODO: Provide user feedback
            return;
        }

        // Use isGeneratingQr for the loading state specific to this modal action
        setIsGeneratingQr(true);
        setQrCodeError(null); // Clear previous errors

        // Determine the expiresAt value based on custom input (formatted as local date time string)
        let finalExpiresAtParam: string | undefined = undefined;
        if (customExpiresAt) {
            try {
                const date = new Date(customExpiresAt); // Parsed as local time
                if (!isNaN(date.getTime())) {
                    const year = date.getFullYear();
                    const month = (`0${date.getMonth() + 1}`).slice(-2);
                    const day = (`0${date.getDate()}`).slice(-2);
                    const hours = (`0${date.getHours()}`).slice(-2);
                    const minutes = (`0${date.getMinutes()}`).slice(-2);
                    const seconds = (`0${date.getSeconds()}`).slice(-2);
                    finalExpiresAtParam = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
                } else {
                    throw new Error("Invalid custom date/time format.");
                }
            } catch (e: unknown) {
                console.error("Invalid custom expiresAt:", customExpiresAt, e);
                if (e instanceof Error) {
                    setQrCodeError(`Invalid expiration date/time: ${e.message || 'Please check the format.'}`);
                } else {
                    setQrCodeError('Invalid expiration date/time: Please check the format.');
                }
                setIsGeneratingQr(false);
                return;
            }
        }


        // Clean up previous QR code URL before fetching the new one triggered by this button click
        if (qrCodeImageUrl) {
            URL.revokeObjectURL(qrCodeImageUrl);
        }
        setQrCodeImageUrl(null); // Clear the previous image while loading


        try {
            // Log the format being sent
            console.log(`Manually Generating QR code for event ${numericEventId}, session ${selectedSessionId} with expiresAt (local string): ${finalExpiresAtParam || 'default'}`);
            // Call your backend service to generate/get the QR code Blob
            const qrCodeBlob = await sessionService.generateQRCode(numericEventId, Number(selectedSessionId), finalExpiresAtParam);

            // If a blob is returned, it means QR was generated/fetched
            if (qrCodeBlob instanceof Blob && qrCodeBlob.size > 0) {
                const url = URL.createObjectURL(qrCodeBlob);
                setQrCodeImageUrl(url); // Update state with the new URL
                setQrCodeError(null); // Clear any previous errors on success
                handleCloseGenerateQrModal(); // Close modal on success
            } else {
                // If fetch was successful but returned no/empty blob
                setQrCodeImageUrl(null); // Explicitly ensure image is null
                throw new Error("Received empty or invalid response from QR generation.");
            }


        } catch (e: unknown) {
            console.error("Failed to generate QR code:", e);
            if (e instanceof Error) {
                setQrCodeError(`Failed to generate QR code: ${e.message || 'Unknown error'}`);
            } else {
                setQrCodeError('Failed to generate QR code: Unknown error');
            }
            // Ensure QR is cleared on error
            setQrCodeImageUrl(null);
            // Do NOT close the modal on error, let the user see the error or try again
        } finally {
            setIsGeneratingQr(false); // Stop loading for the button click
            // qrCodeLoading is managed by the effect
        }
    };


    // Handle downloading the fetched QR code image
    const handleDownloadQRCode = () => {
        if (!qrCodeImageUrl || !selectedSession) {
            console.error("No QR code URL or session info available to download.");
            // TODO: Provide user feedback
            return;
        }

        // Use the fetched object URL to trigger download
        const link = document.createElement('a');
        link.href = qrCodeImageUrl;
        // Set the download filename (use session name)
        const filename = `attendance-qr-${selectedSession.sessionName.replace(/\s+/g, '_') || selectedSession.id}.png`;
        link.download = filename;

        // Append the link to the body, click it, and then remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Note: URL.revokeObjectURL is handled in the useEffect cleanup
        // It's automatically called when qrCodeImageUrl changes or component unmounts.
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

    const sessionsExist = sessions && sessions.length > 0;
    // Use event?.participants.length > 0 or similar if fetching event data


    return (
        <div className="page-content-wrapper"> {/* Wrapper for padding/spacing */}
            {/* --- Page Title --- */}
            {/* <h2 className="page-title">Attendance</h2> */}
            <div className='page-header'>
                <div className={'page-title-section'}>
                    <h2>Attendance</h2>
                    <p className={'page-subtitle'}>
                    Generate attendance codes per session and monitor participants&apos; attendance
                    </p>
                </div>
            </div>

            {/* --- Session Selection Card --- */}
            {/* Show session selection only if there are sessions */}
            {sessionsExist ? (
                <div className="form-container"> {/* Reuse form-container for card styling */}
                    <div className="form-group"> {/* Reuse form-group for layout */}
                        <label htmlFor="sessionSelect" className="form-label">Choose a Session:</label> {/* Added label and class */}
                        <select id="sessionSelect" value={selectedSessionId || ''} onChange={handleSessionChange} className="form-select"> {/* Added class */}
                            {/* Always show the default "Select a Session" option if nothing is selected */}
                            <option value="" disabled={selectedSessionId !== null}>
                                -- Select a Session --
                            </option>
                            {sessions.map((session: Session) => (
                                <option key={session.id} value={session.id}>
                                    {session.sessionName} ({formatDate(session.startDateTime)} {formatDateTime(session.startDateTime)}) {/* Display session name, date, time */}
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
            {/* Show QR code section if sessions exist */}
            {sessionsExist && (
                <div className="form-container">
                    <h3>Attendance QR Code - {selectedSession?.sessionName || ''}</h3>
                    {/* Conditional rendering based on session selection and QR code status */}
                    {!selectedSessionId ? (
                        // Case 1: Sessions exist, but none is selected
                        <p>Please select a session to view/generate the attendance QR code.</p> // Updated message
                    ) : ( // A session is selected
                        // Check loading state first (either auto-fetch or manual generation)
                        qrCodeLoading || isGeneratingQr ? (
                            <p>Loading QR code for {selectedSession?.sessionName || 'selected session'}...</p>
                        ) : qrCodeError ? (
                            // Show error if any occurred during fetch or generation
                            <p className="error-message">Error loading/generating QR code: {qrCodeError}</p>
                        ) : qrCodeImageUrl && selectedSession ? (
                            // Case 4: Session is selected, QR code image is available, and no loading/error
                            <div className={styles["qr-code-section"]}>
                                <div className={styles["qr-code-container"]}>
                                    <img
                                        src={qrCodeImageUrl} // Use the dynamically generated object URL
                                        alt={`QR Code for ${selectedSession.sessionName}`}
                                        style={{ width: 256, height: 256 }}
                                    />
                                </div>
                                <button className="button-secondary" onClick={handleDownloadQRCode}>
                                    Download QR Code (PNG)
                                </button>
                            </div>
                        ) : selectedSession && !qrCodeImageUrl && !qrCodeLoading && !isGeneratingQr && !qrCodeError && !showGenerateQrModal ? (
                            // Case 5: Session is selected, no QR code image found (maybe initial fetch returned nothing or error)
                            // And currently not loading/generating/in modal/has error
                            <div className={styles["qr-code-section"]}>
                                <p>No QR code found for this session. Generate one:</p>
                                <button
                                    className="button-primary"
                                    onClick={handleOpenGenerateQrModal}
                                    // Disable if no session or already generating (isGeneratingQr covers modal state)
                                    disabled={!selectedSessionId}
                                >
                                    Generate Attendance QR Code
                                    {/* isGeneratingQr is handled by the main loading check above */}
                                </button>
                            </div>
                        ) : null // Fallback - ideally shouldn't be reached if logic is comprehensive
                    )}

                    {/* Modal always rendered but conditionally shown */}
                    {showGenerateQrModal && selectedSession ? (
                        // Use a simple div-based modal here. Replace with your actual Modal component if available.
                        <div className="modal-overlay"> {/* CSS for dimming background */}
                            <div className="modal-content form-container"> {/* Reuse form-container for styling */}
                                {/* Show error message specifically for generation attempt if any */}
                                {/* Only show generation errors when the modal is open and attempting generation */}
                                {qrCodeError && isGeneratingQr && showGenerateQrModal && (
                                    <p className="error-message">Error: {qrCodeError}</p>
                                )}
                                <div className="form-group"> {/* Reuse form-group */}
                                    <label htmlFor="expiresAtInput" className="form-label">QR Expires At (Optional):</label>
                                    {/* Use type="datetime-local" for date and time input */}
                                    <input
                                        id="expiresAtInput"
                                        type="datetime-local"
                                        value={customExpiresAt}
                                        onChange={(e) => setCustomExpiresAt(e.target.value)}
                                        className="form-input" // Reuse form-input style
                                    />
                                    {/* Display the default value for context */}
                                    <small>Default: Session End Time ({selectedSession.endDateTime ? formatDateTime(selectedSession.endDateTime) : 'No end time'})</small>
                                </div>
                                <div className="button-group"> {/* Group buttons */}
                                    <button
                                        className="button-primary"
                                        onClick={handleGenerateQrCode}
                                        disabled={isGeneratingQr} // Disable while generating
                                    >
                                        {isGeneratingQr ? 'Generating...' : 'Generate QR Code'}
                                    </button>
                                    <button
                                        className="button-secondary"
                                        onClick={handleCloseGenerateQrModal}
                                        disabled={isGeneratingQr} // Prevent closing while generating
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}

                </div>
            )}




            {/* --- Participants Attendance List Section --- */}
            {/* Show list only if a session is selected */}
            {/* --- Participants Attendance List Section --- */}
            {/* Show list only if a session is selected */}
            {selectedSessionId && (
                <div className="form-container"> {/* Use form-container for card styling */}
                    <h3>Participants Attendance - {selectedSession?.sessionName || 'Selected Session'}</h3> {/* Display selected session name */}

                    {/* Export Button */}
                    {/* {participants && (
                        <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
                            <button className="button-secondary" onClick={handleExportAttendance}>
                                Export Attendance (CSV)
                            </button>
                        </div>
                    )} */}

                    {/* Render the new ParticipantAttendanceTable component */}
                    <AttendanceTable
                        participants={participants}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        totalItems={totalItems}
                        totalPages={totalPages}
                        offset={offset}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                </div>
            )}

        </div>
    )
}


