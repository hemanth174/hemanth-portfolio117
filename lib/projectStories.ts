/**
 * Project story data layer.
 *
 * Template follows the research-backed case-study structure:
 *  1. One-line outcome (headline — written last, read first)
 *  2. Problem (sharp, who it hurt, why it stayed broken)
 *  3. Constraints (real limits — the part that earns trust)
 *  4. Process (compressed timeline, not a full diary)
 *  5. Decision log (decision / rejected alternative / reason)
 *  6. Outcome (numbers where real, honest qualitative where not)
 *  7. Role (plain, specific)
 *  8. Reflection (what you'd do differently)
 *
 * ── How to add / edit a story ──────────────────────────────────────────
 * Add a `CuratedStory` below keyed by a lowercase title fragment, e.g. `hoas`.
 * `getStoryFor(project)` merges it over the project document. Anything you
 * don't specify falls back to sensible content derived from the project.
 * Projects can also carry `tagline` and `stack` fields (saved via the API)
 * which override the fallbacks.
 */

export type StoryStat = { value: string; label: string };

export type StoryDecision = {
  decision: string;
  rejected: string;
  reason: string;
};

export type StoryPhase = {
  label: string;
  title: string;
  desc: string;
  marker?: boolean;
};

export type ProjectStory = {
  /** One-line outcome — the headline result, shown first. */
  outcome: string;
  problemHeading: string;
  problem: string[];
  constraints: string[];
  processHeading: string;
  processIntro?: string;
  phases: StoryPhase[];
  decisionsHeading: string;
  decisions: StoryDecision[];
  outcomeHeading: string;
  outcomeBody: string[];
  stats: StoryStat[];
  role: string;
  rolePoints: string[];
  reflectionHeading: string;
  reflection: string;
  stack: string[];
};

export type StoryProject = {
  _id?: string;
  id?: number;
  title: string;
  category: string;
  description: string;
  image?: string;
  codeUrl?: string;
  liveUrl?: string;
  createdAt?: string | Date;
  // ── Story fields (stored in MongoDB, editable from the admin panel) ──
  tagline?: string;
  videoUrl?: string;
  stack?: string[] | string;
  problemHeading?: string;
  problem?: string[];
  constraints?: string[];
  processHeading?: string;
  processIntro?: string;
  phases?: StoryPhase[];
  decisions?: StoryDecision[];
  outcomeHeading?: string;
  outcomeBody?: string[];
  role?: string;
  rolePoints?: string[];
  reflectionHeading?: string;
  reflection?: string;
  stats?: StoryStat[];
};

type CuratedStory = Partial<ProjectStory> & { match: string };

const curated: CuratedStory[] = [
  {
    match: 'home automation',
    outcome: 'A room that senses and acts on its own — 8 months from a breadboard demo to a reliable Physical AI build.',
    stats: [
      { value: '3 months', label: 'given by the college' },
      { value: '8 months', label: 'actually spent building' },
      { value: "Maker's Conclave", label: 'Physical AI track' },
    ],
    problemHeading: "A switch you still have to walk over and flip isn't automation.",
    problem: [
      "The brief for Maker's Conclave was simple to say and hard to do: build something under the Physical AI theme that actually runs in a real, physical space. We picked home automation — a system that could sense a room and act on it.",
      "The college gave the project three months. That was enough for a version that technically worked on a breadboard, in a demo, under ideal conditions. It was not enough for a version that kept working when the wiring got jostled, the power dipped, or the logic hit an edge case nobody planned for. Getting from “it works” to “it works reliably” is where the other five months went.",
    ],
    constraints: [
      'Hard 3-month college deadline for the Physical AI track',
      'Had to run in a real physical space, not just on a bench',
      'Had to survive jostled wiring, power dips, and unplanned edge cases',
      'Small student team, limited parts budget',
    ],
    processHeading: 'How it actually went: eight months, month by month.',
    phases: [
      { label: 'Month 1', title: 'Idea and scope', desc: 'Mapped out what a home automation build could mean under the Physical AI theme.' },
      { label: 'Month 2', title: 'First prototype', desc: 'Got a basic circuit working on a breadboard — enough to prove the idea.' },
      { label: 'Month 3', title: 'Official deadline', desc: "The college's three-month mark for the Physical AI track. The build kept going anyway.", marker: true },
      { label: 'Month 4', title: 'Starting over', desc: "The first version couldn't hold up to real use, so the wiring got rebuilt from scratch." },
      { label: 'Month 5', title: 'Automation logic', desc: 'Wrote and tested the logic that lets the system respond on its own.' },
      { label: 'Month 6', title: 'Full integration', desc: 'Connected every module — sensors, control logic, interface — into one working system.' },
      { label: 'Month 7', title: 'Real-world testing', desc: 'Ran it under everyday conditions and fixed what broke.' },
      { label: 'Month 8', title: 'Final build and demo', desc: "Locked the build and recorded the demo shown at Maker's Conclave.", marker: true },
    ],
    decisionsHeading: 'Three calls that shaped the build.',
    decisions: [
      {
        decision: 'Rebuilt the wiring from scratch in month 4 instead of patching v1.',
        rejected: 'Keep patching the breadboard prototype.',
        reason: 'Every fix exposed the next weak joint — the prototype could demo but never survive daily use.',
      },
      {
        decision: 'Spent months 5–7 on reliability instead of adding more devices.',
        rejected: 'More features, more sensors, bigger demo.',
        reason: 'A system that controls a real room and fails is worse than a smaller one that never fails.',
      },
      {
        decision: 'Tested under everyday conditions, not lab conditions.',
        rejected: 'Demo-day-only testing.',
        reason: 'Power dips and jostled wires only show up when you stop being careful — which is exactly real life.',
      },
    ],
    outcomeHeading: 'What shipped.',
    outcomeBody: [
      "A fully integrated home automation system — sensors, control logic, and interface working as one — demonstrated live at Maker's Conclave under the Physical AI theme.",
      'The honest metric here is durability: the 3-month version demoed once; the 8-month version kept running.',
    ],
    role: 'Hardware, logic, testing, and demo — end to end.',
    rolePoints: [
      'Designed and wired the sensor and relay setup that reads a room and controls devices in it',
      'Wrote the logic that decides when the system should act, without someone flipping a switch',
      'Ran the system under real conditions repeatedly and traced failures back to their cause',
      "Put together the explanation and the demo shown at Maker's Conclave",
    ],
    reflectionHeading: "What I'd do differently.",
    reflection:
      'Design for the hostile version of reality from week one — strain-relieved wiring, brown-out-tolerant power, and an edge-case list before the first prototype, not after the third rebuild. Reliability is a design input, not a testing phase.',
    stack: ['Microcontroller', 'Sensors', 'Relays & actuators', 'Connectivity', 'Control interface'],
  },
  {
    match: 'hoas',
    outcome: 'A live hostel-ops platform where complaints get tracked, owners get assigned, and nothing disappears into a register.',
    stats: [
      { value: 'Live', label: 'deployed on Vercel' },
      { value: '3 roles', label: 'students · wardens · management' },
      { value: 'StartUp', label: 'built as a real product' },
    ],
    problemHeading: 'Hostel complaints went into a register — and never came back out.',
    problem: [
      'In most hostels, reporting a broken tap or a dead light means writing it in a register or telling a warden in passing. There is no ticket, no owner, no status — so there is no accountability when nothing happens.',
      'HOAS (Hostel Operational Accountability System) turns that verbal chain into tracked complaints with role-based ownership, so students, wardens, and management all see the same truth in real time.',
    ],
    constraints: [
      'Three distinct user roles with different permissions on one platform',
      'Had to be simple enough for non-technical hostel staff',
      'Built as a startup attempt — real users, real uptime expectations',
    ],
    processHeading: 'How it was built.',
    phases: [
      { label: 'Phase 1', title: 'Complaint lifecycle', desc: 'Designed the core loop: raise → assign → resolve → verify, with statuses visible to everyone involved.' },
      { label: 'Phase 2', title: 'Roles and access', desc: 'Split the product into student, warden, and management views with enforced permissions.' },
      { label: 'Phase 3', title: 'Real-time accountability', desc: 'Made state changes visible instantly so responsibility is always attached to a name, not a register page.' },
      { label: 'Phase 4', title: 'Ship and harden', desc: 'Deployed the client live and iterated on the rough edges real usage exposed.', marker: true },
    ],
    decisionsHeading: 'Calls that shaped the product.',
    decisions: [
      {
        decision: 'Role-based views instead of one dashboard with filters.',
        rejected: 'A single dashboard where everyone sees everything.',
        reason: 'Wardens and management act on different information — mixing it guarantees confusion and accidental actions.',
      },
      {
        decision: 'Complaint as a tracked ticket, not a message thread.',
        rejected: 'A chat-style reporting feed.',
        reason: 'Threads bury state; tickets carry state. Accountability needs “who owns this and where does it stand” at a glance.',
      },
      {
        decision: 'Ship the client live early on Vercel.',
        rejected: 'Polish privately until “ready”.',
        reason: 'Real hostel usage surfaced the actual rough edges — no amount of solo testing would have found them.',
      },
    ],
    outcomeHeading: 'What shipped.',
    outcomeBody: [
      'A full-stack, role-based hostel operations platform, live in production with code open on GitHub.',
      'Students can raise and track complaints, wardens manage their scope, and management sees accountability across the hostel in real time.',
    ],
    role: 'Full-stack design and build.',
    rolePoints: [
      'Designed the complaint lifecycle and the three role-based experiences',
      'Built the full-stack platform end to end and deployed it live',
      'Drove it as a startup attempt — real users, real feedback loops',
    ],
    reflectionHeading: "What I'd do differently.",
    reflection:
      'Instrument from day one: time-to-resolve per category and warden workload would turn “it feels better” into numbers I can put at the top of this page. The next iteration gets analytics before features.',
    stack: ['React', 'Node.js', 'MongoDB', 'Vercel'],
  },
];

/** Normalize a project title for matching. */
const norm = (s: string) => s.toLowerCase().trim();

/** Split a comma-separated stack string into a clean array. */
export const parseStack = (stack?: string[] | string): string[] => {
  if (Array.isArray(stack)) return stack.filter(Boolean).slice(0, 20);
  if (typeof stack === 'string' && stack.trim()) {
    return stack
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);
  }
  return [];
};

/** Guess a stack from the project category when none is stored. */
const stackForCategory = (category: string): string[] => {
  const c = norm(category);
  if (c.includes('llm') || c.includes('notebook')) return ['Python', 'LLMs', 'Jupyter'];
  if (c.includes('freelance')) return ['React', 'UI/UX', 'Web'];
  if (c.includes('startup')) return ['React', 'Node.js', 'MongoDB'];
  return ['React', 'JavaScript', 'Web'];
};

const statusFor = (p: StoryProject): StoryStat => {
  if (p.liveUrl && /^https?:\/\//.test(p.liveUrl.trim())) return { value: 'Live', label: 'deployed & working' };
  if (p.codeUrl && /^https?:\/\//.test(p.codeUrl.trim())) return { value: 'Source open', label: 'code on GitHub' };
  return { value: 'In progress', label: 'story being written' };
};

const asArray = <T,>(v: T[] | undefined): T[] => (Array.isArray(v) ? v : []);
const nonEmpty = (v: string | undefined): string | undefined => {
  const t = v?.trim();
  return t ? t : undefined;
};

/**
 * Merge a project document into a full story.
 * Priority: MongoDB story fields (admin-editable) → curated fallback →
 * honest auto-generated overview. Returns a flag telling the page whether
 * this is a real narrative or a placeholder overview.
 */
export const getStoryFor = (project: StoryProject): { story: ProjectStory; curated: boolean } => {
  const title = norm(project.title);
  const hit = curated.find((c) => title.includes(c.match));

  const storedStack = parseStack(project.stack);
  const fallbackStack = storedStack.length > 0 ? storedStack : stackForCategory(project.category);
  const year = project.createdAt ? new Date(project.createdAt).getFullYear() : undefined;

  const fallback: ProjectStory = {
    outcome: project.tagline?.trim() || project.description,
    stats: [
      { value: project.category || 'Project', label: 'category' },
      statusFor(project),
      { value: year ? String(year) : '—', label: 'shipped' },
    ],
    problemHeading: 'What this project sets out to fix.',
    problem: [project.description],
    constraints: ['Scoped and built as a portfolio-grade project — full story being documented.'],
    processHeading: 'How it was built.',
    processIntro: 'The detailed build log for this project is being written up.',
    phases: [
      { label: 'Phase 1', title: 'Scope', desc: 'Defined what the project had to do and what it would deliberately not do.' },
      { label: 'Phase 2', title: 'Build', desc: project.description },
      { label: 'Phase 3', title: 'Ship', desc: 'Deployed and linked below — try the live version or read the source.', marker: true },
    ],
    decisionsHeading: 'Key decisions.',
    decisions: [
      {
        decision: 'Scoped tight: one sharp problem instead of a feature list.',
        rejected: 'A broad build that does a bit of everything.',
        reason: 'Small, finished, and working beats big and half-done — every time.',
      },
    ],
    outcomeHeading: 'Where it stands.',
    outcomeBody: [project.description],
    role: 'Design and build.',
    rolePoints: ['Owned the project end to end — scope, build, and ship.'],
    reflectionHeading: 'What comes next.',
    reflection: 'A full write-up with timeline, trade-offs, and numbers is on the way for this project.',
    stack: fallbackStack,
  };

  // Curated overlay (fallback so fresh DBs still read well).
  const overlay: Partial<ProjectStory> = (() => {
    if (!hit) return {};
    const { match: _match, ...rest } = hit;
    void _match;
    return rest;
  })();

  // MongoDB story fields (admin-editable) win wherever they have content.
  const dbProblem = asArray(project.problem).filter(Boolean);
  const dbOutcomeBody = asArray(project.outcomeBody).filter(Boolean);
  const dbConstraints = asArray(project.constraints).filter(Boolean);
  const dbPhases = asArray(project.phases);
  const dbDecisions = asArray(project.decisions).filter((d) => d && d.decision);
  const dbRolePoints = asArray(project.rolePoints).filter(Boolean);
  const dbStats = asArray(project.stats).filter((s) => s && (s.value || s.label));
  const hasDbNarrative =
    dbProblem.length > 0 ||
    dbOutcomeBody.length > 0 ||
    dbDecisions.length > 0 ||
    dbPhases.length > 0 ||
    !!nonEmpty(project.tagline);

  const pickArr = <T,>(dbArr: T[], curatedArr: T[] | undefined, fallbackArr: T[]): T[] =>
    dbArr.length > 0 ? dbArr : curatedArr && curatedArr.length > 0 ? curatedArr : fallbackArr;

  return {
    curated: hasDbNarrative || !!hit,
    story: {
      outcome: nonEmpty(project.tagline) || overlay.outcome || fallback.outcome,
      problemHeading: nonEmpty(project.problemHeading) || overlay.problemHeading || fallback.problemHeading,
      problem: pickArr(dbProblem, overlay.problem, fallback.problem),
      constraints: pickArr(dbConstraints, overlay.constraints, fallback.constraints),
      processHeading: nonEmpty(project.processHeading) || overlay.processHeading || fallback.processHeading,
      processIntro:
        nonEmpty(project.processIntro) || overlay.processIntro || fallback.processIntro,
      phases: pickArr(dbPhases, overlay.phases, fallback.phases),
      decisionsHeading: overlay.decisionsHeading || fallback.decisionsHeading,
      decisions: pickArr(dbDecisions, overlay.decisions, fallback.decisions),
      outcomeHeading: nonEmpty(project.outcomeHeading) || overlay.outcomeHeading || fallback.outcomeHeading,
      outcomeBody: pickArr(dbOutcomeBody, overlay.outcomeBody, fallback.outcomeBody),
      stats: pickArr(dbStats, overlay.stats, fallback.stats),
      role: nonEmpty(project.role) || overlay.role || fallback.role,
      rolePoints: pickArr(dbRolePoints, overlay.rolePoints, fallback.rolePoints),
      reflectionHeading:
        nonEmpty(project.reflectionHeading) || overlay.reflectionHeading || fallback.reflectionHeading,
      reflection: nonEmpty(project.reflection) || overlay.reflection || fallback.reflection,
      stack: storedStack.length > 0 ? storedStack : overlay.stack || fallback.stack,
    },
  };
};

/** Pick the “next story” for bottom-of-page navigation (wraps around). */
export const getNextProject = (projects: StoryProject[], currentId?: string): StoryProject | null => {
  if (projects.length < 2) return null;
  const idx = projects.findIndex((p) => String(p._id ?? p.id) === String(currentId));
  if (idx === -1) return projects[0];
  return projects[(idx + 1) % projects.length];
};
