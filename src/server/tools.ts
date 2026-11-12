import { FunctionDeclaration, Type } from '@google/genai';
import { db } from './db.js';
import { CurrentUser } from '../types.js';

export const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'get_events',
    description: 'Find, list, or search events in the College Event Management System.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Search keyword for event name, description, topic, or category (e.g. "AI", "Cloud", "Analytics").',
        },
        date: {
          type: Type.STRING,
          description: 'Filter by date string or month (e.g. "October", "18 October").',
        },
        venue: {
          type: Type.STRING,
          description: 'Filter by venue location (e.g. "Auditorium A").',
        },
      },
    },
  },
  {
    name: 'get_event',
    description: 'Get detailed information for a specific event by its ID or title.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        eventId: {
          type: Type.STRING,
          description: 'The event ID (e.g., "EVT-101").',
        },
        name: {
          type: Type.STRING,
          description: 'The exact or approximate event name (e.g., "AI Workshop").',
        },
      },
    },
  },
  {
    name: 'check_registration',
    description: "Check if the currently authenticated student is registered for an event.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        eventId: {
          type: Type.STRING,
          description: 'The ID of the event to check (e.g., "EVT-101").',
        },
        eventName: {
          type: Type.STRING,
          description: 'The name of the event to check (e.g., "Business Analytics Workshop").',
        },
      },
    },
  },
  {
    name: 'get_my_registrations',
    description: 'Retrieve all event registrations for the currently authenticated student.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'register_student',
    description: "Register the currently authenticated student for an event. Verifies student identity, duplicate check, and event capacity.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        eventId: {
          type: Type.STRING,
          description: 'The event ID to register for (e.g., "EVT-101").',
        },
      },
      required: ['eventId'],
    },
  },
  {
    name: 'get_registration_count',
    description: 'Get the number of student registrations and remaining capacity for an event.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        eventId: {
          type: Type.STRING,
          description: 'The event ID (e.g., "EVT-101").',
        },
        eventName: {
          type: Type.STRING,
          description: 'The name of the event (e.g., "AI Workshop").',
        },
      },
    },
  },
  {
    name: 'get_event_registrations',
    description: 'Admin tool to view participant lists for an event. ONLY authorized administrators may access participant information.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        eventId: {
          type: Type.STRING,
          description: 'The event ID to fetch participant list for.',
        },
      },
      required: ['eventId'],
    },
  },
  {
    name: 'create_event',
    description: 'Admin tool to create a new college event or workshop. ONLY authorized administrators may create events.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: 'Title of the event (e.g. "AI Workshop").',
        },
        description: {
          type: Type.STRING,
          description: 'Summary of what the event covers.',
        },
        date: {
          type: Type.STRING,
          description: 'Event date (e.g. "25 October 2026").',
        },
        time: {
          type: Type.STRING,
          description: 'Event start time (e.g. "2:00 PM").',
        },
        venue: {
          type: Type.STRING,
          description: 'Location or room (e.g. "Auditorium A").',
        },
        maximumCapacity: {
          type: Type.INTEGER,
          description: 'Maximum student capacity (e.g. 100).',
        },
        category: {
          type: Type.STRING,
          description: 'Event category or subject.',
        },
      },
      required: ['name', 'description', 'date', 'time', 'venue', 'maximumCapacity'],
    },
  },
  {
    name: 'update_event',
    description: 'Admin tool to update an existing event (e.g. change venue, date, time, capacity). ONLY authorized administrators may update events.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        eventId: {
          type: Type.STRING,
          description: 'The ID of the event to update.',
        },
        name: {
          type: Type.STRING,
          description: 'New title of the event.',
        },
        description: {
          type: Type.STRING,
          description: 'New description.',
        },
        date: {
          type: Type.STRING,
          description: 'New date.',
        },
        time: {
          type: Type.STRING,
          description: 'New time.',
        },
        venue: {
          type: Type.STRING,
          description: 'New venue location (e.g. "Seminar Hall 2").',
        },
        maximumCapacity: {
          type: Type.INTEGER,
          description: 'New maximum capacity.',
        },
      },
      required: ['eventId'],
    },
  },
  {
    name: 'delete_event',
    description: 'Admin tool to delete an event from the system. ONLY authorized administrators may delete events.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        eventId: {
          type: Type.STRING,
          description: 'The ID of the event to delete.',
        },
      },
      required: ['eventId'],
    },
  },
  {
    name: 'create_calendar_event',
    description: 'Create a Google Calendar event for a confirmed student registration. MUST only be called AFTER registration has successfully completed.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        eventId: {
          type: Type.STRING,
          description: 'The ID of the confirmed event to add to calendar.',
        },
      },
      required: ['eventId'],
    },
  },
];

export function executeTool(
  toolName: string,
  args: Record<string, any>,
  currentUser: CurrentUser
): Record<string, any> {
  switch (toolName) {
    case 'get_events': {
      let events = db.getEvents();
      if (args.query) {
        events = db.findEventByNameOrQuery(args.query);
      }
      if (args.date) {
        const d = String(args.date).toLowerCase();
        events = events.filter((e) => e.date.toLowerCase().includes(d));
      }
      if (args.venue) {
        const v = String(args.venue).toLowerCase();
        events = events.filter((e) => e.venue.toLowerCase().includes(v));
      }

      return {
        count: events.length,
        events: events.map((e) => {
          const registered = db.getEventRegistrationCount(e.eventId);
          const available = db.getEventAvailableSeats(e.eventId);
          return {
            eventId: e.eventId,
            name: e.name,
            date: e.date,
            time: e.time,
            venue: e.venue,
            maximumCapacity: e.maximumCapacity,
            registeredCount: registered,
            availableSeats: available,
            isFull: available <= 0,
            description: e.description,
          };
        }),
      };
    }

    case 'get_event': {
      let event = args.eventId ? db.findEventById(args.eventId) : undefined;
      if (!event && args.name) {
        const matches = db.findEventByNameOrQuery(args.name);
        if (matches.length > 0) {
          event = matches[0];
        }
      }

      if (!event) {
        return {
          found: false,
          error: `Event not found with ${args.eventId ? `ID ${args.eventId}` : `name "${args.name}"`}.`,
        };
      }

      const registered = db.getEventRegistrationCount(event.eventId);
      const available = db.getEventAvailableSeats(event.eventId);
      return {
        found: true,
        eventId: event.eventId,
        name: event.name,
        description: event.description,
        date: event.date,
        time: event.time,
        venue: event.venue,
        maximumCapacity: event.maximumCapacity,
        registeredCount: registered,
        availableSeats: available,
        isFull: available <= 0,
      };
    }

    case 'check_registration': {
      if (currentUser.role !== 'student') {
        return {
          registered: false,
          error: 'Current authenticated user is an administrator, not a student.',
        };
      }

      let event = args.eventId ? db.findEventById(args.eventId) : undefined;
      if (!event && args.eventName) {
        const matches = db.findEventByNameOrQuery(args.eventName);
        if (matches.length > 0) event = matches[0];
      }

      if (!event) {
        return {
          registered: false,
          error: `Could not identify event to check registration.`,
        };
      }

      const reg = db.isStudentRegistered(currentUser.data.studentId, event.eventId);
      if (reg) {
        return {
          registered: true,
          eventId: event.eventId,
          eventName: event.name,
          registrationId: reg.registrationId,
          registrationDate: reg.registrationDate,
          status: reg.status,
          addedToCalendar: !!reg.addedToCalendar,
          message: `Student ${currentUser.data.name} is already registered for ${event.name}.`,
        };
      }

      return {
        registered: false,
        eventId: event.eventId,
        eventName: event.name,
        message: `Student ${currentUser.data.name} is not registered for ${event.name}.`,
      };
    }

    case 'get_my_registrations': {
      if (currentUser.role !== 'student') {
        return {
          error: 'Administrator accounts do not have student registrations. Use get_event_registrations to view event participants.',
        };
      }

      const regs = db.getStudentRegistrations(currentUser.data.studentId);
      const details = regs.map((r) => {
        const event = db.findEventById(r.eventId);
        return {
          registrationId: r.registrationId,
          eventId: r.eventId,
          eventName: event ? event.name : 'Unknown Event',
          date: event ? event.date : 'Unknown',
          time: event ? event.time : 'Unknown',
          venue: event ? event.venue : 'Unknown',
          registrationDate: r.registrationDate,
          status: r.status,
          addedToCalendar: !!r.addedToCalendar,
          calendarLink: r.calendarLink,
        };
      });

      return {
        studentId: currentUser.data.studentId,
        studentName: currentUser.data.name,
        count: details.length,
        registrations: details,
      };
    }

    case 'register_student': {
      if (currentUser.role !== 'student') {
        return {
          success: false,
          error: 'Only students can be registered for events. Current user is an administrator.',
        };
      }

      let event = db.findEventById(args.eventId);
      if (!event) {
        // try finding by name if an event name was passed by mistake
        const matches = db.findEventByNameOrQuery(args.eventId);
        if (matches.length > 0) event = matches[0];
      }

      if (!event) {
        return { success: false, error: `Event "${args.eventId}" not found.` };
      }

      // Check duplicate registration
      const existing = db.isStudentRegistered(currentUser.data.studentId, event.eventId);
      if (existing) {
        return {
          success: false,
          alreadyRegistered: true,
          isDuplicate: true,
          error: `Duplicate registration error: Student ${currentUser.data.name} (${currentUser.data.studentId}) is already registered for "${event.name}".`,
        };
      }

      // Check capacity
      const available = db.getEventAvailableSeats(event.eventId);
      if (available <= 0) {
        return {
          success: false,
          isFull: true,
          error: `Event "${event.name}" is completely full (Capacity: ${event.maximumCapacity}/${event.maximumCapacity}).`,
        };
      }

      const result = db.registerStudent(currentUser.data.studentId, event.eventId);
      if (!result.success) {
        return result;
      }

      return {
        success: true,
        registrationId: result.registration?.registrationId,
        eventId: event.eventId,
        eventName: event.name,
        date: event.date,
        time: event.time,
        venue: event.venue,
        studentId: currentUser.data.studentId,
        studentName: currentUser.data.name,
        message: `Successfully registered ${currentUser.data.name} for ${event.name}.`,
      };
    }

    case 'get_registration_count': {
      let event = args.eventId ? db.findEventById(args.eventId) : undefined;
      if (!event && args.eventName) {
        const matches = db.findEventByNameOrQuery(args.eventName);
        if (matches.length > 0) event = matches[0];
      }

      if (!event) {
        return { error: 'Event not found.' };
      }

      const registered = db.getEventRegistrationCount(event.eventId);
      const available = db.getEventAvailableSeats(event.eventId);
      return {
        eventId: event.eventId,
        eventName: event.name,
        registeredCount: registered,
        maximumCapacity: event.maximumCapacity,
        availableSeats: available,
        isFull: available <= 0,
      };
    }

    case 'get_event_registrations': {
      if (currentUser.role !== 'admin') {
        return {
          success: false,
          error: 'Access Denied: Only authenticated administrators are authorized to view participant lists.',
        };
      }

      const event = db.findEventById(args.eventId);
      if (!event) {
        return { success: false, error: `Event with ID "${args.eventId}" was not found.` };
      }

      const allRegs = db.getRegistrations().filter((r) => r.eventId === event.eventId && r.status === 'CONFIRMED');
      const participants = allRegs.map((r) => {
        const student = db.findStudentById(r.studentId);
        return {
          registrationId: r.registrationId,
          studentId: r.studentId,
          name: student ? student.name : r.studentId,
          email: student ? student.email : `${r.studentId.toLowerCase()}@college.edu`,
          course: student ? student.course : 'General Engineering',
          registrationDate: r.registrationDate,
          status: r.status,
        };
      });

      return {
        success: true,
        eventId: event.eventId,
        eventName: event.name,
        maximumCapacity: event.maximumCapacity,
        registeredCount: participants.length,
        availableSeats: Math.max(0, event.maximumCapacity - participants.length),
        participants,
      };
    }

    case 'create_event': {
      if (currentUser.role !== 'admin') {
        return {
          success: false,
          error: 'Access Denied: Only authenticated administrators are authorized to create events.',
        };
      }

      const result = db.createEvent({
        name: args.name,
        description: args.description,
        date: args.date,
        time: args.time,
        venue: args.venue,
        maximumCapacity: Number(args.maximumCapacity) || 50,
        category: args.category || 'General',
      });

      if (!result.success || !result.event) {
        return {
          success: false,
          isDuplicate: !!result.isDuplicate,
          error: result.error || `Duplicate event error: An event named "${args.name}" already exists in the database.`,
        };
      }

      const newEvent = result.event;

      return {
        success: true,
        event: newEvent,
        message: `Event "${newEvent.name}" (ID: ${newEvent.eventId}) successfully created.`,
      };
    }

    case 'update_event': {
      if (currentUser.role !== 'admin') {
        return {
          success: false,
          error: 'Access Denied: Only authenticated administrators are authorized to update events.',
        };
      }

      const updates: any = {};
      if (args.name !== undefined) updates.name = args.name;
      if (args.description !== undefined) updates.description = args.description;
      if (args.date !== undefined) updates.date = args.date;
      if (args.time !== undefined) updates.time = args.time;
      if (args.venue !== undefined) updates.venue = args.venue;
      if (args.maximumCapacity !== undefined) updates.maximumCapacity = Number(args.maximumCapacity);

      const updated = db.updateEvent(args.eventId, updates);
      if (!updated) {
        return { success: false, error: `Event with ID "${args.eventId}" not found.` };
      }

      return {
        success: true,
        event: updated,
        message: `Event "${updated.name}" successfully updated.`,
      };
    }

    case 'delete_event': {
      if (currentUser.role !== 'admin') {
        return {
          success: false,
          error: 'Access Denied: Only authenticated administrators are authorized to delete events.',
        };
      }

      const event = db.findEventById(args.eventId);
      const name = event ? event.name : args.eventId;
      const deleted = db.deleteEvent(args.eventId);
      if (!deleted) {
        return { success: false, error: `Event "${args.eventId}" not found.` };
      }

      return {
        success: true,
        message: `Event "${name}" (${args.eventId}) has been successfully deleted.`,
      };
    }

    case 'create_calendar_event': {
      if (currentUser.role !== 'student') {
        return {
          success: false,
          error: 'Google Calendar events are created for student registrations.',
        };
      }

      const event = db.findEventById(args.eventId);
      if (!event) {
        return { success: false, error: `Event "${args.eventId}" not found.` };
      }

      // Check that registration has completed
      const isReg = db.isStudentRegistered(currentUser.data.studentId, event.eventId);
      if (!isReg) {
        return {
          success: false,
          error: 'Cannot create Google Calendar event: Student is not registered for this event.',
        };
      }

      const calendarSummary = `${event.name} - College Campus`;
      const calendarDetails = `${event.description}\nVenue: ${event.venue}\nStudent: ${currentUser.data.name} (${currentUser.data.studentId})`;
      const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        calendarSummary
      )}&details=${encodeURIComponent(calendarDetails)}&location=${encodeURIComponent(event.venue)}`;

      db.markCalendarAdded(currentUser.data.studentId, event.eventId, calendarLink);

      return {
        success: true,
        message: 'Google Calendar event created successfully.',
        calendarEventId: `gcal_${event.eventId.toLowerCase()}_${Date.now()}`,
        calendarLink,
        eventName: event.name,
        date: event.date,
        time: event.time,
        venue: event.venue,
      };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
