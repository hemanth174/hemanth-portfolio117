'use client';
import React, { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Calendar, MapPin, Upload, RefreshCw, Film } from 'lucide-react';
import { TimelineEvent } from './AdminTypes';

interface ManageEventsTabProps {
  events: TimelineEvent[];
  loading: boolean;
  onRefresh: () => void;
  onSave: (event: Partial<TimelineEvent>, isEdit: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const ManageEventsTab: React.FC<ManageEventsTabProps> = ({
  events,
  loading,
  onRefresh,
  onSave,
  onDelete,
}) => {
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'college' | 'off-college'>('college');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [gallery, setGallery] = useState('');
  const [team, setTeam] = useState('');
  const [contributions, setContributions] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaMessage, setMediaMessage] = useState('');
  const [pendingMedia, setPendingMedia] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = (ev: TimelineEvent) => {
    setEditingEvent(ev);
    setTitle(ev.title || '');
    setType(ev.type || 'college');
    setDate(ev.date || '');
    setLocation(ev.location || '');
    setDescription(ev.description || '');
    setStory(ev.story || '');
    setTags(Array.isArray(ev.tags) ? ev.tags.join(', ') : typeof ev.tags === 'string' ? ev.tags : '');
    setImage(ev.image || '');
    setLink(ev.link || '');
    setVideoUrl(ev.videoUrl || '');
    setProjectUrl(ev.projectUrl || '');
    setGallery(Array.isArray(ev.gallery) ? ev.gallery.join('\n') : '');
    setTeam(Array.isArray(ev.team) ? ev.team.join('\n') : '');
    setContributions(Array.isArray(ev.contributions) ? ev.contributions.join('\n') : '');
    setOutcomes(Array.isArray(ev.outcomes) ? ev.outcomes.join('\n') : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setTitle('');
    setType('college');
    setDate('');
    setLocation('');
    setDescription('');
    setStory('');
    setTags('');
    setImage('');
    setLink('');
    setVideoUrl('');
    setProjectUrl('');
    setGallery('');
    setTeam('');
    setContributions('');
    setOutcomes('');
    setPendingMedia([]);
    setMediaMessage('');
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadMedia = (files: FileList | File[]) => {
    const selected = Array.from(files);
    if (!selected.length) return;
    setMediaMessage('');
    const valid = selected.filter((file) => {
      if (file.type.startsWith('video/') && file.size > 300 * 1024 * 1024) {
        setMediaMessage(`${file.name} is larger than the 300 MB video limit.`);
        return false;
      }
      if (file.type.startsWith('image/') && file.size > 15 * 1024 * 1024) {
        setMediaMessage(`${file.name} is larger than the 15 MB image limit.`);
        return false;
      }
      return true;
    });
    if (valid.length) {
      setPendingMedia((current) => [...current, ...valid]);
      setMediaMessage(`${valid.length} file${valid.length === 1 ? '' : 's'} queued. Save the event to upload.`);
    }
  };

  const uploadFile = async (file: File) => {
    const body = new FormData();
    body.append('file', file);
    const response = await fetch('/api/events/media', { method: 'POST', body });
    const raw = await response.text();
    let data: { url?: string; type?: string; error?: string } = {};
    try {
      data = JSON.parse(raw) as typeof data;
    } catch {
      throw new Error(`Upload failed (${response.status}). The server rejected this file or the upload is too large.`);
    }
    if (!response.ok) throw new Error(data.error || 'Upload failed');
    if (!data.url || !data.type) throw new Error('The server did not return a media URL.');
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim() || !description.trim() || !location.trim()) return;

    setIsSubmitting(true);
    try {
      setIsUploadingMedia(pendingMedia.length > 0);
      const uploadedGallery = gallery.split('\n').map((value) => value.trim()).filter(Boolean);
      let uploadedVideoUrl = videoUrl.trim();
      for (const file of pendingMedia) {
        const media = await uploadFile(file);
        if (media.type === 'video') uploadedVideoUrl = media.url as string;
        else uploadedGallery.push(media.url as string);
      }
      await onSave(
        {
          _id: editingEvent?._id,
          title: title.trim(),
          type,
          date: date.trim(),
          location: location.trim(),
          description: description.trim(),
          story: story.trim(),
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          image,
          link: link.trim(),
          videoUrl: uploadedVideoUrl,
          projectUrl: projectUrl.trim(),
          gallery: uploadedGallery,
          team: team.split('\n').map((value) => value.trim()).filter(Boolean),
          contributions: contributions.split('\n').map((value) => value.trim()).filter(Boolean),
          outcomes: outcomes.split('\n').map((value) => value.trim()).filter(Boolean),
        },
        !!editingEvent
      );
      handleCancelEdit();
    } finally {
      setIsSubmitting(false);
      setIsUploadingMedia(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white font-roboto">
            Manage Activities & Timeline Events
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">
            Document workshops, drone trainings, hackathons, and institutional experiences.
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
        {/* Form (1 col) */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <Plus size={16} className="text-amber-500" />
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h3>
            {editingEvent && (
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
                Event Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Breaking into IoT Workshop"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div><label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">Build / Project URL</label><input type="url" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://shiksha-sahayak..." className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none" /></div>
              <div><label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">Video URL</label><input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="YouTube, Drive, or MP4 URL" className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none" /></div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
              <p className="mb-3 font-mono text-[10px] font-bold tracking-widest text-amber-600 dark:text-yellow-300">STORY PAGE CONTENT · ONE ITEM PER LINE</p>
              <div className="space-y-3">
                <textarea rows={2} value={gallery} onChange={(e) => setGallery(e.target.value)} placeholder="Gallery image URLs (one per line)" className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none" />
                <textarea rows={2} value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Teammates / collaborators (one per line)" className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none" />
                <textarea rows={3} value={contributions} onChange={(e) => setContributions(e.target.value)} placeholder="What I did (one contribution per line)" className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none" />
                <textarea rows={3} value={outcomes} onChange={(e) => setOutcomes(e.target.value)} placeholder="Outcomes and takeaways (one per line)" className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none" />
                <div className="grid gap-2 sm:grid-cols-2"><label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-3 py-3 text-center font-mono text-[10px] font-bold text-zinc-500 hover:border-yellow-400 dark:border-zinc-700"><Upload size={14} /> ADD PHOTOS<input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && uploadMedia(e.target.files)} /></label><label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-3 py-3 text-center font-mono text-[10px] font-bold text-zinc-500 hover:border-yellow-400 dark:border-zinc-700"><Film size={14} /> ADD VIDEO · MAX 300 MB<input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files && uploadMedia(e.target.files)} /></label></div>
                {isUploadingMedia && <p className="font-mono text-[10px] text-yellow-600">UPLOADING MEDIA...</p>}
                {mediaMessage && <p role="status" className={`font-mono text-[10px] ${mediaMessage.includes('uploaded') ? 'text-emerald-600' : 'text-red-500'}`}>{mediaMessage}</p>}
              </div>
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                Event Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'college' | 'off-college')}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white outline-none cursor-pointer"
              >
                <option value="college">On-Campus (College)</option>
                <option value="off-college">Off-Campus (External)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                  Date *
                </label>
                <input
                  type="text"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. 23 MAR 2025"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="NIAT, Hyderabad"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                Short Description *
              </label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of event..."
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                How It Went / Story (Optional)
              </label>
              <textarea
                rows={3}
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Full story for the event preview drawer..."
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="IoT, Robotics, NIAT, Drones"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none"
              />
            </div>

            {/* Image Mode */}
            <div>
              <div className="flex items-center justify-between mb-1.5 font-mono text-[11px]">
                <label className="text-zinc-600 dark:text-zinc-400 font-bold">Event Image</label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`px-2 py-0.5 rounded ${imageMode === 'upload' ? 'bg-yellow-400 text-black font-bold' : 'text-zinc-500'}`}
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`px-2 py-0.5 rounded ${imageMode === 'url' ? 'bg-yellow-400 text-black font-bold' : 'text-zinc-500'}`}
                  >
                    URL
                  </button>
                </div>
              </div>

              {imageMode === 'upload' ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                    }}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) handleFile(f);
                    }}
                    className={`h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-2 cursor-pointer transition-all ${
                      isDragging
                        ? 'border-yellow-400 bg-yellow-400/5'
                        : 'border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:border-yellow-400'
                    }`}
                  >
                    {image ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img src={image} alt="Preview" className="max-h-full max-w-full object-contain rounded" />
                        <span className="absolute text-[9px] bg-black/70 text-white px-2 py-0.5 rounded font-mono">
                          Click to Change
                        </span>
                      </div>
                    ) : (
                      <div className="text-center text-zinc-400 font-mono text-[10px]">
                        <Upload size={16} className="mx-auto mb-1 text-zinc-400" />
                        Upload Event Photo
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/event.png"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 font-bold text-black uppercase tracking-wider font-mono transition-all shadow-md mt-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Publish Event'}
            </button>
          </form>
        </div>

        {/* Existing Events (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider font-mono">
            Published Timeline Events ({events.length})
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="py-20 text-center text-zinc-400 font-mono border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
              No events found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {events.map((ev) => (
                <div
                  key={ev._id || ev.id}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                >
                  <div>
                    <div className="h-32 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden mb-3 border border-zinc-200 dark:border-zinc-800 relative">
                      {ev.image ? (
                        <img src={ev.image} alt={ev.title} className="max-h-full max-w-full object-cover" />
                      ) : (
                        <Calendar size={28} className="text-zinc-400" />
                      )}
                      <span className="absolute top-2 right-2 text-[9px] font-black uppercase font-mono px-2 py-0.5 rounded-full bg-yellow-400 text-black">
                        {ev.type === 'college' ? 'College' : 'External'}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1 mb-1">
                      {ev.title}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                      {ev.description}
                    </p>

                    <div className="space-y-1 text-[10px] text-zinc-500 font-mono">
                      <div className="flex items-center gap-1.5"><Calendar size={11} /> {ev.date}</div>
                      <div className="flex items-center gap-1.5"><MapPin size={11} /> {ev.location}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-900">
                    <button
                      onClick={() => handleStartEdit(ev)}
                      className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => (ev._id || ev.id) && onDelete((ev._id || ev.id) as string)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={13} />
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
