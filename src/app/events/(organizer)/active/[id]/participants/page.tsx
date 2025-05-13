// src/app/events/[id]/participants/page.tsx

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

type SortKey = keyof User | null;
type SortDirection = 'asc' | 'desc';

type FilterType = 'all' | 'faculty' | 'course' | 'year' | 'gender' | 'role'; // Added gender and role filters


// --- Helper function to calculate demographics ---
// Move demographics calculation out to a function for clarity
const calculateDemographics = (data: User[]): DemographicsSummary => {
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
    const [participants, setParticipants] = useState<User[]>([]);
    // State for demographics derived from participants
    const [demographics, setDemographics] = useState<DemographicsSummary | null>(null);

    // --- State for various loading/error states ---
    const [isLoadingInitial, setIsLoadingInitial] = useState(true); // Loading initial saved data
    const [initialLoadError, setInitialLoadError] = useState<string | null>(null); // Error loading initial data

    const [isImporting, setIsImporting] = useState(false); // File import process
    const [uploadedParticipants, setUploadedParticipants] = useState<User[]>([]);
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

    // --- State for team members pagination
    const [currentPageNo, setCurrentPageNo] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [sortBy, setSortBy] = useState<string>("participant.name");
    const [totalPages, setTotalPages] = useState(0);
    const [totalParticipants, setTotalParticipants] = useState(0);


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
            setDemographics(calculateDemographics(participants));
        } else {
            setDemographics(null); // Or an empty summary
        }
    }, [participants]); // Recalculate when participants state updates

    useEffect(() => {
        // Prevent body scrolling when overlay is open
        if (uploadedParticipants.length > 0) {
            document.body.style.overflow = "hidden"; // Disable background scroll
        } else {
            document.body.style.overflow = "auto"; // Re-enable scroll when overlay is closed
        }

        return () => {
            document.body.style.overflow = "auto"; // Ensure scroll is re-enabled on component unmount
        };


    }, [uploadedParticipants]); // Run the effect when uploadedParticipants changes

    // Fetch data
    const fetchSavedParticipants = async () => {
        setIsLoadingInitial(true);
        setInitialLoadError(null);
        // Clear other status messages on initial load
        setImportError(null);
        setImportSuccess(null);
        setSaveError(null);
        try {
            // Call your service to get participants already saved for this event
            const response = await eventService.getParticipantsByEventId(Number(eventId),currentPageNo, pageSize, sortBy);
            setParticipants(response.content); // Set the main participants state
            setCurrentPageNo(response.pageable.pageNumber);
            setTotalPages(response.totalPages);
            setTotalParticipants(response.totalElements);
          
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
            setUploadedParticipants(importedList);


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


    const handleAddParticipant = async (participant: User | null) => {
        if (!participant) return;
        setIsModalOpen(false);
        setIsSaving(true); // Start saving state
        setSaveError(null); // Clear previous save errors
        setImportError(null); // Clear import errors too

        try {
            const updatedParticipants = [...participants];

            // Build a fast lookup set for existing participants
            const existingEmails = new Set(participants.map(p => p.email.toLowerCase()));
            const existingNamePhonePairs = new Set(participants.map(p => {
                const name = p.name.trim().toLowerCase();
                const phone = (p.phoneNo ?? '').replace(/\D/g, '');
                return `${name}_${phone}`;
            }));

            let addedParticipants: User[] = [];
            let skippedCount = 0;


            const emailKey = participant.email.toLowerCase();
            const namePhoneKey = `${participant.name.trim().toLowerCase()}_${(participant.phoneNo ?? '').replace(/\D/g, '')}`;

            const isDuplicate = existingEmails.has(emailKey) || existingNamePhonePairs.has(namePhoneKey);

            if (!isDuplicate) {
                updatedParticipants.push(participant);
                addedParticipants.push(participant);
                existingEmails.add(emailKey);
                existingNamePhonePairs.add(namePhoneKey);
            } else {
                skippedCount++;
            }


            if (addedParticipants.length > 0) {
                console.log("Saving newly added participants:", addedParticipants);
                const success = await eventService.saveParticipants(Number(eventId), addedParticipants);

                if (success) {
                    setParticipants(updatedParticipants); // Only update if save succeeded
                    setUploadedParticipants([]); // Clear upload buffer
                    // Update import status messages

                    toast.success(`${addedParticipants.length} new participants added.`);
                } else {
                    throw new Error('Save operation did not report success.');
                }
            } else {

                toast.info('No new participants to save.');
            }

            if (skippedCount > 0) {
                toast.warning(`${skippedCount} participants skipped (already exist).`);
            }

            // Refresh current page data (optional)
            router.refresh();

        } catch (saveErr: any) {
            console.error("Save Error:", saveErr);
            setSaveError(`Failed to save changes: ${saveErr.message || 'Unknown error during save'}`);
        } finally {
            setIsSaving(false); // End saving state
        }
    };


    // --- Handle Deleting a Participant by ID ---
    const handleDeleteParticipant = (id: number | string) => {

        try {
            eventService.deleteParticipants(Number(eventId), Number(id));
            setParticipants(participants.filter(p => p.id !== id));
        } catch (deleteErr) {
            console.error("DeleteError:", deleteErr);
        }
        // Use filter to create a new array excluding the participant with the given id
        // Optional: Reset filter/sort if deleting might make current view inconsistent
        setFilterType('all');
        setFilterValue(null);
        setSortKey(null);
    };

    const handleDeleteUploaded = (id: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this participant?");
        if (!confirmDelete) return;

        setUploadedParticipants(uploadedParticipants.filter(p => String(p.id) !== id));
    };




    const handleConfirmSave = async () => {
        if (uploadedParticipants.length === 0) return;
        if (!eventId) { setSaveError("Event ID is missing. Cannot save."); return; }

        setIsSaving(true); // Start saving state
        setSaveError(null); // Clear previous save errors
        setImportError(null); // Clear import errors too

        try {
            const updatedParticipants = [...participants];

            // Build a fast lookup set for existing participants
            const existingEmails = new Set(participants.map(p => p.email.toLowerCase()));
            const existingNamePhonePairs = new Set(participants.map(p => {
                const name = p.name.trim().toLowerCase();
                const phone = (p.phoneNo ?? '').replace(/\D/g, '');
                return `${name}_${phone}`;
            }));

            let addedParticipants: typeof uploadedParticipants = [];
            let skippedCount = 0;

            uploadedParticipants.forEach((newP) => {
                const emailKey = newP.email.toLowerCase();
                const namePhoneKey = `${newP.name.trim().toLowerCase()}_${(newP.phoneNo ?? '').replace(/\D/g, '')}`;

                const isDuplicate = existingEmails.has(emailKey) || existingNamePhonePairs.has(namePhoneKey);

                if (!isDuplicate) {
                    updatedParticipants.push(newP);
                    addedParticipants.push(newP);
                    existingEmails.add(emailKey);
                    existingNamePhonePairs.add(namePhoneKey);
                } else {
                    skippedCount++;
                }
            });

            if (addedParticipants.length > 0) {
                console.log("Saving newly added participants:", addedParticipants);
                const success = await eventService.saveParticipants(Number(eventId), addedParticipants);

                if (success) {
                    setParticipants(updatedParticipants); // Only update if save succeeded
                    setUploadedParticipants([]); // Clear upload buffer
                    // Update import status messages

                    toast.success(`${addedParticipants.length} new participants added.`);
                } else {
                    throw new Error('Save operation did not report success.');
                }
            } else {

                toast.info('No new participants to save.');
            }

            if (skippedCount > 0) {
                toast.warning(`${skippedCount} participants skipped (already exist).`);
            }

            // Refresh current page data (optional)
            router.refresh();

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


                {/* Uploaded Participants Overlay */}
                {uploadedParticipants.length > 0 && (
                    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full">
                            <h2 className="text-xl font-bold mb-4">New Uploaded Participants</h2>

                            <div className="overflow-x-auto mb-4">
                                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="text-left px-4 py-2">No</th>
                                            <th className="text-left px-4 py-2">Name</th>
                                            <th className="text-left px-4 py-2">Email</th>
                                            <th className="text-left px-4 py-2">Phone No</th>
                                            <th className="text-left px-4 py-2">Faculty</th>
                                            <th className="text-left px-4 py-2">Course</th>
                                            <th className="text-left px-4 py-2">Year</th>
                                            <th className="text-left px-4 py-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {uploadedParticipants.map((p, index) => (
                                            <tr key={p.id} className="border-t">
                                                <td className="px-4 py-2">{index + 1}</td>
                                                <td className="px-4 py-2">{p.name}</td>
                                                <td className="px-4 py-2">{p.email}</td>
                                                <td className="px-4 py-2">{p.phoneNo}</td>
                                                <td className="px-4 py-2">{p.faculty || "-"}</td>
                                                <td className="px-4 py-2">{p.course || "-"}</td>
                                                <td className="px-4 py-2">{p.year || "-"}</td>
                                                <td className="px-4 py-2">
                                                    <button
                                                        className="text-red-600 hover:underline"
                                                        onClick={() => handleDeleteUploaded(String(p.id))}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end gap-4">
                                <button
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                    onClick={() => setUploadedParticipants([])}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                    onClick={handleConfirmSave}
                                    disabled={isSaving}
                                >
                                    <Save className="w-5 h-5" />
                                    {isSaving ? "Saving..." : "Save Uploaded"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}


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
                            currentPage={currentPageNo}
                            pageSize={pageSize}
                            totalParticipants={totalParticipants}
                            totalPages={totalPages}
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


            {/* --- Add Participant Modal --- */}
            <AddParticipantModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onConfirm={handleAddParticipant}
            />

        </div> // End page-content-wrapper
    );
}
