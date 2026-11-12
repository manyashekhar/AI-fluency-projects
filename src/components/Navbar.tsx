import React from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  UserCheck, 
  RotateCcw, 
  Calendar as CalendarIcon,
  Sparkles,
  ChevronDown,
  Users,
  Database
} from 'lucide-react';
import { CurrentUser, Student, AdminUser } from '../types.js';

export type NavTab = 'chat' | 'events' | 'all-events-db' | 'all-users-db' | 'registrations' | 'database';

interface NavbarProps {
  currentUser: CurrentUser;
  onSelectUser: (user: CurrentUser) => void;
  students: Student[];
  admins: AdminUser[];
  onResetDb: () => void;
  isResetting: boolean;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  registrationCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSelectUser,
  students,
  admins,
  onResetDb,
  isResetting,
  activeTab,
  setActiveTab,
  registrationCount,
}) => {
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 backdrop-blur-md bg-slate-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('chat')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  CampusEvents
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                  AI ASSISTANT
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">College Event Management System</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>AI Assistant</span>
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>Browse Events</span>
            </button>
            <button
              onClick={() => setActiveTab('all-events-db')}
              className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'all-events-db'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>All Events DB</span>
            </button>
            <button
              onClick={() => setActiveTab('all-users-db')}
              className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'all-users-db'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>All Users DB</span>
            </button>
            <button
              onClick={() => setActiveTab('registrations')}
              className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'registrations'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>{currentUser.role === 'admin' ? 'Participants' : 'My Registrations'}</span>
              {registrationCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-blue-400/20 text-blue-300">
                  {registrationCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all flex items-center space-x-1 cursor-pointer ${
                activeTab === 'database'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>Tools & Rules</span>
            </button>
          </nav>

          {/* Right Controls: Role/Persona Switcher + Reset */}
          <div className="flex items-center space-x-3">
            {/* Reset Database Button */}
            <button
              onClick={onResetDb}
              disabled={isResetting}
              title="Reset database to initial seed data"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            {/* Persona / Auth Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2.5 bg-slate-800 hover:bg-slate-750 px-3 py-1.5 rounded-xl border border-slate-700 transition-all text-left"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                    : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {currentUser.role === 'admin' ? (
                    <ShieldCheck className="w-4 h-4 text-purple-300" />
                  ) : (
                    <UserCheck className="w-4 h-4 text-emerald-300" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-semibold text-slate-100">{currentUser.data.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      currentUser.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {currentUser.role === 'admin' ? 'Admin' : 'Student'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {currentUser.role === 'admin' ? currentUser.data.adminId : currentUser.data.studentId}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-slate-200">
                    <div className="px-3 py-1.5 border-b border-slate-700/60 mb-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Switch Authenticated User
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Tests student vs administrator access controls & permissions.
                      </p>
                    </div>

                    <div className="px-2 py-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5">Students</p>
                      {students.map((stu) => (
                        <button
                          key={stu.studentId}
                          onClick={() => {
                            onSelectUser({ role: 'student', data: stu });
                            setShowUserMenu(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            currentUser.role === 'student' && currentUser.data.studentId === stu.studentId
                              ? 'bg-blue-600/30 text-blue-200 border border-blue-500/30'
                              : 'hover:bg-slate-700/60 text-slate-300'
                          }`}
                        >
                          <div>
                            <p className="font-medium text-slate-100">{stu.name}</p>
                            <p className="text-[10px] text-slate-400">{stu.studentId} • {stu.course}</p>
                          </div>
                          {currentUser.role === 'student' && currentUser.data.studentId === stu.studentId && (
                            <span className="text-[10px] font-bold text-blue-400">Active</span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="px-2 py-1 border-t border-slate-700/60 mt-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5">Administrators</p>
                      {admins.map((adm) => (
                        <button
                          key={adm.adminId}
                          onClick={() => {
                            onSelectUser({ role: 'admin', data: adm });
                            setShowUserMenu(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            currentUser.role === 'admin' && currentUser.data.adminId === adm.adminId
                              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/30'
                              : 'hover:bg-slate-700/60 text-slate-300'
                          }`}
                        >
                          <div>
                            <p className="font-medium text-slate-100">{adm.name}</p>
                            <p className="text-[10px] text-slate-400">{adm.adminId} • {adm.department}</p>
                          </div>
                          {currentUser.role === 'admin' && currentUser.data.adminId === adm.adminId && (
                            <span className="text-[10px] font-bold text-purple-400">Active</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex border-t border-slate-800 bg-slate-900 px-2 py-1.5 space-x-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg text-center whitespace-nowrap ${
            activeTab === 'chat' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Assistant
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg text-center whitespace-nowrap ${
            activeTab === 'events' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab('all-events-db')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg text-center whitespace-nowrap ${
            activeTab === 'all-events-db' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Events DB
        </button>
        <button
          onClick={() => setActiveTab('all-users-db')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg text-center whitespace-nowrap ${
            activeTab === 'all-users-db' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Users DB
        </button>
        <button
          onClick={() => setActiveTab('registrations')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg text-center whitespace-nowrap ${
            activeTab === 'registrations' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {currentUser.role === 'admin' ? 'Participants' : 'Registrations'}
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg text-center whitespace-nowrap ${
            activeTab === 'database' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Tools
        </button>
      </div>
    </header>
  );
};
