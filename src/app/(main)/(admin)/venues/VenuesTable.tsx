'use client';

import React, { useState } from 'react';
import { Venue } from '@/types/event';
import { FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import styles from './venues.module.css';

interface VenuesTableProps {
    venues: Venue[]; // This is now the list for the CURRENT page
    handleDeleteVenue: (venueId: number) => void;
    handleEditVenue: (id: number, venue: Venue) => void;

    // --- Floor Level Filter Props ---
    currentFloorLevel: number | undefined;
    onFloorLevelChange: (floorLevel: number | 1) => void;

    // --- Pagination Props ---
    currentPage: number;
    pageSize: number;
    totalItems: number; // Total items across ALL pages
    totalPages: number; // Total number of pages
    offset: number;
    onPageChange: (page: number) => void; // Handler for page change
    onPageSizeChange: (size: number) => void; // Handler for page size change

    // --- Loading State ---
    isLoading?: boolean;
}

const VenuesTable: React.FC<VenuesTableProps> = ({
    venues,
    handleDeleteVenue,
    handleEditVenue,
    currentFloorLevel,
    onFloorLevelChange,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    offset,
    onPageChange,
    onPageSizeChange,
    isLoading = false,
}) => {
    const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<Venue>>({});

    const startIndex = (currentPage * pageSize) + 1;
    const endIndex = Math.min((currentPage + 1) * pageSize, totalItems);

    const handleFloorLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onFloorLevelChange(Number(value));
        onPageChange(0);
    };

    const startEditing = (venue: Venue) => {
        setEditingVenueId(venue.id);
        setEditFormData({
            id: venue.id,
            name: venue.name,
            fullName: venue.fullName,
            capacity: venue.capacity,
            qrCodeUrl: venue.qrCodeUrl
        });
    };

    const cancelEditing = () => {
        setEditingVenueId(null);
        setEditFormData({});
    };

    const saveEdit = () => {
        if (editingVenueId && editFormData) {
            // Validate required fields
            if (!editFormData.name?.trim() || !editFormData.fullName?.trim()) {
                alert('Venue code and full name are required');
                return;
            }

            if (editFormData.capacity && editFormData.capacity < 0) {
                alert('Capacity cannot be negative');
                return;
            }

            const updatedVenue: Venue = {
                id: editingVenueId,
                name: editFormData.name!.trim(),
                fullName: editFormData.fullName!.trim(),
                capacity: editFormData.capacity || 0,
                qrCodeUrl: editFormData.qrCodeUrl ? editFormData.qrCodeUrl.trim() : ""
            };

            handleEditVenue(Number(editingVenueId), updatedVenue);
            setEditingVenueId(null);
            setEditFormData({});
        }
    };

    const handleInputChange = (field: keyof Venue, value: string | number) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div>
            {/* Header Section with Info and Controls */}
            <div className={styles.tableHeader}>
                <div className={styles.paginationContainer}>
                    <div className={styles.paginationInfo}>
                        Showing {startIndex} - {endIndex} of {totalItems} venues
                    </div>

                    <div className={styles.pageSizeSelector}>
                        Venues per page:
                        <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>

                <div className={styles.tableControls}>
                    {/* Floor Level Dropdown */}
                    <div className={styles.floorLevelSelector}>
                        <label htmlFor="floor-level" className={styles.floorLabel}>
                            Floor Level:
                        </label>
                        <select
                            id="floor-level"
                            value={currentFloorLevel || '1'}
                            onChange={handleFloorLevelChange}
                            className={styles.floorDropdown}
                            disabled={isLoading}
                        >
                            <option value="1">Level 1</option>
                            <option value="2">Level 2</option>
                            <option value="3">Level 3</option>
                            <option value="4">Level 4</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            <div className={styles.tableWrapper}>
                {isLoading && (
                    <div className={styles.loadingOverlay}>
                        <div className={styles.loadingSpinner}></div>
                        <span>Loading venues...</span>
                    </div>
                )}

                {/* Venues Table */}
                <table className={"paging-table"}>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Code</th>
                            <th>Full Name</th>
                            <th>Capacity</th>
                            <th>Floor Level</th>
                            <th>Location QR Code Url</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {venues.length > 0 ? (
                            venues.map((venue, index) => (
                                <tr key={venue.id}>
                                    <td>{offset + index + 1}</td>
                                    <td>
                                        {editingVenueId === venue.id ? (
                                            <input
                                                type="text"
                                                value={editFormData.name || ''}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                className={styles.editInput}
                                                placeholder="Venue code"
                                            />
                                        ) : (
                                            venue.name || '-'
                                        )}
                                    </td>
                                    <td>
                                        {editingVenueId === venue.id ? (
                                            <input
                                                type="text"
                                                value={editFormData.fullName || ''}
                                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                                className={styles.editInput}
                                                placeholder="Full name"
                                            />
                                        ) : (
                                            venue.fullName
                                        )}
                                    </td>
                                    <td>
                                        {editingVenueId === venue.id ? (
                                            <input
                                                type="number"
                                                value={editFormData.capacity || ''}
                                                onChange={(e) => handleInputChange('capacity', Number(e.target.value))}
                                                className={styles.editInput}
                                                placeholder="Capacity"
                                                min="0"
                                            />
                                        ) : (
                                            venue.capacity || '-'
                                        )}
                                    </td>
                                    <td>
                                        <span className={styles.floorBadge}>
                                            Level {currentFloorLevel || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        {editingVenueId === venue.id ? (
                                            <input
                                                type="text"
                                                value={editFormData.qrCodeUrl || ''}
                                                onChange={(e) => handleInputChange('qrCodeUrl', e.target.value)}
                                                className={styles.editInput}
                                                placeholder="Qr code Url"
                                            />
                                        ) : (
                                            venue.qrCodeUrl || '-'
                                        )}
                                    </td>
                                    <td className={styles.actionColumn}>
                                        {editingVenueId === venue.id ? (
                                            <div className={styles.editActions}>
                                                <button
                                                    onClick={saveEdit}
                                                    className={styles.saveButton}
                                                    title="Save changes"
                                                    disabled={isLoading}
                                                >
                                                    <FaCheck />
                                                </button>
                                                <button
                                                    onClick={cancelEditing}
                                                    className={styles.cancelButton}
                                                    title="Cancel editing"
                                                    disabled={isLoading}
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={styles.normalActions}>
                                                <button
                                                    onClick={() => startEditing(venue)}
                                                    className={styles.editButton}
                                                    title="Edit venue"
                                                    disabled={isLoading}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteVenue(Number(venue.id))}
                                                    className={styles.deleteButton}
                                                    title="Delete venue"
                                                    disabled={isLoading}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className={styles.emptyRow}>
                                    {isLoading ? 'Loading...' :
                                        `No venues found on Level ${currentFloorLevel || '1'}.`}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- Pagination Controls --- */}
            {totalItems > 0 && totalPages > 1 && ( // Only show controls if there's more than one page
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
                            Page {currentPage + 1} of {totalPages}
                        </span>

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages - 1} // Disable if on the last page
                            className="button-secondary" // Reuse button style
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VenuesTable;
