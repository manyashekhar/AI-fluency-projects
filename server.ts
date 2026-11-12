import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/server/db.js';
import { processUserMessage } from './src/server/assistant.js';
import { CurrentUser } from './src/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all students (for persona switcher / auth demo)
app.get('/api/students', (_req: Request, res: Response) => {
  res.json(db.getStudents());
});

// Get admin personas
app.get('/api/admins', (_req: Request, res: Response) => {
  res.json(db.getAdmins());
});

// Get ALL users of the app database (Students + Administrators)
app.get('/api/users', (_req: Request, res: Response) => {
  const students = db.getStudents().map((s) => {
    const studentRegs = db.getStudentRegistrations(s.studentId);
    return {
      userId: s.studentId,
      name: s.name,
      email: s.email,
      role: 'Student' as const,
      courseOrDepartment: s.course,
      avatar: s.avatar,
      registrationCount: studentRegs.length,
      registeredEvents: studentRegs.map((r) => {
        const ev = db.findEventById(r.eventId);
        return {
          eventId: r.eventId,
          eventName: ev?.name || r.eventId,
          registrationId: r.registrationId,
          status: r.status,
          date: ev?.date,
          venue: ev?.venue,
        };
      }),
    };
  });

  const admins = db.getAdmins().map((a) => {
    return {
      userId: a.adminId,
      name: a.name,
      email: a.email,
      role: 'Administrator' as const,
      courseOrDepartment: a.department,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      registrationCount: 0,
      registeredEvents: [],
      permissions: ['Manage Events', 'View Participant Lists', 'View Stats'],
    };
  });

  res.json({
    totalUsers: students.length + admins.length,
    studentsCount: students.length,
    adminsCount: admins.length,
    users: [...students, ...admins],
  });
});

// Create event with duplicate validation
app.post('/api/events', (req: Request, res: Response) => {
  const { name, description, date, time, venue, maximumCapacity, category, isAdmin } = req.body;
  if (!isAdmin) {
    res.status(403).json({ error: 'Access denied: Only administrators can create events.' });
    return;
  }
  if (!name || !venue || !date || !time) {
    res.status(400).json({ error: 'Missing required event fields (name, venue, date, time).' });
    return;
  }

  const result = db.createEvent({
    name,
    description: description || 'Campus event',
    date,
    time,
    venue,
    maximumCapacity: Number(maximumCapacity) || 50,
    category: category || 'General',
  });

  if (!result.success) {
    res.status(409).json({ error: result.error, isDuplicate: true });
    return;
  }

  res.status(201).json(result.event);
});

// Register student with duplicate & capacity validation
app.post('/api/registrations', (req: Request, res: Response) => {
  const { studentId, eventId } = req.body;
  if (!studentId || !eventId) {
    res.status(400).json({ error: 'Missing studentId or eventId' });
    return;
  }

  const result = db.registerStudent(studentId, eventId);
  if (!result.success) {
    const statusCode = result.alreadyRegistered ? 409 : 400;
    res.status(statusCode).json({ error: result.error, alreadyRegistered: result.alreadyRegistered });
    return;
  }

  res.status(201).json(result.registration);
});

// Get all events with live counts
app.get('/api/events', (_req: Request, res: Response) => {
  const events = db.getEvents().map((e) => {
    const registered = db.getEventRegistrationCount(e.eventId);
    const available = db.getEventAvailableSeats(e.eventId);
    return {
      ...e,
      registeredCount: registered,
      availableSeats: available,
      isFull: available <= 0,
    };
  });
  res.json(events);
});

// Get single event
app.get('/api/events/:id', (req: Request, res: Response) => {
  const event = db.findEventById(req.params.id);
  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }
  const registered = db.getEventRegistrationCount(event.eventId);
  const available = db.getEventAvailableSeats(event.eventId);
  res.json({
    ...event,
    registeredCount: registered,
    availableSeats: available,
    isFull: available <= 0,
  });
});

// Get registrations (role-scoped)
app.get('/api/registrations', (req: Request, res: Response) => {
  const studentId = req.query.studentId as string | undefined;
  const isAdmin = req.query.isAdmin === 'true';

  if (studentId) {
    const studentRegs = db.getStudentRegistrations(studentId).map((r) => {
      const event = db.findEventById(r.eventId);
      return {
        ...r,
        event,
      };
    });
    res.json(studentRegs);
    return;
  }

  if (isAdmin) {
    const allRegs = db.getRegistrations().map((r) => {
      const event = db.findEventById(r.eventId);
      const student = db.findStudentById(r.studentId);
      return {
        ...r,
        event,
        student,
      };
    });
    res.json(allRegs);
    return;
  }

  res.status(400).json({ error: 'Specify studentId or request as admin' });
});

// Admin-only participants endpoint
app.get('/api/events/:id/participants', (req: Request, res: Response) => {
  const isAdmin = req.query.isAdmin === 'true';
  if (!isAdmin) {
    res.status(403).json({ error: 'Access denied: Administrator authorization required' });
    return;
  }

  const event = db.findEventById(req.params.id);
  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  const eventRegs = db.getRegistrations().filter((r) => r.eventId === event.eventId && r.status === 'CONFIRMED');
  const participants = eventRegs.map((r) => {
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

  res.json({
    eventId: event.eventId,
    eventName: event.name,
    maximumCapacity: event.maximumCapacity,
    registeredCount: participants.length,
    availableSeats: Math.max(0, event.maximumCapacity - participants.length),
    participants,
  });
});

// Chat endpoint (AI Assistant with function calling loop)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, currentUser } = req.body as {
      message: string;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
      currentUser: CurrentUser;
    };

    if (!message || !currentUser) {
      res.status(400).json({ error: 'Missing message or currentUser' });
      return;
    }

    const result = await processUserMessage(message, history || [], currentUser);
    res.json(result);
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Reset database
app.post('/api/reset-db', (_req: Request, res: Response) => {
  db.reset();
  res.json({ success: true, message: 'Database reset to initial seed state.' });
});

// Mount Vite or static assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
