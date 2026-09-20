/**
 * One-time seed: writes the curated project stories (headline, narrative,
 * timeline, decisions, stats, stack) into MongoDB so the story pages and
 * the admin panel read from the database instead of hardcoded data.
 *
 * Usage:  node scripts/seed-project-stories.mjs
 * Never prints the connection string — only titles and update results.
 */
import { readFileSync } from 'node:fs';
import { MongoClient } from 'mongodb';

const loadEnv = () => {
  try {
    const text = readFileSync('.env', 'utf8');
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) process.env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
    }
  } catch {
    // fall through to existing environment
  }
};

const stories = [
  {
    match: /home automation/i,
    set: {
      tagline:
        'A room that senses and acts on its own — 8 months from a breadboard demo to a reliable Physical AI build.',
      videoUrl: '',
      stack: ['Microcontroller', 'Sensors', 'Relays & actuators', 'Connectivity', 'Control interface'],
      stats: [
        { value: '3 months', label: 'given by the college' },
        { value: '8 months', label: 'actually spent building' },
        { value: "Maker's Conclave", label: 'Physical AI track' },
      ],
      problemHeading: "A switch you still have to walk over and flip isn't automation.",
      problem: [
        "The brief for Maker's Conclave was simple to say and hard to do: build something under the Physical AI theme that actually runs in a real, physical space. We picked home automation — a system that could sense a room and act on it.",
        'The college gave the project three months. That was enough for a version that technically worked on a breadboard, in a demo, under ideal conditions. It was not enough for a version that kept working when the wiring got jostled, the power dipped, or the logic hit an edge case nobody planned for. Getting from “it works” to “it works reliably” is where the other five months went.',
      ],
      constraints: [
        'Hard 3-month college deadline for the Physical AI track',
        'Had to run in a real physical space, not just on a bench',
        'Had to survive jostled wiring, power dips, and unplanned edge cases',
        'Small student team, limited parts budget',
      ],
      processHeading: 'How it actually went: eight months, month by month.',
      processIntro: '',
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
    },
  },
  {
    match: /hoas|hostel operational/i,
    set: {
      tagline:
        'A live hostel-ops platform where complaints get tracked, owners get assigned, and nothing disappears into a register.',
      videoUrl: '',
      stack: ['React', 'Node.js', 'MongoDB', 'Vercel'],
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
      processIntro: '',
      phases: [
        { label: 'Phase 1', title: 'Complaint lifecycle', desc: 'Designed the core loop: raise → assign → resolve → verify, with statuses visible to everyone involved.' },
        { label: 'Phase 2', title: 'Roles and access', desc: 'Split the product into student, warden, and management views with enforced permissions.' },
        { label: 'Phase 3', title: 'Real-time accountability', desc: 'Made state changes visible instantly so responsibility is always attached to a name, not a register page.' },
        { label: 'Phase 4', title: 'Ship and harden', desc: 'Deployed the client live and iterated on the rough edges real usage exposed.', marker: true },
      ],
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
    },
  },
];

loadEnv();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set. Add it to .env first.');
  process.exit(1);
}

const client = await MongoClient.connect(uri);
try {
  const db = client.db('hemanthPortfolio');
  for (const { match, set } of stories) {
    const doc = await db.collection('projects').findOne({ title: match });
    if (!doc) {
      console.log(`NOT FOUND — no project matching ${match}`);
      continue;
    }
    const res = await db.collection('projects').updateOne({ _id: doc._id }, { $set: set });
    console.log(`OK — "${doc.title}" (matched: ${res.matchedCount}, updated: ${res.modifiedCount})`);
  }
} finally {
  await client.close();
}
console.log('Done.');
