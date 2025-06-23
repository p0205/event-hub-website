'use client';

import { useState, useEffect, use } from 'react';
import { 
    Calendar, 
    MapPin, 
    Clock, 
    Navigation, 
    Phone,
    ArrowLeft,
    AlertCircle,
    Mail
} from 'lucide-react';
import styles from './event.module.css';
import { useParams } from 'next/navigation';
import { EventDetails } from '@/types/event';
import { eventService } from '@/services';
import router from 'next/router';



const EventDetailsPage = () => {
    const params = useParams();
    const eventId = params.eventId;
    const [event, setEvent] = useState<EventDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAppDialog, setShowAppDialog] = useState(false);


    useEffect(() => {
        // Simulate API call
        const fetchEventDetails = async () => {
            setLoading(true);
            try {
               console.log(eventId);
                const response = await eventService.getEventDetails(Number(eventId));
               
                
                setEvent(response);
                console.log('Event loaded:', response); // Debug log
            } catch (err) {
                setError('Failed to load event details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [eventId]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (startDateTime: string, endDateTime: string) => {
        const start = new Date(startDateTime);
        const end = new Date(endDateTime);
        const startTime = start.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        const endTime = end.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        return `${startTime} - ${endTime}`;
    };

    const handleGetDirections = (venue: string) => {
        setShowAppDialog(true);
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}>
                        <div className={styles.spinner}></div>
                        <p>Loading event details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className={styles.container}>
                <div className={styles.errorContainer}>
                    <AlertCircle className={styles.errorIcon} />
                    <p className={styles.errorMessage}>
                        {error || 'Event not found'}
                    </p>
                    <button 
                        onClick={() => router.push('/public/calendar')}
                        className={styles.primaryAction}
                    >
                        <ArrowLeft className={styles.buttonIcon} />
                        Back to Calendar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Page Header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{event.eventName}</h1>
                
            </div>

            {/* Two-Column Layout */}
            <div className={styles.mainContent}>
                {/* Left Column - Main Content */}
                <div className={styles.leftColumn}>
                    {/* Event Details */}
                    <div className={styles.eventDetailsContainer}>
                        <p className={styles.eventDescription}>
                            {event.description}
                        </p>

                        {/* Sessions Section */}
                        {event.sessions.length > 0 && (
                            <div className={styles.sessionsSection}>
                                <h2 className={styles.sectionTitle}>Sessions</h2>
                                <div className={styles.sessionsList}>
                                    {event.sessions.map((session) => (
                                        <div key={session.id} className={styles.sessionCard}>
                                            <h3 className={styles.sessionTitle}>{session.sessionName}</h3>
                                            <div className={styles.sessionMeta}>
                                                <div className={styles.sessionMetaItem}>
                                                    <Calendar className={styles.metaIcon} />
                                                    <span>
                                                        {formatDate(session.startDateTime)}, {formatTime(session.startDateTime, session.endDateTime)}
                                                    </span>
                                                </div>
                                                <div className={styles.sessionMetaItem}>
                                                </div>
                                                {session.venues.map((venue) => (
                                                    <div key={venue.id} className={styles.venueItem}>
                                                    <MapPin className={styles.metaIcon} />
                                                    <span>{venue.name}</span>
                                                    <button 
                                                        className={styles.getDirectionsButton}
                                                        onClick={() => handleGetDirections(venue.id)}
                                                    >
                                                        <Navigation className={styles.buttonIcon} />
                                                        Get Directions
                                                    </button>
                                                 </div>
                                                ))}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Organizer Information */}
                    <div className={styles.organizerSection}>
                        <h2 className={styles.sectionTitle}>Organizer Information</h2>
                        <div className={styles.organizerInfo}>
                            <div className={styles.organizerItem}>
                                <span className={styles.organizerLabel}>Organizer:</span>
                                <span className={styles.organizerValue}>{event.organizerName}</span>
                            </div>
                            <div className={styles.organizerItem}>
                                <span className={styles.organizerLabel}>PIC:</span>
                                <span className={styles.organizerValue}>
                                    {event.picName|| 'Not available'}
                                    </span>
                            </div>
                            <div className={styles.organizerItem}>
                                <span className={styles.organizerLabel}>Phone:</span>
                                <span className={styles.organizerValue}>
                                    <Phone className={styles.metaIcon} />
                                    {event.picContact || 'Not available'}
                                </span>
                            </div>
                            <div className={styles.organizerItem}>
                                <span className={styles.organizerLabel}>Email:</span>
                                <span className={styles.organizerValue}>
                                    <Mail className={styles.metaIcon} />
                                    {event.picEmail || 'Not available'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* App Download Dialog */}
            {showAppDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" onClick={() => setShowAppDialog(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Download the FTMK Event Hub</h2>
                            <button onClick={() => setShowAppDialog(false)} aria-label="Close modal">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <img src="/app_download.png" alt="FTMK App QR Code" className="w-40 h-40 mx-auto mb-4" />
                        <p className="text-center mb-2">Scan this QR code to download the FTMK Event Hub Android App.</p>
                        <p className="text-center mb-4">
                            Can't scan? Download <a href="https://drive.google.com/uc?export=download&id=183yl-lWcoYxu3ko_UsMSNYLUBRwihIW3" className="text-amber-700 hover:text-amber-800 font-semibold underline">Here</a>
                        </p>
                        <ul className="mb-4 text-sm text-gray-700 list-disc list-inside">
                            <li>✔ View all events</li>
                            <li>✔ Manage your personal events</li>
                            <li>✔ Built-in navigation to event venues</li>
                        </ul>
                        
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerContentCentered}>
                    <div className={styles.footerLogoRow}>
                        <img src="/utemLogo.png" alt="UTeM Logo" className={styles.footerLogo} />
                        <img src="/ftmkLogo.png" alt="FTMK Logo" className={styles.footerLogo} />
                    </div>
                </div>

                <div className={styles.footerBottom}>
                    <p>&copy; 2025 FTMK Event Hub. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default EventDetailsPage;
