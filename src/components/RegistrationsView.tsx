import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ExternalLink, 
  Search, 
  User, 
  GraduationCap, 
  Layers, 
  BarChart3, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Registration, CurrentUser, CollegeEvent, Student } from '../types.js';

interface RegistrationsViewProps {
  currentUser: CurrentUser;
  registrations: (Registration & { event?: CollegeEvent; student?: Student })[];
  events: CollegeEvent[];
  onOpenAssistantForQuery: (query: string) => void;
}

export const RegistrationsView: React.FC<RegistrationsViewProps> = ({
  currentUser,
  registrations,
  events,
  onOpenAssistantForQuery,
}) => {
  const [filterEventId, setFilterEventId] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isAdmin = currentUser.role === 'admin';

  const filteredRegistrations = registrations.filter((r) => {
    const matchesEvent = filterEventId === 'All' || r.eventId === filterEventId;
    const matchesSearch =
      (r.event?.name && r.event.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.registrationId && r.registrationId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.student?.name && r.student.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.studentId && r.studentId.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesEvent && matchesSearch;
  });

  // Calculate admin stats
  const totalRegistrations = registrations.length;
  const totalCapacity = events.reduce((sum, e) => sum + e.maximumCapacity, 0);
  const fillRate = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isAdmin ? 'Master Participant & Registration Registry' : 'My Event Registrations'}
              </h1>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Admin Access
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1">
              {isAdmin
                ? 'Authorized view of student enrollments, participant rosters, and capacity metrics.'
                : 'Verified registrations under your authenticated student account.'}
            </p>
          </div>

          {!isAdmin && (
            <button
              onClick={() => onOpenAssistantForQuery('Show my registrations.')}
              className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Query via Assistant</span>
            </button>
          )}
        </div>

        {/* Stats for Admin */}
        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-800">
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Total Active Enrollments</p>
              <p className="text-2xl font-bold text-white mt-1">{totalRegistrations}</p>
            </div>
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Total Campus Seat Capacity</p>
              <p className="text-2xl font-bold text-cyan-400 mt-1">{totalCapacity}</p>
            </div>
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Overall Seat Fill Rate</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{fillRate}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar for Registrations */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAdmin ? "Search by student, ID, or workshop..." : "Search your registrations..."}
            className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {isAdmin && (
          <div className="w-full sm:w-auto flex items-center space-x-2">
            <span className="text-xs text-slate-400 whitespace-nowrap">Filter by Event:</span>
            <select
              value={filterEventId}
              onChange={(e) => setFilterEventId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="All">All Events ({events.length})</option>
              {events.map((e) => (
                <option key={e.eventId} value={e.eventId}>
                  {e.name} ({e.eventId})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Registrations List / Table */}
      {filteredRegistrations.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
          <Layers className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <p className="text-base font-semibold text-slate-300">No registrations found</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {!isAdmin
              ? 'You have not registered for any events yet. Head over to Browse Events or ask the AI Assistant to register you!'
              : 'No student registrations match your current search query or filter.'}
          </p>
        </div>
      ) : !isAdmin ? (
        // Student View: Cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRegistrations.map((reg) => (
            <div
              key={reg.registrationId}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                    {reg.registrationId}
                  </span>
                  <h3 className="font-bold text-white text-base mt-2">
                    {reg.event?.name || 'Registered Event'}
                  </h3>
                </div>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Confirmed</span>
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>{reg.event?.date || 'Scheduled Date'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>{reg.event?.time || 'Scheduled Time'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>{reg.event?.venue || 'Campus Venue'}</span>
                </div>
              </div>

              {/* Calendar Status & Action */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Calendar:{' '}
                  <span className={reg.addedToCalendar ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                    {reg.addedToCalendar ? 'Added' : 'Not added'}
                  </span>
                </span>

                {reg.calendarLink && (
                  <a
                    href={reg.calendarLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-xs font-medium border border-blue-500/30 transition-colors"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>View in GCal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Admin View: Detailed Participant Table
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Registration ID</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Event Name</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredRegistrations.map((r) => (
                  <tr key={r.registrationId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-blue-400">
                      {r.registrationId}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {r.student?.name || r.studentId}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {r.studentId}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {r.student?.course || 'Engineering'}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-100">
                      {r.event?.name || r.eventId}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {r.event?.date || 'Scheduled'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle className="w-3 h-3" />
                        <span>CONFIRMED</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
