// src/app/events/[id]/participants/page.tsx

'use client'; // This is a Client Component, required for state, effects, and event handlers

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation'; // From URL get event ID, for navigation
import Link from 'next/link'; // If participant name is a link
import { v4 as uuidv4 } from 'uuid'; // For temporary IDs for new participants

// Import Recharts components (ensure these are installed: npm install recharts)
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Import necessary components and types
// Adjust paths based on your project structure
import ParticipantsTable from '@/components/ParticipantsTable';
import AddParticipantModal from '@/components/AddParticipantModal';
import { Participant } from '@/types/user'; // Ensure this matches your backend model
import { eventService } from '@/services'; // Adjust path to your service module

// Import styles (ensure path is correct)
import styles from './participantsPage.module.css';

// --- Define Helper Types ---
// These types were in your original code, keeping them here
interface DemographicsSummary {
    total: number;
    byFaculty: { [key: string]: number };
    byCourse: { [key: string]: number };
    byYear: { [key: number]: number }; // Assuming year might be treated as number for grouping
    byGender: { [key: string]: number }; // Added gender demographics
    byRole: { [key: string]: number }; // Added role demographics
}

type SortKey = keyof Participant | null;
type SortDirection = 'asc' | 'desc';

type FilterType = 'all' | 'faculty' | 'course' | 'year' | 'gender' | 'role'; // Added gender and role filters


// --- Helper function to calculate demographics ---
// Move demographics calculation out to a function for clarity
const calculateDemographics = (data: Participant[]): DemographicsSummary => {
    const summary: DemographicsSummary = {
        total: data.length,
        byFaculty: {},
        byCourse: {},
        byYear: {},
        byGender: {},
        byRole: {}
    };

    data.forEach(p => {
        if (p.faculty) summary.byFaculty[p.faculty] = (summary.byFaculty[p.faculty] || 0) + 1;
        if (p.course) summary.byCourse[p.course] = (summary.byCourse[p.course] || 0) + 1;

        // Handle year which can be string, number, or null
        const yearValue = p.year;
        if (yearValue !== null && yearValue !== undefined) {
            // Use string representation as key if years are mixed types or strings
            const yearKey: string = String(yearValue);
            (summary.byYear as any)[yearKey] = ((summary.byYear as any)[yearKey] || 0) + 1;
        }

        if (p.gender) summary.byGender[p.gender] = (summary.byGender[p.gender] || 0) + 1;
        if (p.role) summary.byRole[p.role] = (summary.byRole[p.role] || 0) + 1;
    });
    return summary;
};


// --- Main Page Component ---
export default function EventParticipantsPage() {
    const params = useParams();
    const router = useRouter(); // Use useRouter from next/navigation
    const eventId = Array.isArray(params.id) ? params.id[0] : params.id; // event ID as string

    // --- State for the main list of participants ---
    const [participants, setParticipants] = useState<Participant[]>([]);
    // State for demographics derived from participants
    const [demographics, setDemographics] = useState<DemographicsSummary | null>(null);

    // --- State for various loading/error states ---
    const [isLoadingInitial, setIsLoadingInitial] = useState(true); // Loading initial saved data
    const [initialLoadError, setInitialLoadError] = useState<string | null>(null); // Error loading initial data

    const [isImporting, setIsImporting] = useState(false); // File import process
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState<string | null>(null);

    const [isSaving, setIsSaving] = useState(false); // Final save process
    const [saveError, setSaveError] = useState<string | null>(null); // Error during final save


    // --- State for "Add Participant" Modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);


    // --- State for Sorting ---
    const [sortKey, setSortKey] = useState<SortKey>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // --- State for Filtering ---
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [filterValue, setFilterValue] = useState<string | number | null>(null);


    // --- Component Mount State (for Hydration/Recharts) ---
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);


    // --- Data Fetching (Initial Load of Saved Participants) ---
    useEffect(() => {
        if (!eventId) {
            setIsLoadingInitial(false);
            setInitialLoadError("Event ID is missing.");
            return;
        }

        const fetchSavedParticipants = async () => {
            setIsLoadingInitial(true);
            setInitialLoadError(null);
            // Clear other status messages on initial load
            setImportError(null);
            setImportSuccess(null);
            setSaveError(null);
            try {
                // Call your service to get participants already saved for this event
                const savedParticipants = await eventService.getParticipantsByEventId(Number(eventId));
                setParticipants(savedParticipants); // Set the main participants state

            } catch (err: any) {
                console.error("Failed to fetch initially saved participants:", err);
                setInitialLoadError(`Failed to load existing participants: ${err.message || 'Unknown error'}`);
                setParticipants([]); // Display empty list on error
            } finally {
                setIsLoadingInitial(false);
            }
        };

        fetchSavedParticipants();
    }, [eventId]); // Re-run effect if eventId changes


    // --- Recalculate Demographics whenever participants list changes ---
    useEffect(() => {
        if (participants) {
            setDemographics(calculateDemographics(participants));
        } else {
            setDemographics(null); // Or an empty summary
        }
    }, [participants]); // Recalculate when participants state updates


    // --- Handle CSV File Import ---
    const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !eventId) {
            setIsImporting(false);
            setImportError(file ? "Event ID is missing." : null); // Error if no eventId
            return;
        }

        // Reset import status messages for the new attempt
        setImportError(null);
        setImportSuccess(null);
        setSaveError(null); // Clear save errors too
        setIsImporting(true);

        // --- File Type Validation ---
        const expectedType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const expectedExtension = '.xlsx';
        if (file.type !== expectedType && !file.name.toLowerCase().endsWith(expectedExtension)) {
            setImportError(`Invalid file type. Please upload an Excel (.xlsx) file.`);
            setIsImporting(false);
            event.target.value = ''; // Clear the file input
            return;
        }
        // --- End Validation ---

        // --- Call the backend service to import and return the list ---
        try {
            // Call the service function that sends the file to the backend API
            // and GETS BACK the list of participants found in the file.
            // Assumes backend process includes saving the data and returning the saved list.
            const importedList = await eventService.importParticipantsInfo(Number(eventId), file);

            // --- SUCCESS: Update the participant list state with the imported list ---
            // This replaces the current list (initial saved data or previous import)
            // with the newly imported list for review.
            setParticipants(importedList);

            // Update import status messages
            setImportSuccess(`Successfully imported ${importedList.length} participants.`);

        } catch (importErr: any) {
            console.error("Import Error:", importErr);
            setImportError(`Import failed: ${importErr.message || 'Unknown error during import'}`);
            setImportSuccess(null); // Ensure success message is cleared on error
        } finally {
            // Reset importing state and clear the file input
            setIsImporting(false);
            event.target.value = '';
        }
    };

    // --- Handle Adding a Participant Manually (from Modal) ---
    const handleAddParticipant = (newParticipantData: Omit<Participant, 'id'>) => {
        // Generate a unique temporary string ID for the new participant in the frontend state
        const tempId = uuidv4();
        const newParticipant: Participant = {
            ...newParticipantData,
            id: tempId, // Assign the generated unique string ID
            // Ensure nullable fields are explicitly null if empty string from form
            phoneNo: newParticipantData.phoneNo || null,
            gender: newParticipantData.gender || null,
            faculty: newParticipantData.faculty || null,
            course: newParticipantData.course || null,
            year: newParticipantData.year || null,
            role: newParticipantData.role || null,
        };
        // Add the new participant to the state array immutably
        setParticipants([...participants, newParticipant]);
        // Optionally reset filter/sort if adding might make current view inconsistent
        setFilterType('all');
        setFilterValue(null);
        setSortKey(null);
    };

    // --- Handle Deleting a Participant by ID ---
    const handleDeleteParticipant = (id: number | string) => {
        // Use filter to create a new array excluding the participant with the given id
        setParticipants(participants.filter(p => p.id !== id));
        // Optional: Reset filter/sort if deleting might make current view inconsistent
        setFilterType('all');
        setFilterValue(null);
        setSortKey(null);
    };


    // --- Handle Final "Confirm & Save" Action ---
    const handleConfirmSave = async () => {
        if (!eventId) { setSaveError("Event ID is missing. Cannot save."); return; }

        setIsSaving(true); // Start saving state
        setSaveError(null); // Clear previous save errors
        setImportError(null); // Clear import errors too

        try {
            // Call the API to save the *current* list state
            // This endpoint receives the full list from the frontend state
            console.log("Saving participants:", participants);
            const success = await eventService.saveParticipants(Number(eventId), participants);

            // --- SUCCESS ---
            if (success) {
                alert('Participants saved successfully!');
                // Optionally navigate away or refresh the page data
                //router.push(`/events/${eventId}`); // Example: Go back to event details page
                router.refresh(); // Refetches data for the current route segments, getting backend-assigned IDs
            } else {
                // If service returns non-success but doesn't throw
                throw new Error('Save operation did not report success.');
            }

        } catch (saveErr: any) {
            console.error("Save Error:", saveErr);
            setSaveError(`Failed to save changes: ${saveErr.message || 'Unknown error during save'}`);
        } finally {
            setIsSaving(false); // End saving state
        }
    };


    // --- Filter Options (Derived from participants data) ---
    const filterOptions = useMemo(() => {
        const faculties = Array.from(new Set(participants.map(p => p.faculty).filter(Boolean))).sort();
        const courses = Array.from(new Set(participants.map(p => p.course).filter(Boolean))).sort();

        // --- FIX: Refined predicate for years array ---
        const years = Array.from(new Set(
            participants.map(p => p.year)
                .filter((year: string | number | null | undefined): year is string | number => {
                    // Explicitly type the parameter and use return statement
                    return year !== null && year !== undefined;
                })
        )).sort((a, b) => {
            // Keep the existing sorting logic for year options if it works
            const aNum = typeof a === 'number' ? a : parseInt(String(a), 10);
            const bNum = typeof b === 'number' ? b : parseInt(String(b), 10);

            if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
            if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);

            // Handle cases where one is a valid number string but the other isn't
            if (!isNaN(aNum) && isNaN(bNum)) return -1; // Number comes before non-number string
            if (isNaN(aNum) && !isNaN(bNum)) return 1; // Non-number string comes after number

            return 0; // Fallback
        });
        // --- End FIX ---


        const genders = Array.from(new Set(participants.map(p => p.gender).filter(Boolean))).sort();
        const roles = Array.from(new Set(participants.map(p => p.role).filter(Boolean))).sort();


        return {
            faculties: ['All Faculties', ...(faculties as string[])], // Ensure string array
            courses: ['All Courses', ...(courses as string[])],     // Ensure string array
            years: ['All Years', ...years.map(y => `Year ${y}`)], // Prefix 'Year' for display
            genders: ['All Genders', ...(genders as string[])],
            roles: ['All Roles', ...(roles as string[])],
        };
    }, [participants]);
        // --- Handle Filter Type Change ---
    const handleFilterTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newFilterType = event.target.value as FilterType;
        setFilterType(newFilterType);
        setFilterValue(null); // Reset filter value when filter type changes
        // Optional: Reset sort when filter changes
        setSortKey(null);
        setSortDirection('asc');
    };

    // --- Handle Filter Value Change ---
    const handleFilterValueChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        // Store the value as is (string like 'Engineering', 'Year 3', 'M', 'Student')
        setFilterValue(value === '' ? null : value); // Set null for the "All" option if its value is empty string
        // Optional: Reset sort when filter changes
        setSortKey(null);
        setSortDirection('asc');
    };


    // --- Apply Filtering Logic ---
    const filteredParticipants = useMemo(() => {
        if (filterType === 'all' || filterValue === null || filterValue === '' || filterValue.toString().startsWith('All ')) {
            return participants; // No filter or 'All' filter applied
        }

        return participants.filter(p => {
            let participantValue: string | number | null | undefined;

            switch (filterType) {
                case 'faculty': participantValue = p.faculty; break;
                case 'course': participantValue = p.course; break;
                case 'gender': participantValue = p.gender; break;
                case 'role': participantValue = p.role; break;
                case 'year':
                    // Handle year filtering: filterValue is like "Year 3", participant.year is number/string/null
                    if (p.year === null || p.year === undefined) return false; // Cannot match null year
                    const yearString = `Year ${p.year}`;
                    return yearString === filterValue; // Compare formatted string
                default: return true; // Should not happen
            }

            // For string comparisons (faculty, course, gender, role)
            return participantValue === filterValue;
        });
    }, [participants, filterType, filterValue]); // Re-filter when participants, type, or value changes


    // --- Sorting Handler (Keep as is) ---
    const handleSort = (key: SortKey) => {
        if (sortKey === key) { setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }
        else { setSortKey(key); setSortDirection('asc'); }
    };

    // --- Apply Sorting Logic (on the filtered list) ---
    const sortedParticipants = useMemo(() => {
        // Sort the FILTERED participants list
        if (!sortKey) return filteredParticipants;

        const sorted = [...filteredParticipants].sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            // Handle null/undefined values - they typically go to the end
            if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
            if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1;

            // Handle numeric vs string comparison (especially for 'year' which could be mixed)
            const typeA = typeof aValue;
            const typeB = typeof bValue;

            if (typeA === 'number' && typeB === 'number') {
                return sortDirection === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
            }
            if (typeA === 'string' && typeB === 'string') {
                return sortDirection === 'asc' ? (aValue as string).localeCompare(bValue as string) : (bValue as string).localeCompare(aValue as string);
            }

            // Fallback for other types or mixed types - attempt string comparison
            try {
                const stringA = String(aValue);
                const stringB = String(bValue);
                return sortDirection === 'asc' ? stringA.localeCompare(stringB) : stringB.localeCompare(stringA);
            } catch (e) {
                // Fallback if string conversion fails for some reason
                return 0;
            }
        });
        return sorted;
    }, [filteredParticipants, sortKey, sortDirection]); // Re-sort when filtered list, sort key, or direction changes


    // --- Prepare Data for Recharts (based on *all* participants) ---
    // Demographics charts should usually show the overall distribution BEFORE filtering/sorting
    const facultyChartData = demographics ? Object.entries(demographics.byFaculty).map(([name, count]) => ({ name, count })) : [];
    const courseChartData = demographics ? Object.entries(demographics.byCourse).map(([name, count]) => ({ name, count })) : [];
    const yearChartData = demographics ? Object.entries(demographics.byYear).map(([name, count]) => ({ name: `Year ${name}`, count })) : []; // Format year name for chart
    const genderChartData = demographics ? Object.entries(demographics.byGender).map(([name, count]) => ({ name, count })) : [];
    const roleChartData = demographics ? Object.entries(demographics.byRole).map(([name, count]) => ({ name, count })) : [];


    // --- Render Loading/Error State for Initial Page Load ---
    if (isLoadingInitial) {
        return (
            <div className="page-content-wrapper">
                <h2 className="page-title">Participants</h2>
                <p className="loading-message" style={{ color: '#007bff' }}>Loading participants...</p>
            </div>
        );
    }

    if (initialLoadError) {
        return (
            <div className="page-content-wrapper">
                <h2 className="page-title">Participants</h2>
                <p className="error-message" style={{ color: '#dc3545' }}>Error: {initialLoadError}</p>
            </div>
        );
    }


    // --- Main Render Function ---
    return (
        <div className="page-content-wrapper"> {/* Keep this wrapper */}
            {/* --- Page Title --- */}
            <h2 className="page-title">Participants</h2>

            {/* --- Import XLSX Section --- */}
            <div className="form-container" style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px', background: '#f9f9f9' }}>
                <h3>Import Participants from XLSX File</h3>
                <div className="form-group">
                    <label htmlFor="xlsxFileInput"
                        style={{
                            padding: '10px 15px', backgroundColor: isImporting ? '#cccccc' : '#f0f0f0', // Grey out when importing
                            border: '1px solid #ccc', borderRadius: '4px',
                            cursor: isImporting ? 'not-allowed' : 'pointer',
                            display: 'inline-block',
                            opacity: isImporting ? 0.6 : 1, // Reduce opacity when disabled
                        }}>
                        {isImporting ? 'Processing...' : 'Choose .xlsx File'}
                    </label>
                    <input
                        type="file"
                        id="xlsxFileInput"
                        accept=".xlsx"
                        onChange={handleImportCSV}
                        disabled={isImporting || isSaving} // Disable file input while importing or saving
                        style={{ display: 'none' }}
                    />
                    {isImporting && <span style={{ marginLeft: '10px', color: '#007bff' }}>Importing...</span>}
                    {importError && <p className="error-message" style={{ marginTop: '10px', color: '#dc3545' }}>{importError}</p>}
                    {importSuccess && <p className="success-message" style={{ marginTop: '10px', color: '#28a745' }}>{importSuccess}</p>}
                </div>
            </div>

            {/* --- Participants List & Actions Section --- */}
            <div className="form-container" style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px', background: '#fff' }}> {/* Keep form-container for card styling */}

                {/* List Title and Add Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <h3>Participants List ({sortedParticipants.length} of {participants.length})</h3> {/* Show count of filtered/total */}
                    <button
                        onClick={() => setIsModalOpen(true)} // Open the Add modal
                        disabled={isSaving || isImporting} // Disable while importing or saving
                        style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: isSaving || isImporting ? 'not-allowed' : 'pointer' }}
                    >
                        + Add Participant
                    </button>
                </div>


                {/* Filter Controls */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <span>Filter by:</span>
                    <select value={filterType} onChange={handleFilterTypeChange} disabled={isSaving || isImporting}>
                        <option value="all">All</option>
                        <option value="faculty">Faculty</option>
                        <option value="course">Course</option>
                        <option value="year">Year</option>
                        <option value="gender">Gender</option>
                        <option value="role">Role</option>
                    </select>

                    {/* Filter Value Dropdown (Conditionally Rendered based on filterType) */}
                    {(filterType === 'faculty' && filterOptions.faculties) && (
                        <select value={filterValue?.toString() || ''} onChange={handleFilterValueChange} disabled={isSaving || isImporting}>
                            {filterOptions.faculties.map(option => (
                                <option key={option || ''} value={option || ''}>{option || 'N/A'}</option>
                            ))}
                        </select>
                    )}
                    {(filterType === 'course' && filterOptions.courses) && (
                        <select value={filterValue?.toString() || ''} onChange={handleFilterValueChange} disabled={isSaving || isImporting}>
                            {filterOptions.courses.map(option => (
                                <option key={option || ''} value={option || ''}>{option || 'N/A'}</option>
                            ))}
                        </select>
                    )}
                    {(filterType === 'year' && filterOptions.years) && (
                        <select value={filterValue?.toString() || ''} onChange={handleFilterValueChange} disabled={isSaving || isImporting}>
                            {filterOptions.years.map(option => (
                                <option key={option || ''} value={option || ''}>{option || 'N/A'}</option>
                            ))}
                        </select>
                    )}
                    {(filterType === 'gender' && filterOptions.genders) && (
                        <select value={filterValue?.toString() || ''} onChange={handleFilterValueChange} disabled={isSaving || isImporting}>
                            {filterOptions.genders.map(option => (
                                <option key={option || ''} value={option || ''}>{option || 'N/A'}</option>
                            ))}
                        </select>
                    )}
                    {(filterType === 'role' && filterOptions.roles) && (
                        <select value={filterValue?.toString() || ''} onChange={handleFilterValueChange} disabled={isSaving || isImporting}>
                            {filterOptions.roles.map(option => (
                                <option key={option || ''} value={option || ''}>{option || 'N/A'}</option>
                            ))}
                        </select>
                    )}
                </div>


                {/* Participants Table */}
                {participants.length === 0 ? ( // Check main participants list length
                    <p className="no-events-message" style={{ textAlign: 'center', fontStyle: 'italic', color: '#777' }}>
                        {isLoadingInitial ? 'Loading participants...' :
                            initialLoadError ? 'Could not load participants.' :
                                'No participants found. Import a file or add manually.'}
                    </p>
                ) : (
                    // Apply styles from the CSS Module for the table container
                    <div className={styles["participants-table-container"]}>
                        {/* ParticipantsTable component handles rendering the table structure */}
                        <ParticipantsTable
                            participants={sortedParticipants} // Pass the sorted and filtered list
                            onDeleteParticipant={handleDeleteParticipant} // Pass delete handler
                        />
                    </div>
                )}

                {/* Display Save Error */}
                {saveError && (
                    <div style={{ color: '#721c24', backgroundColor: '#f8d7da', borderColor: '#f5c6cb', padding: '10px', marginTop: '15px', border: '1px solid', borderRadius: '4px' }}>
                        <strong>Error:</strong> {saveError}
                    </div>
                )}


                {/* Action Buttons for the whole list */}
                <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px', display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to cancel? Any unsaved changes (imports, additions, deletions) will be lost.")) {
                                router.back(); // Go back to the previous page
                            }
                        }}
                        disabled={isSaving || isImporting} // Disable while saving or importing
                        style={{ padding: '10px 20px', cursor: isSaving || isImporting ? 'not-allowed' : 'pointer', border: '1px solid #ccc', borderRadius: '4px', background: 'none', color: '#333' }}
                    >
                        Cancel Changes
                    </button>
                    <button
                        onClick={handleConfirmSave} // Call the save handler
                        disabled={isSaving || isImporting || participants.length === 0} // Disable if saving, importing, or list is empty
                        style={{ padding: '10px 20px', cursor: isSaving || isImporting || participants.length === 0 ? 'not-allowed' : 'pointer', backgroundColor: isSaving || isImporting || participants.length === 0 ? '#cccccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                        {isSaving ? 'Saving...' : 'Confirm & Save All Changes'} {/* Button text changes while saving */}
                    </button>
                </div>

            </div> {/* End Participants List & Actions Section */}


            {/* --- Participants Demographics Section (with Charts) --- */}
            {/* Render demographics only if not loading initial participants and participants exist */}
            {!isLoadingInitial && participants.length > 0 && demographics && (
                <div className="form-container" style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', background: '#fff' }}>
                    <h3>Participants Demographics</h3>
                    {demographics.total > 0 ? (
                        <div className={styles["demographics-summary"]}>
                            <p><strong>Total Participants:</strong> {demographics.total}</p>

                            {/* --- Conditionally render charts only after mounted --- */}
                            {isMounted ? ( // <-- Render charts only if isMounted is true (for hydration safety)
                                <>
                                    {/* --- Faculty Distribution Chart --- */}
                                    {facultyChartData.length > 0 && <><h4>Faculty Distribution:</h4><div style={{ width: '100%', height: 250 }}><ResponsiveContainer width="100%" height="100%"><BarChart data={facultyChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="count" fill="#8884d8" name="Number of Participants" /></BarChart></ResponsiveContainer></div></>}
                                    {/* Spacing */}
                                    {facultyChartData.length > 0 && courseChartData.length > 0 && <div style={{ height: 20 }}></div>}

                                    {/* --- Course Distribution Chart --- */}
                                    {courseChartData.length > 0 && <><h4>Course Distribution:</h4><div style={{ width: '100%', height: 250 }}><ResponsiveContainer width="100%" height="100%"><BarChart data={courseChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="count" fill="#82ca9d" name="Number of Participants" /></BarChart></ResponsiveContainer></div></>}
                                    {/* Spacing */}
                                    {(courseChartData.length > 0 || facultyChartData.length > 0) && yearChartData.length > 0 && <div style={{ height: 20 }}></div>}


                                    {/* --- Year Distribution Chart --- */}
                                    {yearChartData.length > 0 && <><h4>Year Distribution:</h4><div style={{ width: '100%', height: 250 }}><ResponsiveContainer width="100%" height="100%"><BarChart data={yearChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="count" fill="#ffc658" name="Number of Participants" /></BarChart></ResponsiveContainer></div></>}
                                    {/* Spacing */}
                                    {(yearChartData.length > 0 || courseChartData.length > 0 || facultyChartData.length > 0) && genderChartData.length > 0 && <div style={{ height: 20 }}></div>}

                                    {/* --- Gender Distribution Chart --- */}
                                    {genderChartData.length > 0 && <><h4>Gender Distribution:</h4><div style={{ width: '100%', height: 250 }}><ResponsiveContainer width="100%" height="100%"><BarChart data={genderChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="count" fill="#ff9800" name="Number of Participants" /></BarChart></ResponsiveContainer></div></>}
                                    {/* Spacing */}
                                    {(genderChartData.length > 0 || yearChartData.length > 0 || courseChartData.length > 0 || facultyChartData.length > 0) && roleChartData.length > 0 && <div style={{ height: 20 }}></div>}

                                    {/* --- Role Distribution Chart --- */}
                                    {roleChartData.length > 0 && <><h4>Role Distribution:</h4><div style={{ width: '100%', height: 250 }}><ResponsiveContainer width="100%" height="100%"><BarChart data={roleChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="count" fill="#9c27b0" name="Number of Participants" /></BarChart></ResponsiveContainer></div></>}


                                    {/* Placeholder if no chart data exists despite total > 0 (e.g., no faculty data) */}
                                    {facultyChartData.length === 0 && courseChartData.length === 0 && yearChartData.length === 0 && genderChartData.length === 0 && roleChartData.length === 0 && (
                                        <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#777' }}>No demographic data available for charts.</p>
                                    )}


                                </>
                            ) : (
                                // Placeholder while charts are not mounted
                                <div style={{ width: '100%', height: 250, backgroundColor: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    Loading Charts...
                                </div>
                            )}

                        </div>
                    ) : ( // demographics.total === 0
                        <div className={styles["demographics-summary"]}>
                            <p><strong>Total Participants:</strong> 0</p>
                            <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#777' }}>No participant data available to display demographics charts.</p>
                        </div>
                    )}
                </div>
            )}


            {/* --- Add Participant Modal --- */}
            <AddParticipantModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddParticipant}
            />

        </div> // End page-content-wrapper
    );
}

// --- Mock Service Methods (Replace with your actual eventService) ---
// Assume eventService is imported and has these async methods
// class EventService {
//      async getParticipantsByEventId(eventId: string): Promise<Participant[]> {
//          console.log(`[Mock Service] Fetching initial saved participants for ${eventId}`);
//          await new Promise(resolve => setTimeout(resolve, 800));
//           // Return sample saved data
//          return [
//             { id: 1, name: "Initial User 1", email: "i1@saved.com", phoneNo: "111", gender: "F", faculty: "Sci", course: "Bio", year: "2", role: "Student" },
//             { id: 2, name: "Initial User 2", email: "i2@saved.com", phoneNo: "222", gender: "M", faculty: "Eng", course: "EE", year: "3", role: "Organizer" },
//          ];
//      }
//      async importParticipantsInfo(eventId: string, file: File): Promise<Participant[]> {
//          console.log(`[Mock Service] Importing file "${file.name}" for ${eventId}. Simulating processing.`);
//          await new Promise(resolve => setTimeout(resolve, 2000));
//          // Simulate returning processed data from file
//           const importedData: Participant[] = [
//               { id: uuidv4(), name: "Imported User A", email: "ia@imported.com", phoneNo: "777", gender: "F", faculty: "Arts", course: "Lit", year: "1", role: "Student" },
//               { id: uuidv4(), name: "Imported User B", email: "ib@imported.com", phoneNo: "888", gender: "M", faculty: "Eng", course: "ME", year: "4", role: "Volunteer" },
//           ];
//           console.log(`[Mock Service] Import done, returning ${importedData.length} participants.`);
//          return importedData;
//      }
//      async saveParticipants(eventId: string, participants: Participant[]): Promise<any> {
//          console.log(`[Mock Service] Saving ${participants.length} participants for ${eventId}.`);
//          console.log("Data to save:", participants);
//          await new Promise(resolve => setTimeout(resolve, 1500));
//          // Simulate saving to database. Backend assigns final IDs for new items.
//          const success = Math.random() > 0.1;
//           if (!success) throw new Error("Mock save failed");
//           console.log("[Mock Service] Save successful!");
//           return { success: true }; // Simulate backend response
//      }
// }
// // If eventService is not a default export or class instance, uncomment/adjust
// // const eventService = new EventService();