'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Search, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import styles from './calendar.module.css';
import { CalendarEvent, EventType } from '@/types/event';
import eventService from '@/services/eventService';
import { useRouter } from 'next/navigation';

interface Event {
    eventId: number;
    eventName: string;
    eventType?: string;
    sessionId: number;
    sessionName: string;
    startDateTime: string;
    endDateTime: string;
    venueNames: string;
    description: string;
}

const CalendarPage = () => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [filterType, setFilterType] = useState<string>('all');
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
    const [showDateModal, setShowDateModal] = useState(false);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [eventsCache, setEventsCache] = useState<Map<string, CalendarEvent[]>>(new Map());
    const [selectedDateForEvents, setSelectedDateForEvents] = useState<Date>(new Date());
    const router = useRouter();

    // Fetch events for the current month
    const fetchEventsForMonth = async (month: Date) => {
        const year = month.getFullYear();
        const monthNum = month.getMonth();
        
        // Create cache key for this month
        const cacheKey = `${year}-${monthNum}`;
        
        // Check if events are already cached
        if (eventsCache.has(cacheKey)) {
            setEvents(eventsCache.get(cacheKey) || []);
            return;
        }

        setLoading(true);
        try {
            // Calculate first and last day of the month
            const firstDay = new Date(year, monthNum, 1);
            const lastDay = new Date(year, monthNum + 1, 0);
            
            // Format dates for API - remove timezone info and format as LocalDateTime
            const startDateTime = firstDay.getFullYear() + '-' + 
                String(firstDay.getMonth() + 1).padStart(2, '0') + '-' + 
                String(firstDay.getDate()).padStart(2, '0') + 'T00:00:00';
            
            const endDateTime = lastDay.getFullYear() + '-' + 
                String(lastDay.getMonth() + 1).padStart(2, '0') + '-' + 
                String(lastDay.getDate()).padStart(2, '0') + 'T23:59:59';
            
            console.log(`Fetching events for ${year}-${monthNum + 1}:`, { startDateTime, endDateTime });
            
            const monthEvents = await eventService.getAllCalendarEventsByMonth(startDateTime, endDateTime);
            
            // Cache the events
            setEventsCache(prev => new Map(prev).set(cacheKey, monthEvents));
            setEvents(monthEvents);
            
            console.log(`Fetched ${monthEvents.length} events for ${year}-${monthNum + 1}`);
        } catch (error) {
            console.error('Error fetching events:', error);
            // Fallback to empty array if API fails
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch events when month changes
    useEffect(() => {
        fetchEventsForMonth(currentMonth);
    
    }, [currentMonth]);
   

    const getTodayEvents = () => {
        const today = new Date();
        const todayString = today.getFullYear() + '-' +
            String(today.getMonth() + 1).padStart(2, '0') + '-' +
            String(today.getDate()).padStart(2, '0');
        return events.filter(event => event.startDateTime.split('T')[0] === todayString);
    };

    const getUpcomingEvents = () => {
        const today = new Date();
        return events
            .filter(event => new Date(event.startDateTime) > today)
            .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
            .slice(0, 5);
    };

    const getFilteredEvents = () => {
        return events.filter(event => {
            const matchesType = filterType === 'all' || 
                (event.eventType && event.eventType.toLowerCase() === filterType.toLowerCase());
            const matchesKeyword = searchKeyword === '' || 
                event.eventName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                event.sessionName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                event.description?.toLowerCase().includes(searchKeyword.toLowerCase());
            return matchesType && matchesKeyword;
        });
    };

    const getEventsForDate = (date: Date) => {
        const dateString = date.getFullYear() + '-' +
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0');
        return events.filter(event => event.startDateTime.split('T')[0] === dateString);
    };

    const handleDateClick = (date: Date) => {
        setSelectedDateForEvents(date);
    };

    const handleDateModalClick = (date: Date) => {
        const dateEvents = getEventsForDate(date);
        setSelectedDateEvents(dateEvents);
        setSelectedDate(date);
        setShowDateModal(true);
    };

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

    const getEventTypeColor = (eventType: string) => {
        switch (eventType?.toUpperCase()) {
            case EventType.TALK:
                return '#3b82f6'; // Blue for talks
            case EventType.SEMINAR:
                return '#8b5cf6'; // Purple for seminars
            case EventType.WORKSHOP:
                return '#f59e0b'; // Orange for workshops
            case EventType.CONFERENCE:
                return '#ef4444'; // Red for conferences
            case EventType.SYMPOSIUM:
                return '#06b6d4'; // Cyan for symposiums
            case EventType.HACKATHON:
                return '#10b981'; // Green for hackathons
            case EventType.CODE_CHALLENGE:
                return '#6366f1'; // Indigo for code challenges
            case EventType.INNOVATION_PITCH:
                return '#ec4899'; // Pink for innovation pitches
            case EventType.BOOTCAMP:
                return '#f97316'; // Orange for bootcamps
            case EventType.CAREER_TALK:
                return '#059669'; // Emerald for career talks
            case EventType.SOFT_SKILLS_TRAINING:
                return '#7c3aed'; // Violet for soft skills
            case EventType.STUDENT_FORUM:
                return '#dc2626'; // Red for student forums
            case EventType.CLUB_MEETING:
                return '#0891b2'; // Sky blue for club meetings
            case EventType.INDUSTRY_VISIT:
                return '#65a30d'; // Lime for industry visits
            case EventType.COMPANY_SHOWCASE:
                return '#be185d'; // Rose for company showcases
            case EventType.NETWORKING_EVENT:
                return '#9333ea'; // Purple for networking
            case EventType.COMPETITION:
                return '#ea580c'; // Orange for competitions
            case EventType.EXHIBITION:
                return '#16a34a'; // Green for exhibitions
            case EventType.FESTIVAL:
                return '#eab308'; // Yellow for festivals
            case EventType.CULTURAL_EVENT:
                return '#db2777'; // Pink for cultural events
            default:
                return '#6b7280'; // Gray default
        }
    };

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const calendarDays = [];
        const today = new Date();

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const isCurrentMonth = date.getMonth() === month;
            const isToday = date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
            const isSelected = date.getDate() === selectedDateForEvents.getDate() &&
                date.getMonth() === selectedDateForEvents.getMonth() &&
                date.getFullYear() === selectedDateForEvents.getFullYear();
            const dateEvents = getEventsForDate(date);

            calendarDays.push(
                <div
                    key={i}
                    className={`${styles.calendarDay} ${isCurrentMonth ? styles.currentMonth : styles.otherMonth} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
                    onClick={() => handleDateClick(date)}
                >
                    <span className={styles.dayNumber}>{date.getDate()}</span>
                    {dateEvents.length > 0 && (
                        <div className={styles.eventIndicator}>
                            {dateEvents.length === 1 ? (
                                <div className={styles.singleEvent} style={{ backgroundColor: getEventTypeColor(dateEvents[0].eventType || 'default') }}></div>
                            ) : (
                                <div className={styles.multipleEvents}>
                                    {dateEvents.slice(0, 3).map((event, index) => (
                                        <div key={index} className={styles.eventDot} style={{ backgroundColor: getEventTypeColor(event.eventType || 'default') }}></div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        return calendarDays;
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const getSelectedDateEvents = () => {
        const dateString = selectedDateForEvents.getFullYear() + '-' +
            String(selectedDateForEvents.getMonth() + 1).padStart(2, '0') + '-' +
            String(selectedDateForEvents.getDate()).padStart(2, '0');
        return events.filter(event => event.startDateTime.split('T')[0] === dateString);
    };

    const formatSelectedDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDateForEvents(date);
    };

    const nextDate = () => {
        const next = new Date(selectedDateForEvents);
        next.setDate(next.getDate() + 1);
        setSelectedDateForEvents(next);
    };

    const prevDate = () => {
        const prev = new Date(selectedDateForEvents);
        prev.setDate(prev.getDate() - 1);
        setSelectedDateForEvents(prev);
    };

    return (
        <div className={styles.container}>
            {/* Page Title */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Explore <span>FTMK Events</span></h1>
                <p className={styles.pageSubtitle}>View all FTMK events in one place</p>
            </div>

            {/* Two-Column Layout */}
            <div className={styles.mainContent}>
                {/* Left Column - Main Calendar */}
                <div className={styles.leftColumn}>
                    {/* Calendar Section */}
                    <div className={styles.calendarContainer}>
                        {loading && (
                            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-16">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                                    <p className="text-gray-600">Loading events...</p>
                                </div>
                            </div>
                        )}
                        <div className={styles.calendarHeader}>
                            <button onClick={prevMonth} className={styles.calendarNav}>
                                <ChevronLeft className={styles.navIcon} />
                            </button>
                            <h2 className={styles.calendarTitle}>
                                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h2>
                            <button onClick={nextMonth} className={styles.calendarNav}>
                                <ChevronRight className={styles.navIcon} />
                            </button>
                        </div>
                        <div className={styles.calendarGrid}>
                            <div className={styles.calendarWeekdays}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className={styles.weekday}>{day}</div>
                                ))}
                            </div>
                            <div className={styles.calendarDays}>
                                {renderCalendar()}
                            </div>
                        </div>
                    </div>

                    {/* Selected Date Events Section */}
                    <div className={styles.upcomingContainer}>
                        <div className={styles.sectionHeader}>
                            <button onClick={prevDate} className={styles.dateNav}>
                                <ChevronLeft className={styles.navIcon} />
                            </button>
                            <h2 className={styles.sectionTitle}>Events on {formatSelectedDate(selectedDateForEvents)}</h2>
                            <button onClick={nextDate} className={styles.dateNav}>
                                <ChevronRight className={styles.navIcon} />
                            </button>
                        </div>
                        <div className={styles.upcomingEvents}>
                            {getSelectedDateEvents().length > 0 ? (
                                getSelectedDateEvents().map((event) => (
                                    <div key={event.eventId} className={styles.upcomingEvent}>
                                        <div className={styles.upcomingEventDate}>
                                            <div className={styles.eventDay}>
                                                {new Date(event.startDateTime).getDate()}
                                            </div>
                                            <div className={styles.eventMonth}>
                                                {new Date(event.startDateTime).toLocaleDateString('en-US', { month: 'short' })}
                                            </div>
                                        </div>
                                        <div className={styles.upcomingEventContent}>
                                            <div className={styles.eventHeader}>
                                                <span
                                                    className={styles.eventType}
                                                    style={{ backgroundColor: getEventTypeColor(event.eventType || 'default') }}
                                                >
                                                    {event.eventType}
                                                </span>
                                            </div>
                                            <h3 className={styles.upcomingEventTitle}>{event.eventName}</h3>
                                            <p className={styles.sessionName}>
                                                <strong>Session:</strong> {event.sessionName}
                                            </p>
                                            <div className={styles.upcomingEventMeta}>
                                                <span className={styles.upcomingEventDateTime}>
                                                    <Calendar className={styles.metaIcon} />
                                                    {new Date(event.startDateTime).toLocaleDateString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}, {formatTime(event.startDateTime, event.endDateTime)}
                                                </span>
                                                <span className={styles.upcomingEventLocation}>
                                                    <MapPin className={styles.metaIcon} />
                                                    {event.venueNames}
                                                </span>
                                            </div>
                                            <p className={styles.eventDescription}>
                                                {event.description}
                                            </p>
                                        </div>
                                        <button 
                                            className={styles.upcomingViewButton}
                                            onClick={() => router.push(`/public/calendar/${event.eventId}`)}
                                        >
                                            <Eye className={styles.buttonIcon} />
                                            View Details
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    <p>No events scheduled for {formatSelectedDate(selectedDateForEvents)}. Select another date or check the calendar!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className={styles.rightColumn}>
                    {/* Search Bar */}
                    {/* <div className={styles.searchContainer}>
                        <div className={styles.searchBar}>
                            <Search className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                    </div> */}
                    {/* Today's Events Section */}
                    <div className={styles.todayContainer}>
                        <h2 className={styles.sectionTitle}>Happening Today</h2>
                        <div className={styles.todayEvents}>
                            {getTodayEvents().length > 0 ? (
                                getTodayEvents().map((event) => (
                                    <div key={event.eventId} className={styles.todayEventCard}>
                                        <div className={styles.eventHeader}>
                                            <span
                                                className={styles.eventType}
                                                style={{ backgroundColor: getEventTypeColor(event.eventType || 'default') }}
                                            >
                                                {event.eventType}
                                            </span>
                                        </div>
                                        <h3 className={styles.eventTitle}>{event.eventName}</h3>
                                        <p className={styles.sessionName}>
                                            <strong>Session:</strong> {event.sessionName}
                                        </p>
                                        <div className={styles.eventMeta}>
                                            <div className={styles.eventMetaItem}>
                                                <Calendar className={styles.metaIcon} />
                                                <span>{new Date(event.startDateTime).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}, {formatTime(event.startDateTime, event.endDateTime)}</span>
                                            </div>
                                            <div className={styles.eventMetaItem}>
                                                <MapPin className={styles.metaIcon} />
                                                <span>{event.venueNames}</span>
                                            </div>
                                        </div>
                                        <p className={styles.eventDescription}>
                                            {event.description}
                                        </p>
                                        <button 
                                            className={styles.viewDetailsButton}
                                            onClick={() => router.push(`/public/calendar/${event.eventId}`)}
                                        >
                                            <Eye className={styles.buttonIcon} />
                                            View Details
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    <p>No events scheduled for today. Check the calendar for other events!</p>
                                </div>
                            )}
                        </div>
                    </div>

                   
                </div>
            </div>

            {/* Date Modal */}
            {showDateModal && (
                <div className={styles.modalOverlay} onClick={() => setShowDateModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>
                            Events for {selectedDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </h3>
                        <div className={styles.modalEvents}>
                            {selectedDateEvents.length > 0 ? (
                                selectedDateEvents.map((event) => (
                                    <div key={event.eventId} className={styles.modalEvent}>
                                        <h4 className={styles.modalEventTitle}>{event.eventName}</h4>
                                        <div className={styles.modalEventMeta}>
                                            <span>{new Date(event.startDateTime).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric'
                                            })}, {formatTime(event.startDateTime, event.endDateTime)}</span>
                                            <span>{event.venueNames}</span>
                                            <span
                                                className={styles.eventType}
                                                style={{ backgroundColor: getEventTypeColor(event.eventType || 'default') }}
                                            >
                                                {event.eventType}
                                            </span>
                                        </div>
                                        <p className={styles.modalEventDescription}>
                                            <strong>Session:</strong> {event.sessionName}<br />
                                            {event.description}
                                        </p>
                                        <button 
                                            className={styles.modalViewButton}
                                            onClick={() => router.push(`/public/calendar/${event.eventId}`)}
                                        >
                                            <Eye className={styles.buttonIcon} />
                                            View Details
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.modalEmpty}>No events scheduled for this date.</p>
                            )}
                        </div>
                        <button
                            className={styles.modalClose}
                            onClick={() => setShowDateModal(false)}
                        >
                            Close
                        </button>
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

export default CalendarPage;
