// src/components/ParticipantsTable.tsx
'use client';


import React, { useState } from 'react';
import { User } from '@/types/user'; // Adjust path
import ConfirmationModal from './ConfirmationModal';

interface ParticipantsTableProps {
    participants: User[];
    onDeleteParticipant: ((id: number | string) => void) | null; // Make it optional by allowing null
    // --- Pagination Props ---
    currentPage: number;
    pageSize: number;
    totalParticipants: number; // Total items across ALL pages
    totalPages: number; // Total number of pages
    offset: number;
    onPageChange: (page: number) => void; // Handler for page change
    onPageSizeChange: (size: number) => void; // Handler for page size change
    // --- End Pagination Props ---

}

const ParticipantsTable: React.FC<ParticipantsTableProps> = ({
    participants,
    onDeleteParticipant,
    currentPage,
    pageSize,
    totalParticipants,
    totalPages,
    offset,
    onPageChange,
    onPageSizeChange,

}) => {
    // State to handle confirmation modal
    const [showConfirm, setShowConfirm] = useState(false);
    const [toDeleteId, setToDeleteId] = useState<number | string | null>(null);

    const handleDeleteClick = (id: number | string) => {
        setToDeleteId(id);
        setShowConfirm(true);
    };

    const handleConfirmDelete = () => {
        if (toDeleteId !== null && onDeleteParticipant) {
            onDeleteParticipant(toDeleteId);
        }
        setShowConfirm(false);
        setToDeleteId(null);
    };

    const handleCancelDelete = () => {
        setShowConfirm(false);
        setToDeleteId(null);
    };

    if (!participants || participants.length === 0) {
        return <p style={{ marginTop: '20px', fontStyle: 'italic' }}>No participants available. Add participants manually or check import results.</p>;
    }

    const startIndex = (currentPage * pageSize) + 1;
    const endIndex = Math.min((currentPage + 1) * pageSize, totalParticipants); // Ensure end index doesn't exceed total items


    return (
        <>

            {totalParticipants > 0 && (
                <div className="pagination-container">
                    <div className="pagination-info">
                        Showing {startIndex} - {endIndex} of {totalParticipants} participants
                    </div>

                    <div className="page-size-selector">
                        Participants per page:
                        <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>

            )}

            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>No.</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Name</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Email</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Phone</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Gender</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Faculty</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Course</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Year</th>
                            {onDeleteParticipant && <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {participants.map((participant, index) => (
                            <tr key={participant.id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{offset + index}</td>
                                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{participant.name}</td>
                                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{participant.email}</td>
                                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{participant.phoneNo || '-'}</td>
                                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{participant.gender || '-'}</td>
                                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{participant.faculty || '-'}</td>
                                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{participant.course || '-'}</td>
                                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{participant.year || '-'}</td>
                                {onDeleteParticipant && (
                                    <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleDeleteClick(participant.id ?? '')}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.9em'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* --- Pagination Controls --- */}
                {totalParticipants > 0 && totalPages > 1 && ( // Only show controls if there's more than one page
                    <div className="pagination-button-group">
               

                        {/* Page Buttons */}
                        <div className="page-buttons">
                            <button
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 0} // Disable if on the first page
                                className="button-secondary" // Reuse button style
                            >
                                Previous
                            </button>

                            {/* Simple Page Number Display (can be enhanced) */}
                            <span className="page-number">
                                Page {currentPage+1} of {totalPages}
                            </span>

                            <button
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages-1} // Disable if on the last page
                                className="button-secondary" // Reuse button style
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}


            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                open={showConfirm}
                title="Remove Participant?"
                message="Are you sure you want to remove this participant?"
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </>
    );
};

export default ParticipantsTable;
