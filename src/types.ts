export interface Student {
  studentId: string;
  name: string;
  email: string;
  course: string;
  avatar?: string;
}

export interface CollegeEvent {
  eventId: string;
  name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  maximumCapacity: number;
  category?: string;
}

export interface Registration {
  registrationId: string;
  studentId: string;
  eventId: string;
  registrationDate: string;
  status: 'CONFIRMED' | 'CANCELLED';
  addedToCalendar?: boolean;
  calendarLink?: string;
}

export interface AdminUser {
  adminId: string;
  name: string;
  email: string;
  role: 'Administrator';
  department: string;
}

export interface AppUser {
  userId: string;
  name: string;
  email: string;
  role: 'Student' | 'Administrator';
  courseOrDepartment: string;
  avatar?: string;
  registrationCount: number;
  registeredEvents?: Array<{
    eventId: string;
    eventName: string;
    registrationId: string;
    status: string;
    date?: string;
    venue?: string;
  }>;
  permissions?: string[];
}

export type CurrentUser = 
  | { role: 'student'; data: Student }
  | { role: 'admin'; data: AdminUser };

export interface ToolCallExecution {
  tool: string;
  args: Record<string, any>;
  result: Record<string, any>;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: ToolCallExecution[];
}
