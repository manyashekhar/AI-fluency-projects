import React, { useState, useEffect } from 'react';
import { X, Users, Mail, GraduationCap, Calendar, CheckCircle, Search, AlertCircle } from 'lucide-react';

interface ParticipantListModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | null;
}

export const ParticipantListModal: React.FC<ParticipantListModalProps> = ({
  isOpen,
  onClose,
  eventId,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && eventId) {
      setLoading(true);
      setError(null);
      fetch(`/api/events/${eventId}/participants?isAdmin=true`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load participants or access denied.');
          return res.json();
        })
        .then((json) => {
          setData(json);
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setData(null);
      setSearch('');
    }
  }, [isOpen, eventId]);

  if (!isOpen) return null;

  const filteredParticipants = data?.participants?.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.studentId.toLowerCase().includes(search.toLowerCase()) ||
    p.course.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-100 flex flex-col max-h-[85vh]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white">Event Participant Roster</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Admin Only
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {data ? `${data.eventName} (${data.registeredCount}/${data.maximumCapacity} registered • ${data.availableSeats} seats left)` : 'Loading event details...'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs mb-3 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search participants by name, student ID, course..."
            className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950/60">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading participants...</div>
          ) : filteredParticipants.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              {search ? 'No participants match the search query.' : 'No registered participants for this event.'}
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px] sticky top-0">
                <tr>
                  <th className="px-3.5 py-2.5">Student</th>
                  <th className="px-3.5 py-2.5">ID</th>
                  <th className="px-3.5 py-2.5">Course</th>
                  <th className="px-3.5 py-2.5">Enrollment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {filteredParticipants.map((p: any) => (
                  <tr key={p.registrationId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-3.5 py-2.5">
                      <p className="font-semibold text-white">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.email}</p>
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-blue-400">{p.studentId}</td>
                    <td className="px-3.5 py-2.5 text-slate-300">{p.course}</td>
                    <td className="px-3.5 py-2.5">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle className="w-2.5 h-2.5" />
                        <span>Confirmed</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Total records: {filteredParticipants.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
