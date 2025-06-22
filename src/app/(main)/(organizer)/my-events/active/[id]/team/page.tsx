// src/app/my-events/[id]/team/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

// Assuming a CSS Module for team page specific styles
import styles from './team.module.css'; // Create this CSS module
// import userService from '@/services/userService';
import { User } from '@/types/user';
import teamService from '@/services/teamService';
import { Role, SearchUserInTeam, TeamMember } from '@/types/event'; // Ensure TeamMember type includes userId, name, email, role
import { toast } from 'sonner';

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
    // const [sortBy, setSortBy] = useState<string>("user.name");
    const [totalPages, setTotalPages] = useState(0);
    const [totalMembers, setTotalMembers] = useState(0);

    // --- State for the Add Member Modal ---
    const [showAddMemberModal, setShowAddMemberModal] = useState(false); // Controls modal visibility

    // --- State for adding team members (inside modal) ---
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchUserInTeam[]>([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [selectedRoleForAdd, setSelectedRoleForAdd] = useState<Role | null>(null); // Role selected for the bulk add
    const [selectedUsersForAdd, setSelectedUsersForAdd] = useState<User[]>([]); // List of users selected for bulk add
    const [addingUsers, setAddingUsers] = useState(false); // State for bulk adding users loading
    const [addUsersSuccess, setAddUsersSuccess] = useState(false); // State for successful bulk addition
    const [addUsersError, setAddUsersError] = useState<string | null>(null); // State for bulk addition errors

    const [refreshTeamTrigger, setRefreshTeamTrigger] = useState(0); // State to trigger refresh of team data

    // --- Data Loading (fetch team members) ---
    useEffect(() => {
        const loadTeamData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await teamService.getTeamMembers(Number(eventId), currentPageNo, pageSize, "user.name");
                setTeamMembers(response.content);
                setPageSize(response.size);
                setCurrentPageNo(response.pageable.pageNumber);
                setTotalPages(response.totalPages);
                setTotalMembers(response.totalElements);

            } catch (e: unknown) {
                console.error("Error loading team data:", e);
                if (e instanceof Error) {
                    setError(`Failed to load team data: ${e.message || 'Unknown error'}`);
                } else {
                    setError('Failed to load team data: Unknown error');
                }
            } finally {
                setLoading(false);
            }
        };
        loadTeamData();
    }, [eventId, refreshTeamTrigger, currentPageNo, pageSize]); // Rerun if eventId or trigger changes

    // --- Data Loading (fetch roles - triggered when modal is shown) ---
    useEffect(() => {
        const loadRoles = async () => {
            // Use a specific loading state for roles if needed, or just reuse 'searching' briefly
            setSearching(true); // Indicate roles are loading
            setSearchError(null); // Clear previous errors related to modal
            try {
                const data = await teamService.getRoles();
                setTeamRoles(data);
            } catch (e: unknown) {
                console.error("Error loading team roles:", e);
                if (e instanceof Error) {
                    setSearchError(`Failed to load roles: ${e.message || 'Unknown error'}`);
                } else {
                    setSearchError('Failed to load roles: Unknown error');
                }
            } finally {
                setSearching(false); // Roles finished loading
            }
        };

        if (showAddMemberModal) {
            console.log("Add Member Modal is open, loading roles...");
            loadRoles();
        } else {
            // --- Cleanup modal state when it closes ---
            setTeamRoles([]);
            setSelectedRoleForAdd(null);
            setSelectedUsersForAdd([]);
            setSearchQuery('');
            setSearchResults([]);
            setSearchError(null);
            setAddUsersError(null);
            setAddUsersSuccess(false);
            setSearching(false); // Ensure loading state is off
            setAddingUsers(false); // Ensure adding state is off
        }

    }, [showAddMemberModal]); // Dependency array: rerun effect when showAddMemberModal changes


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


    // Handle search input change
    const handleSearchEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setSearchResults([]);
        setSearchError(null);
        setAddUsersError(null); // Clear add errors if search changes
        setAddUsersSuccess(false); // Clear success message
    };

    // Handle triggering the user search
    const handleSearchUsers = useCallback(async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setSearchError(null);
            return;
        }
        setSearching(true);
        setSearchError(null);
        setSearchResults([]);
        try {
            if (selectedRoleForAdd?.id === undefined) {
                throw new Error("Role ID is undefined.");
            }
            const data = await teamService.searchUserInTeam(Number(eventId), searchQuery.trim(), selectedRoleForAdd.id);
            setSearchResults(data);
            if (data.length === 0) {
                setSearchError('No users found matching the email/name.');
            }
        } catch (e: unknown) {
            console.error("User search error:", e);
            if (e instanceof Error) {
                setSearchError(`Search failed: ${e.message || 'Unknown error'}`);
            } else {
                setSearchError('Search failed: Unknown error');
            }
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    }, [searchQuery]);

    // Handle changing the role for the bulk add
    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRoleName = e.target.value;
        const selectedRole = teamRoles.find(role => role.name === selectedRoleName);

        if (selectedRole) {
            setSelectedRoleForAdd(selectedRole);
        } else {
            setSelectedRoleForAdd(null);
        }
        setAddUsersError(null); // Clear errors when role changes
        setAddUsersSuccess(false); // Clear success message
        // Keep search results and selected users when role changes
    };

    // Handle toggling user selection for bulk add
    const handleToggleUserSelection = (user: User) => {
        setSelectedUsersForAdd(prevSelected => {
            const isSelected = prevSelected.some(u => u.id === user.id);
            if (isSelected) {
                return prevSelected.filter(u => u.id !== user.id);
            } else {

                return [...prevSelected, user];
            }
        });
        setAddUsersError(null); // Clear previous errors when selection changes
        setAddUsersSuccess(false); // Clear success message
    };

    // Handle adding all selected users with the chosen role
    const handleAddSelectedUsers = async () => {
        if (!selectedRoleForAdd || selectedUsersForAdd.length === 0) {
            setAddUsersError("Please select a role and at least one user.");
            setAddUsersSuccess(false);
            return;
        }

        setAddingUsers(true);
        setAddUsersError(null);
        setAddUsersSuccess(false);

        const userIdsToAdd = selectedUsersForAdd.map(user => Number(user.id));
        const roleIdToAssign = selectedRoleForAdd.id;

        try {
            await teamService.addTeamMembers(Number(eventId), userIdsToAdd, roleIdToAssign);
            setAddUsersSuccess(true);
            setAddUsersError(null);

            // Refresh team list *after* success message potentially shown briefly
            setRefreshTeamTrigger(prev => prev + 1);
            setShowAddMemberModal(false);
            toast.success(`${selectedUsersForAdd.length} User(s) added successfully.`);
            // Close modal on success after a short delay (optional)
            // Or close immediately:
            // setShowAddMemberModal(false);

        } catch (e: unknown) {
            console.error("Bulk add team member API error:", e);
            if (e instanceof Error) {
                const apiErrorMessage = e.message || 'Unknown error';
                setAddUsersError(`Failed to add users: ${apiErrorMessage}`);
            } else {
                setAddUsersError('Failed to add users: Unknown error');
            }
            setAddUsersSuccess(false);
        } finally {
            // Set addingUsers back to false *unless* closing modal immediately
            // If closing modal, useEffect cleanup will handle it.
            // If *not* closing modal automatically, uncomment the next line:
            // setAddingUsers(false);
            // If closing modal *with delay*, keep addingUsers=true until modal closes
        }
    };

    // Handle deleting a team member
    const handleDeleteTeamMember = async (userIdToDelete: number, userName: string) => {
        if (!window.confirm(`Are you sure you want to remove ${userName} from the team?`)) {
            return;
        }
        // Use main loading state temporarily or create a specific delete loading state
        setLoading(true);
        setError(null);
        try {
            await teamService.deleteTeamMember(Number(eventId), userIdToDelete);
            console.log("Team member successfully deleted.");
            setRefreshTeamTrigger(prev => prev + 1); // Trigger refetch
        } catch (e: unknown) {
            console.error("Delete team member error:", e);
            if (e instanceof Error) {
                const apiErrorMessage = e.message || 'Unknown error';
                setError(`Failed to delete team member: ${apiErrorMessage}`);
            } else {
                setError('Failed to delete team member: Unknown error');
            }
            // Optional: Trigger refetch even on error to ensure consistency
            // setRefreshTeamTrigger(prev => prev + 1);
        } finally {
            setLoading(false);
        }
    };

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

    // --- Modal Close Handler ---
    const closeModal = () => {
        setShowAddMemberModal(false);
        // State cleanup happens via useEffect dependency
    };

    // Handler for closing modal when clicking overlay background
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) { // Only close if click is directly on the overlay
            closeModal();
        }
    };

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
                    <button
                        className="add-button"
                        onClick={() => setShowAddMemberModal(true)}
                        title="Add Team Member"
                        disabled={loading || addingUsers} // Disable while main list loads or users are being added in modal
                    >
                        +
                    </button>
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
                                    <button
                                        className="button-secondary"
                                        onClick={() => handleDeleteTeamMember(member.userId, member.name)}
                                        disabled={loading || addingUsers} // Disable if main list loading or modal is adding
                                    >
                                        Delete
                                    </button>
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

            {/* --- Add Team Member Modal --- */}
            {showAddMemberModal && (
                <div className={styles.modalOverlay} onClick={handleOverlayClick}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}> {/* Prevent clicks inside modal from closing it */}
                        <button className={styles.closeModalButton} onClick={closeModal} title="Close">&times;</button>
                        <h3>Add New Team Member</h3>

                        {/* --- Role Selection --- */}
                        <div className="form-group">
                            <label htmlFor="teamRole">Assign Role:</label>
                            {/* Show loading state for roles if needed */}
                            {searching && teamRoles.length === 0 && <p className="loading-message">Loading roles...</p>}
                            {/* Show error if roles failed to load */}
                            {!searching && !hasRoles && searchError && <p className="error-message">{searchError}</p>}
                            <select
                                id="teamRole"
                                value={selectedRoleForAdd?.name || ''}
                                onChange={handleRoleChange}
                                disabled={!hasRoles || addingUsers || searching} // Disable while adding or loading roles
                            >
                                <option value="" disabled>Select a Role</option>
                                {teamRoles.map(role => (
                                    <option key={role.name} value={role.name}>{role.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* --- User Search (conditional on role selected) --- */}
                        {selectedRoleForAdd && hasRoles && (
                            <>
                                <div className="form-group" style={{ marginTop: '15px' }}>
                                    <label htmlFor="searchEmail">Search User by Email or Name:</label>
                                    <div className={styles.searchInputContainer}> {/* Flex container for input + button */}
                                        <input
                                            type="text"
                                            id="searchEmail"
                                            value={searchQuery}
                                            onChange={handleSearchEmailChange}
                                            placeholder="Enter user email or name"
                                            disabled={addingUsers || searching}
                                            className={styles.searchInput}
                                        />
                                        <button
                                            className={`button-secondary ${styles.searchButton}`}
                                            onClick={handleSearchUsers}
                                            disabled={searching || !searchQuery.trim() || addingUsers}
                                        >
                                            {searching ? '...' : 'Search'} {/* Use '...' for brevity */}
                                        </button>
                                    </div>
                                </div>

                                {/* Search Status/Results */}
                                {searching && <p className="loading-message">Searching users...</p>}
                                {searchError && !searching && <p className="error-message">{searchError}</p>}

                                {searchResults.length > 0 && !searching && (
                                    <div className={styles["search-results"]} style={{ marginTop: '15px' }}>
                                        <h4>Search Results ({searchResults.length}):</h4>
                                        <ul className={styles.resultsList}> {/* Add class for potential styling/scrolling */}
                                            {searchResults.map(user => {
                                                const isSelected = selectedUsersForAdd.some(u => u.id === user.id);


                                                return (
                                                    <li key={user.id} className={`${styles["search-result-item"]} ${isSelected ? styles["selected"] : ''} ${user.hasRole ? styles["already-member"] : ''}`}>
                                                        {/* <img src={'/default-avatar.png'} alt={user.name} className={styles["profile-image"]} width={35} height={35} /> */}
                                                        <div className={styles["user-info"]}>
                                                            <div className={styles["user-name"]}>{user.name}</div>
                                                            <div className={styles["user-email"]}>{user.email}</div>
                                                        </div>
                                                        {user.hasRole ? (
                                                            <span className={styles["already-member-tag"]}>Role Assigned</span>
                                                        ) : (
                                                            <button
                                                                className={`${isSelected ? "button-secondary" : "button-primary"} ${styles.selectUserButton}`} // Add common class
                                                                onClick={() => handleToggleUserSelection(user)}
                                                                disabled={addingUsers}
                                                            >
                                                                {isSelected ? 'Deselect' : 'Select'}
                                                            </button>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}

                        {/* --- Selected Users List --- */}
                        {selectedUsersForAdd.length > 0 && (
                            <div className={styles["selected-users-list"]} style={{ marginTop: '20px' }}>
                                <h4>Selected Users ({selectedUsersForAdd.length}):</h4>
                                <ul className={styles.resultsList}> {/* Reuse class for scrolling/styling */}
                                    {selectedUsersForAdd.map(user => (
                                        <li key={user.id} className={styles["selected-user-item"]}>
                                            {/* <img src={'/default-avatar.png'} alt={user.name} className={styles["profile-image"]} width={30} height={30} /> */}
                                            <div className={styles["user-info"]}>
                                                <div className={styles["user-name"]}>{user.name}</div>
                                                <div className={styles["user-email"]}>{user.email}</div>
                                            </div>
                                            <button
                                                className={`button-secondary ${styles.removeUserButton}`} // Add common class
                                                onClick={() => handleToggleUserSelection(user)}
                                                disabled={addingUsers}
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* --- Add All Selected Users Button & Messages --- */}
                        <div className={styles.modalActions} style={{ marginTop: '20px' }}>
                            {/* Add/Error/Success Messages */}
                            <div className={styles.modalMessages}>
                                {addUsersError && <p className="error-message">{addUsersError}</p>}
                                {addUsersSuccess && <p className="success-message">Users added successfully!</p>}
                            </div>

                            {selectedRoleForAdd && selectedUsersForAdd.length > 0 && (
                                <button
                                    className="button-primary"
                                    onClick={handleAddSelectedUsers}
                                    disabled={addingUsers || addUsersSuccess} // Disable while adding or if success message is shown
                                >
                                    {addingUsers ? 'Adding...' : `Add ${selectedUsersForAdd.length} User(s)`}
                                </button>
                            )}
                        </div>

                    </div> {/* End modalContent */}
                </div> // End modalOverlay
            )}

        </div> // End page-content-wrapper
    );
}