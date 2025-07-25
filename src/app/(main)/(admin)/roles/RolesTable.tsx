'use client';

import React from 'react';
import { Role } from '@/types/event';
import { FaTrash } from 'react-icons/fa';



interface RolesTableProps {
    roles: Role[]; // This is now the list for the CURRENT page
    handleDeleteRole: (roleId: number) => void;
    // --- Pagination Props ---
    currentPage: number;
    pageSize: number;
    totalItems: number; // Total items across ALL pages
    totalPages: number; // Total number of pages
    offset: number;
    onPageChange: (page: number) => void; // Handler for page change
    onPageSizeChange: (size: number) => void; // Handler for page size change

    // --- End Pagination Props ---
}

const RoleTable: React.FC<RolesTableProps> = ({
    roles,
    handleDeleteRole,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    offset,
    onPageChange,
    onPageSizeChange,
}) => {

    const startIndex = (currentPage * pageSize) + 1;
    const endIndex = Math.min((currentPage + 1) * pageSize, totalItems); // Ensure end index doesn't exceed total items


    return (
        <div>
            {totalItems > 0 && (
                <div className="pagination-container">
                    <div className="pagination-info">
                        Showing {startIndex} - {endIndex} of {totalItems} roles
                    </div>

                    <div className="page-size-selector">
                        Roles per page:
                        <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>

            )}



            <table className={"paging-table"}>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Name</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Render only the participants for the current page */}
                    {roles.length > 0 ? (
                        roles.map((roles, index) => (

                            <tr key={roles.id}>
                                <td>{offset + index + 1}</td>
                                <td>{roles.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleDeleteRole(roles.id)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Delete budget"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>

                            </tr>
                        ))
                    ) : (
                        // Message when the current page is empty (e.g., last page has no items)
                        <tr>
                            <td colSpan={8} style={{ textAlign: 'center' }}>No role found.</td>
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

            {/* Message if no registered participants for the selected session */}
            {/* This case is now handled by the parent component */}
            {/* {!participants || participants.length === 0 && totalItems === 0 && (
                <p>No participants found for this session.</p>
            )} */}

        </div>
    );
};

export default RoleTable;