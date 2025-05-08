"use client";
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { CalendarEvent } from '@/types/event';
import { eventService } from '@/services';
import { formatDateTime } from '@/helpers/eventHelpers';

export default function OrganizerCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await eventService.getCalendarEvents(1);
        setEvents(response);
      } catch (e: any) {
        setError(`Failed to load events: ${e.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);


  const handleEventClick = (arg: any) => {
    const clickedEvent = arg.event.extendedProps as CalendarEvent;
    const description = `${clickedEvent.eventName} (${clickedEvent.sessionName})\n\nStart Time: ${formatDateTime(clickedEvent.startDateTime)}\nEnd Time: ${formatDateTime(clickedEvent.endDateTime)}\nVenues: ${clickedEvent.venueNames}`;
    alert(description);
  };

  const renderEventContent = (eventInfo: any) => {
    return (
      <>
        {eventInfo.timeText && (
          <div style={{ fontWeight: 'bold', fontSize: '0.85em' }}>
            {eventInfo.timeText}
          </div>
        )}
        <div className="fc-event-title-wrap">
          {eventInfo.event.title}
        </div>
      </>
    );
  };

  if (loading) return <div>Loading calendar...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events.map((e) => ({
          id: e.sessionId.toString(),
          title: e.sessionName,
          start: e.startDateTime,
          end: e.endDateTime,
          extendedProps: e,
        }))}
        eventClick={handleEventClick}
        editable={false}
        selectable={true}
        eventContent={renderEventContent}
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short',
        }}
      />
    </div>
  );
}
