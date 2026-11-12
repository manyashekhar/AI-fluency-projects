import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Search, 
  Plus, 
  Users, 
  MapPin, 
  Clock, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  Edit3, 
  Trash2,
  Table,
  LayoutGrid,
  Layers
} from 'lucide-react';
import { CollegeEvent, CurrentUser, Registration } from '../types.js';

interface AllEventsDatabaseViewProps {
  events: (CollegeEvent & { registeredCount: number; availableSeats: number; isFull: boolean })[];
  currentUser: CurrentUser;
  registrations: Registration[];
  onAskAssistantToRegister: (eventName: string) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (event: CollegeEvent) => void;
  onOpenParticipantsModal: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
}

export const AllEventsDatabaseView: React.FC<AllEventsDatabaseViewProps> = ({
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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const categories = ['All', 'Artificial Intelligence', 'Analytics & Management', 'Cybersecurity', 'Cloud & DevOps', 'Robotics & Hardware', 'General'];

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.eventId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.date.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalCapacity = events.reduce((acc, e) => acc + e.maximumCapacity, 0);
  const totalEnrolled = events.reduce((acc, e) => acc + e.registeredCount, 0);
  const fullEventsCount = events.filter((e) => e.isFull).length;

  const isUserRegistered = (eventId: string) => {
    if (currentUser.role !== 'student') return false;
    return registrations.some((r) => r.eventId === eventId && r.status === 'CONFIRMED');
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'college_events_database.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-blue-400" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                All Events Database
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {events.length} Events Total
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Live database records of college workshops, seminars, capacities, enrolled attendees, and venues.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export JSON</span>
            </button>

            {currentUser.role === 'admin' && (
              <button
                onClick={onOpenCreateModal}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Event</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <p className="text-xs text-slate-400 font-medium">Total Active Events</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">{events.length}</p>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <p className="text-xs text-slate-400 font-medium">Total Seat Capacity</p>
            <p className="text-xl sm:text-2xl font-bold text-cyan-400 mt-1">{totalCapacity}</p>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <p className="text-xs text-slate-400 font-medium">Enrolled Participants</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-400 mt-1">{totalEnrolled}</p>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <p className="text-xs text-slate-400 font-medium">Fully Booked Events</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">{fullEventsCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by name, ID, venue, date..."
            className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Table view"
            >
              <Table className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Card grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Events Table View */}
      {viewMode === 'table' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Event ID</th>
                  <th className="px-4 py-3">Event Name & Topic</th>
                  <th className="px-4 py-3">Schedule</th>
                  <th className="px-4 py-3">Venue</th>
                  <th className="px-4 py-3">Capacity & Enrollment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No events match your search query.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => {
                    const registered = isUserRegistered(event.eventId);

                    return (
                      <tr key={event.eventId} className="hover:bg-slate-800/40 transition-colors">
                        {/* Event ID */}
                        <td className="px-4 py-3 font-mono font-medium text-cyan-400 whitespace-nowrap">
                          {event.eventId}
                        </td>

                        {/* Name & Category */}
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-sm">{event.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-blue-300 border border-slate-700">
                              {event.category || 'Workshop'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 max-w-sm">
                            {event.description}
                          </p>
                        </td>

                        {/* Schedule */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-slate-200 font-medium">{event.date}</div>
                          <div className="text-[11px] text-slate-400">{event.time}</div>
                        </td>

                        {/* Venue */}
                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                          {event.venue}
                        </td>

                        {/* Capacity */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-slate-100">
                              {event.registeredCount} / {event.maximumCapacity}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              ({event.availableSeats} available)
                            </span>
                          </div>
                          <div className="w-28 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                event.isFull
                                  ? 'bg-red-500'
                                  : event.availableSeats <= 3
                                  ? 'bg-amber-400'
                                  : 'bg-blue-500'
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.round((event.registeredCount / event.maximumCapacity) * 100)
                                )}%`,
                              }}
                            />
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {registered ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle className="w-3 h-3" />
                              <span>Registered</span>
                            </span>
                          ) : event.isFull ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                              <AlertTriangle className="w-3 h-3" />
                              <span>FULL</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                              <span>Available</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {currentUser.role === 'admin' ? (
                            <div className="inline-flex items-center space-x-1">
                              <button
                                onClick={() => onOpenParticipantsModal(event.eventId)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                                title="View participants"
                              >
                                <Users className="w-3.5 h-3.5 text-blue-400" />
                              </button>
                              <button
                                onClick={() => onOpenEditModal(event)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                                title="Edit event"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-slate-300" />
                              </button>
                              <button
                                onClick={() => onDeleteEvent(event.eventId)}
                                className="p-1.5 bg-slate-800 hover:bg-red-950/40 text-red-400 rounded-lg border border-slate-700 transition-colors"
                                title="Delete event"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div>
                              {registered ? (
                                <span className="text-[11px] text-emerald-400 font-medium">Enrolled ✓</span>
                              ) : event.isFull ? (
                                <span className="text-[11px] text-slate-500">Waitlist closed</span>
                              ) : (
                                <button
                                  onClick={() => onAskAssistantToRegister(event.name)}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  <span>Register</span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((event) => {
            const registered = isUserRegistered(event.eventId);

            return (
              <div
                key={event.eventId}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold">{event.eventId}</span>
                    <h3 className="font-bold text-white text-base mt-0.5">{event.name}</h3>
                  </div>
                  {event.isFull ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                      FULL
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-cyan-400 border border-cyan-500/30">
                      {event.availableSeats} seats left
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{event.description}</p>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>{event.date} at {event.time}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>{event.venue}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Capacity: {event.registeredCount}/{event.maximumCapacity}
                  </span>
                  {currentUser.role === 'admin' ? (
                    <button
                      onClick={() => onOpenParticipantsModal(event.eventId)}
                      className="px-2.5 py-1 bg-slate-800 text-xs text-slate-200 rounded-lg hover:bg-slate-700"
                    >
                      Participants
                    </button>
                  ) : (
                    <button
                      onClick={() => onAskAssistantToRegister(event.name)}
                      disabled={event.isFull || registered}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-medium rounded-lg"
                    >
                      {registered ? 'Registered' : event.isFull ? 'Full' : 'Register'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
