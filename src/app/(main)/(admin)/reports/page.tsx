'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, BarChart3, DollarSign, TrendingUp, ChevronDown, Download, Search, Building2 } from 'lucide-react';
import venueService from '@/services/venueService';
import adminService from '@/services/adminService';
import { Venue } from '@/types/event';
import styles from './report.module.css';

// Define types
interface ReportType {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    available: boolean;
    requiresVenueSelection: boolean;
    requiresDateRange: boolean;
    category: string;
    estimatedTime?: string;
}

// Report types with their configurations
const reportTypes: ReportType[] = [
    {
        id: 'venue-utilization',
        name: 'Venue Utilization Analytics',
        description: 'Comprehensive analysis of space utilization patterns for strategic facility management.',
        icon: BarChart3,
        available: true,
        requiresVenueSelection: true,
        requiresDateRange: true,
        category: 'Operations'
    },
    {
        id: 'event-type-performance',
        name: 'Event Type Performance',
        description: 'Insightful analysis of event types by participation, attendance, and engagement to support strategic planning and future event design.',
        icon: TrendingUp,
        available: true,
        requiresVenueSelection: false,
        requiresDateRange: true,
        category: 'Analytics'
    },
    {
        id: 'budget-analysis',
        name: 'Financial Performance Dashboard',
        description: 'Executive-level financial analysis including budget utilization, cost optimization opportunities, ROI metrics, and variance analysis for informed fiscal decisions.',
        icon: DollarSign,
        available: false,
        requiresVenueSelection: false,
        requiresDateRange: true,
        category: 'Financial'
    },
   
];

export default function AdminReportPage() {
    // Format current date to YYYY-MM-DD
    const getCurrentDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // State management
    const [selectedReportType, setSelectedReportType] = useState<string>('');
    const [selectedVenues, setSelectedVenues] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [customStartDate, setCustomStartDate] = useState<string>(getCurrentDate());
    const [customEndDate, setCustomEndDate] = useState<string>(getCurrentDate());

    const [expandedReportType, setExpandedReportType] = useState<string>('');
    const [venueSearchQuery, setVenueSearchQuery] = useState<string>('');

    // Fetch venues when component mounts
    useEffect(() => {
        const fetchVenues = async () => {
            try {
                setError(null);
                const fetchedVenues = await venueService.fetchVenues();
                setVenues(fetchedVenues);
            } catch (error) {
                console.error('Failed to fetch venues:', error);
                setError('Failed to load venues. Please try again later.');
            }
        };

        fetchVenues();
    }, []);

    // Handle venue selection
    const handleVenueSelection = (venueId: string) => {
        if (selectedVenues.includes(venueId)) {
            setSelectedVenues(selectedVenues.filter(id => id !== venueId));
        } else {
            setSelectedVenues([...selectedVenues, venueId]);
        }
    };

    // Handle select all venues
    const handleSelectAllVenues = () => {
        if (selectedVenues.length === venues.length) {
            setSelectedVenues([]);
        } else {
            setSelectedVenues(venues.map(venue => venue.id));
        }
    };

    // Handle report generation
    const handleGenerateReport = async () => {
        console.log('Generate button clicked');
        console.log('Selected Report Type:', selectedReportType);
        console.log('Start Date:', customStartDate);
        console.log('End Date:', customEndDate);
        console.log('Selected Venues:', selectedVenues);

        if (!selectedReportType) {
            console.log('No report type selected');
            return;
        }

        const reportType = reportTypes.find(type => type.id === selectedReportType);
        if (!reportType || !reportType.available) {
            console.log('Report type not found or not available');
            return;
        }

        // Validate dates
        if (!customStartDate || !customEndDate) {
            console.log('Dates missing');
            setError('Please select both start and end dates');
            return;
        }

        // Validate date range is at least one month
        const startDate = new Date(customStartDate);
        const endDate = new Date(customEndDate);
        const oneMonthInMs = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        const dateRangeInMs = endDate.getTime() - startDate.getTime();

        if (dateRangeInMs < oneMonthInMs) {
            setError('Please select a date range of at least one month');
            return;
        }

        try {
            console.log('Starting report generation...');
            setIsGenerating(true);
            setError(null);

            // Format dates to include time
            const formatDateTime = (dateStr: string) => {
                const date = new Date(dateStr);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}`;
            };

            let report;
            let filename;
            if (selectedReportType === 'event-type-performance') {
                report = await adminService.generateEventTypePerformanceReport(
                    formatDateTime(customStartDate),
                    formatDateTime(customEndDate)
                );
                filename = 'event_type_performance_report.pdf';
            } else {
                const request = {
                    startDateTime: formatDateTime(customStartDate),
                    endDateTime: formatDateTime(customEndDate),
                    venueIds: selectedVenues.map(id => parseInt(id))
                };
                console.log('Request payload:', request);
                report = await adminService.generateVenueUtilizationReport(request);
                filename = `${reportType.name.toLowerCase().replace(/\s+/g, '_')}_report.pdf`;
            }
            console.log('Report generated successfully');

            // Create download link
            const url = window.URL.createObjectURL(report);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error generating report:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    // Get filtered venues based on search
    const getFilteredVenues = () => {
        return venues.filter(venue => 
            venue.name.toLowerCase().includes(venueSearchQuery.toLowerCase()) ||
            venue.fullName.toLowerCase().includes(venueSearchQuery.toLowerCase())
        );
    };

    // Get selected date range label
    const getSelectedDateRangeLabel = () => {
        if (!customStartDate || !customEndDate) return ' - ';
        
        const formatDate = (dateStr: string) => {
            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        return `${formatDate(customStartDate)} - ${formatDate(customEndDate)}`;
    };

    return (
        <div  className={styles.pageContainer}>
            <div >
                <div className={styles.container}>
                    {/* Header Section */}
                    <div className={styles.header}>
                        <div className="flex justify-between items-center mb-6">
                        
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Report Generation</h1>
                            </div>
                        </div>
                    </div>

                    {/* Report Types Section */}
                    <div className={styles.mainCard}>
                        <div className={styles.cardContent}>
                            <div className={styles.cardSpacing}>
                                {reportTypes.map((type) => (
                                    <div 
                                        key={type.id} 
                                        className={`
                                            ${styles.reportTypeCard}
                                            ${expandedReportType === type.id ? styles.reportTypeCardExpanded : styles.reportTypeCardHover}
                                            ${!type.available ? styles.reportTypeCardDisabled : ''}
                                        `}
                                    >
                                        <button
                                            onClick={() => {
                                                setExpandedReportType(expandedReportType === type.id ? '' : type.id);
                                                setSelectedReportType(type.id);
                                            }}
                                            className={styles.reportTypeButton}
                                        >
                                            <div className={styles.reportTypeButtonContent}>
                                                <div className={`
                                                    ${styles.reportTypeIcon}
                                                    ${type.available ? styles.reportTypeIconActive : styles.reportTypeIconInactive}
                                                `}>
                                                    <type.icon className={styles.reportTypeIconSvg} />
                                                </div>
                                                <div className={styles.reportTypeContent}>
                                                    <div className={styles.reportTypeHeader}>
                                                        <h3 className={styles.reportTypeTitle}>{type.name}</h3>
                                                    </div>
                                                    <div className={styles.reportTypeDescription}>
                                                        <p>{type.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronDown className={`
                                                ${styles.chevronIcon}
                                                ${expandedReportType === type.id ? styles.chevronIconRotated : ''}
                                            `} />
                                        </button>

                                        {/* Expanded Configuration Panel */}
                                        {expandedReportType === type.id && (
                                            <div className={styles.expandedPanel}>
                                                <div className={styles.expandedPanelContent}>
                                                    {type.available ? (
                                                        <>
                                                            {/* Date Range Selection */}
                                                            {type.requiresDateRange && (
                                                                <div>
                                                                    <div className={styles.sectionHeader}>
                                                                        <Calendar className={styles.sectionHeaderIcon} />
                                                                        <h4 className={styles.sectionHeaderTitle}>Date Range</h4>
                                                                    </div>
                                                                    <div className={styles.formContainer}>
                                                                        <div className={styles.formGrid}>
                                                                            <div className={styles.formGroup}>
                                                                                <label className={styles.formLabel}>
                                                                                    Start Date
                                                                                </label>
                                                                                <input
                                                                                    type="date"
                                                                                    value={customStartDate}
                                                                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                                                                    className={styles.formInput}
                                                                                />
                                                                            </div>
                                                                            <div className={styles.formGroup}>
                                                                                <label className={styles.formLabel}>
                                                                                    End Date
                                                                                </label>
                                                                                <input
                                                                                    type="date"
                                                                                    value={customEndDate}
                                                                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                                                                    className={styles.formInput}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Venue Selection */}
                                                            {type.requiresVenueSelection && (
                                                                <div>
                                                                    <div className={styles.sectionHeader}>
                                                                        <Building2 className={styles.sectionHeaderIcon} />
                                                                        <h4 className={styles.sectionHeaderTitle}>Venue Selection</h4>
                                                                    </div>
                                                                    
                                                                    <div className={styles.venueContainer}>
                                                                        {/* Select All Header */}
                                                                        <div className={styles.selectAllHeader}>
                                                                            <label className={styles.selectAllLabel}>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={selectedVenues.length === venues.length}
                                                                                    onChange={handleSelectAllVenues}
                                                                                    className={styles.venueCheckbox}
                                                                                />
                                                                                <span className={styles.selectAllText}>Select All Venues</span>
                                                                            </label>
                                                                        </div>

                                                                        {/* Venue Search */}
                                                                        <div className={styles.venueSearch}>
                                                                            <div className={styles.venueSearchInput}>
                                                                                <Search className={styles.venueSearchIcon} />
                                                                                <input
                                                                                    type="text"
                                                                                    value={venueSearchQuery}
                                                                                    onChange={(e) => setVenueSearchQuery(e.target.value)}
                                                                                    placeholder="Search venues by name"
                                                                                    className={styles.venueSearchField}
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        {/* Venue List */}
                                                                        <div className={styles.venueList}>
                                                                            {getFilteredVenues().length === 0 ? (
                                                                                <div className={styles.venueListEmpty}>
                                                                                    No venues found matching &quot;{venueSearchQuery}&quot;
                                                                                </div>
                                                                            ) : (
                                                                                getFilteredVenues().map((venue, index) => (
                                                                                    <div
                                                                                        key={venue.id}
                                                                                        className={`
                                                                                            ${styles.venueItem}
                                                                                            ${index !== getFilteredVenues().length - 1 ? styles.venueItemBorder : ''}
                                                                                        `}
                                                                                        onClick={() => handleVenueSelection(venue.id)}
                                                                                    >
                                                                                        <label className={styles.venueLabel}>
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={selectedVenues.includes(venue.id)}
                                                                                                onChange={() => handleVenueSelection(venue.id)}
                                                                                                className={styles.venueCheckbox}
                                                                                            />
                                                                                            <div className={styles.venueInfo}>
                                                                                                <div className={styles.venueName}>{venue.name}</div>
                                                                                                <div className={styles.venueDetails}>
                                                                                                    <span>{venue.fullName}</span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </label>
                                                                                    </div>
                                                                                ))
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Generate Button */}
                                                            <div className={styles.generateSection}>
                                                                <div className={styles.summarySection}>
                                                                    <div className={styles.summaryContent}>
                                                                        <div className={styles.summaryTitle}>Report Configuration Summary:</div>
                                                                        <div className={styles.summaryList}>
                                                                            <div>• Period: {getSelectedDateRangeLabel()}</div>
                                                                            {type.requiresVenueSelection && (
                                                                                <div>• Venues: {selectedVenues.length === 0 ? 'None selected' : 
                                                                                    selectedVenues.length === venues.length ? 'All venues' : 
                                                                                    `${selectedVenues.length} selected`}</div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                <button
                                                                    onClick={handleGenerateReport}
                                                                    disabled={isGenerating || (type.requiresVenueSelection && selectedVenues.length === 0)}
                                                                    className={styles.generateButton}
                                                                >
                                                                    {isGenerating ? (
                                                                        <>
                                                                            <div className={styles.loadingSpinner}></div>
                                                                            <span className={styles.buttonMainText}>Generating Report...</span>
                                                                            <div className={styles.buttonSubText}>Please wait</div>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Download className={styles.buttonIcon} />
                                                                            <span className={styles.buttonMainText}>Generate Report</span>
                                                                            <div className={styles.buttonSubText}>PDF Format</div>
                                                                        </>
                                                                    )}
                                                                </button>
                                                                {error && (
                                                                    <div className={styles.errorMessage}>
                                                                        {error}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className={styles.unavailableState}>
                                                            <p className={styles.unavailableText}>This report type is not yet available.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={styles.footer}>
                        <p>Reports are generated in real-time</p>
                    </div>
                </div>
            </div>
        </div>
    );
}