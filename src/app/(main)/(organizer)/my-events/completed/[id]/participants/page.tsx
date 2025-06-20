// src/app/my-events/[id]/participants/page.tsx

'use client'; // This is a Client Component, required for state, effects, and event handlers

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation'; // From URL get event ID, for navigation
import { v4 as uuidv4 } from 'uuid'; // For temporary IDs for new participants

// Import Recharts components (ensure these are installed: npm install recharts)
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Import necessary components and types
// Adjust paths based on your project structure
import ParticipantsTable from '@/components/ParticipantsTable';
import AddParticipantModal from '@/components/AddParticipantModal';
import { User } from '@/types/user'; // Ensure this matches your backend model
import { eventService } from '@/services'; // Adjust path to your service module
import { toast } from 'sonner';

// Import styles (ensure path is correct)
import styles from './participantsPage.module.css';
import { Save } from 'lucide-react';
import { DemographicsSummary } from '@/types/event';

// --- Define Helper Types ---
// These types were in your original code, keeping them here

type SortKey = keyof User | null;
type SortDirection = 'asc' | 'desc';

type FilterType = 'all' | 'faculty' | 'course' | 'year' | 'gender' | 'role'; // Added gender and role filters


// --- Helper function to calculate demographics ---
// Move demographics calculation out to a function for clarity

// --- Main Page Component ---
export default function EventParticipantsPage() {
    const params = useParams();
    const router = useRouter(); // Use useRouter from next/navigation
    const eventId = Array.isArray(params.id) ? params.id[0] : params.id; // event ID as string

    // --- State for the main list of participants ---
    const [participants, setParticipants] = useState<User[]>([]);
    // State for demographics derived from participants
    const [demographics, setDemographics] = useState<DemographicsSummary | null>(null);

    // --- State for various loading/error states ---
    const [isLoadingInitial, setIsLoadingInitial] = useState(true); // Loading initial saved data
    const [initialLoadError, setInitialLoadError] = useState<string | null>(null); // Error loading initial data

    const [isSaving, setIsSaving] = useState(false); // Final save process
    const [saveError, setSaveError] = useState<string | null>(null); // Error during final save

    // --- State for Sorting ---
    const [sortKey, setSortKey] = useState<SortKey>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // --- State for Filtering ---
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [filterValue, setFilterValue] = useState<string | number | null>(null);

    // --- State for team members pagination
    const [currentPageNo, setCurrentPageNo] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [sortBy, setSortBy] = useState<string>("participant.name");
    const [totalPages, setTotalPages] = useState(0);
    const [totalParticipants, setTotalParticipants] = useState(0);
    const [offset, setOffset] = useState(0);

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
        fetchSavedParticipants();
    }, [eventId, currentPageNo, pageSize, sortBy]); // Re-run effect if eventId changes


    // --- Recalculate Demographics whenever participants list changes ---
    useEffect(() => {
        if (participants) {
            fetchDemographics();
        } else {
            setDemographics(null); // Or an empty summary
        }
    }, [participants]); // Recalculate when participants state updates


    const fetchDemographics = async () => {
        try {
            const demographic = await eventService.getParticipantsDemographicsByEventId(Number(eventId));
            setDemographics(demographic);
        } catch (error) {
            console.error("Failed to fetch initially saved participants:", error);
            setDemographics(null);
        }
    };



    // Fetch data
    const fetchSavedParticipants = async () => {
        setIsLoadingInitial(true);
        setInitialLoadError(null);
        // Clear other status messages on initial load

        setSaveError(null);
        try {
            // Call your service to get participants already saved for this event
            const response = await eventService.getParticipantsByEventId(Number(eventId), currentPageNo, pageSize, sortBy);
            setParticipants(response.content); // Set the main participants state
            setCurrentPageNo(response.pageable.pageNumber);
            setTotalPages(response.totalPages);
            setTotalParticipants(response.totalElements);
            setOffset(response.pageable.offset + 1);
        } catch (err: any) {
            console.error("Failed to fetch initially saved participants:", err);
            setInitialLoadError(`Failed to load existing participants: ${err.message || 'Unknown error'}`);
            setParticipants([]); // Display empty list on error
        } finally {
            setIsLoadingInitial(false);
        }
    };



    // Handle pagination
    const handlePageChange = (newPage: number) => {
        setCurrentPageNo(newPage);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
    }

    // Handle exporting attendance data (e.g., as CSV)
    const handleExportAttendance = async () => {
        if (!eventId) {
            console.error("Cannot export: Event ID missing.");
            return;
        }

        try {
            // Show loading state if needed
            const xlsxBlob = await eventService.exportParticipantsXLSX(Number(eventId));

            // Create a download link
            const url = window.URL.createObjectURL(xlsxBlob);
            const link = document.createElement('a');
            link.href = url;

            // Set the filename using the session name if available
            const filename =  `attendance-${eventId.replace(/\s+/g, '_')}.xlsx`;
            link.download = filename;

            // Trigger the download
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error("Failed to export attendance data:", error);
            // You might want to show an error message to the user here
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
            <div className='page-header'>
                <div className={'page-title-section'}>
                    <h2>Participants</h2>
                    <p className={'page-subtitle'}>
                        Administer participants and view demographic insights
                    </p>
                </div>
            </div>

            {/* --- Participants List & Actions Section --- */}
            <div className="form-container" style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px', background: '#fff' }}> {/* Keep form-container for card styling */}

                {/* List Title and Add Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <h3>Participants List ({sortedParticipants.length} of {participants.length})</h3> {/* Show count of filtered/total */}
                    {/* Export Button */}
                    {participants && (
                        <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
                            <button className="button-secondary" onClick={handleExportAttendance}>
                                Export Participants (XLSX)
                            </button>
                        </div>
                    )}
                </div>


                {/* Filter Controls */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <span>Filter by:</span>
                    <select value={filterType} onChange={handleFilterTypeChange}>
                        <option value="all">All</option>
                        <option value="faculty">Faculty</option>
                        <option value="course">Course</option>
                        <option value="year">Year</option>
                        <option value="gender">Gender</option>
                        <option value="role">Role</option>
                    </select>

                    {/* Filter Value Dropdown (Conditionally Rendered based on filterType) */}
                    {(filterType === 'faculty' && filterOptions.faculties) && (
                        <select value={filterValue?.toString() || ''} onChange={handleFilterValueChange}>
                            {filterOptions.faculties.map(option => (
                                <option key={option || ''} value={option || ''}>{option || 'N/A'}</option>
                            ))}
                        </select>
                    )}
                    {(filterType === 'course' && filterOptions.courses) && (
                        <select value={filterValue?.toString() || ''} onChange={handleFilterValueChange} >
                            {filterOptions.courses.map(option => (
                                <option key={option || ''} value={option || ''}>{option || 'N/A'}</option>
                            ))}
                        </select>
                    )}
                    {(filterType === 'year' && filterOptions.years) && (
                        <select value={filterValue?.toString() || ''} onChange={handleFilterValueChange}>
                            {filterOptions.years.map(option => (
                                <option key={option || ''} value={option || ''}>{option || 'N/A'}</option>
                            ))}
                        </select>
                    )}
                    {(filterType === 'gender' && filterOptions.genders) && (
                        <select value={filterValue?.toString() || ''} onChange={handleFilterValueChange}>
                            {filterOptions.genders.map(option => (
                                <option key={option || ''} value={option || ''}>{option || 'N/A'}</option>
                            ))}
                        </select>
                    )}
                    {(filterType === 'role' && filterOptions.roles) && (
                        <select value={filterValue?.toString() || ''} onChange={handleFilterValueChange}>
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
                            onDeleteParticipant={null as unknown as (id: string | number) => void} // Type assertion to satisfy TypeScript
                            currentPage={currentPageNo}
                            pageSize={pageSize}
                            totalParticipants={totalParticipants}
                            totalPages={totalPages}
                            offset={offset}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}

                        />
                    </div>
                )}

                {/* Display Save Error */}
                {saveError && (
                    <div style={{ color: '#721c24', backgroundColor: '#f8d7da', borderColor: '#f5c6cb', padding: '10px', marginTop: '15px', border: '1px solid', borderRadius: '4px' }}>
                        <strong>Error:</strong> {saveError}
                    </div>
                )}


            </div> {/* End Participants List & Actions Section */}


            {/* --- Participants Demographics Section (with Charts) --- */}
            {/* Render demographics only if not loading initial participants and participants exist */}
            {!isLoadingInitial && participants.length > 0 && demographics && (
                <div className="form-container" style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', background: '#fff' }}>
                    <h3>Participants Demographics</h3>
                    {demographics.totalNumber > 0 ? (
                        <div className={styles["demographics-summary"]}>
                            <p><strong>Total Participants:</strong> {demographics.totalNumber}</p>

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
                                    {(genderChartData.length > 0 || yearChartData.length > 0 || courseChartData.length > 0 || facultyChartData.length > 0) && <div style={{ height: 20 }}></div>}



                                    {/* Placeholder if no chart data exists despite total > 0 (e.g., no faculty data) */}
                                    {facultyChartData.length === 0 && courseChartData.length === 0 && yearChartData.length === 0 && genderChartData.length === 0 && (
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



        </div> // End page-content-wrapper
    );
}
