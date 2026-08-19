'use client';
import React, { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Award, Upload, RefreshCw } from 'lucide-react';
import { Certification } from './AdminTypes';

interface ManageCertificationsTabProps {
  certifications: Certification[];
  loading: boolean;
  onRefresh: () => void;
  onSave: (cert: Partial<Certification>, isEdit: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const ManageCertificationsTab: React.FC<ManageCertificationsTabProps> = ({
  certifications,
  loading,
  onRefresh,
  onSave,
  onDelete,
}) => {
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [title, setTitle] = useState('');
  const [img, setImg] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = (c: Certification) => {
    setEditingCert(c);
    setTitle(c.title || '');
    setImg(c.img || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingCert(null);
    setTitle('');
    setImg('');
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImg(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !img.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(
        {
          _id: editingCert?._id,
          title: title.trim(),
          img: img.trim(),
        },
        !!editingCert
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
            Manage Certifications & Badges
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">
            Upload certificates, hackathon honors, and verification credentials.
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
              {editingCert ? 'Edit Certificate' : 'Add New Certificate'}
            </h3>
            {editingCert && (
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
                Certificate Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Neo4j Certified Professional"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 font-mono text-[11px]">
                <label className="text-zinc-600 dark:text-zinc-400 font-bold">Certificate Image *</label>
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
                    className={`h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-2 cursor-pointer transition-all ${
                      isDragging
                        ? 'border-yellow-400 bg-yellow-400/5'
                        : 'border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:border-yellow-400'
                    }`}
                  >
                    {img ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img src={img} alt="Preview" className="max-h-full max-w-full object-contain rounded" />
                        <span className="absolute text-[9px] bg-black/70 text-white px-2 py-0.5 rounded font-mono">
                          Click to Change
                        </span>
                      </div>
                    ) : (
                      <div className="text-center text-zinc-400 font-mono text-[10px]">
                        <Upload size={20} className="mx-auto mb-1 text-zinc-400" />
                        Upload Certificate Image
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <input
                  type="url"
                  value={img}
                  onChange={(e) => setImg(e.target.value)}
                  placeholder="https://example.com/certificate.png"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 font-bold text-black uppercase tracking-wider font-mono transition-all shadow-md mt-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingCert ? 'Update Certificate' : 'Publish Certificate'}
            </button>
          </form>
        </div>

        {/* Existing Certifications (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider font-mono">
            Published Certificates ({certifications.length})
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
            </div>
          ) : certifications.length === 0 ? (
            <div className="py-20 text-center text-zinc-400 font-mono border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
              No certifications uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certifications.map((c) => (
                <div
                  key={c._id || c.id}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                >
                  <div>
                    <div className="h-36 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden mb-3 border border-zinc-200 dark:border-zinc-800 relative">
                      {c.img ? (
                        <img src={c.img} alt={c.title} className="max-h-full max-w-full object-contain p-2" />
                      ) : (
                        <Award size={28} className="text-zinc-400" />
                      )}
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white line-clamp-2">
                      {c.title}
                    </h4>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-900">
                    <button
                      onClick={() => handleStartEdit(c)}
                      className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => (c._id || c.id) && onDelete((c._id || c.id) as string)}
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
