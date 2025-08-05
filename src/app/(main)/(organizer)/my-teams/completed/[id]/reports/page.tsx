// src/app/organizer/my-events/completed/reports/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './reports.module.css'; // Create this CSS module
import { EventReportOverview } from '@/types/event';
import eventReportService from '@/services/eventReportService';
import { formatDate } from '@/helpers/eventHelpers';

export default function EventReportsPage() {

    const params = useParams();
    const eventId = params.id as string; // eventId will be a string, convert to number for service calls
    const router = useRouter();

    const [reportOverview, setReportOverview] = useState<EventReportOverview>();
    const [loading, setLoading] = useState(true); // Changed to true for initial loading
    const [error, setError] = useState<string | null>(null);
    const [showAllComments, setShowAllComments] = useState(true);
    const [showLatestComments, setShowLatestComments] = useState(false);
    const [latestCommentsCount, setLatestCommentsCount] = useState(5);
    const [showDetails, setShowDetails] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    // --- Data Loading ---
    const loadEventReportOverview = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await eventReportService.getEventReportOverview(Number(eventId));
            setReportOverview(data);
            console.log("Event Report Overview loaded:", data);
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Unknown error';
            console.error("Error loading budget data:", errorMessage);
            setError(`Failed to load report overview data: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        loadEventReportOverview();
    }, [loadEventReportOverview]);

    const handleGenerateFeedbackReport = async () => {
        setIsGeneratingReport(true);
        setError(null);
        try {
            const commentsLimit = showLatestComments ? latestCommentsCount : undefined;
            const pdfBlob = await eventReportService.generateFeedbackReport(Number(eventId), commentsLimit);

            // Create a URL for the blob and open in new tab
            const url = window.URL.createObjectURL(pdfBlob);
            window.open(url, '_blank');
            // Clean up the URL object after a short delay to ensure the tab has opened
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 1000);
        } catch (e: unknown) {
            console.error("Error generating feedback report:", e);
            setError(`Failed to generate feedback report: ${e || 'Unknown error'}`);
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const handleCommentOptionChange = (option: 'all' | 'latest') => {
        if (option === 'all') {
            setShowAllComments(true);
            setShowLatestComments(false);
        } else {
            setShowAllComments(false);
            setShowLatestComments(true);
        }
    };

    const renderStarRating = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <div className={styles["star-rating"]}>
                {'★'.repeat(fullStars)}
                {hasHalfStar && '☆'}
                {'☆'.repeat(emptyStars)}
            </div>
        );
    };

    // --- Loading State ---
    if (loading) {
        return (
            <div className="page-content-wrapper">
                <div className='page-header'>
                    <div className='page-title-section'>
                        <h2>Event Reports</h2>
                        <p className={'page-subtitle'}>
                            View and generate comprehensive event reports
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading event reports...</p>
                    </div>
                </div>
            </div>
        );
    }

    // --- Error State ---
    if (error) {
        return (
            <div className="page-content-wrapper">
                <div className='page-header'>
                    <div className='page-title-section'>
                        <h2>Event Reports</h2>
                        <p className={'page-subtitle'}>
                            View and generate comprehensive event reports
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Reports</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button 
                            onClick={loadEventReportOverview}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- No Data State ---
    if (!reportOverview) {
        return (
            <div className="page-content-wrapper">
                <div className='page-header'>
                    <div className='page-title-section'>
                        <h2>Event Reports</h2>
                        <p className={'page-subtitle'}>
                            View and generate comprehensive event reports
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="text-gray-400 text-6xl mb-4">📊</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Reports Available</h3>
                        <p className="text-gray-600">No report data found for this event.</p>
                    </div>
                </div>
            </div>
        );
    }

    // --- Main Content ---
    return (
        <div className={styles["page-container"]}>

            <h1>{reportOverview?.eventName}</h1>
            {/* <p className={styles["event-subtitle"]}>{"Sample Event"} - {"Sample Event End Date"}</p> */}

            <div className={styles["reports-container"]}>
                {/* Attendance Report Card */}
                <div className={styles["report-card"]}>
                    <div className={styles["report-header"]}>
                        <h2>📊 Attendance Report</h2>
                        <span className={`${styles["status-badge"]} ${styles["status-generated"]}`}>
                            Generated on {formatDate(reportOverview?.attendance.attendanceReport.generatedAt)}
                        </span>
                    </div>

                    <div className={styles["report-content"]}>
                        {/* Session Attendance Details */}
                        <div className={styles["session-list"]}>
                            <h3>Session Attendance</h3>
                            {reportOverview?.attendance.sessionAttendances?.map((session, index) => (
                                <div key={index} className={styles["session-item"]}>
                                    <div className={styles["session-name"]}><strong>{session.sessionName}</strong></div>
                                    <div className={styles["session-detail"]}>
                                        <span>Total Attendees: {session.totalAttendees}</span> &nbsp;|&nbsp;
                                        <span>Attendance Rate: {session.sessionAttendanceRate.toFixed(2)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <a
                            href={reportOverview?.attendance.attendanceReport.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                        >
                            <button className={`${styles["download-btn"]} button-primary`}>
                                Download PDF Report
                            </button>
                        </a>
                    </div>
                </div>



                {/* Budget Report Card */}
                <div className={styles["report-card"]}>
                    <div className={styles["report-header"]}>
                        <h2>💰 Budget Report</h2>
                        <span className={`${styles["status-badge"]} ${styles["status-generated"]}`}>
                            Generated on {formatDate(reportOverview?.budget.budgetReport.generatedAt)}
                        </span>
                    </div>
                    <div className={styles["report-content"]}>
                        <div className={styles["report-summary"]}>
                            <div className={styles["summary-item"]}>
                                <span className={styles["summary-label"]}>Total Budget</span>
                                <span className={styles["summary-value"]}>RM {reportOverview?.budget.totalBudget.toLocaleString()}</span>
                            </div>
                            <div className={styles["summary-item"]}>
                                <span className={styles["summary-label"]}>Total Expenses</span>
                                <span className={styles["summary-value"]}>RM {reportOverview?.budget.totalExpenses.toLocaleString()}</span>
                            </div>
                            <div className={styles["summary-item"]}>
                                <span className={styles["summary-label"]}>Remaining</span>
                                <span className={styles["summary-value"]}>RM {reportOverview?.budget.remaining.toLocaleString()}</span>
                            </div>
                        </div>

                        <a
                            href={reportOverview?.budget.budgetReport.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                        >
                            <button className={`${styles["download-btn"]} button-primary`}>
                                Download PDF Report
                            </button>
                        </a>

                    </div>
                </div>

                {/* Feedback Report Card */}
                <div className={`${styles["report-card"]} ${styles["feedback-report-card"]}`}>
                    <div className={styles["report-header"]}>
                        <h2>💬 Feedback Report</h2>

                        <span className={`${styles["status-badge"]} ${styles["status-pending"]}`}>
                            Ready to Generate
                        </span>

                    </div>

                    {/* Simple Rating Display */}
                    <div className={styles["report-content"]}>
                        <div className={styles["report-summary"]}>
                            <div className={styles["summary-item"]}>
                                <span className={styles["summary-label"]}>Overall Rating</span>
                                <span className={styles["summary-value"]}>{reportOverview?.feedback.averageRating.toFixed(2)}/5</span>
                            </div>
                            <div className={styles["summary-item"]}>
                                <span className={styles["summary-label"]}>Total Feedback</span>
                                <span className={styles["summary-value"]}>{reportOverview?.feedback.feedbackCount}</span>
                            </div>
                        </div>


                        <button
                            className={`${styles["download-btn"]} button-primary`}
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            Generate Report
                        </button>

                    </div>

                    {/* Detailed Section - Shows after Generate Report is clicked */}
                    {showDetails && (
                        <>
                            {/* Event Summary */}
                            <div className={styles["feedback-summary"]}>
                                <h3>Feedback Summary</h3>
                                <div className={styles["rating-overview"]}>
                                    <div className={styles["average-rating"]}>
                                        <span className={styles["rating-number"]}>{reportOverview?.feedback.averageRating.toFixed(2)}</span>
                                        {renderStarRating(reportOverview?.feedback.averageRating ?? 0)}
                                        <span className={styles["total-feedback"]}>({reportOverview?.feedback.feedbackCount} feedback entries)</span>
                                    </div>
                                    <div className={styles["rating-breakdown"]}>
                                        {Object.entries(reportOverview?.feedback.ratings ?? {})
                                            .sort(([a], [b]) => parseInt(b) - parseInt(a))
                                            .map(([rating, count]) => (
                                                <div key={rating} className={styles["rating-item"]}>
                                                    <span className={styles["rating-stars"]}>{'★'.repeat(parseInt(rating))}</span>
                                                    <span className={styles["rating-count"]}>{count.toString()}</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>

                            {/* Informational Banner */}
                            <div className={styles["info-banner"]}>
                                <span className={styles["info-icon"]}>ℹ️</span>
                                <span>Note: The customization below affects only the displayed comments. The overall rating summary is calculated from all feedback submissions.</span>
                            </div>

                            {/* Comment Customization Panel */}

                            <div className={styles["customization-panel"]}>
                                <h3>Comment Selection</h3>

                                {/* Comment Selection Options */}
                                <div className={styles["comment-options"]}>

                                    <div className={styles["option-group"]}>
                                        <label className={styles["checkbox-label"]}>
                                            <input
                                                type="checkbox"
                                                checked={showAllComments}
                                                onChange={() => handleCommentOptionChange('all')}
                                            />
                                            <span>Show all comments</span>
                                        </label>
                                    </div>
                                    <div className={styles["option-group"]}>
                                        <label className={styles["checkbox-label"]}>
                                            <input
                                                type="checkbox"
                                                checked={showLatestComments}
                                                onChange={() => handleCommentOptionChange('latest')}
                                            />
                                            <span>Show the latest</span>
                                            <input
                                                type="number"
                                                className={styles["inline-number-input"]}
                                                value={latestCommentsCount}
                                                onChange={(e) => setLatestCommentsCount(parseInt(e.target.value) || 0)}
                                                min="1"
                                                max="50"
                                                disabled={!showLatestComments}
                                            />
                                            <span>comments per rating</span>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    className={`${styles["download-btn"]} button-primary`}
                                    onClick={handleGenerateFeedbackReport}
                                    disabled={isGeneratingReport}
                                >
                                    {isGeneratingReport ? 'Generating...' : 'Generate Report'}
                                </button>


                            </div>
                        </>
                    )}
                </div>


                {/* Budget Report Card */}
                <div className={styles["report-card"]}>
                    <div className={styles["report-header"]}>
                        <h2>🤖 AI-generated Post Event Article</h2>

                    </div>
                    <div className={styles["report-content"]}>
                        <div className={styles["report-summary"]}>
                            <p>Generate a comprehensive post-event article using AI. You can review and edit the article for your event bulletin or report.</p>

                        </div>
                        <a
                           
                            onClick={() => router.push(`/my-events/completed/${params.id}/reports/post-event-article`)}
                        >
                            <button className={`${styles["download-btn"]} button-primary`}>
                                Generate Article
                            </button>
                        </a>


                    </div>
                </div>



            </div>
            {/* AI-generated Post Event Article Card */}
        </div>



    );
}