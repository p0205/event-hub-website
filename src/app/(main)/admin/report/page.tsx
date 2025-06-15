'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Calendar, MapPin, BarChart3, Users, DollarSign, TrendingUp, ChevronDown, Download, Filter, Search, Clock, Building2, TrendingDown } from 'lucide-react';
import venueService from '@/services/venueService';
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

// Remove the predefined date ranges
const dateRanges = [
    { label: 'Custom Range', value: 'custom' },
];

// Report types with their configurations
const reportTypes: ReportType[] = [
    {
        id: 'venue-utilization',
        name: 'Venue Utilization Analytics',
        description: 'Comprehensive analysis of space utilization patterns, occupancy rates, peak usage hours, and optimization recommendations for strategic facility management.',
        icon: BarChart3,
        available: true,
        requiresVenueSelection: true,
        requiresDateRange: true,
        category: 'Operations'
    },
    {
        id: 'event-attendance',
        name: 'Event Attendance Intelligence',
        description: 'Advanced analytics on event participation trends, attendance forecasting, and engagement metrics to drive strategic event planning decisions.',
        icon: Users,
        available: false,
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
    {
        id: 'participant-demographics',
        name: 'Stakeholder Demographics Report',
        description: 'Strategic insights into participant demographics, engagement patterns, satisfaction metrics, and behavioral analytics for enhanced decision-making.',
        icon: TrendingUp,
        available: false,
        requiresVenueSelection: false,
        requiresDateRange: true,
        category: 'Analytics'
    }
];

const categoryColors = {
    'Operations': 'bg-blue-50 text-blue-700 border-blue-200',
    'Analytics': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Financial': 'bg-amber-50 text-amber-700 border-amber-200'
};

export default function AdminReportPage() {
    // State management
    const [selectedReportType, setSelectedReportType] = useState<string>('venue-utilization');
    const [selectedDateRange, setSelectedDateRange] = useState<string>('3months');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [selectedVenues, setSelectedVenues] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isLoadingVenues, setIsLoadingVenues] = useState<boolean>(true);
    const [venueError, setVenueError] = useState<string | null>(null);

    const [expandedReportType, setExpandedReportType] = useState<string>('venue-utilization');
    const [venueSearchQuery, setVenueSearchQuery] = useState<string>('');

    // Get current report type configuration
    const currentReportConfig = reportTypes.find(type => type.id === selectedReportType);

    // Fetch venues when component mounts
    useEffect(() => {
        const fetchVenues = async () => {
            try {
                setIsLoadingVenues(true);
                setVenueError(null);
                const fetchedVenues = await venueService.fetchVenues();
                setVenues(fetchedVenues);
            } catch (error) {
                console.error('Failed to fetch venues:', error);
                setVenueError('Failed to load venues. Please try again later.');
            } finally {
                setIsLoadingVenues(false);
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

    // Generate report
    const handleGenerateReport = async () => {
        if (!currentReportConfig?.available) {
            return;
        }

        setIsGenerating(true);
        
        // Simulate report generation
        setTimeout(() => {
            setIsGenerating(false);
            alert('Report generated successfully! Opening in new tab...');
        }, 3000);
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
        return 'Custom Range';
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                <div className={styles.maxWidth}>
                    {/* Header Section */}
                    <div className={styles.header}>
                        <div className={styles.headerContent}>
                            <div className={styles.headerIcon}>
                                <FileText className={styles.headerIconSvg} />
                            </div>
                            <div>
                                <h1 className={styles.headerTitle}>Report Generation</h1>
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
                                                    <p className={styles.reportTypeDescription}>{type.description}</p>
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
                                                                                    No venues found matching "{venueSearchQuery}"
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