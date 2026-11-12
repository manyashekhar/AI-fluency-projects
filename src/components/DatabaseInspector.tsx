import React, { useState } from 'react';
import { 
  Database, 
  Wrench, 
  Shield, 
  CheckCircle2, 
  RotateCcw, 
  Users, 
  Calendar as CalendarIcon, 
  Layers, 
  Download,
  AlertTriangle,
  Search,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Student, CollegeEvent, Registration, AdminUser, CurrentUser } from '../types.js';

interface DatabaseInspectorProps {
  students: Student[];
  admins: AdminUser[];
  events: (CollegeEvent & { registeredCount: number; availableSeats: number; isFull: boolean })[];
  registrations: Registration[];
  onResetDb: () => void;
  isResetting: boolean;
  currentUser?: CurrentUser;
  onSelectUser?: (user: CurrentUser) => void;
}

export const DatabaseInspector: React.FC<DatabaseInspectorProps> = ({
  students,
  admins,
  events,
  registrations,
  onResetDb,
  isResetting,
  currentUser,
  onSelectUser,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'events-db' | 'users-db' | 'registrations-db' | 'tools' | 'rules'>('events-db');
  const [searchFilter, setSearchFilter] = useState('');

  // Combined users list
  const allUsers = [
    ...students.map((s) => ({
      userId: s.studentId,
      name: s.name,
      email: s.email,
      role: 'Student' as const,
      courseOrDepartment: s.course,
      avatar: s.avatar,
      registrationCount: registrations.filter((r) => r.studentId === s.studentId && r.status === 'CONFIRMED').length,
    })),
    ...admins.map((a) => ({
      userId: a.adminId,
      name: a.name,
      email: a.email,
      role: 'Administrator' as const,
      courseOrDepartment: a.department,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      registrationCount: 0,
    })),
  ];

  const filteredUsers = allUsers.filter((u) =>
    u.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    u.userId.toLowerCase().includes(searchFilter.toLowerCase()) ||
    u.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
    u.courseOrDepartment.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredEvents = events.filter((e) =>
    e.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    e.eventId.toLowerCase().includes(searchFilter.toLowerCase()) ||
    e.venue.toLowerCase().includes(searchFilter.toLowerCase()) ||
    e.date.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredRegistrations = registrations.filter((r) =>
    r.registrationId.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.studentId.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.eventId.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const exportTableJSON = (data: any, filename: string) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Live College Database Explorer
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Direct access to all events database, all users database (students & administrators), registration records, and safety guardrails.
          </p>
        </div>

        <button
          onClick={onResetDb}
          disabled={isResetting}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-blue-400' : ''}`} />
          <span>Reset DB to Initial Seed</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center space-x-1.5 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => { setActiveSubTab('events-db'); setSearchFilter(''); }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'events-db'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5 text-blue-300" />
          <span>All Events Database ({events.length})</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('users-db'); setSearchFilter(''); }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'users-db'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-cyan-300" />
          <span>All Users Database ({allUsers.length})</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('registrations-db'); setSearchFilter(''); }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'registrations-db'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-300" />
          <span>All Registrations ({registrations.length})</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('tools'); setSearchFilter(''); }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'tools'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Wrench className="w-3.5 h-3.5 text-amber-300" />
          <span>Connected Tools (11)</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('rules'); setSearchFilter(''); }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'rules'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-purple-300" />
          <span>Rules & Duplicate Guardrails</span>
        </button>
      </div>

      {/* Sub Tab: All Events Database */}
      {activeSubTab === 'events-db' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search events in database..."
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <button
              onClick={() => exportTableJSON(events, 'all_events_database')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export Events JSON</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Event ID</th>
                    <th className="px-4 py-3">Event Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Date & Time</th>
                    <th className="px-4 py-3">Venue</th>
                    <th className="px-4 py-3">Capacity</th>
                    <th className="px-4 py-3">Enrolled</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {filteredEvents.map((e) => (
                    <tr key={e.eventId} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{e.eventId}</td>
                      <td className="px-4 py-3 font-semibold text-white">
                        <div>{e.name}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{e.description}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{e.category || 'Workshop'}</td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{e.date} at {e.time}</td>
                      <td className="px-4 py-3 text-slate-300">{e.venue}</td>
                      <td className="px-4 py-3 font-semibold">{e.maximumCapacity}</td>
                      <td className="px-4 py-3 font-medium text-blue-300">{e.registeredCount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          e.isFull ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {e.isFull ? 'FULL (0 seats)' : `${e.availableSeats} available`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab: All Users Database */}
      {activeSubTab === 'users-db' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search users by name, ID, email, role..."
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <button
              onClick={() => exportTableJSON(allUsers, 'all_users_database')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export Users JSON</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Course / Department</th>
                    <th className="px-4 py-3">Registrations / Authority</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {filteredUsers.map((u) => {
                    const isCurrent = currentUser && (
                      (currentUser.role === 'student' && u.role === 'Student' && currentUser.data.studentId === u.userId) ||
                      (currentUser.role === 'admin' && u.role === 'Administrator' && currentUser.data.adminId === u.userId)
                    );

                    return (
                      <tr key={u.userId} className={`hover:bg-slate-800/40 ${isCurrent ? 'bg-blue-900/10' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                              alt={u.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <div className="font-semibold text-white">{u.name}</div>
                              <div className="text-[10px] text-slate-400">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-cyan-400">{u.userId}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            u.role === 'Administrator'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{u.courseOrDepartment}</td>
                        <td className="px-4 py-3">
                          {u.role === 'Student' ? (
                            <span className="text-[11px] text-slate-300 font-medium">
                              {u.registrationCount} registered workshop{u.registrationCount === 1 ? '' : 's'}
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                              Full Administrative Access
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isCurrent ? (
                            <span className="text-[11px] font-bold text-emerald-400">Active User</span>
                          ) : onSelectUser ? (
                            <button
                              onClick={() => {
                                if (u.role === 'Student') {
                                  const stu = students.find((s) => s.studentId === u.userId);
                                  if (stu) onSelectUser({ role: 'student', data: stu });
                                } else {
                                  const adm = admins.find((a) => a.adminId === u.userId);
                                  if (adm) onSelectUser({ role: 'admin', data: adm });
                                }
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs rounded border border-slate-700 cursor-pointer"
                            >
                              Switch User
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab: All Registrations Database */}
      {activeSubTab === 'registrations-db' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search by registration ID, student ID, event ID..."
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <button
              onClick={() => exportTableJSON(registrations, 'all_registrations_database')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export Registrations JSON</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Registration ID</th>
                    <th className="px-4 py-3">Student ID</th>
                    <th className="px-4 py-3">Event ID</th>
                    <th className="px-4 py-3">Enrollment Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Google Calendar Synced</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {filteredRegistrations.map((r) => (
                    <tr key={r.registrationId} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono font-medium text-blue-400">{r.registrationId}</td>
                      <td className="px-4 py-3 font-mono text-cyan-400">{r.studentId}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{r.eventId}</td>
                      <td className="px-4 py-3 text-slate-400">{new Date(r.registrationDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" />
                          <span>{r.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {r.addedToCalendar ? '✓ Added' : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab: Tools */}
      {activeSubTab === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'get_events', desc: 'Find / search events by keyword, date, venue, category.', access: 'Students & Admins' },
            { name: 'get_event', desc: 'Get specific event details with available seats & capacity.', access: 'Students & Admins' },
            { name: 'check_registration', desc: "Check current student's registration for an event.", access: 'Students (own)' },
            { name: 'get_my_registrations', desc: "Get current student's full registration list.", access: 'Students (own)' },
            { name: 'register_student', desc: 'Register student for event with duplicate & capacity checks.', access: 'Students' },
            { name: 'get_registration_count', desc: 'Get number of registrations and seats remaining.', access: 'Students & Admins' },
            { name: 'get_event_registrations', desc: 'Get participant roster for an event.', access: 'Admin only (protected)' },
            { name: 'create_event', desc: 'Admin creates new college workshop. Enforces duplicate event check.', access: 'Admin only (protected)' },
            { name: 'update_event', desc: 'Admin updates event venue, date, time, capacity.', access: 'Admin only (protected)' },
            { name: 'delete_event', desc: 'Admin deletes an event from the database.', access: 'Admin only (protected)' },
            { name: 'create_calendar_event', desc: 'Creates Google Calendar event after registration confirmation.', access: 'Students' },
          ].map((t) => (
            <div key={t.name} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-cyan-400 text-xs">{t.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                  t.access.includes('Admin only')
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {t.access}
                </span>
              </div>
              <p className="text-xs text-slate-300">{t.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Sub Tab: Rules */}
      {activeSubTab === 'rules' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-white text-base flex items-center space-x-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span>Core Safety & Business Rules Enforced by Assistant</span>
          </h3>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-start space-x-2.5 p-3 bg-red-950/20 rounded-xl border border-red-500/30">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Duplicate Registration Prevention (Strict Error)</p>
                <p className="text-slate-400">Never register a student twice for the same event. If a student is already registered, the backend returns an explicit Duplicate Registration Error and halts the workflow.</p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-3 bg-red-950/20 rounded-xl border border-red-500/30">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Duplicate Event Prevention (Strict Error)</p>
                <p className="text-slate-400">Never add a duplicate event to the database. If an administrator attempts to create an event with a name that already exists, the database blocks creation and returns a Duplicate Event Error.</p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-100">Live Database Verification</p>
                <p className="text-slate-400">Always use backend tools for live data. Never invent or hallucinate database state.</p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-100">Capacity Enforcement</p>
                <p className="text-slate-400">Never register a student if the event is full (capacity reached).</p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-100">Role-Based Access Control (RBAC)</p>
                <p className="text-slate-400">Students may only see their own registrations. Only authenticated administrators may see participant rosters or execute event create/update/delete operations.</p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-100">Post-Registration Calendar Sequence</p>
                <p className="text-slate-400">Do not create a Google Calendar event until registration has successfully completed.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
