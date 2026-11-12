import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, Layers, AlertCircle } from 'lucide-react';
import { CollegeEvent } from '../types.js';

interface AdminEventManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: CollegeEvent | null;
  onSave: (eventData: any) => Promise<void>;
}

export const AdminEventManagerModal: React.FC<AdminEventManagerModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('25 October 2026');
  const [time, setTime] = useState('2:00 PM');
  const [venue, setVenue] = useState('Auditorium A');
  const [capacity, setCapacity] = useState(100);
  const [category, setCategory] = useState('Artificial Intelligence');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventToEdit) {
      setName(eventToEdit.name);
      setDescription(eventToEdit.description);
      setDate(eventToEdit.date);
      setTime(eventToEdit.time);
      setVenue(eventToEdit.venue);
      setCapacity(eventToEdit.maximumCapacity);
      setCategory(eventToEdit.category || 'Artificial Intelligence');
    } else {
      setName('');
      setDescription('');
      setDate('25 October 2026');
      setTime('2:00 PM');
      setVenue('Auditorium A');
      setCapacity(100);
      setCategory('Artificial Intelligence');
    }
    setError(null);
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !venue.trim() || capacity <= 0) {
      setError('Please fill in all required fields with valid data.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        eventId: eventToEdit ? eventToEdit.eventId : undefined,
        name,
        description,
        date,
        time,
        venue,
        maximumCapacity: Number(capacity),
        category,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-white mb-1">
          {eventToEdit ? 'Update College Event' : 'Create New College Event'}
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Admin tool connected to backend database. Enforces role security.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI & Machine Learning Workshop"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed workshop syllabus and prerequisites..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date *</label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="25 October 2026"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Time *</label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="2:00 PM"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Venue *</label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Auditorium A"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Max Capacity *</label>
              <input
                type="number"
                min={1}
                required
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Analytics & Management">Analytics & Management</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Cloud & DevOps">Cloud & DevOps</option>
              <option value="Robotics & Hardware">Robotics & Hardware</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : eventToEdit ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
