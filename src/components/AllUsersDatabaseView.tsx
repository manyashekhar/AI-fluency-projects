import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  GraduationCap, 
  UserCheck, 
  Download, 
  ExternalLink, 
  Sparkles,
  BookOpen,
  Mail,
  Calendar,
  Layers
} from 'lucide-react';
import { CurrentUser, Student, AdminUser, AppUser } from '../types.js';

interface AllUsersDatabaseViewProps {
  currentUser: CurrentUser;
  onSelectUser: (user: CurrentUser) => void;
  students: Student[];
  admins: AdminUser[];
}

export const AllUsersDatabaseView: React.FC<AllUsersDatabaseViewProps> = ({
  currentUser,
  onSelectUser,
  students,
  admins,
}) => {
  const [usersData, setUsersData] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Student' | 'Administrator'>('All');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      if (res.ok) {
        const json = await res.json();
        setUsersData(json.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  const filteredUsers = usersData.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.courseOrDepartment.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'All' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const studentsCount = usersData.filter((u) => u.role === 'Student').length;
  const adminsCount = usersData.filter((u) => u.role === 'Administrator').length;
  const totalRegistrations = usersData.reduce((acc, u) => acc + (u.registrationCount || 0), 0);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(usersData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'college_users_database.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSwitchUser = (user: AppUser) => {
    if (user.role === 'Student') {
      const stu = students.find((s) => s.studentId === user.userId) || {
        studentId: user.userId,
        name: user.name,
        email: user.email,
        course: user.courseOrDepartment,
      };
      onSelectUser({ role: 'student', data: stu });
    } else {
      const adm = admins.find((a) => a.adminId === user.userId) || {
        adminId: user.userId,
        name: user.name,
        email: user.email,
        role: 'Administrator',
        department: user.courseOrDepartment,
      };
      onSelectUser({ role: 'admin', data: adm });
    }
  };

  const isCurrentActive = (user: AppUser) => {
    if (currentUser.role === 'student') {
      return user.role === 'Student' && currentUser.data.studentId === user.userId;
    } else {
      return user.role === 'Administrator' && currentUser.data.adminId === user.userId;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                All Users Database
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {usersData.length} Total Users
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Complete directory of all registered students and administrators. Switch personas with one click to test RBAC and live assistant access.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export Users JSON</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <p className="text-xs text-slate-400 font-medium">Total Registered Users</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">{usersData.length}</p>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <p className="text-xs text-slate-400 font-medium">Student Accounts</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-400 mt-1">{studentsCount}</p>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <p className="text-xs text-slate-400 font-medium">Administrators</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-400 mt-1">{adminsCount}</p>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <p className="text-xs text-slate-400 font-medium">Active Event Enrollments</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">{totalRegistrations}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name, ID, email, course..."
            className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          {(['All', 'Student', 'Administrator'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                roleFilter === role
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              {role === 'All' ? 'All Roles' : `${role}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Users Database Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800 tracking-wider">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Course / Department</th>
                <th className="px-4 py-3">Registrations / Permissions</th>
                <th className="px-4 py-3 text-right">Impersonate / Switch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Loading users database...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No users match your search query or role filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isActive = isCurrentActive(user);

                  return (
                    <tr
                      key={user.userId}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isActive ? 'bg-blue-900/10' : ''
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-semibold text-white">{user.name}</span>
                              {isActive && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-blue-500/20 text-blue-300">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 block">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            user.role === 'Administrator'
                              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                              : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {user.role === 'Administrator' ? (
                            <ShieldCheck className="w-3 h-3 text-purple-400" />
                          ) : (
                            <GraduationCap className="w-3 h-3 text-blue-400" />
                          )}
                          <span>{user.role}</span>
                        </span>
                      </td>

                      {/* User ID */}
                      <td className="px-4 py-3 font-mono font-medium text-cyan-400 whitespace-nowrap">
                        {user.userId}
                      </td>

                      {/* Course / Department */}
                      <td className="px-4 py-3 text-slate-300">
                        {user.courseOrDepartment}
                      </td>

                      {/* Registrations / Permissions */}
                      <td className="px-4 py-3">
                        {user.role === 'Student' ? (
                          <div className="space-y-1">
                            <span className="text-[11px] font-medium text-slate-300">
                              {user.registrationCount} workshop{user.registrationCount === 1 ? '' : 's'} registered
                            </span>
                            {user.registeredEvents && user.registeredEvents.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {user.registeredEvents.map((re) => (
                                  <span
                                    key={re.registrationId}
                                    className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700"
                                    title={`${re.eventName} (${re.registrationId})`}
                                  >
                                    {re.eventName}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-950/60 text-purple-300 border border-purple-800/40">
                              Manage Events
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-950/60 text-purple-300 border border-purple-800/40">
                              View Participants
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Impersonate button */}
                      <td className="px-4 py-3 text-right">
                        {isActive ? (
                          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-slate-800 text-slate-400 text-xs font-medium rounded-lg border border-slate-700">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSwitchUser(user)}
                            className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold rounded-lg border border-blue-500/30 transition-colors cursor-pointer"
                          >
                            <span>Switch to User</span>
                          </button>
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
    </div>
  );
};
