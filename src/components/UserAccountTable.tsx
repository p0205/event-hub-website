import { formatDate, formatDateAndTime, formatDateTime } from "@/helpers/eventHelpers";
import { User, UserAccountStatus } from "@/types/user";
import { useState } from "react";
import { FaEdit, FaTrash } from 'react-icons/fa';

interface UserAccountTableProps {
    users: User[];
    onDeleteUserAccount: (id: number | string) => void;
    onEditUserAccount: (id: number | string) => void;
    currentPage: number;
    pageSize: number;
    totalItems: number;
    offset: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

const UserAccountTable: React.FC<UserAccountTableProps> = ({
    users,
    onDeleteUserAccount,
    onEditUserAccount,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    offset,
    onPageChange,
    onPageSizeChange,
}) => {
    const startIndex = (currentPage * pageSize) + 1;
    const endIndex = Math.min((currentPage + 1) * pageSize, totalItems);

    if (!users || users.length === 0) {
        return <p style={{ marginTop: '20px', fontStyle: 'italic' }}>No users available.</p>;
    }

    return (
        <>
            {totalItems > 0 && (
                <div className="pagination-container">
                    <div className="pagination-info">
                        Showing {startIndex} - {endIndex} of {totalItems} users
                    </div>

                    <div className="page-size-selector">
                        Users per page:
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            )}

            <div className="table-container" style={{ 
                overflowX: 'auto', 
                marginTop: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse', 
                    border: '1px solid #ddd',
                    minWidth: '1400px',
                    position: 'relative'
                }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', whiteSpace: 'nowrap' }}>Name</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', whiteSpace: 'nowrap' }}>Email</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', whiteSpace: 'nowrap' }}>Phone</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', whiteSpace: 'nowrap' }}>Gender</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', whiteSpace: 'nowrap' }}>Faculty</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', whiteSpace: 'nowrap' }}>Course</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', whiteSpace: 'nowrap' }}>Year</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', whiteSpace: 'nowrap' }}>Role</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', whiteSpace: 'nowrap' }}>Status</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', whiteSpace: 'nowrap' }}>Created At</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', whiteSpace: 'nowrap' }}>Last Updated</th>
                            <th style={{ 
                                border: '1px solid #ddd', 
                                padding: '12px', 
                                textAlign: 'center', 
                                minWidth: '120px', 
                                whiteSpace: 'nowrap',
                                position: 'sticky',
                                right: 0,
                                backgroundColor: '#f8f9fa',
                                zIndex: 1,
                                boxShadow: '-2px 0 5px rgba(0,0,0,0.1)'
                            }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.id} style={{ 
                                borderBottom: '1px solid #ddd',
                                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                                transition: 'background-color 0.2s'
                            }}>
                                <td style={{ border: '1px solid #ddd', padding: '10px', fontSize: '0.875rem' }}>{user.name}</td>
                                <td style={{ border: '1px solid #ddd', padding: '10px', fontSize: '0.875rem' }}>{user.email}</td>
                                <td style={{ border: '1px solid #ddd', padding: '10px', fontSize: '0.875rem' }}>{user.phoneNo || '-'}</td>
                                <td style={{ border: '1px solid #ddd', padding: '10px', fontSize: '0.875rem' }}>{user.gender || '-'}</td>
                                <td style={{ border: '1px solid #ddd', padding: '10px', fontSize: '0.875rem' }}>{user.faculty || '-'}</td>
                                <td style={{ border: '1px solid #ddd', padding: '10px', fontSize: '0.875rem' }}>{user.course || '-'}</td>
                                <td style={{ border: '1px solid #ddd', padding: '10px', fontSize: '0.875rem' }}>{user.year || '-'}</td>
                                <td style={{ border: '1px solid #ddd', padding: '10px', fontSize: '0.875rem' }}>
                                    <span className={`role ${user.role?.toLowerCase().replace(' ', '') || ''}`}>
                                        {user.role || 'N/A'}
                                    </span>
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '10px', fontSize: '0.875rem' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        backgroundColor: user.status === UserAccountStatus.ACTIVE ? '#e8f5e9' :
                                            user.status === UserAccountStatus.INACTIVE ? '#ffebee' :
                                            user.status === UserAccountStatus.PENDING ? '#fff3e0' :
                                            user.status === UserAccountStatus.SUSPENDED ? '#f5f5f5' : '#f5f5f5',
                                        color: user.status === UserAccountStatus.ACTIVE ? '#2e7d32' :
                                            user.status === UserAccountStatus.INACTIVE ? '#c62828' :
                                            user.status === UserAccountStatus.PENDING ? '#ef6c00' :
                                            user.status === UserAccountStatus.SUSPENDED ? '#616161' : '#616161'
                                    }}>
                                        {user.status || 'N/A'}
                                    </span>
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '10px', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#666', fontSize: '0.875rem' }}>
                                        {formatDateAndTime(user.createdAt)}
                                    </span>
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '10px', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#666', fontSize: '0.875rem' }}>
                                        {formatDateAndTime(user.lastUpdatedAt)}
                                    </span>
                                </td>
                                <td style={{ 
                                    border: '1px solid #ddd', 
                                    padding: '10px',
                                    position: 'sticky',
                                    right: 0,
                                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                                    zIndex: 1,
                                    boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
                                    fontSize: '0.875rem'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '10px',
                                        flexWrap: 'nowrap'
                                    }}>
                                        <button
                                            className="action-button edit"
                                            title="Edit"
                                            onClick={() => onEditUserAccount(user.id!)}
                                            style={{
                                                padding: '8px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                backgroundColor: '#e3f2fd',
                                                color: '#1976d2',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#bbdefb';
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#e3f2fd';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="action-button delete"
                                            title="Delete"
                                            onClick={() => onDeleteUserAccount(user.id!)}
                                            style={{
                                                padding: '8px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                backgroundColor: '#ffebee',
                                                color: '#d32f2f',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#ffcdd2';
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#ffebee';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>


            {totalItems > 0 && totalPages > 1 && (
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
        </>
    );
};

export default UserAccountTable;