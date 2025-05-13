'use client';

import React, { useEffect } from 'react';
import { formatDate, formatDateTime } from '@/helpers/eventHelpers'; // Import formatting helper
import styles from './AttendanceTable.module.css'; // Import CSS module
import { Attendee } from '@/types/event';



interface ParticipantAttendanceTableProps {
    participants: Attendee[]; // This is now the list for the CURRENT page
    onManualAttendanceChange: (participantId: string, currentlyAttended: boolean) => void;
    selectedSessionName?: string | null;

    // --- Pagination Props ---
    currentPage: number;
    pageSize: number;
    totalItems: number; // Total items across ALL pages
    totalPages: number; // Total number of pages
    onPageChange: (page: number) => void; // Handler for page change
    onPageSizeChange: (size: number) => void; // Handler for page size change
    // --- End Pagination Props ---
}

const ParticipantAttendanceTable: React.FC<ParticipantAttendanceTableProps> = ({
    participants,
    onManualAttendanceChange,
    // Pagination Props
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    onPageChange,
    onPageSizeChange,
}) => {

    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems); // Ensure end index doesn't exceed total items


    return (
        <div>
            {/* Optional Title for the Table */}
            {/* {selectedSessionName && (
                <h3>Participants Attendance - {selectedSessionName}</h3>
             )} */}

            {/* Display current range and total */}
            {totalItems > 0 && (
                <div className="pagination-container">
                    <div className="pagination-info">
                        Showing {startIndex} - {endIndex} of {totalItems} attendees
                    </div>

                    <div className="page-size-selector">
                        Attendees per page:
                        <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>

            )}



            <table className={styles.attendanceTable}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Contact Number</th>
                        <th>Faculty</th>
                        <th>Course</th>
                        <th>Year</th>
                        <th>Check In Time</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Render only the participants for the current page */}
                    {participants.length > 0 ? (
                        participants.map(participant => (
                            <tr key={participant.userId}>
                                <td>{participant.name}</td>
                                <td>{participant.email}</td>
                                <td>{participant.phoneNo}</td>
                                <td>{participant.faculty || "-"}</td>
                                <td>{participant.course || "-"}</td>
                                <td>{participant.year || "-"}</td>
                                <td className={styles.timeMethodCell}>
                                    {participant.checkinDateTime
                                        ? `${formatDate(participant.checkinDateTime)}, ${formatDateTime(participant.checkinDateTime)}`
                                        : '-'}

                                </td>
                            </tr>
                        ))
                    ) : (
                        // Message when the current page is empty (e.g., last page has no items)
                        <tr>
                            <td colSpan={8} style={{ textAlign: 'center' }}>No attendee found for this section.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* --- Pagination Controls --- */}
            {totalItems > 0 && totalPages > 1 && ( // Only show controls if there's more than one page
                <div className="pagination-button-group">
                    {/* Page Buttons */}
                    <div className="page-buttons">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1} // Disable if on the first page
                            className="button-secondary" // Reuse button style
                        >
                            Previous
                        </button>

                        {/* Simple Page Number Display (can be enhanced) */}
                        <span className="page-number">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages} // Disable if on the last page
                            className="button-secondary" // Reuse button style
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Message if no registered participants for the selected session */}
            {/* This case is now handled by the parent component */}
            {/* {!participants || participants.length === 0 && totalItems === 0 && (
                <p>No participants found for this session.</p>
            )} */}

        </div>
    );
};

export default ParticipantAttendanceTable;