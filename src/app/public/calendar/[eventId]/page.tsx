'use client';

import { useState, useEffect } from 'react';
import { 
    Calendar, 
    MapPin, 
    Navigation, 
    Phone,
    ArrowLeft,
    AlertCircle,
    Mail
} from 'lucide-react';
import Image from 'next/image';
import styles from './event.module.css';
import { useParams, useRouter } from 'next/navigation';
import { EventDetails, SimpleVenueDTO } from '@/types/event';
import { eventService } from '@/services';

const EventDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
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
            } catch (error: unknown) {
                console.error('Error fetching event details:', error);
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

    const isAndroid = () => {
        if (typeof window === 'undefined') return false;
        return /Android/i.test(navigator.userAgent);
    };

    const isIOS = () => {
        if (typeof window === 'undefined') return false;
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    };

    const isMobile = () => {
        if (typeof window === 'undefined') return false;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    const tryOpenApp = (venueData: SimpleVenueDTO) => {
        return new Promise((resolve) => {
            // Create the simplified deep link URL with only venue information
            const deepLinkUrl = `ftmkeventhub://navigate?venue=${encodeURIComponent(venueData.name)}`;
            console.log('Attempting to open app with URL:', deepLinkUrl); // Debug log
            // Create a hidden iframe to attempt opening the app
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = deepLinkUrl;
            document.body.appendChild(iframe);

            // Set a timeout to check if the app opened
            const timeout = setTimeout(() => {
                document.body.removeChild(iframe);
                resolve(false); // App not installed
            }, 2500);

            // If the page loses focus quickly, it likely means the app opened
            const handleVisibilityChange = () => {
                if (document.hidden) {
                    clearTimeout(timeout);
                    document.body.removeChild(iframe);
                    document.removeEventListener('visibilitychange', handleVisibilityChange);
                    resolve(true); // App opened
                }
            };

            document.addEventListener('visibilitychange', handleVisibilityChange);

            // Fallback: if page loses focus (blur), app likely opened
            const handleBlur = () => {
                setTimeout(() => {
                    clearTimeout(timeout);
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                    }
                    window.removeEventListener('blur', handleBlur);
                    document.removeEventListener('visibilitychange', handleVisibilityChange);
                    resolve(true); // App opened
                }, 500);
            };

            window.addEventListener('blur', handleBlur);
        });
    };

    const handleGetDirections = async (venue: SimpleVenueDTO) => {
        // For desktop/laptop or iOS, always show dialog
        if (!isMobile() || isIOS()) {
            setShowAppDialog(true);
            return;
        }

        // For Android devices, try to open the app first
        if (isAndroid()) {
            try {
                const appOpened = await tryOpenApp(venue);
                
                // If app didn't open (not installed), show the dialog
                if (!appOpened) {
                    setShowAppDialog(true);
                }
            } catch (error) {
                console.error('Error trying to open app:', error);
                // Fallback to showing dialog
                setShowAppDialog(true);
            }
        } else {
            // For other mobile devices, show dialog
            setShowAppDialog(true);
        }
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
                                                        onClick={() => handleGetDirections(venue)}
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
                        <Image src="/app_download.png" alt="FTMK App QR Code" width={160} height={160} className="w-40 h-40 mx-auto mb-4" />
                        <p className="text-center mb-2">
                            {isAndroid() ? 
                                "App not installed. Scan this QR code to download the FTMK Event Hub Android App." :
                                "Scan this QR code to download the FTMK Event Hub Android App."
                            }
                        </p>
                        <p className="text-center mb-4">
                            Can&apos;t scan? Download <a href="https://drive.usercontent.google.com/download?id=1zex2qPopso1pSacWvdUOFQ4eo31ymc1t&export=download&authuser=0" className="text-amber-700 hover:text-amber-800 font-semibold underline">Here</a>
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
                        <Image src="/utemLogo.png" alt="UTeM Logo" width={120} height={40} className={styles.footerLogo} />
                        <Image src="/ftmkLogo.png" alt="FTMK Logo" width={120} height={40} className={styles.footerLogo} />
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