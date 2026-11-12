import { Student, CollegeEvent, Registration, AdminUser } from '../types.js';

export const INITIAL_STUDENTS: Student[] = [
  {
    studentId: 'STU101',
    name: 'Alex Rivera',
    email: 'alex.rivera@college.edu',
    course: 'B.Tech Computer Science',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    studentId: 'STU102',
    name: 'Priya Sharma',
    email: 'priya.s@college.edu',
    course: 'MS Data Analytics',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
  {
    studentId: 'STU103',
    name: 'Marcus Chen',
    email: 'marcus.c@college.edu',
    course: 'B.S. Software Engineering',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    studentId: 'STU104',
    name: 'Jordan Taylor',
    email: 'jordan.t@college.edu',
    course: 'B.Tech Artificial Intelligence',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    studentId: 'STU105',
    name: 'Elena Rostova',
    email: 'elena.r@college.edu',
    course: 'MBA Tech Management',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_ADMINS: AdminUser[] = [
  {
    adminId: 'ADM001',
    name: 'Dr. Sarah Jenkins',
    email: 'admin.jenkins@college.edu',
    role: 'Administrator',
    department: 'Student Affairs & Campus Events',
  },
];

export const INITIAL_EVENTS: CollegeEvent[] = [
  {
    eventId: 'EVT-101',
    name: 'AI Workshop',
    description: 'Hands-on practical session covering transformer architectures, prompt engineering, and building generative AI web applications.',
    date: '18 October 2026',
    time: '2:00 PM',
    venue: 'Auditorium A',
    maximumCapacity: 50,
    category: 'Artificial Intelligence',
  },
  {
    eventId: 'EVT-102',
    name: 'Business Analytics Workshop',
    description: 'Data storytelling, predictive analytics, SQL metrics, and decision modeling for modern business leaders.',
    date: '20 October 2026',
    time: '10:30 AM',
    venue: 'Seminar Hall 2',
    maximumCapacity: 30,
    category: 'Analytics & Management',
  },
  {
    eventId: 'EVT-103',
    name: 'Cybersecurity & Ethical Hacking Bootcamp',
    description: 'Hands-on offensive & defensive security tactics, vulnerability assessments, and live CTF challenges.',
    date: '22 October 2026',
    time: '1:00 PM',
    venue: 'Tech Lab 4',
    maximumCapacity: 25,
    category: 'Cybersecurity',
  },
  {
    eventId: 'EVT-104',
    name: 'Cloud Architecture Masterclass',
    description: 'Designing distributed microservices, scalable Kubernetes deployments, and cloud security architectures.',
    date: '28 October 2026',
    time: '3:30 PM',
    venue: 'Lecture Theatre B',
    maximumCapacity: 60,
    category: 'Cloud & DevOps',
  },
  {
    eventId: 'EVT-105',
    name: 'Robotics & Embedded AI Summit',
    description: 'Autonomous systems, IoT sensor integration, and real-time edge computer vision implementations.',
    date: '30 October 2026',
    time: '11:00 AM',
    venue: 'Innovation Hub',
    maximumCapacity: 40,
    category: 'Robotics & Hardware',
  },
];

class DatabaseManager {
  private students: Student[] = [];
  private admins: AdminUser[] = [];
  private events: CollegeEvent[] = [];
  private registrations: Registration[] = [];

  constructor() {
    this.reset();
  }

  public reset() {
    this.students = JSON.parse(JSON.stringify(INITIAL_STUDENTS));
    this.admins = JSON.parse(JSON.stringify(INITIAL_ADMINS));
    this.events = JSON.parse(JSON.stringify(INITIAL_EVENTS));
    this.registrations = [];

    // Seed registrations
    // 1. Alex Rivera (STU101) is registered for Business Analytics Workshop (EVT-102)
    this.registrations.push({
      registrationId: 'REG-1001',
      studentId: 'STU101',
      eventId: 'EVT-102',
      registrationDate: '2026-10-02T09:15:00.000Z',
      status: 'CONFIRMED',
      addedToCalendar: true,
      calendarLink: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Business+Analytics+Workshop',
    });

    // 2. Priya Sharma (STU102) is registered for AI Workshop (EVT-101)
    this.registrations.push({
      registrationId: 'REG-1002',
      studentId: 'STU102',
      eventId: 'EVT-101',
      registrationDate: '2026-10-03T11:20:00.000Z',
      status: 'CONFIRMED',
      addedToCalendar: true,
      calendarLink: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=AI+Workshop',
    });

    // 3. Populate EVT-101 (AI Workshop) with 47 more mock students (total 48/50, 2 seats left!)
    for (let i = 3; i <= 48; i++) {
      this.registrations.push({
        registrationId: `REG-${1000 + i}`,
        studentId: `MOCK_STU_${i}`,
        eventId: 'EVT-101',
        registrationDate: '2026-10-04T10:00:00.000Z',
        status: 'CONFIRMED',
      });
    }

    // 4. Populate EVT-103 (Cybersecurity Bootcamp) to full capacity (25/25)
    for (let i = 1; i <= 25; i++) {
      this.registrations.push({
        registrationId: `REG-SEC-${100 + i}`,
        studentId: i === 1 ? 'STU103' : i === 2 ? 'STU104' : `MOCK_SEC_${i}`,
        eventId: 'EVT-103',
        registrationDate: '2026-10-01T08:00:00.000Z',
        status: 'CONFIRMED',
      });
    }

    // 5. Populate EVT-102 with 11 more registrations (total 12/30)
    for (let i = 1; i <= 11; i++) {
      this.registrations.push({
        registrationId: `REG-BIZ-${100 + i}`,
        studentId: `MOCK_BIZ_${i}`,
        eventId: 'EVT-102',
        registrationDate: '2026-10-02T12:00:00.000Z',
        status: 'CONFIRMED',
      });
    }

    // 6. EVT-104 with 18 registrations
    for (let i = 1; i <= 18; i++) {
      this.registrations.push({
        registrationId: `REG-CLD-${100 + i}`,
        studentId: `MOCK_CLD_${i}`,
        eventId: 'EVT-104',
        registrationDate: '2026-10-03T15:00:00.000Z',
        status: 'CONFIRMED',
      });
    }
  }

  // Getters
  public getStudents(): Student[] {
    return [...this.students];
  }

  public getAdmins(): AdminUser[] {
    return [...this.admins];
  }

  public getEvents(): CollegeEvent[] {
    return [...this.events];
  }

  public getRegistrations(): Registration[] {
    return [...this.registrations];
  }

  public findStudentById(studentId: string): Student | undefined {
    return this.students.find((s) => s.studentId === studentId);
  }

  public findAdminById(adminId: string): AdminUser | undefined {
    return this.admins.find((a) => a.adminId === adminId);
  }

  public findEventById(eventId: string): CollegeEvent | undefined {
    return this.events.find((e) => e.eventId === eventId);
  }

  public findEventByNameOrQuery(query: string): CollegeEvent[] {
    const q = query.toLowerCase().trim();
    return this.events.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.category && e.category.toLowerCase().includes(q)) ||
        e.venue.toLowerCase().includes(q)
    );
  }

  public getEventRegistrationCount(eventId: string): number {
    return this.registrations.filter(
      (r) => r.eventId === eventId && r.status === 'CONFIRMED'
    ).length;
  }

  public getEventAvailableSeats(eventId: string): number {
    const event = this.findEventById(eventId);
    if (!event) return 0;
    const count = this.getEventRegistrationCount(eventId);
    return Math.max(0, event.maximumCapacity - count);
  }

  public isStudentRegistered(studentId: string, eventId: string): Registration | undefined {
    return this.registrations.find(
      (r) => r.studentId === studentId && r.eventId === eventId && r.status === 'CONFIRMED'
    );
  }

  public getStudentRegistrations(studentId: string): Registration[] {
    return this.registrations.filter(
      (r) => r.studentId === studentId && r.status === 'CONFIRMED'
    );
  }

  // Mutations
  public registerStudent(studentId: string, eventId: string): { success: boolean; error?: string; alreadyRegistered?: boolean; registration?: Registration } {
    const event = this.findEventById(eventId);
    if (!event) {
      return { success: false, error: `Event with ID "${eventId}" does not exist.` };
    }

    const student = this.findStudentById(studentId);
    const studentName = student ? student.name : studentId;

    // Check if already registered
    const existing = this.isStudentRegistered(studentId, eventId);
    if (existing) {
      return { 
        success: false, 
        alreadyRegistered: true,
        error: `Duplicate registration error: Student ${studentName} (${studentId}) is already registered for "${event.name}" (Registration ID: ${existing.registrationId}).` 
      };
    }

    // Check capacity
    const currentCount = this.getEventRegistrationCount(eventId);
    if (currentCount >= event.maximumCapacity) {
      return {
        success: false,
        error: `Cannot register: "${event.name}" is at maximum capacity (${event.maximumCapacity}/${event.maximumCapacity}).`,
      };
    }

    const newReg: Registration = {
      registrationId: `REG-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId,
      eventId,
      registrationDate: new Date().toISOString(),
      status: 'CONFIRMED',
      addedToCalendar: false,
    };

    this.registrations.push(newReg);
    return { success: true, registration: newReg };
  }

  public markCalendarAdded(studentId: string, eventId: string, calendarLink: string): boolean {
    const reg = this.registrations.find(
      (r) => r.studentId === studentId && r.eventId === eventId && r.status === 'CONFIRMED'
    );
    if (reg) {
      reg.addedToCalendar = true;
      reg.calendarLink = calendarLink;
      return true;
    }
    return false;
  }

  public createEvent(eventData: Omit<CollegeEvent, 'eventId'>): { success: boolean; error?: string; isDuplicate?: boolean; event?: CollegeEvent } {
    // Check for duplicate event by name (case-insensitive)
    const normalizedName = eventData.name.trim().toLowerCase();
    const existing = this.events.find(
      (e) => e.name.trim().toLowerCase() === normalizedName
    );

    if (existing) {
      return {
        success: false,
        isDuplicate: true,
        error: `Duplicate event error: An event named "${existing.name}" (ID: ${existing.eventId}) already exists in the database.`,
      };
    }

    const nextNum = 101 + this.events.length;
    const newEvent: CollegeEvent = {
      ...eventData,
      eventId: `EVT-${nextNum}`,
    };
    this.events.push(newEvent);
    return { success: true, event: newEvent };
  }

  public updateEvent(eventId: string, updates: Partial<Omit<CollegeEvent, 'eventId'>>): CollegeEvent | null {
    const event = this.findEventById(eventId);
    if (!event) return null;
    Object.assign(event, updates);
    return event;
  }

  public deleteEvent(eventId: string): boolean {
    const index = this.events.findIndex((e) => e.eventId === eventId);
    if (index === -1) return false;
    this.events.splice(index, 1);
    // Cancel associated registrations
    this.registrations = this.registrations.filter((r) => r.eventId !== eventId);
    return true;
  }
}

export const db = new DatabaseManager();
