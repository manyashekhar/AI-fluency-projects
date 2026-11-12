import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, NavTab } from './components/Navbar.js';
import { ChatAssistant } from './components/ChatAssistant.js';
import { EventsView } from './components/EventsView.js';
import { RegistrationsView } from './components/RegistrationsView.js';
import { DatabaseInspector } from './components/DatabaseInspector.js';
import { AllUsersDatabaseView } from './components/AllUsersDatabaseView.js';
import { AllEventsDatabaseView } from './components/AllEventsDatabaseView.js';
import { AdminEventManagerModal } from './components/AdminEventManagerModal.js';
import { ParticipantListModal } from './components/ParticipantListModal.js';
import { CurrentUser, Student, AdminUser, CollegeEvent, Registration, ChatMessage } from './types.js';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    role: 'student',
    data: {
      studentId: 'STU101',
      name: 'Alex Rivera',
      email: 'alex.rivera@college.edu',
      course: 'B.Tech Computer Science',
    },
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [events, setEvents] = useState<(CollegeEvent & { registeredCount: number; availableSeats: number; isFull: boolean })[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>('chat');
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Toast notification state for errors / success
  const [toast, setToast] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CollegeEvent | null>(null);
  const [participantModalEventId, setParticipantModalEventId] = useState<string | null>(null);

  const showToast = (type: 'error' | 'success', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 6000);
  };

  // Fetch all initial data
  const loadData = useCallback(async () => {
    try {
      const [stuRes, admRes, evtRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/admins'),
        fetch('/api/events'),
      ]);

      if (stuRes.ok) setStudents(await stuRes.json());
      if (admRes.ok) setAdmins(await admRes.json());
      if (evtRes.ok) setEvents(await evtRes.json());

      // Fetch registrations depending on user
      await loadRegistrations(currentUser);
    } catch (err) {
      console.error('Failed to load application data:', err);
    }
  }, [currentUser]);

  const loadRegistrations = async (user: CurrentUser) => {
    try {
      const query = user.role === 'admin' ? '?isAdmin=true' : `?studentId=${user.data.studentId}`;
      const res = await fetch(`/api/registrations${query}`);
      if (res.ok) {
        setRegistrations(await res.json());
      }
    } catch (err) {
      console.error('Failed to load registrations:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // When user switches persona
  const handleSelectUser = (user: CurrentUser) => {
    setCurrentUser(user);
    loadRegistrations(user);
    // Add system notification in chat
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        role: 'system',
        content: `Switched user session to ${user.data.name} (${user.role === 'admin' ? 'Admin' : 'Student'} ID: ${user.role === 'admin' ? user.data.adminId : user.data.studentId}).`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  // Send message to AI assistant
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isAssistantLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAssistantLoading(true);

    try {
      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          currentUser,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Request completed.',
        timestamp: new Date().toISOString(),
        toolCalls: data.toolCalls,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Check if any duplicate error occurred in tool calls
      const duplicateToolError = data.toolCalls?.find(
        (t: any) => t.result?.isDuplicate || t.result?.alreadyRegistered || (t.result?.error && t.result.error.toLowerCase().includes('duplicate'))
      );
      if (duplicateToolError) {
        showToast('error', duplicateToolError.result.error || 'Duplicate entry error detected.');
      }

      // If any mutation tools were run, refresh live events and registrations
      const mutationTools = ['register_student', 'create_event', 'update_event', 'delete_event', 'create_calendar_event'];
      const hasMutations = data.toolCalls?.some((t: any) => mutationTools.includes(t.tool));

      if (hasMutations) {
        const evtRes = await fetch('/api/events');
        if (evtRes.ok) setEvents(await evtRes.json());
        await loadRegistrations(currentUser);
      }
    } catch (err: any) {
      console.error('Error during AI Assistant execution:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an issue processing your request. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsAssistantLoading(false);
    }
  };

  // Reset DB
  const handleResetDb = async () => {
    setIsResetting(true);
    try {
      await fetch('/api/reset-db', { method: 'POST' });
      await loadData();
      showToast('success', 'Database successfully reset to initial seed state.');
      setMessages([
        {
          id: `init-${Date.now()}`,
          role: 'assistant',
          content: 'College Event Database has been reset to initial seed state. How can I assist you today?',
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Failed to reset DB:', err);
    } finally {
      setIsResetting(false);
    }
  };

  // Action from events view: Register via Assistant
  const handleAskAssistantToRegister = (eventName: string) => {
    setActiveTab('chat');
    handleSendMessage(`Register me for the ${eventName}.`);
  };

  // Action from registrations view: Query via Assistant
  const handleOpenAssistantForQuery = (prompt: string) => {
    setActiveTab('chat');
    handleSendMessage(prompt);
  };

  // Admin save event (create or update with duplicate check)
  const handleSaveEvent = async (eventData: any) => {
    if (currentUser.role !== 'admin') {
      alert('Administrator authorization required.');
      return;
    }

    if (eventData.eventId) {
      // Update
      await handleSendMessage(
        `Change the ${eventData.name} venue to ${eventData.venue} with capacity ${eventData.maximumCapacity}.`
      );
      await loadData();
    } else {
      // Create: Call /api/events to perform strict duplicate check
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventData,
          isAdmin: true,
        }),
      });

      const resJson = await res.json();

      if (!res.ok) {
        // Show error in modal and toast
        showToast('error', resJson.error || 'Failed to create event.');
        throw new Error(resJson.error || 'Duplicate event error.');
      }

      showToast('success', `Event "${eventData.name}" created successfully.`);
      await loadData();
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-evt-${Date.now()}`,
          role: 'assistant',
          content: `Event created successfully.\n\nEvent: ${resJson.name}\nDate: ${resJson.date}\nTime: ${resJson.time}\nVenue: ${resJson.venue}\nCapacity: ${resJson.maximumCapacity}\nID: ${resJson.eventId}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  // Admin delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (currentUser.role !== 'admin') {
      alert('Administrator authorization required.');
      return;
    }
    const evt = events.find((e) => e.eventId === eventId);
    if (!evt) return;

    const ok = window.confirm(`Are you sure you want to delete "${evt.name}" (${eventId})?`);
    if (!ok) return;

    await handleSendMessage(`Delete the event ${evt.name}.`);
    await loadData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      <Navbar
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        students={students}
        admins={admins}
        onResetDb={handleResetDb}
        isResetting={isResetting}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        registrationCount={registrations.length}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`p-3.5 rounded-2xl border shadow-2xl flex items-start space-x-3 backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-red-950/90 border-red-500/50 text-red-200 shadow-red-950/50'
                : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-emerald-950/50'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs font-medium leading-relaxed">
              <span className="font-bold block mb-0.5">
                {toast.type === 'error' ? 'Validation Error' : 'Success'}
              </span>
              {toast.message}
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'chat' && (
          <ChatAssistant
            currentUser={currentUser}
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isAssistantLoading}
            onRefreshData={loadData}
          />
        )}

        {activeTab === 'events' && (
          <EventsView
            events={events}
            currentUser={currentUser}
            registrations={registrations}
            onAskAssistantToRegister={handleAskAssistantToRegister}
            onOpenCreateModal={() => {
              setEventToEdit(null);
              setIsEventModalOpen(true);
            }}
            onOpenEditModal={(event) => {
              setEventToEdit(event);
              setIsEventModalOpen(true);
            }}
            onOpenParticipantsModal={(eventId) => setParticipantModalEventId(eventId)}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {activeTab === 'all-events-db' && (
          <AllEventsDatabaseView
            events={events}
            currentUser={currentUser}
            registrations={registrations}
            onAskAssistantToRegister={handleAskAssistantToRegister}
            onOpenCreateModal={() => {
              setEventToEdit(null);
              setIsEventModalOpen(true);
            }}
            onOpenEditModal={(event) => {
              setEventToEdit(event);
              setIsEventModalOpen(true);
            }}
            onOpenParticipantsModal={(eventId) => setParticipantModalEventId(eventId)}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {activeTab === 'all-users-db' && (
          <AllUsersDatabaseView
            currentUser={currentUser}
            onSelectUser={handleSelectUser}
            students={students}
            admins={admins}
          />
        )}

        {activeTab === 'registrations' && (
          <RegistrationsView
            currentUser={currentUser}
            registrations={registrations}
            events={events}
            onOpenAssistantForQuery={handleOpenAssistantForQuery}
          />
        )}

        {activeTab === 'database' && (
          <DatabaseInspector
            students={students}
            admins={admins}
            events={events}
            registrations={registrations}
            onResetDb={handleResetDb}
            isResetting={isResetting}
            currentUser={currentUser}
            onSelectUser={handleSelectUser}
          />
        )}
      </main>

      {/* Admin Modals */}
      <AdminEventManagerModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        eventToEdit={eventToEdit}
        onSave={handleSaveEvent}
      />

      <ParticipantListModal
        isOpen={!!participantModalEventId}
        onClose={() => setParticipantModalEventId(null)}
        eventId={participantModalEventId}
      />
    </div>
  );
}
