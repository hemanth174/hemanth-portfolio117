'use client';
import React, { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Workflow, Upload, FileCode2, RefreshCw } from 'lucide-react';
import { N8nWorkflow } from './AdminTypes';

interface ManageWorkflowsTabProps {
  workflows: N8nWorkflow[];
  loading: boolean;
  onRefresh: () => void;
  onSave: (workflow: Partial<N8nWorkflow>, isEdit: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const ManageWorkflowsTab: React.FC<ManageWorkflowsTabProps> = ({
  workflows,
  loading,
  onRefresh,
  onSave,
  onDelete,
}) => {
  const [editingWorkflow, setEditingWorkflow] = useState<N8nWorkflow | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Automation');
  const [tags, setTags] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [workflowJson, setWorkflowJson] = useState('');
  const [jsonFileName, setJsonFileName] = useState('');
  const [thumbMode, setThumbMode] = useState<'upload' | 'url'>('upload');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = (w: N8nWorkflow) => {
    setEditingWorkflow(w);
    setTitle(w.title || '');
    setDescription(w.description || '');
    setCategory(w.category || 'Automation');
    setTags(Array.isArray(w.tags) ? w.tags.join(', ') : typeof w.tags === 'string' ? w.tags : '');
    setThumbnail(w.thumbnail || '');
    setWorkflowJson(w.workflowJson || '');
    setJsonFileName(w.workflowJson ? 'Existing JSON Loaded' : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingWorkflow(null);
    setTitle('');
    setDescription('');
    setCategory('Automation');
    setTags('');
    setThumbnail('');
    setWorkflowJson('');
    setJsonFileName('');
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        JSON.parse(text); // validate
        setWorkflowJson(text);
        setJsonFileName(file.name);
      } catch {
        alert('Invalid JSON file format. Please upload a valid n8n exported workflow JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    if (!editingWorkflow && !workflowJson.trim()) {
      alert('Please upload an n8n workflow JSON file.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(
        {
          _id: editingWorkflow?._id,
          title: title.trim(),
          description: description.trim(),
          category,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          thumbnail,
          workflowJson: workflowJson || undefined,
        },
        !!editingWorkflow
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
            Manage n8n Automation Workflows
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">
            Upload exported n8n workflow JSONs. Credentials will automatically be sanitized on publication.
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
              <Plus size={16} className="text-[#EA4B35]" />
              {editingWorkflow ? 'Edit Workflow' : 'Upload n8n Workflow'}
            </h3>
            {editingWorkflow && (
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
                Workflow Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Gmail Auto-Responder with AI"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-[#EA4B35]"
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white outline-none cursor-pointer"
              >
                <option value="Automation">Automation</option>
                <option value="AI Agent">AI Agent</option>
                <option value="Data Pipeline">Data Pipeline</option>
                <option value="Webhook">Webhook</option>
                <option value="Notification">Notification</option>
                <option value="Custom">Custom</option>
              </select>
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
                placeholder="Explain the workflow logic and connected services..."
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
                placeholder="Gmail, OpenAI, Slack, Webhook"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none"
              />
            </div>

            {/* n8n JSON Upload Button */}
            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                n8n Workflow JSON File *
              </label>
              <input
                type="file"
                ref={jsonInputRef}
                accept=".json,application/json"
                onChange={handleJsonUpload}
                className="hidden"
              />
              <div
                onClick={() => jsonInputRef.current?.click()}
                className="p-3.5 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 hover:border-[#EA4B35] bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between cursor-pointer transition-all font-mono text-xs"
              >
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 truncate">
                  <FileCode2 size={16} className="text-[#EA4B35] shrink-0" />
                  <span className="truncate">{jsonFileName || 'Click to select .json file'}</span>
                </div>
                <Upload size={14} className="text-zinc-400 shrink-0 ml-2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-[#EA4B35] hover:bg-[#d43d28] font-bold text-white uppercase tracking-wider font-mono transition-all shadow-md mt-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingWorkflow ? 'Update Workflow' : 'Upload Workflow'}
            </button>
          </form>
        </div>

        {/* Existing Workflows */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider font-mono">
            Published Workflows ({workflows.length})
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#EA4B35]/20 border-t-[#EA4B35] rounded-full animate-spin" />
            </div>
          ) : workflows.length === 0 ? (
            <div className="py-20 text-center text-zinc-400 font-mono border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
              No n8n workflows uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {workflows.map((w) => (
                <div
                  key={w._id}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:border-[#EA4B35]/50 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black uppercase font-mono px-2 py-0.5 rounded-full bg-[#EA4B35]/10 text-[#EA4B35] border border-[#EA4B35]/20">
                        {w.category}
                      </span>
                      {w.nodeCount != null && (
                        <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                          <Workflow size={11} /> {w.nodeCount} nodes
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1 mb-1">
                      {w.title}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {w.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-900">
                    <button
                      onClick={() => handleStartEdit(w)}
                      className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => w._id && onDelete(w._id)}
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
