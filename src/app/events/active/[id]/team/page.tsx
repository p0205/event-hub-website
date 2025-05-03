// src/app/events/[id]/team/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Assuming a CSS Module for team page specific styles
import styles from './team.module.css'; // Create this CSS module
import userService from '@/services/userService';
import { User } from '@/types/user';
import teamService from '@/services/teamService';
import { Role, TeamMember } from '@/types/event'; // Ensure TeamMember type includes userId, name, email, role

export default function EventTeamPage() {
    const params = useParams();
    const eventId = params.id as string;

    // --- State for data and loading ---
    const [eventTeam, setEventTeam] = useState<TeamMember[]>([]);
    const [teamRoles, setTeamRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- State for bulk adding team members ---
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const [showAddMemberSection, setShowAddMemberSection] = useState(false); // Controls visibility of the add section
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
                const teamMembers = await teamService.getTeamMembers(Number(eventId));
                console.log("--- Fetched team data ---", teamMembers);
                setEventTeam(teamMembers);
                console.log("--- eventTeam state updated ---", teamMembers);
            } catch (e: any) {
                console.error("Error loading team data:", e);
                setError(`Failed to load team data: ${e.message || 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };

        console.log("Loading team data effect triggered for event ID:", eventId, "Trigger:", refreshTeamTrigger);
        loadTeamData();

    }, [eventId, refreshTeamTrigger]); // Rerun if eventId or trigger changes

    // --- Data Loading (fetch roles - triggered when add section is shown) ---
    useEffect(() => {
        const loadRoles = async () => {
            setLoading(true); // Consider a separate loading state for roles if main loading is disruptive
            // setError(null); // Decide if you want to clear main error here
            try {
                const data = await teamService.getRoles();
                setTeamRoles(data);
            } catch (e: any) {
                console.error("Error loading team roles:", e);
                // Set a specific error for roles if needed, or use the main error state
                setError(`Failed to load team roles: ${e.message || 'Unknown error'}`);
            } finally {
                setLoading(false); // Decide if you want to manage main loading state here
            }
        };

        if (showAddMemberSection) {
            console.log("showAddMemberSection is true, loading roles...");
            loadRoles();
        } else {
            // Clear roles when the section is hidden
            setTeamRoles([]);
            setSelectedRoleForAdd(null); // Clear selected role too
            setSelectedUsersForAdd([]); // Clear selected users
            setSearchQuery(''); // Clear search
            setSearchResults([]); // Clear results
            setSearchError(null); // Clear search error
            setAddUsersError(null); // Clear add errors
            setAddUsersSuccess(false); // Clear success state
        }

    }, [showAddMemberSection]); // Dependency array: rerun effect when showAddMemberSection changes


    // --- Handlers ---

    // Handle search input change (Keep existing)
    const handleSearchEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        // Clear search results and selected users when input changes substantially (optional debounce recommended)
        setSearchResults([]);
        // Consider if you want to clear selectedUsersForAdd here or only on section close/successful add
        // setSelectedUsersForAdd([]);
        setSearchError(null);
    };

    // Handle triggering the user search (Keep existing)
    const handleSearchUsers = useCallback(async () => {
        if (!searchQuery.trim()) { // Check for empty or whitespace query
            setSearchResults([]);
            setSearchError(null);
            return;
        }

        setSearching(true);
        setSearchError(null);
        setSearchResults([]);
        // Keep selectedUsersForAdd, don't clear on search

        try {
            const data = await userService.getUserByNameOrEmail(searchQuery.trim());
            setSearchResults(data);

            if (data.length === 0) {
                setSearchError('No users found matching the email/name.');
            }

        } catch (e: any) {
            console.error("User search error:", e);
            setSearchError(`Search failed: ${e.message || 'Unknown error'}`);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    }, [searchQuery]);


    // Handle changing the role for the bulk add (New)
    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRoleName = e.target.value; // Get the value from the <option>

        // Find the corresponding Role object in the teamRoles array
        // Assuming <option value={role.id}> and role.id is a number
        const selectedRole = teamRoles.find(role => role.name === selectedRoleName);

        if (selectedRole) {
            setSelectedRoleForAdd(selectedRole);
            // Optional: Clear selected users if changing the role makes the previous selection irrelevant
            // setSelectedUsersForAdd([]);
        } else {
            console.warn(`Selected role  "${selectedRoleName}" not found in teamRoles.`);
            setSelectedRoleForAdd(null);
        }
         setAddUsersError(null); // Clear previous errors when role changes
    };


    // Handle toggling user selection for bulk add (New)
    const handleToggleUserSelection = (user: User) => {
        setSelectedUsersForAdd(prevSelected => {
            // Check if the user is already in the selected list by comparing IDs
            const isSelected = prevSelected.some(u => u.id === user.id);

            if (isSelected) {
                // If already selected, remove them from the list
                console.log(`Deselecting user: ${user.name}`);
                return prevSelected.filter(u => u.id !== user.id);
            } else {
                // If not selected, add them to the list
                 // Optional: Add a check here if the user is already a *member* of the event team
                 const isAlreadyMember = eventTeam.some(member => member.userId === user.id);
                 if (isAlreadyMember) {
                      console.warn(`User ${user.name} is already a member of the event team.`);
                      setAddUsersError(`User ${user.name} is already a member.`); // Provide feedback to the user
                      // Don't add to the selected list
                      return prevSelected;
                 }

                console.log(`Selecting user: ${user.name}`);
                return [...prevSelected, user];
            }
        });
         setAddUsersError(null); // Clear previous errors when selection changes
         setAddUsersSuccess(false); // Clear success message
    };

    // Handle adding all selected users with the chosen role (New)
    const handleAddSelectedUsers = async () => {
        if (!selectedRoleForAdd || selectedUsersForAdd.length === 0) {
            console.error("Attempted bulk add without selected role or users.");
            setAddUsersError("Please select a role and at least one user.");
            setAddUsersSuccess(false);
            return;
        }

        setAddingUsers(true);
        setAddUsersError(null);
        setAddUsersSuccess(false);

        const userIdsToAdd = selectedUsersForAdd.map(user => Number(user.id));
        const roleIdToAssign = selectedRoleForAdd.id; // Get the ID from the selected Role object

        console.log(`Initiating bulk add for users (IDs: ${userIdsToAdd.join(', ')}) with role ID ${roleIdToAssign} to event ${eventId}`);

        console.log("Selected users for bulk add:", userIdsToAdd);
        try {
            // --- API Call for Bulk Add ---
            // Call the service method that talks to your backend's bulk add endpoint.
            // You MUST implement teamService.addTeamMembersBulk
            await teamService.addTeamMembers(Number(eventId), userIdsToAdd, roleIdToAssign);
            // -----------------------------

            // On successful backend response:
            setAddUsersSuccess(true); // Indicate success
            setAddUsersError(null); // Clear any previous errors

            // --- Reset Add Form State ---
            setSelectedUsersForAdd([]); // Clear the list of selected users
            setSelectedRoleForAdd(null); // Optional: Clear the selected role too
            setSearchQuery(''); // Clear search input
            setSearchResults([]); // Clear search results
            // Optional: Close the add section automatically on success
            // setShowAddMemberSection(false);
            // ----------------------------

            // Trigger a refetch of the main team list to show the newly added members
            console.log("Bulk add successful. Triggering team data refetch.");
            setRefreshTeamTrigger(prev => prev + 1);

        } catch (e: any) {
            console.error("Bulk add team member API error:", e);
             // Attempt to extract a user-friendly error message
            const apiErrorMessage = e.response?.data?.message || e.message || 'Unknown error';
            setAddUsersError(`Failed to add users: ${apiErrorMessage}`);
            setAddUsersSuccess(false); // Ensure success state is false on error
        } finally {
            setAddingUsers(false); // End loading state
        }
    };


    // Handle deleting a team member (Keep existing, confirm userId usage)
    const handleDeleteTeamMember = async (userIdToDelete: number, userName: string) => { // Changed type to number
        console.log(`Attempting to delete team member ${userName} (User ID: ${userIdToDelete}) from event ${eventId}`);

        if (!window.confirm(`Are you sure you want to remove ${userName} from the team?`)) {
            return;
        }

        // Use loading state while deleting (can use a separate state if needed)
        setLoading(true);
        setError(null);

        try {
            // Implement the actual API call to delete the team member on the backend
            // This call likely needs eventId and the user ID (userIdToDelete)
            // You MUST implement teamService.deleteTeamMember
            //  await teamService.deleteTeamMember(Number(eventId), userIdToDelete);

            // // If the API call is successful, update the local state by filtering
            // setEventTeam(prevTeam => prevTeam.filter(member => member.userId !== userIdToDelete)); // Assuming TeamMember DTO has userId property

            console.log("Team member successfully deleted.");
            // No need to trigger full refetch unless filtering state is problematic

        } catch (e: any) {
            console.error("Delete team member error:", e);
            const apiErrorMessage = e.response?.data?.message || e.message || 'Unknown error';
            setError(`Failed to delete team member: ${apiErrorMessage}`);
             // Trigger refetch on error to sync state with backend if filtering failed
            setRefreshTeamTrigger(prev => prev + 1);
        } finally {
            setLoading(false);
        }
    };


    // --- Effect for Debouncing Search (Optional but Recommended) ---
    // Consider adding a debounce effect here so search doesn't fire on every keystroke
    // You would replace the call to handleSearchUsers in handleSearchEmailChange
    // Example using lodash.debounce or a custom debounce hook:
    /*
    const debouncedSearchUsers = useMemo(() => debounce(handleSearchUsers, 300), [handleSearchUsers]);

    useEffect(() => {
      // Only trigger debounce if search query is not empty
      if (searchQuery.trim()) {
         debouncedSearchUsers();
      } else {
         // If query is empty, cancel any pending debounce call and clear results/error
         debouncedSearchUsers.cancel();
         setSearchResults([]);
         setSearchError(null);
      }

      // Cleanup debounce on component unmount or if handleSearchUsers changes
      return () => {
        debouncedSearchUsers.cancel();
      };
    }, [searchQuery, debouncedSearchUsers]);
    */


    // --- Render Logic ---
    if (loading && eventTeam.length === 0) { // Show initial loading only if team data is empty
        return (
            <div className="page-content-wrapper">
                <h2 className="page-title">Team</h2>
                <p className="loading-message">Loading team data...</p>
            </div>
        );
    }

    if (error && eventTeam.length === 0) { // Show initial error only if team data is empty
         return (
            <div className="page-content-wrapper">
                <h2 className="page-title">Team</h2>
                <p className="error-message">Error: {error}</p>
            </div>
         );
    }

    const hasTeamMembers = eventTeam && eventTeam.length > 0;
    const hasCategoriesForRoles = teamRoles && teamRoles.length > 0; // Check if there are roles defined


    return (
        <div className="page-content-wrapper">
            <h2 className="page-title">Team</h2>

            {/* --- Add Team Member Section --- */}
            <div className="form-container" style={{ marginBottom: '20px' }}> {/* Add spacing below section */}
                <h3>Add Team Member</h3>
                 {/* Button/Trigger to show/hide the section */}
                <button className="button-secondary" onClick={() => setShowAddMemberSection(!showAddMemberSection)} style={{ marginBottom: '15px' }}>
                    {showAddMemberSection ? 'Hide Add Member Form' : 'Show Add Member Form'}
                </button>


                {showAddMemberSection && (
                    <div className={styles["add-team-member-form"]}>

                        {/* --- Role Selection --- */}
                        <div className="form-group">
                            <label htmlFor="teamRole">Assign Role:</label>
                            <select
                                id="teamRole"
                                value={selectedRoleForAdd?.name || ''}
                                onChange={handleRoleChange}
                                disabled={!hasCategoriesForRoles || addingUsers || loading}
                            >
                                <option value="" disabled>Select a Role</option>
                                {teamRoles.map(role => (
                                    <option key={role.name} value={role.name}>{role.name}</option>
                                ))}
                            </select>
                             {/* Optional: Display selected role name */}
                             {selectedRoleForAdd && (
                                <p style={{ marginTop: '5px', fontWeight: 'bold' }}>Selected Role: {selectedRoleForAdd.name}</p>
                             )}
                        </div>


                        {/* --- User Search Input --- */}
                         {/* Show search only if a role is selected and roles exist */}
                        {selectedRoleForAdd && hasCategoriesForRoles && (
                            <div className="form-group" style={{ marginTop: '15px' }}>
                                <label htmlFor="searchEmail">Search User by Email or Name:</label>
                                <input
                                    type="text"
                                    id="searchEmail"
                                    value={searchQuery}
                                    onChange={handleSearchEmailChange}
                                    placeholder="Enter user email or name"
                                    disabled={addingUsers || searching}
                                />
                                 {/* If using debounce, this button might trigger the debounce directly */}
                                <button className="button-secondary" onClick={handleSearchUsers} disabled={searching || !searchQuery.trim() || addingUsers}>
                                    {searching ? 'Searching...' : 'Search'}
                                </button>
                            </div>
                        )}


                        {/* Search Results Display */}
                         {selectedRoleForAdd && hasCategoriesForRoles && ( // Show results area only if role selected
                            <> {/* Use fragment if needed */}
                                {searching && <p className="loading-message">Searching...</p>}
                                {searchError && <p className="error-message">{searchError}</p>}

                                {searchResults.length > 0 && (
                                    <div className={styles["search-results"]} style={{ marginTop: '15px' }}>
                                        <h4>Search Results:</h4>
                                        <ul>
                                            {searchResults.map(user => {
                                                const isSelected = selectedUsersForAdd.some(u => u.id === user.id);
                                                const isAlreadyMember = eventTeam.some(member => member.userId === user.id);

                                                return (
                                                    <li key={user.id} className={`${styles["search-result-item"]} ${isSelected ? styles["selected"] : ''} ${isAlreadyMember ? styles["already-member"] : ''}`}>
                                                        <img src={'/default-avatar.png'} alt={user.name} className={styles["profile-image"]} width={40} height={40} />
                                                        <div className={styles["user-info"]}>
                                                            <div className={styles["user-name"]}>{user.name}</div>
                                                            <div className={styles["user-email"]}>{user.email}</div>
                                                        </div>
                                                        {isAlreadyMember ? (
                                                            <span className={styles["already-member-tag"]}>Already Member</span>
                                                        ) : (
                                                            <button
                                                                className={isSelected ? "button-secondary" : "button-primary"}
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
                                <ul>
                                    {selectedUsersForAdd.map(user => (
                                        <li key={user.id} className={styles["selected-user-item"]}>
                                            <img src={'/default-avatar.png'} alt={user.name} className={styles["profile-image"]} width={30} height={30} />
                                            <div className={styles["user-info"]}>
                                                <div className={styles["user-name"]}>{user.name}</div>
                                                <div className={styles["user-email"]}>{user.email}</div>
                                            </div>
                                            <button
                                                className="button-secondary"
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


                        {/* --- Add All Selected Users Button --- */}
                        {selectedRoleForAdd && selectedUsersForAdd.length > 0 && (
                            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                                <button
                                    className="button-primary"
                                    onClick={handleAddSelectedUsers}
                                    disabled={addingUsers}
                                >
                                    {addingUsers ? 'Adding...' : `Add ${selectedUsersForAdd.length} User(s) with Role ${selectedRoleForAdd.name}`}
                                </button>
                            </div>
                        )}

                        {/* Add/Error/Success Messages */}
                        {addUsersError && <p className="error-message" style={{ marginTop: '10px' }}>{addUsersError}</p>}
                        {addUsersSuccess && <p className="success-message" style={{ marginTop: '10px' }}>Users added successfully!</p>}

                    </div>
                )}
            </div>


            {/* --- Event Team Members List --- */}
            <div className="form-container">
                <h3>Event Team Members ({eventTeam.length}) {loading && eventTeam.length > 0 && <span className="loading-message" style={{marginLeft: '10px'}}>Updating...</span>}</h3> {/* Indicate updating when list is already loaded */}
                {error && eventTeam.length > 0 && <p className="error-message">{error}</p>} {/* Show error below heading if list exists */}

                {hasTeamMembers ? (
                    <div className={styles["team-members-list-container"]}>
                        <ul>
                            {eventTeam.map(member => (
                                <li key={member.userId} className={styles["team-member-item"]}>
                                    {/* User Profile Image */}
                                    <img
                                        src={'/default-avatar.png'}
                                        alt={member.name}
                                        className={styles["profile-image"]}
                                        width={40}
                                        height={40}
                                    />
                                    <div className={styles["user-info"]}>
                                        <div className={styles["user-name"]}>{member.name}</div>
                                        <div className={styles["user-email"]}>{member.email}</div>
                                    </div>
                                    <span className={styles["team-member-role"]}>{member.role}</span>
                                    {/* Delete Button */}
                                    <button
                                        className="button-secondary"
                                        onClick={() => handleDeleteTeamMember(member.userId, member.name)}
                                        disabled={addingUsers || loading} // Disable if adding or loading the main list/deleting
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                     // Show "no members" message only when not loading and the list is empty
                    !loading && <p className="no-events-message">No team members added to this event yet.</p>
                )}
            </div>


        </div>
    );
}