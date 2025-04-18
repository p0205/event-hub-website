"use client";

import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { useState } from "react";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const events = [
  {
    title: "DB Fiesta",
    start: new Date(2023, 5, 1),
    end: new Date(2023, 5, 3),
  },
  {
    title: "Mobile App Workshop 2",
    start: new Date(2023, 5, 16),
    end: new Date(2023, 5, 17),
  },
  {
    title: "Software Expo",
    start: new Date(2023, 5, 23),
    end: new Date(2023, 5, 23),
  },
];

export default function Calendar() {
  const [allEvents, setAllEvents] = useState(events);

  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Event Calendar</h2>
      <BigCalendar
        localizer={localizer}
        events={allEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
  );
}
