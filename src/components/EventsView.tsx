import React, { useState } from 'react';
import { 
  Search, 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  Clock, 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { CollegeEvent, CurrentUser, Registration } from '../types.js';

interface EventsViewProps {
  events: (CollegeEvent & { registeredCount: number; availableSeats: number; isFull: boolean })[];
  currentUser: CurrentUser;
  registrations: Registration[];
  onAskAssistantToRegister: (eventName: string) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (event: CollegeEvent) => void;
  onOpenParticipantsModal: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  currentUser,
  registrations,
  onAskAssistantToRegister,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenParticipantsModal,
  onDeleteEvent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Artificial Intelligence', 'Analytics & Management', 'Cybersecurity', 'Cloud & DevOps', 'Robotics & Hardware'];

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const isUserRegisteredFor = (eventId: string) => {
    if (currentUser.role !== 'student') return false;
    return registrations.some((r) => r.eventId === eventId && r.status === 'CONFIRMED');
  };

  const getCalendarLinkFor = (eventId: string) => {
    const reg = registrations.find((r) => r.eventId === eventId && r.status === 'CONFIRMED');
    return reg?.calendarLink;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner / Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            College Events & Workshops
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse upcoming technical seminars, bootcamps, and academic workshops with real-time seat tracking.
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, keyword, or venue..."
            className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.map((event) => {
          const registered = isUserRegisteredFor(event.eventId);
          const percentFilled = Math.min(
            100,
            Math.round((event.registeredCount / event.maximumCapacity) * 100)
          );
          const calendarLink = getCalendarLinkFor(event.eventId);

          return (
            <div
              key={event.eventId}
              className={`flex flex-col justify-between bg-slate-900 border rounded-2xl p-5 transition-all shadow-sm ${
                registered
                  ? 'border-emerald-500/40 shadow-emerald-500/5 bg-slate-900/90'
                  : event.isFull
                  ? 'border-red-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Badges: Category & Status */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-blue-400 border border-blue-500/20">
                    {event.category || 'Workshop'}
                  </span>

                  {registered ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Registered</span>
                    </span>
                  ) : event.isFull ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Full Capacity</span>
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-cyan-400 border border-cyan-500/20">
                      {event.availableSeats} seat{event.availableSeats > 1 ? 's' : ''} left
                    </span>
                  )}
                </div>

                {/* Event Name & ID */}
                <div className="mb-2">
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                    {event.name}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">{event.eventId}</span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                  {event.description}
                </p>

                {/* Logistics */}
                <div className="space-y-2 mb-4 text-xs text-slate-300">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{event.venue}</span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1.5 mb-5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center space-x-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>Capacity</span>
                    </span>
                    <span className="font-semibold text-slate-200">
                      {event.registeredCount} / {event.maximumCapacity} seats
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        event.isFull
                          ? 'bg-red-500'
                          : percentFilled > 80
                          ? 'bg-amber-400'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${percentFilled}%` }}
                    />
                  </div>
                  {event.isFull && (
                    <p className="text-[10px] text-red-400 font-medium">
                      Event capacity reached. Further registrations locked.
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Actions based on Role */}
              <div className="pt-2 border-t border-slate-800/80">
                {currentUser.role === 'admin' ? (
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenParticipantsModal(event.eventId)}
                      className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>Participants</span>
                    </button>
                    <button
                      onClick={() => onOpenEditModal(event)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
                      title="Edit event"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(event.eventId)}
                      className="p-1.5 bg-slate-800 hover:bg-red-950/40 text-red-400 rounded-lg border border-slate-700 hover:border-red-800/50 transition-colors cursor-pointer"
                      title="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {registered ? (
                      <div className="flex items-center gap-2">
                        <span className="flex-1 py-2 text-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                          Registered
                        </span>
                        {calendarLink && (
                          <a
                            href={calendarLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 rounded-xl border border-blue-500/30 transition-colors"
                            title="Open Google Calendar Event"
                          >
                            <CalendarIcon className="w-4 h-4 text-blue-400" />
                          </a>
                        )}
                      </div>
                    ) : event.isFull ? (
                      <button
                        disabled
                        className="w-full py-2 bg-slate-800 text-slate-500 text-xs font-medium rounded-xl cursor-not-allowed border border-slate-700"
                      >
                        Event Full (0 Seats Left)
                      </button>
                    ) : (
                      <button
                        onClick={() => onAskAssistantToRegister(event.name)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Register via Assistant</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
