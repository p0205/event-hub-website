// src/app/events/[id]/participants/page.tsx
'use client'; // 这是一个客户端组件，用于数据获取和交互

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation'; // 从 URL 获取 event ID
import Link from 'next/link'; // 如果参与者姓名是链接的话
import { parse } from 'csv-parse/browser/esm'; // 用于解析 CSV，需要安装库

// Import Recharts components
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';


// Assuming the module is in a 'styles' subfolder
// Using the corrected import path based on previous troubleshooting
import styles from './participantsPage.module.css';


// 定义参与者数据结构
interface Participant {
    id: string; // 参与者唯一标识
    name: string;
    email: string;
    faculty: string;
    course: string;
    year: number; // 假设年级是数字 1, 2, 3, 4
    // 根据需要添加其他字段
}

// 定义人口统计汇总数据结构 (可选)
interface DemographicsSummary {
    total: number;
    byFaculty: { [key: string]: number };
    byCourse: { [key: string]: number };
    byYear: { [key: number]: number };
}

// 定义排序相关的类型
type SortKey = keyof Participant | null; // 用于排序的字段名
type SortDirection = 'asc' | 'desc'; // 排序方向

// Define Filter types
type FilterType = 'all' | 'faculty' | 'course' | 'year';


// --- Define Mock Participant Data (Keep this for now) ---
const mockParticipants: Participant[] = [
    { id: 'p1', name: 'Alice Smith', email: 'alice.s@example.com', faculty: 'Engineering', course: 'ME', year: 3 },
    { id: 'p2', name: 'Bob Johnson', email: 'bob.j@example.com', faculty: 'Science', course: 'Physics', year: 2 },
    { id: 'p3', name: 'Charlie Brown', email: 'charlie.b@example.com', faculty: 'Arts', course: 'History', year: 4 },
    { id: 'p4', name: 'David Green', email: 'david.g@example.com', faculty: 'Engineering', course: 'EE', year: 3 },
    { id: 'p5', name: 'Eve Adams', email: 'eve.a@example.com', faculty: 'Science', course: 'Chemistry', year: 1 },
    { id: 'p6', name: 'Frank White', email: 'frank.w@example.com', faculty: 'Arts', course: 'Sociology', year: 2 },
    { id: 'p7', name: 'Grace Black', email: 'grace.b@example.com', faculty: 'Engineering', course: 'ME', year: 4 },
    { id: 'p8', name: 'Heidi Blue', email: 'heidi.b@example.com', faculty: 'Science', course: 'Biology', year: 3 },
    { id: 'p9', name: 'Ivan Red', email: 'ivan.r@example.com', faculty: 'Arts', course: 'Literature', year: 1 },
    { id: 'p10', name: 'Judy Grey', email: 'judy.g@example.com', faculty: 'Engineering', course: 'EE', year: 2 },
];
// --- End Mock Participant Data ---


export default function EventParticipantsPage() {
    const params = useParams();
    const eventId = params.id as string; // 从 URL 参数获取活动 ID

    // --- State for Participants and Demographics (fetched/loaded) ---
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [demographics, setDemographics] = useState<DemographicsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- State for CSV Import ---
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState<string | null>(null);

    // --- State for Component Mount (for Hydration/Recharts) ---
    const [isMounted, setIsMounted] = useState(false);


    // --- State for Sorting ---
    const [sortKey, setSortKey] = useState<SortKey>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');


    // --- State for Filtering ---
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [filterValue, setFilterValue] = useState<string | number | null>(null); // Value for the selected filter type


    // --- Data Fetching (using Mock Data for now) ---
    useEffect(() => {
        const loadMockParticipants = async () => {
            setLoading(true);
            setError(null);
            try {
                // Simulate API delay (optional)
                // await new Promise(resolve => setTimeout(resolve, 500));

                // Use mock data directly
                const data = mockParticipants; // Use mock data

                setParticipants(data);

                // Calculate demographics from mock data
                const summary: DemographicsSummary = {
                    total: data.length,
                    byFaculty: {},
                    byCourse: {},
                    byYear: {},
                };
                data.forEach(p => {
                    summary.byFaculty[p.faculty] = (summary.byFaculty[p.faculty] || 0) + 1;
                    summary.byCourse[p.course] = (summary.byCourse[p.course] || 0) + 1;
                    const yearKey: number | string = typeof p.year === 'number' ? p.year : String(p.year);
                    summary.byYear[yearKey as any] = ((summary.byYear as any)[yearKey] || 0) + 1;
                });
                setDemographics(summary);

            } catch (e: any) {
                console.error("Error loading mock participants:", e);
                setError(`Failed to load mock participants: ${e.message || 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };

        loadMockParticipants();

        // Set mounted state after initial load
        setIsMounted(true);

    }, [eventId]);


    // --- Filter Options (Derived from participants data) ---
    const filterOptions = useMemo(() => {
        const faculties = Array.from(new Set(participants.map(p => p.faculty))).sort();
        const courses = Array.from(new Set(participants.map(p => p.course))).sort();
        const years = Array.from(new Set(participants.map(p => p.year))).sort((a, b) => a - b); // Sort numerically

        return {
            faculties: ['All Faculties', ...faculties], // Add 'All' option
            courses: ['All Courses', ...courses],     // Add 'All' option
            years: ['All Years', ...years.map(y => `Year ${y}`)], // Add 'All' and format year
        };
    }, [participants]);


    // --- Apply Filtering Logic ---
    const filteredParticipants = useMemo(() => {
        if (filterType === 'all' || filterValue === null || filterValue === '') {
            return participants; // No filter applied
        }

        return participants.filter(p => {
            if (filterType === 'faculty') {
                 // Handle 'All Faculties' option
                 if (filterValue === 'All Faculties') return true;
                 return p.faculty === filterValue;
            }
            if (filterType === 'course') {
                 // Handle 'All Courses' option
                 if (filterValue === 'All Courses') return true;
                 return p.course === filterValue;
            }
            if (filterType === 'year') {
                 // Handle 'All Years' option
                 if (filterValue === 'All Years') return true;
                 // Convert filterValue back to number for comparison if year is number
                 const yearNumber = parseInt(String(filterValue).replace('Year ', ''), 10);
                 return p.year === yearNumber;
            }
            return true; // Should not happen
        });
    }, [participants, filterType, filterValue]); // Re-filter when participants, type, or value changes


    // --- Apply Sorting Logic (on the filtered list) ---
    const sortedParticipants = useMemo(() => {
        // Sort the FILTERED participants list
        if (!sortKey) return filteredParticipants;

        const sorted = [...filteredParticipants].sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
            if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
             // Numerical comparison for numbers (like year)
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                 return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }
             // Fallback for other types or mixed types
            if (aValue < bValue) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return sorted;
    }, [filteredParticipants, sortKey, sortDirection]); // Re-sort when filtered list, sort key, or direction changes


    // --- Handle CSV File Import (Logic remains the same) ---
    const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setImportError(null);
        setImportSuccess(null);

        if (file.type !== 'text/csv') {
             setImportError('Invalid file type. Please upload a CSV file.');
             setIsImporting(false);
             event.target.value = '';
             return;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
            const text = e.target?.result as string;
            if (!text) {
                 setImportError('Failed to read file.');
                 setIsImporting(false);
                 event.target.value = '';
                 return;
            }

            try {
                 parse(text, {
                    columns: true,
                    skip_empty_lines: true,
                    trim: true,
                 }, async (err, records) => {
                     if (err) {
                         console.error("CSV Parsing Error:", err);
                         setImportError(`Failed to parse CSV: ${err.message}`);
                         setIsImporting(false);
                         event.target.value = '';
                         return;
                     }

                     const importedParticipants = records.map((record: any) => ({
                         id: record.id || record.ID || record.Id || record['Participant ID'] || String(Math.random()),
                         name: record.name || record.Name || '',
                         email: record.email || record.Email || '',
                         faculty: record.faculty || record.Faculty || '',
                         course: record.course || record.Course || '',
                         year: parseInt(record.year || record.Year || '0', 10) || 0,
                         // Map other columns...
                     }));

                     console.log("Simulating sending imported participants to backend:", importedParticipants);

                     try {
                         await new Promise(resolve => setTimeout(resolve, 1000));
                         console.log("Simulated backend import success.");
                         setImportSuccess('Participants imported successfully!');
                         setImportError(null);
                         // Optional: Update state with imported data temporarily
                         /*
                         setParticipants(prevParticipants => {
                              const updatedParticipants = [...prevParticipants, ...importedParticipants];
                              const updatedSummary: DemographicsSummary = { ... }; // Recalculate
                              setDemographics(updatedSummary);
                              return updatedParticipants;
                         });
                         */

                     } catch (uploadError: any) {
                          console.error("Simulated Backend Import Error:", uploadError);
                         setImportError(`Import failed: ${uploadError.message || 'Unknown error during backend import'}`);
                          setImportSuccess(null);
                     } finally {
                          setIsImporting(false);
                          event.target.value = '';
                     }
                 });

            } catch (e: any) {
                console.error("Import process error:", e);
                setImportError(`An error occurred during import: ${e.message || 'Unknown error'}`);
                setIsImporting(false);
                event.target.value = '';
            }
        };

        reader.onerror = () => {
            setImportError('Failed to read file.');
            setIsImporting(false);
            event.target.value = '';
        };

        reader.readAsText(file);
    };

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    // --- Handle Filter Type Change ---
    const handleFilterTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newFilterType = event.target.value as FilterType;
        setFilterType(newFilterType);
        setFilterValue(null); // Reset filter value when filter type changes
        setSortKey(null); // Optional: Reset sort when filter changes
        setSortDirection('asc'); // Optional: Reset sort direction
    };

    // --- Handle Filter Value Change ---
     const handleFilterValueChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        // Store the raw value (string like 'Engineering' or 'Year 3')
        setFilterValue(value);
        setSortKey(null); // Optional: Reset sort when filter changes
        setSortDirection('asc'); // Optional: Reset sort direction
    };


    // 页面加载和错误状态显示
    if (loading) {
        return (
             <div className="page-content-wrapper">
                 <h2 className="page-title">Participants</h2>
                 <p className="loading-message">Loading participants...</p>
             </div>
        );
    }

    if (error) {
        return (
            <div className="page-content-wrapper">
                <h2 className="page-title">Participants</h2>
                <p className="error-message">Error: {error}</p>
            </div>
        );
    }

    // 渲染排序指示器 (箭头)
    const renderSortIndicator = (key: SortKey) => {
        if (sortKey !== key) return null;
        return sortDirection === 'asc' ? ' ▲' : ' ▼';
    };

    // --- Prepare Data for Recharts (based on *all* participants) ---
    // Demographics charts should usually show the overall distribution
    const facultyChartData = demographics ? Object.entries(demographics.byFaculty).map(([name, count]) => ({ name, count })) : [];
    const courseChartData = demographics ? Object.entries(demographics.byCourse).map(([name, count]) => ({ name, count })) : [];
    const yearChartData = demographics ? Object.entries(demographics.byYear).map(([name, count]) => ({ name: `Year ${name}`, count })) : [];


    return (
        <div className="page-content-wrapper"> {/* Keep this wrapper */}
            {/* --- Page Title --- */}
            <h2 className="page-title">Participants</h2>

            {/* --- Import CSV Section --- */}
            <div className="form-container">
                <h3>Import Participants</h3>
                <div className="form-group">
                    <label htmlFor="csvFileInput" className="button-secondary" style={{ cursor: isImporting ? 'not-allowed' : 'pointer' }}>
                         Import CSV
                    </label>
                    <input
                        type="file"
                        id="csvFileInput"
                        accept=".csv"
                        onChange={handleImportCSV}
                        disabled={isImporting}
                        style={{ display: 'none' }}
                    />
                     {isImporting && <span style={{ marginLeft: '10px' }}>Importing...</span>}
                     {importError && <p className="error-message" style={{ marginTop: '10px' }}>{importError}</p>}
                     {importSuccess && <p className="loading-message" style={{ marginTop: '10px' }}>{importSuccess}</p>}
                </div>
            </div>

            {/* --- Participants List Section --- */}
            <div className="form-container"> {/* Keep form-container for card styling */}
                {/* Combine title and filters in a flex container */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                     <h3>Participants List ({sortedParticipants.length})</h3> {/* Display count of FILTERED list */}

                     {/* Filter Dropdown */}
                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                         <span>Filter by:</span>
                         <select value={filterType} onChange={handleFilterTypeChange}>
                            <option value="all">All</option>
                            <option value="faculty">Faculty</option>
                            <option value="course">Course</option>
                            <option value="year">Year</option>
                         </select>

                         {/* Filter Value Dropdown (Conditionally Rendered) */}
                         {(filterType === 'faculty' && filterOptions.faculties) && (
                             <select value={filterValue || ''} onChange={handleFilterValueChange}>
                                 {filterOptions.faculties.map(option => (
                                     <option key={option} value={option}>{option}</option>
                                 ))}
                             </select>
                         )}
                          {(filterType === 'course' && filterOptions.courses) && (
                             <select value={filterValue || ''} onChange={handleFilterValueChange}>
                                 {filterOptions.courses.map(option => (
                                     <option key={option} value={option}>{option}</option>
                                 ))}
                             </select>
                         )}
                          {(filterType === 'year' && filterOptions.years) && (
                             <select value={filterValue || ''} onChange={handleFilterValueChange}>
                                 {filterOptions.years.map(option => (
                                     <option key={option} value={option}>{option}</option>
                                 ))}
                             </select>
                         )}
                     </div>
                </div>


                {sortedParticipants.length === 0 ? (
                    <p className="no-events-message">No participants found{filterType !== 'all' ? ' matching the filter' : ''}.</p> 
                ) : (
                    // Apply styles from the CSS Module for the table container
                    <div className={styles["participants-table-container"]}>
                        {/* Apply styles from the CSS Module for the table */}
                        <table className={styles["participants-table"]}>
                            <thead>
                                <tr>
                                    {/* Table headers, clickable for sorting - Keep cursor inline */}
                                    {/* The styles for padding, text-align, border-bottom etc. are in the module CSS */}
                                    <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                                        Name {renderSortIndicator('name')}
                                    </th>
                                     <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                                        Email {renderSortIndicator('email')}
                                    </th>
                                    <th onClick={() => handleSort('faculty')} style={{ cursor: 'pointer' }}>
                                        Faculty {renderSortIndicator('faculty')}
                                    </th>
                                     <th onClick={() => handleSort('course')} style={{ cursor: 'pointer' }}>
                                        Course {renderSortIndicator('course')}
                                    </th>
                                     <th onClick={() => handleSort('year')} style={{ cursor: 'pointer' }}>
                                        Year {renderSortIndicator('year')}
                                    </th>
                                    {/* Add other headers... */}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedParticipants.map(participant => (
                                    // Apply styles for table rows and cells in the module CSS
                                    <tr key={participant.id}>
                                        <td>{participant.name}</td>
                                        <td>{participant.email}</td>
                                        <td>{participant.faculty}</td>
                                        <td>{participant.course}</td>
                                        <td>{participant.year}</td>
                                        {/* Add other participant data cells... */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- Participants Demographics Section (with Charts) --- */}
            <div className="form-container">
                <h3>Participants Demographics</h3>
                {demographics && demographics.total > 0 ? (
                    <div className={styles["demographics-summary"]}>
                        <p><strong>Total Participants:</strong> {demographics.total}</p>

                        {/* --- Conditionally render charts only after mounted --- */}
                        {isMounted ? ( // <-- Render charts only if isMounted is true
                           <>
                                {/* --- Faculty Distribution Chart --- */}
                                <h4>Faculty:</h4>
                                <div style={{ width: '100%', height: 250 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={facultyChartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="count" fill="#8884d8" name="Number of Participants" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div style={{ height: 20 }}></div> {/* Spacing */}

                                {/* --- Course Distribution Chart --- */}
                                <h4>By Course:</h4>
                                <div style={{ width: '100%', height: 250 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={courseChartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="count" fill="#82ca9d" name="Number of Participants" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div style={{ height: 20 }}></div> {/* Spacing */}

                                {/* --- Year Distribution Chart --- */}
                                <h4>By Year:</h4>
                                <div style={{ width: '100%', height: 250 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={yearChartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="count" fill="#ffc658" name="Number of Participants" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                           </>
                        ) : (
                            // Optional: Render a placeholder while charts are not mounted
                            <div style={{ width: '100%', height: 250, backgroundColor: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                Loading Charts...
                            </div>
                        )}

                    </div>
                ) : demographics && demographics.total === 0 ? (
                     <div className={styles["demographics-summary"]}>
                          <p><strong>Total Participants:</strong> 0</p>
                          <p className="no-events-message">No participant data available to display demographics charts.</p>
                     </div>
                ) : (
                     <div className={styles["demographics-summary"]}>
                         <p>Calculating demographics...</p>
                     </div>
                )}
            </div>



        </div>
    );
}