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
import { Role, TeamMember } from '@/types/event';



export default function EventTeamPage() {
    const params = useParams();
    const eventId = params.id as string;

    // --- State for data and loading ---
    const [eventTeam, setEventTeam] = useState<TeamMember[]>([]);
    const [teamRoles, setTeamRoles] = useState<Role[]>([]); // Assuming roles are strings
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- State for adding team members ---
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [searching, setSearching] = useState(false); // State for search loading
    const [searchError, setSearchError] = useState<string | null>(null);

    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [selectedUserToAdd, setSelectedUserToAdd] = useState<User | null>(null); // User selected from search results
    const [selectedRoleToAdd, setSelectedRoleToAdd] = useState<Role | null>(null); // Role selected for the user to be added

    const [addingUser, setAddingUser] = useState(false); // State for adding user loading
    const [addUserSuccess, setAddUserSuccess] = useState(false); // State for successful addition
    const [addUserError, setAddUserError] = useState<string | null>(null);

    const [refreshTeamTrigger, setRefreshTeamTrigger] = useState(0); // State to trigger refresh of team data

    // --- Data Loading (fetch team members) ---
    useEffect(() => {
        const loadTeamData = async () => {
            setLoading(true);
            setError(null);
            try {
                const teamMembers = await teamService.getTeamMembers(Number(eventId));
                console.log("--- Fetched team data ---", teamMembers); // <-- Check this log
                setEventTeam(teamMembers);
                console.log("--- eventTeam state updated ---", teamMembers); // <-- Check this log too
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

    useEffect(() => {
        const loadRoles = async () => {
            setLoading(true);
            setError(null); // Clear previous errors on new load attempt
            try {
                const data = await teamService.getRoles(); // Replace with your actual service call
                setTeamRoles(data);

            } catch (e: any) {
                console.error("Error loading team roles:", e);
                setError(`Failed to load team roles data: ${e.message || 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };

        if (showAddMemberModal) {
            console.log("showAddMemberModal is true, loading roles...");
            loadRoles();
        } else {
            setTeamRoles([]);
            setError(null);
        }
        // ---------------------------------------------

    }, [showAddMemberModal]); // Dependency array: rerun effect when showAddMemberModal changes


    // --- Handlers ---

    // Handle email search input change
    const handleSearchEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        // Clear selected user and results when input changes
        setSelectedUserToAdd(null);
        setSearchResults([]);
        setSearchError(null);
    };

    // Handle triggering the user search (e.g., on button click or after debounce)
    // Using useCallback to memoize the function
    const handleSearchUsers = useCallback(async () => {
        if (!searchQuery) {
            setSearchResults([]);
            setSearchError(null);
            return;
        }

        setSearching(true);
        setSearchError(null);
        setSearchResults([]); // Clear previous results
        setSelectedUserToAdd(null); // Clear selected user

        try {
            // TODO: Implement API call to search users by email
            // Example: const response = await fetch(`/api/users/search?email=${searchEmail}`);
            // if (!response.ok) throw new Error('Search failed');
            // const data: User[] = await response.json();

            const data = await userService.getUserByNameOrEmail(searchQuery); // Call the user service to get users by name or email
            // --- Simulate Mock Search Results ---
            // Filter mock results based on the search email
            // --- End Simulate Mock Search Results ---


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
    }, [searchQuery]); // Dependencies for useCallback


    // Handle selecting a user from the search results
    const handleSelectUserToAdd = (user: User) => {
        setSelectedUserToAdd(user);
        setSearchResults([]); // Clear results after selection
        setSearchQuery(''); // Clear the search input
        setShowAddMemberModal(true);
    };

    // Handle changing the role for the user to be added
    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRoleName = e.target.value; // Get the string value from the dropdown
    
        // Find the corresponding Role object in the teamRoles array
        const selectedRole = teamRoles.find(role => role.name === selectedRoleName);
    
        // Set the state to the found Role object
        if (selectedRole) {
            setSelectedRoleToAdd(selectedRole);
        } else {
            // Handle the case where the role is not found (shouldn't happen if teamRoles is correct)
            console.warn(`Selected role  "${selectedRoleName}" not found in teamRoles.`);
            setSelectedRoleToAdd(null); // Or set to a default role if appropriate
        }
    };

    // Handle adding the selected user to the team (Simulated with state update)
    const handleAddTeamMember = async () => {
        if (!selectedUserToAdd || !selectedRoleToAdd) {
            console.error("No user or role selected to add.");
            // TODO: Show user feedback
            return;
        }

        // Check if the user is already in the team
        const alreadyInTeam = eventTeam.some(member => member.userId === selectedUserToAdd.id);
        if (alreadyInTeam) {
            console.warn(`User ${selectedUserToAdd.name} is already in the team.`);
            setAddUserError(`User ${selectedUserToAdd.name} is already in the team.`);
            // TODO: Show user feedback
            return;
        }

        setAddingUser(true);
        setAddUserError(null);


        console.log(`Simulating adding user ${selectedUserToAdd.name} (ID: ${selectedUserToAdd.id}) with role ${selectedRoleToAdd.name} (ID: ${selectedRoleToAdd.id}) to event ${eventId}`);
        try {
            await teamService.addTeamMember(Number(eventId), Number(selectedUserToAdd.id), selectedRoleToAdd.id);

            // Reset add user form state
            setSelectedUserToAdd(null);
            setSelectedRoleToAdd((teamRoles[0] as Role) || null);
            setSearchQuery(''); // Clear search email input too
            setSearchResults([]); // Clear search results
            setAddUserSuccess(true); // Set success state
            setShowAddMemberModal(false);
            setRefreshTeamTrigger(prev => prev + 1);
            console.log("Simulated successful team member addition.");

        } catch (e: any) {
            console.error("Simulated add team member error:", e);
            setAddUserError(`Failed to add team member: ${e.message || 'Unknown error'}`);
        } finally {
            setAddingUser(false);
        }
        // --- End Simulated State Update ---
    };


    // Handle deleting a team member (Simulated with state update)
    const handleDeleteTeamMember = async (teamMemberId: string, userName: string) => {
        console.log(`Simulating deleting team member ${userName} (ID: ${teamMemberId}) from event ${eventId}`);

        // TODO: Add confirmation dialog before deleting

        setLoading(true); // Show loading while deleting
        setError(null); // Clear previous errors

        // TODO: Implement API call to delete the team member
        // Example: fetch(`/api/events/${eventId}/team/${teamMemberId}`, {
        //     method: 'DELETE',
        // });

        // --- Simulate State Update for Deleting Team Member ---
        // In a real app, you would make an API call here first.
        // After successful API call, update the state.
        try {

            setEventTeam(prevTeam => prevTeam.filter(member => member.userId !== teamMemberId)); // Remove from the list
            console.log("Simulated successful team member deletion.");

        } catch (e: any) {
            console.error("Simulated delete team member error:", e);
            setError(`Failed to delete team member: ${e.message || 'Unknown error'}`);
        } finally {
            setLoading(false); // Hide loading
        }
        // --- End Simulated State Update ---
    };


    // --- Effect for Debouncing Search (Optional but Recommended) ---
    // You might want to add a debounce effect here so search doesn't fire on every keystroke
    // Example using lodash.debounce or a custom debounce hook:
    // const debouncedSearch = useMemo(() => debounce(handleSearchUsers, 300), [handleSearchUsers]);
    // useEffect(() => {
    //   debouncedSearch();
    //   return () => debouncedSearch.cancel(); // Cleanup debounce on component unmount
    // }, [searchEmail, debouncedSearch]);


    // --- Render Logic ---
    if (loading) {
        return (
            <div className="page-content-wrapper">
                <h2 className="page-title">Team</h2>
                <p className="loading-message">Loading team data...</p>
            </div>
        );
    }

    if (error) {
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
        <div className="page-content-wrapper"> {/* Wrapper for padding/spacing */}
            {/* --- Page Title --- */}
            <h2 className="page-title">Team</h2>

            {/* --- Add Team Member Section --- */}
            <div className="form-container"> {/* Reuse form-container for card styling */}
                <h3>Add Team Member</h3>
                <div className={styles["add-team-member-form"]}> {/* Use CSS Module for layout */}
                    {/* Email Search Input */}
                    <div className="form-group"> {/* Reuse form-group */}
                        <label htmlFor="searchEmail">Search User by Email or Name:</label>
                        <input
                            type="email" // Or text, depending on preferred search field
                            id="searchEmail"
                            value={searchQuery}
                            onChange={handleSearchEmailChange}
                            placeholder="Enter user email or name"
                        />
                        {/* Optional: Add a search button if not using debounce */}
                        <button className="button-secondary" onClick={handleSearchUsers} disabled={searching || !searchQuery} style={{ marginLeft: '10px' }}>
                            {searching ? 'Searching...' : 'Search'}
                        </button>
                    </div>

                    {/* Search Results Display */}
                    {searching && <p className="loading-message">Searching...</p>}
                    {searchError && <p className="error-message">{searchError}</p>}

                    {searchResults.length > 0 && (
                        <div className={styles["search-results"]}> {/* Use CSS Module for layout */}
                            <h4>Search Results:</h4>
                            <ul>
                                {searchResults.map(user => (
                                    <li key={user.id} className={styles["search-result-item"]}> {/* Use CSS Module */}
                                        {/* User Profile Image */}
                                        <img
                                            src={'/default-avatar.png'} // Use default if no image
                                            alt={user.name}
                                            className={styles["profile-image"]} // Use CSS Module
                                            width={40} // Set size or use CSS
                                            height={40}
                                        />
                                        <div className={styles["user-info"]}> {/* Use CSS Module */}
                                            <div className={styles["user-name"]}>{user.name}</div> {/* Use CSS Module */}
                                            <div className={styles["user-email"]}>{user.email}</div> {/* Use CSS Module */}
                                        </div>
                                        {/* Select Button */}
                                        <button className="button-secondary" onClick={() => handleSelectUserToAdd(user)}>
                                            Select
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Selected User and Role Selection */}
                    {selectedUserToAdd && showAddMemberModal && hasCategoriesForRoles && ( // Show this section only if a user is selected and roles exist
                        <div className={styles["selected-user-area"]}> {/* Use CSS Module */}
                            <h4>Selected User:</h4>
                            <div className={styles["selected-user-details"]}> {/* Use CSS Module */}
                                {/* User Profile Image */}
                                <img
                                    src={'/default-avatar.png'} // Use default if no image
                                    alt={selectedUserToAdd.name}
                                    className={styles["profile-image"]} // Use CSS Module (reuse style)
                                    width={40}
                                    height={40}
                                />
                                <div className={styles["user-info"]}> {/* Use CSS Module (reuse style) */}
                                    <div className={styles["user-name"]}>{selectedUserToAdd.name}</div>
                                    <div className={styles["user-email"]}>{selectedUserToAdd.email}</div>
                                </div>
                                {/* Role Selection */}
                                <div className="form-group" style={{ marginLeft: '20px' }}> {/* Reuse form-group */}
                                    <label htmlFor="teamRole">Assign Role:</label>
                                    <select
                                        id="teamRole"
                                        value={selectedRoleToAdd?.name || ''}
                                        onChange={handleRoleChange}
                                    >
                                        {teamRoles.map(role => (
                                            <option key={role.id} value={role.name}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* Add to Team Button */}
                            <button className="button-primary" onClick={handleAddTeamMember} disabled={addingUser}>
                                {addingUser ? 'Adding...' : 'Add to Team'}
                            </button>
                            {addUserError && <p className="error-message" style={{ marginTop: '10px' }}>{addUserError}</p>}
                        </div>
                    )}
                    {selectedUserToAdd && !hasCategoriesForRoles && (
                        <div className={styles["selected-user-area"]}>
                            <p className="error-message">No team roles defined to assign.</p>
                        </div>
                    )}
                </div>
            </div>


            {/* --- Event Team Members List --- */}
            <div className="form-container"> {/* Reuse form-container */}
                <h3>Event Team Members ({eventTeam.length})</h3>
                {hasTeamMembers ? (
                    <div className={styles["team-members-list-container"]}> {/* Use CSS Module for layout/container */}
                        <ul>
                            {eventTeam.map(member => (
                                <li key={member.userId} className={styles["team-member-item"]}> {/* Use CSS Module for each item */}
                                    {/* User Profile Image */}
                                    <img
                                        src={'/default-avatar.png'} // Use default if no image
                                        alt={member.name}
                                        className={styles["profile-image"]} // Use CSS Module (reuse style)
                                        width={40}
                                        height={40}
                                    />
                                    <div className={styles["user-info"]}> {/* Use CSS Module (reuse style) */}
                                        <div className={styles["user-name"]}>{member.name}</div>
                                        <div className={styles["user-email"]}>{member.email}</div>
                                    </div>
                                    <span className={styles["team-member-role"]}>{member.role}</span> {/* Display Role */}
                                    {/* Delete Button */}
                                    <button
                                        className="button-secondary" // Reuse button style
                                        onClick={() => handleDeleteTeamMember(member.userId, member.name)}
                                        disabled={loading} // Disable while deleting
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="no-events-message">No team members added to this event yet.</p>
                )}
            </div>


        </div>
    );
}