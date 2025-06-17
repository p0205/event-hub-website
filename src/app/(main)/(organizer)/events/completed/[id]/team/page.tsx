// src/app/events/[id]/team/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';

// Assuming a CSS Module for team page specific styles
import styles from './team.module.css'; // Create this CSS module

import teamService from '@/services/teamService';
import { Role, TeamMember } from '@/types/event'; // Ensure TeamMember type includes userId, name, email, role


export default function EventTeamPage() {
    const params = useParams();
    const eventId = params.id as string;

    // --- State for data and loading ---
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [teamRoles, setTeamRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- State for team members pagination
    const [currentPageNo, setCurrentPageNo] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [sortBy] = useState<string>("user.name");
    const [totalPages, setTotalPages] = useState(0);
    const [totalMembers, setTotalMembers] = useState(0);

    
    const [refreshTeamTrigger, setRefreshTeamTrigger] = useState(0); // State to trigger refresh of team data

    // --- Data Loading (fetch team members) ---
    useEffect(() => {
        const loadTeamData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await teamService.getTeamMembers(Number(eventId), currentPageNo, pageSize, sortBy);
                setTeamMembers(response.content);
                setPageSize(response.size);
                setCurrentPageNo(response.pageable.pageNumber);
                setTotalPages(response.totalPages);
                setTotalMembers(response.totalElements);

            } catch (e: any) {
                console.error("Error loading team data:", e);
                setError(`Failed to load team data: ${e.message || 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };
        loadTeamData();
    }, [eventId, refreshTeamTrigger, currentPageNo, pageSize, sortBy]); // Rerun if eventId or trigger changes


    // --- Handlers ---
    // Handle pagination
    const handlePageChange = (newPage: number) => {
        setCurrentPageNo(newPage);
    };

    // const goToFirstPage = () => {
    //     if (currentPageNo > 0) {
    //         setCurrentPageNo(0);
    //     }
    // }

    // const goToLastPage = () => {
    //     if (currentPageNo > 0) {
    //         setCurrentPageNo(totalPages - 1);
    //     }
    // }

    const onPageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
    }


   


    // --- Render Logic ---

    if (loading && teamMembers.length === 0) {
        return (
            <div className="page-content-wrapper">
                <div className='page-header'>
                    <div className='page-title-section'>
                        <h2>Team</h2>
                        <p className={'page-subtitle'}>
                            Collaborate with team members to coordinate efforts and ensure seamless event execution
                        </p>
                    </div>
                </div>
                <p className="loading-message">Loading team data...</p>
            </div>
        );
    }



    const hasTeamMembers = teamMembers && teamMembers.length > 0;
    const hasRoles = teamRoles && teamRoles.length > 0;
    const startIndex = (currentPageNo * pageSize) + 1;
    const endIndex = Math.min((currentPageNo + 1) * pageSize, totalMembers); // Ensure end index doesn't exceed total items

    

    return (
        <div className="page-content-wrapper">
            <div className='page-header'>
                <div className='page-title-section'>
                    <h2>Team</h2>
                    <p className={'page-subtitle'}>
                        Collaborate with team members to coordinate efforts and ensure seamless event execution
                    </p>
                </div>

            </div>
            {/* --- Event Team Members List --- */}
            <div className="form-container">
                {/* Heading with Add Button */}
                <div className={styles["teamListHeader"]}>
                    <h3>Event Team Members ({totalMembers})</h3>
                   
                   
                </div>

                {error && teamMembers.length > 0 && <p className="error-message">{error}</p>}

                {hasTeamMembers ? (

                    <div className={styles["team-members-list-container"]}>
                        {/* Display current range and total */}
                        {totalMembers > 0 && (
                            <div className="pagination-container">
                                <div className="pagination-info">
                                    Showing {startIndex} - {endIndex} of {totalMembers} participants
                                </div>
                                {/* Page Size Selector */}
                                <div className="page-size-selector">
                                    Participants per page:
                                    <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
                                        <option value={5}>5</option>
                                        <option value={10}>10</option> {/* Default */}
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        {/* Add more options as needed */}
                                    </select>
                                </div>
                            </div>
                        )}

                        <ul>
                            {teamMembers.map(member => (
                                <li key={member.userId} className={styles["team-member-item"]}>
                                    <img src={'/default-avatar.png'} alt={member.name} className={styles["profile-image"]} width={40} height={40} />
                                    <div className={styles["user-info"]}>
                                        <div className={styles["user-name"]}>{member.name}</div>
                                        <div className={styles["user-email"]}>{member.email}</div>
                                    </div>
                                    <span className={styles["team-member-role"]}>{member.roles}</span>
                                   
                                </li>
                            ))}
                        </ul>

                        {/* --- Pagination Controls --- */}
                        {totalMembers > 0 && totalPages > 1 && ( // Only show controls if there's more than one page
                            <div className="pagination-button-group">

                                {/* Page Buttons */}
                                <div className="page-buttons">
                                    <button
                                        onClick={() => handlePageChange(currentPageNo - 1)}
                                        disabled={currentPageNo === 0} // Disable if on the first page
                                        className="button-secondary" // Reuse button style
                                    >
                                        Previous
                                    </button>

                                    {/* Simple Page Number Display (can be enhanced) */}
                                    <span className="page-number">
                                        Page {currentPageNo + 1} of {totalPages}
                                    </span>

                                    <button
                                        onClick={() => handlePageChange(currentPageNo + 1)}
                                        disabled={currentPageNo === totalPages - 1} // Disable if on the last page
                                        className="button-secondary" // Reuse button style
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                ) : (
                    !loading && <p className="no-events-message">No team members added to this event yet.</p>
                )}
            </div>

            
              
         

        </div> // End page-content-wrapper
    );
}