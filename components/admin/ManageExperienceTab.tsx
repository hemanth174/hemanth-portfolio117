'use client';
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Briefcase, MapPin, Clock, RefreshCw } from 'lucide-react';
import { WorkExperience } from './AdminTypes';

interface ManageExperienceTabProps {
  experiences: WorkExperience[];
  loading: boolean;
  onRefresh: () => void;
  onSave: (exp: Partial<WorkExperience>, isEdit: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const ManageExperienceTab: React.FC<ManageExperienceTabProps> = ({
  experiences,
  loading,
  onRefresh,
  onSave,
  onDelete,
}) => {
  const [editingExp, setEditingExp] = useState<WorkExperience | null>(null);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [duration, setDuration] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [link, setLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartEdit = (exp: WorkExperience) => {
    setEditingExp(exp);
    setCompany(exp.company || '');
    setRole(exp.role || '');
    setDuration(exp.duration || '');
    setIsCurrent(Boolean(exp.isCurrent));
    setLocation(exp.location || '');
    setDescription(exp.description || '');
    setSkills(Array.isArray(exp.skills) ? exp.skills.join(', ') : typeof exp.skills === 'string' ? exp.skills : '');
    setLink(exp.link || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingExp(null);
    setCompany('');
    setRole('');
    setDuration('');
    setIsCurrent(false);
    setLocation('');
    setDescription('');
    setSkills('');
    setLink('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim() || !duration.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(
        {
          _id: editingExp?._id,
          company: company.trim(),
          role: role.trim(),
          duration: duration.trim(),
          isCurrent,
          location: location.trim(),
          description: description.trim(),
          skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
          link: link.trim(),
        },
        !!editingExp
      );
      handleCancelEdit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white font-roboto">
            Manage Work Experience
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">
            Maintain industry roles, internships, and technical leadership history.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:border-yellow-400 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-all shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <Plus size={16} className="text-amber-500" />
              {editingExp ? 'Edit Experience' : 'Add Experience Entry'}
            </h3>
            {editingExp && (
              <button
                onClick={handleCancelEdit}
                className="text-[11px] text-zinc-400 hover:text-red-500 font-mono"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                Company / Organization *
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. NIAT Drone Lab"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                Role Title *
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Robotics & Software Intern"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                  Duration *
                </label>
                <input
                  type="text"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. Jun 2025 - Present"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Hyderabad, India"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                Description *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key accomplishments and technical responsibilities..."
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                Key Skills (Comma-separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript, Python, IoT, Drones"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 font-bold text-black uppercase tracking-wider font-mono transition-all shadow-md mt-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingExp ? 'Update Entry' : 'Add Experience'}
            </button>
          </form>
        </div>

        {/* Existing Experiences */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider font-mono">
            Work Experience Timeline ({experiences.length})
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
            </div>
          ) : experiences.length === 0 ? (
            <div className="py-20 text-center text-zinc-400 font-mono border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
              No work experiences added yet.
            </div>
          ) : (
            <div className="space-y-3">
              {experiences.map((exp) => (
                <div
                  key={exp._id}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Briefcase size={14} className="text-amber-500" />
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                        {exp.role}
                      </h4>
                      <span className="text-xs text-zinc-400 font-mono">@ {exp.company}</span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {exp.description}
                    </p>

                    <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-mono pt-1">
                      <div className="flex items-center gap-1"><Clock size={11} /> {exp.duration}</div>
                      {exp.location && <div className="flex items-center gap-1"><MapPin size={11} /> {exp.location}</div>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleStartEdit(exp)}
                      className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => exp._id && onDelete(exp._id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
