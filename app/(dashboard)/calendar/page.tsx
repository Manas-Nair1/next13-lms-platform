"use client";

export default function CalendarPage() {
  return (
    <div className="flex flex-col w-full h-full">
      <iframe
        src="https://calendar.google.com/calendar/embed?"
        style={{ border: 0 }}
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
      ></iframe>
    </div>
  );
}

// "use client";

// import React, { useState } from 'react';
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import interactionPlugin from '@fullcalendar/interaction';

// export default function CalendarPage() {
//   const [events, setEvents] = useState([
//     { id: '1', title: 'Event 1', start: new Date().toISOString() },
//     { id: '2', title: 'Event 2', start: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString() },
//   ]);

//   const handleDateSelect = (selectInfo) => {
//     let title = prompt('Please enter a new title for your event');
//     let calendarApi = selectInfo.view.calendar;

//     calendarApi.unselect(); // clear date selection

//     if (title) {
//       const newEvent = {
//         id: String(events.length + 1),
//         title,
//         start: selectInfo.startStr,
//         end: selectInfo.endStr,
//         allDay: selectInfo.allDay,
//       };
//       setEvents([...events, newEvent]);
//     }
//   };

//   const handleEventClick = (clickInfo) => {
//     if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
//       setEvents(events.filter(event => event.id !== clickInfo.event.id));
//     }
//   };

//   return (
//     <div className="flex flex-col w-full h-full">
//       <FullCalendar
//         plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//         initialView="dayGridMonth"
//         selectable={true}
//         selectMirror={true}
//         dayMaxEvents={true}
//         weekends={true}
//         events={events}
//         select={handleDateSelect}
//         eventClick={handleEventClick}
//       />
//     </div>
//   );
// }