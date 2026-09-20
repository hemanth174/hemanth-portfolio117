'use client';
import React, { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Code2, ExternalLink, Image as ImageIcon, Upload, RefreshCw } from 'lucide-react';
import { Project } from './AdminTypes';

interface ManageProjectsTabProps {
  projects: Project[];
  loading: boolean;
  onRefresh: () => void;
  onSave: (project: Partial<Project>, isEdit: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const ManageProjectsTab: React.FC<ManageProjectsTabProps> = ({
  projects,
  loading,
  onRefresh,
  onSave,
  onDelete,
}) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Personal Project');
  const [projectType, setProjectType] = useState<'big' | 'small'>('big');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [codeUrl, setCodeUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  // ── Project story fields (powers the READ THE STORY page) ──
  const [tagline, setTagline] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [stack, setStack] = useState('');
  const [problemHeading, setProblemHeading] = useState('');
  const [problem, setProblem] = useState('');
  const [constraints, setConstraints] = useState('');
  const [processHeading, setProcessHeading] = useState('');
  const [processIntro, setProcessIntro] = useState('');
  const [phases, setPhases] = useState('');
  const [decisions, setDecisions] = useState('');
  const [outcomeHeading, setOutcomeHeading] = useState('');
  const [outcomeBody, setOutcomeBody] = useState('');
  const [role, setRole] = useState('');
  const [rolePoints, setRolePoints] = useState('');
  const [reflectionHeading, setReflectionHeading] = useState('');
  const [reflection, setReflection] = useState('');
  const [stats, setStats] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetStoryFields = () => {
    setTagline('');
    setVideoUrl('');
    setStack('');
    setProblemHeading('');
    setProblem('');
    setConstraints('');
    setProcessHeading('');
    setProcessIntro('');
    setPhases('');
    setDecisions('');
    setOutcomeHeading('');
    setOutcomeBody('');
    setRole('');
    setRolePoints('');
    setReflectionHeading('');
    setReflection('');
    setStats('');
  };

  const handleStartEdit = (p: Project) => {
    setEditingProject(p);
    setTitle(p.title || '');
    setCategory(p.category || 'Personal Project');
    setProjectType(p.projectType || 'big');
    setDescription(p.description || '');
    setImage(p.image || '');
    setCodeUrl(p.codeUrl || '');
    setLiveUrl(p.liveUrl || '');
    setTagline(p.tagline || '');
    setVideoUrl(p.videoUrl || '');
    setStack(Array.isArray(p.stack) ? p.stack.join(', ') : (p.stack || ''));
    setProblemHeading(p.problemHeading || '');
    setProblem((p.problem || []).join('\n\n'));
    setConstraints((p.constraints || []).join('\n'));
    setProcessHeading(p.processHeading || '');
    setProcessIntro(p.processIntro || '');
    setPhases(
      (p.phases || [])
        .map((ph) => `${ph.label || ''} | ${ph.title || ''} | ${ph.desc || ''}${ph.marker ? ' | !' : ''}`)
        .join('\n')
    );
    setDecisions(
      (p.decisions || [])
        .map((d) => `${d.decision || ''} | ${d.rejected || ''} | ${d.reason || ''}`)
        .join('\n')
    );
    setOutcomeHeading(p.outcomeHeading || '');
    setOutcomeBody((p.outcomeBody || []).join('\n\n'));
    setRole(p.role || '');
    setRolePoints((p.rolePoints || []).join('\n'));
    setReflectionHeading(p.reflectionHeading || '');
    setReflection(p.reflection || '');
    setStats((p.stats || []).map((s) => `${s.value || ''} | ${s.label || ''}`).join('\n'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setTitle('');
    setCategory('Personal Project');
    setProjectType('big');
    setDescription('');
    setImage('');
    setCodeUrl('');
    setLiveUrl('');
    resetStoryFields();
  };

  const storyHasContent = () =>
    !!(tagline.trim() || videoUrl.trim() || problem.trim() || decisions.trim() || outcomeBody.trim());

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const splitLines = (v: string) => v.split('\n').map((s) => s.trim()).filter(Boolean);
  const splitParas = (v: string) => v.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(
        {
          _id: editingProject?._id,
          title: title.trim(),
          category,
          projectType,
          description: description.trim(),
          image,
          codeUrl: codeUrl.trim(),
          liveUrl: liveUrl.trim(),
          // ── Story payload (arrays parsed from the textareas below) ──
          tagline: tagline.trim(),
          videoUrl: videoUrl.trim(),
          stack: stack.split(',').map((s) => s.trim()).filter(Boolean),
          problemHeading: problemHeading.trim(),
          problem: splitParas(problem),
          constraints: splitLines(constraints),
          processHeading: processHeading.trim(),
          processIntro: processIntro.trim(),
          phases: splitLines(phases).map((line) => {
            const [label = '', phaseTitle = '', desc = '', flag = ''] = line.split('|').map((s) => s.trim());
            return { label, title: phaseTitle, desc, marker: flag === '!' };
          }),
          decisions: splitLines(decisions)
            .map((line) => {
              const [decision = '', rejected = '', reason = ''] = line.split('|').map((s) => s.trim());
              return { decision, rejected, reason };
            })
            .filter((d) => d.decision),
          outcomeHeading: outcomeHeading.trim(),
          outcomeBody: splitParas(outcomeBody),
          role: role.trim(),
          rolePoints: splitLines(rolePoints),
          reflectionHeading: reflectionHeading.trim(),
          reflection: reflection.trim(),
          stats: splitLines(stats)
            .map((line) => {
              const [value = '', label = ''] = line.split('|').map((s) => s.trim());
              return { value, label };
            })
            .filter((s) => s.value || s.label),
        },
        !!editingProject
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
            Manage Portfolio Projects
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">
            Add, update, or remove projects shown on your live portfolio.
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
        {/* Project Form (1 col) */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <Plus size={16} className="text-amber-500" />
              {editingProject ? 'Edit Project' : 'Publish New Project'}
            </h3>
            {editingProject && (
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
                Project Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AI Workflow Engine"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="Personal Project">Personal Project</option>
                  <option value="LLM Notebook">LLM Notebook</option>
                  <option value="StartUp">StartUp</option>
                  <option value="Freelance Project">Freelance Project</option>
                  <option value="Open Source">Open Source</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                  Scale *
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value as 'big' | 'small')}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="big">Big (Major)</option>
                  <option value="small">Small (Mini)</option>
                </select>
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
                placeholder="What did you build and which technologies did you use?"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400 resize-none"
              />
            </div>

            {/* Image Mode */}
            <div>
              <div className="flex items-center justify-between mb-1.5 font-mono text-[11px]">
                <label className="text-zinc-600 dark:text-zinc-400 font-bold">Thumbnail</label>
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
                    className={`h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-2 cursor-pointer transition-all ${
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
                        <Upload size={18} className="mx-auto mb-1 text-zinc-400" />
                        Click or drag image file
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/project.png"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                  Code Repo URL
                </label>
                <input
                  type="text"
                  value={codeUrl}
                  onChange={(e) => setCodeUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                  Live Demo URL
                </label>
                <input
                  type="text"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://myproject.com"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none"
                />
              </div>
            </div>

            {/* ── Project Story (powers the READ THE STORY page) ── */}
            <details className="rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden">
              <summary className="px-3.5 py-2.5 text-[11px] font-bold tracking-wider uppercase text-zinc-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-yellow-400 transition-colors cursor-pointer select-none flex items-center justify-between font-mono">
                <span>
                  📖 Project Story{' '}
                  {storyHasContent() ? (
                    <span className="text-amber-600 dark:text-yellow-400">(filled ✓)</span>
                  ) : (
                    <span className="text-zinc-400">(optional)</span>
                  )}
                </span>
                <span className="text-zinc-400">▾</span>
              </summary>
              <div className="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-zinc-200 dark:border-zinc-800">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                    One-line outcome (headline, read first)
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. A live platform where nothing disappears into a register."
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                    Demo video URL (YouTube link or direct .mp4)
                  </label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or https://.../demo.mp4"
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                    Tech stack (comma separated)
                  </label>
                  <input
                    type="text"
                    value={stack}
                    onChange={(e) => setStack(e.target.value)}
                    placeholder="React, Node.js, MongoDB, Vercel"
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                    Problem heading (make it carry the story)
                  </label>
                  <input
                    type="text"
                    value={problemHeading}
                    onChange={(e) => setProblemHeading(e.target.value)}
                    placeholder="e.g. Complaints went into a register — and never came back out."
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                    Problem (paragraphs — separate with a blank line)
                  </label>
                  <textarea
                    rows={4}
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="What was broken, who it hurt, why it stayed broken…"
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                    Constraints (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    placeholder={'3-month deadline\nHas to run in a real space\nSmall team, limited budget'}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                      Process heading
                    </label>
                    <input
                      type="text"
                      value={processHeading}
                      onChange={(e) => setProcessHeading(e.target.value)}
                      placeholder="How it was built."
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                      Process intro
                    </label>
                    <input
                      type="text"
                      value={processIntro}
                      onChange={(e) => setProcessIntro(e.target.value)}
                      placeholder="One-line intro (optional)"
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                    Timeline (label | title | what happened — trailing ! = milestone)
                  </label>
                  <textarea
                    rows={4}
                    value={phases}
                    onChange={(e) => setPhases(e.target.value)}
                    placeholder={'Month 1 | Idea and scope | Mapped out the build\nMonth 3 | Deadline | Kept going anyway | !'}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400 resize-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                    Decision log (decision | what you rejected | why)
                  </label>
                  <textarea
                    rows={4}
                    value={decisions}
                    onChange={(e) => setDecisions(e.target.value)}
                    placeholder={'Rebuilt from scratch | Keep patching v1 | Every fix exposed the next weak joint'}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400 resize-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                    Outcome heading
                  </label>
                  <input
                    type="text"
                    value={outcomeHeading}
                    onChange={(e) => setOutcomeHeading(e.target.value)}
                    placeholder="What shipped."
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                    Outcome (paragraphs — real numbers beat adjectives)
                  </label>
                  <textarea
                    rows={3}
                    value={outcomeBody}
                    onChange={(e) => setOutcomeBody(e.target.value)}
                    placeholder="What changed because this exists…"
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                    Your role (one line)
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Full-stack design and build."
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                    Role points (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={rolePoints}
                    onChange={(e) => setRolePoints(e.target.value)}
                    placeholder={'Designed the lifecycle\nBuilt the platform end to end'}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                    Reflection heading
                  </label>
                  <input
                    type="text"
                    value={reflectionHeading}
                    onChange={(e) => setReflectionHeading(e.target.value)}
                    placeholder="What I'd do differently."
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                    Reflection (honest beats generic)
                  </label>
                  <textarea
                    rows={3}
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="What you learned, what you'd change next time…"
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5 font-mono">
                    Stat strip (value | label, one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={stats}
                    onChange={(e) => setStats(e.target.value)}
                    placeholder={'8 months | actually spent building\nLive | deployed on Vercel'}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400 resize-none font-mono"
                  />
                </div>
              </div>
            </details>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 font-bold text-black uppercase tracking-wider font-mono transition-all shadow-md mt-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Project...' : editingProject ? 'Update Project' : 'Publish Project'}
            </button>
          </form>
        </div>

        {/* Existing Projects Grid (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider font-mono">
            Existing Published Projects ({projects.length})
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <div className="py-20 text-center text-zinc-400 font-mono border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
              No projects created yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((p) => (
                <div
                  key={p._id || p.id}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                >
                  <div>
                    <div className="h-32 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden mb-3 border border-zinc-200 dark:border-zinc-800 relative">
                      {p.image ? (
                        <img src={p.image} alt={p.title} className="max-h-full max-w-full object-contain p-2" />
                      ) : (
                        <ImageIcon className="text-zinc-400" size={28} />
                      )}
                      <span className="absolute top-2 right-2 text-[9px] font-black uppercase font-mono px-2 py-0.5 rounded-full bg-yellow-400 text-black">
                        {p.category}
                      </span>
                      {(p.tagline || p.videoUrl || (p.problem || []).length || (p.decisions || []).length) && (
                        <span className="absolute top-2 left-2 text-[8px] font-black uppercase font-mono px-2 py-0.5 rounded-full bg-black/70 text-yellow-300 border border-yellow-400/40">
                          Story ✓{p.videoUrl ? ' · Video ✓' : ''}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1 mb-1">
                      {p.title}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-900">
                    <div className="flex gap-2 text-zinc-500">
                      {p.codeUrl && p.codeUrl !== '#' && (
                        <a href={p.codeUrl} target="_blank" rel="noopener noreferrer" className="hover:text-black dark:hover:text-white">
                          <Code2 size={13} />
                        </a>
                      )}
                      {p.liveUrl && p.liveUrl !== '#' && (
                        <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="hover:text-black dark:hover:text-white">
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                        title="Edit Project"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => p._id && onDelete(p._id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                        title="Delete Project"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
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
