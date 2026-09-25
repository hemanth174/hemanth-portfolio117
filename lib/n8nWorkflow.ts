/**
 * Shared n8n workflow parsing, tidy-tree layout, and plain-language descriptions.
 * Pure functions only (no React) so the parser can be verified outside the browser.
 */

export type N8nRawNode = {
  id?: string | number;
  name?: string;
  type?: string;
  typeVersion?: number;
  disabled?: boolean;
  parameters?: Record<string, unknown>;
  position?: [number, number];
};

export type N8nConnectionTarget = {
  node: string;
  type?: string;
  index?: number;
};

export type ParsedFlowEdge = {
  source: string;
  target: string;
  connectionType: string;
};

export type FlowNodeDatum = {
  title: string;
  subtitle: string;
  color: string;
  iconLetter: string;
  disabled?: boolean;
  isTrigger?: boolean;
  description: string;
  connectsTo: string[];
  secondaryTo: string[];
};

export type FlowStep = {
  order: number;
  id: string;
  title: string;
  subtitle: string;
  color: string;
  description: string;
  connectsTo: string[];
  secondaryTo: string[];
};

export type ParsedWorkflow = {
  nodes: Array<{
    id: string;
    position: { x: number; y: number };
    data: FlowNodeDatum;
  }>;
  edges: ParsedFlowEdge[];
  steps: FlowStep[];
  error?: string;
};

export const NODE_WIDTH = 220;
export const COLUMN_GAP = 300;
export const ROW_GAP = 130;

const str = (value: unknown): string => (typeof value === 'string' ? value : '');

const paramsOf = (node: N8nRawNode): Record<string, unknown> =>
  node.parameters && typeof node.parameters === 'object'
    ? (node.parameters as Record<string, unknown>)
    : {};

export function nodeColor(type?: string): string {
  const normalized = type?.toLowerCase() ?? '';
  if (normalized.includes('respond')) return '#14b8a6';
  if (
    normalized.includes('trigger') ||
    normalized.includes('webhook') ||
    normalized.includes('schedule') ||
    normalized.includes('manual')
  )
    return '#22c55e';
  if (
    normalized.includes('openai') ||
    normalized.includes('agent') ||
    normalized.includes('lmmodel') ||
    normalized.includes('lmchat')
  )
    return '#8b5cf6';
  if (normalized.includes('memory')) return '#f97316';
  if (normalized.includes('http') || normalized.includes('request')) return '#3b82f6';
  if (
    normalized.includes('code') ||
    normalized.includes('function') ||
    normalized.includes('if') ||
    normalized.includes('switch')
  )
    return '#f59e0b';
  if (
    normalized.includes('telegram') ||
    normalized.includes('slack') ||
    normalized.includes('gmail') ||
    normalized.includes('email')
  )
    return '#EA4B35';
  if (normalized.includes('set') || normalized.includes('merge') || normalized.includes('filter'))
    return '#06b6d4';
  if (normalized.includes('supabase') || normalized.includes('postgres') || normalized.includes('mysql'))
    return '#10b981';
  return '#71717a';
}

export function isTriggerType(type?: string): boolean {
  const normalized = type?.toLowerCase() ?? '';
  if (normalized.includes('respond')) return false;
  return (
    normalized.includes('trigger') ||
    normalized.includes('webhook') ||
    normalized.includes('schedule') ||
    normalized.includes('manual')
  );
}

export function shortType(type?: string): string {
  if (!type) return 'n8n Node';
  const raw = type.split('.').pop() || type;
  const cleaned = raw.replace(/([A-Z])/g, ' $1').replace(/trigger/i, '').trim();
  return cleaned || 'Trigger';
}

export function iconLetterFor(title: string): string {
  const words = title.replace(/[^a-zA-Z0-9 ]/g, ' ').split(' ').filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (title.slice(0, 2) || 'n8').toUpperCase();
}

/** Plain-language explanation of what a single node does, derived from type + parameters. */
export function describeN8nNode(node: N8nRawNode): string {
  const type = node.type?.toLowerCase() ?? '';
  const p = paramsOf(node);

  if (type.includes('respondtowebhook') || type.includes('respond_to_webhook') || type.includes('respond'))
    return 'Reply step. Sends the HTTP response back to the original caller and ends this branch.';
  if (type.includes('webhook')) {
    const method = str(p.httpMethod) || 'incoming';
    const path = str(p.path);
    return `Entry point. Listens for ${method} requests${path ? ` on /${path}` : ''} and starts the workflow for each one.`;
  }
  if (type.includes('manualtrigger') || type.includes('manual_trigger'))
    return 'Entry point. Starts the workflow when triggered manually for testing.';
  if (type.includes('scheduletrigger'))
    return 'Entry point. Starts the workflow automatically on a schedule.';
  if (type.includes('formtrigger'))
    return 'Entry point. Starts the workflow from a submitted n8n form.';
  if (type.includes('trigger') && !type.includes('respon')) {
    return 'Entry point. Watches for an external event and starts the workflow when it fires.';
  }
  if (type.includes('code'))
    return 'Transform step. Runs custom JavaScript over the incoming items and passes the result on.';
  if (type.includes('editfields') || (type.endsWith('.set') && str(p.mode) !== '')) {
    const list = (p.assignments as Record<string, unknown> | undefined)?.assignments;
    const count = Array.isArray(list) ? list.length : 0;
    return count > 0
      ? `Shape step. Sets ${count} field${count === 1 ? '' : 's'} on each item to normalize the payload.`
      : 'Shape step. Maps incoming fields into a clean, normalized shape.';
  }
  if (type.endsWith('.set') || type.includes('editfields'))
    return 'Shape step. Maps incoming fields into a clean, normalized shape.';
  if (type.includes('httprequest')) {
    const method = str(p.method) || 'GET';
    const url = str(p.url);
    return `Call step. Sends an HTTP ${method} request${url ? ` to ${url}` : ''} and passes the response on.`;
  }
  if (type.includes('supabase')) {
    const op = str(p.operation);
    const table = str(p.tableId) || str(p.table);
    return `Database step. ${op ? `${op} on` : 'Reads/writes'} the Supabase table${table ? ` "${table}"` : ''} and passes the result on.`;
  }
  if (type.includes('postgres') || type.includes('mysql')) {
    const op = str(p.operation);
    return `Database step. Runs a ${op || 'query'} operation and passes the rows on.`;
  }
  if (type.includes('gmail') || type.includes('sendemail') || type.includes('smtp'))
    return 'Notify step. Sends an email to the customer with their details and passes the receipt on.';
  if (type.includes('telegram') || type.includes('slack') || type.includes('discord'))
    return 'Notify step. Sends a chat message to the configured channel and passes the receipt on.';
  if (type.endsWith('.if') || type.includes('filter')) {
    return 'Branch step. Splits the flow into true/false paths based on a condition.';
  }
  if (type.includes('switch')) return 'Router step. Routes each item down a different path by matching rules.';
  if (type.includes('merge')) return 'Join step. Combines items from multiple branches back into one stream.';
  if (type.includes('agent'))
    return 'AI step. Runs an AI agent with connected tools and memory to produce a result.';
  if (type.includes('openai') || type.includes('lmmodel') || type.includes('lmchat'))
    return 'AI step. Calls a language model and passes the generated text on.';
  if (type.includes('memory')) return 'Memory step. Stores conversation context the AI node can recall.';
  if (type.includes('sticky')) return 'Note. A visual annotation only — it never executes.';
  return `${shortType(node.type)} step. Processes each incoming item and passes the result downstream.`;
}

/** Find the executable nodes array in any plausible n8n JSON envelope. */
function extractRawNodes(root: unknown): N8nRawNode[] {
  if (!root || typeof root !== 'object') return [];
  const r = root as Record<string, unknown>;
  const candidates = [r.nodes, (r.workflow as Record<string, unknown> | undefined)?.nodes, (r.data as Record<string, unknown> | undefined)?.nodes];
  for (const c of candidates) {
    if (Array.isArray(c)) return c as N8nRawNode[];
  }
  return [];
}

/** Find the connections map in any plausible n8n JSON envelope. */
function extractConnections(root: unknown): Record<string, unknown> {
  if (!root || typeof root !== 'object') return {};
  const r = root as Record<string, unknown>;
  const candidates = [
    r.connections,
    (r.workflow as Record<string, unknown> | undefined)?.connections,
    (r.data as Record<string, unknown> | undefined)?.connections,
  ];
  for (const c of candidates) {
    if (c && typeof c === 'object' && !Array.isArray(c)) return c as Record<string, unknown>;
  }
  return {};
}

/** Collect edges defensively — one malformed entry must never break the canvas. */
export function collectFlowEdges(nodeIds: Set<string>, connections: Record<string, unknown>): ParsedFlowEdge[] {
  const edges: ParsedFlowEdge[] = [];
  try {
    for (const [source, outputs] of Object.entries(connections)) {
      if (!outputs || typeof outputs !== 'object') continue;
      for (const [connectionType, outputGroups] of Object.entries(outputs as Record<string, unknown>)) {
        const groups = Array.isArray(outputGroups) ? outputGroups : [outputGroups];
        for (const group of groups) {
          const targets = Array.isArray(group) ? group : [group];
          for (const target of targets) {
            try {
              if (!target || typeof target !== 'object') continue;
              const name = (target as N8nConnectionTarget).node;
              if (typeof name !== 'string' || !name) continue;
              if (!nodeIds.has(source) || !nodeIds.has(name) || source === name) continue;
              edges.push({ source, target: name, connectionType });
            } catch {
              continue;
            }
          }
        }
      }
    }
  } catch {
    // Return whatever was collected so far.
  }
  return edges;
}

/**
 * Tidy-tree layout: left-to-right tree with parents centered over children.
 * Falls back to a horizontal chain when there are no connections at all,
 * so nodes are ALWAYS visible.
 */
export function layoutTreePositions(
  ids: string[],
  edges: ParsedFlowEdge[],
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  if (ids.length === 0) return positions;

  // No connections at all: simple horizontal chain — always visible.
  if (edges.length === 0) {
    ids.forEach((id, i) => positions.set(id, { x: i * COLUMN_GAP, y: 0 }));
    return positions;
  }

  const treeEdges = edges.filter((e) => e.connectionType === 'main');
  const skeleton = treeEdges.length > 0 ? treeEdges : edges;

  const children = new Map(ids.map((id) => [id, [] as string[]]));
  const parents = new Map(ids.map((id) => [id, [] as string[]]));
  const indegree = new Map(ids.map((id) => [id, 0]));

  skeleton.forEach(({ source, target }) => {
    if (!children.get(source)?.includes(target)) children.get(source)?.push(target);
    if (!parents.get(target)?.includes(source)) parents.get(target)?.push(source);
    indegree.set(target, (indegree.get(target) ?? 0) + 1);
  });

  const depth = new Map(ids.map((id) => [id, 0]));
  const indegCopy = new Map(indegree);
  const queue = ids.filter((id) => (indegCopy.get(id) ?? 0) === 0);
  const topo: string[] = [];
  while (queue.length > 0) {
    const source = queue.shift()!;
    topo.push(source);
    children.get(source)?.forEach((target) => {
      depth.set(target, Math.max(depth.get(target) ?? 0, (depth.get(source) ?? 0) + 1));
      indegCopy.set(target, (indegCopy.get(target) ?? 0) - 1);
      if ((indegCopy.get(target) ?? 0) === 0) queue.push(target);
    });
  }
  ids.forEach((id) => {
    if (!topo.includes(id)) {
      const preds = parents.get(id) ?? [];
      const maxPred = preds.reduce((m, p) => Math.max(m, depth.get(p) ?? 0), -1);
      depth.set(id, maxPred + 1);
      topo.push(id);
    }
  });

  const ySlot = new Map<string, number>();
  let cursor = 0;
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const walk = (id: string) => {
    if (visited.has(id) || visiting.has(id)) return;
    visiting.add(id);
    const kids = (children.get(id) ?? []).filter((k) => !visited.has(k) && !visiting.has(k));
    if (kids.length === 0) {
      ySlot.set(id, cursor);
      cursor += 1;
    } else {
      kids.forEach(walk);
      const placed = kids.filter((k) => ySlot.has(k));
      if (placed.length === 0) {
        ySlot.set(id, cursor);
        cursor += 1;
      } else {
        const ys = placed.map((k) => ySlot.get(k)!).sort((a, b) => a - b);
        ySlot.set(id, (ys[0] + ys[ys.length - 1]) / 2);
      }
    }
    visiting.delete(id);
    visited.add(id);
  };

  const roots = ids.filter((id) => (indegree.get(id) ?? 0) === 0);
  [...roots, ...ids].forEach((id) => {
    if (!visited.has(id)) walk(id);
  });

  const columns = new Map<number, string[]>();
  ids.forEach((id) => {
    const col = depth.get(id) ?? 0;
    columns.set(col, [...(columns.get(col) ?? []), id]);
  });
  const maxDepth = Math.max(0, ...Array.from(columns.keys()));
  for (let sweep = 0; sweep < 2; sweep += 1) {
    for (let col = 1; col <= maxDepth; col += 1) {
      const colIds = columns.get(col) ?? [];
      colIds.sort((a, b) => {
        const pa = parents.get(a) ?? [];
        const pb = parents.get(b) ?? [];
        const ya = pa.length > 0 ? pa.reduce((s, p) => s + (ySlot.get(p) ?? 0), 0) / pa.length : (ySlot.get(a) ?? 0);
        const yb = pb.length > 0 ? pb.reduce((s, p) => s + (ySlot.get(p) ?? 0), 0) / pb.length : (ySlot.get(b) ?? 0);
        return ya - yb;
      });
      columns.set(col, colIds);
    }
  }

  const orderedCols = Array.from(columns.entries()).sort((a, b) => b[0] - a[0]);
  orderedCols.forEach(([col, colIds]) => {
    const sorted = [...colIds].sort((a, b) => (ySlot.get(a) ?? 0) - (ySlot.get(b) ?? 0));
    sorted.forEach((id) => {
      const kids = (children.get(id) ?? []).filter((k) => positions.has(k));
      if (kids.length > 0) {
        const ys = kids.map((k) => positions.get(k)!.y).sort((a, b) => a - b);
        ySlot.set(id, (ys[0] + ys[ys.length - 1]) / 2);
      }
    });
    const resorted = [...colIds].sort((a, b) => (ySlot.get(a) ?? 0) - (ySlot.get(b) ?? 0));
    let lastY = Number.NEGATIVE_INFINITY;
    resorted.forEach((id, i) => {
      const ideal = (ySlot.get(id) ?? i) * ROW_GAP;
      const y = lastY === Number.NEGATIVE_INFINITY ? ideal : Math.max(ideal, lastY + ROW_GAP);
      const safeY = Number.isFinite(y) ? y : i * ROW_GAP;
      positions.set(id, { x: col * COLUMN_GAP, y: safeY });
      lastY = safeY;
    });
  });

  ids.forEach((id, i) => {
    const p = positions.get(id);
    if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) {
      positions.set(id, { x: i * COLUMN_GAP, y: 0 });
    }
  });

  const allX = Array.from(positions.values()).map((p) => p.x);
  const allY = Array.from(positions.values()).map((p) => p.y);
  if (allX.length > 0 && allY.length > 0) {
    const offX = (Math.min(...allX) + Math.max(...allX)) / 2;
    const offY = (Math.min(...allY) + Math.max(...allY)) / 2;
    positions.forEach((p, id) => positions.set(id, { x: p.x - offX, y: p.y - offY }));
  }

  return positions;
}

/** Full parse: executable nodes (sticky notes excluded), edges, ordered steps. */
export function parseN8nWorkflow(workflowJson: string): ParsedWorkflow {
  let root: unknown;
  try {
    root = JSON.parse(workflowJson);
  } catch {
    return { nodes: [], edges: [], steps: [], error: 'This workflow JSON could not be parsed.' };
  }

  const rawNodes = extractRawNodes(root).filter(
    (n) => n && typeof n === 'object' && !(n.type ?? '').toString().toLowerCase().includes('sticky'),
  );
  if (rawNodes.length === 0) {
    return { nodes: [], edges: [], steps: [], error: 'No executable nodes were found in this workflow JSON.' };
  }

  const ids = rawNodes.map((node, index) => {
    const name = typeof node.name === 'string' && node.name ? node.name : '';
    const nid = node.id !== undefined && node.id !== null ? String(node.id) : '';
    return name || nid || `node-${index}`;
  });
  // Guarantee uniqueness even if names repeat.
  const seen = new Set<string>();
  const uniqueIds = ids.map((id) => {
    let candidate = id;
    let n = 2;
    while (seen.has(candidate)) {
      candidate = `${id} (${n})`;
      n += 1;
    }
    seen.add(candidate);
    return candidate;
  });

  const idSet = new Set(uniqueIds);
  const rawEdges = collectFlowEdges(idSet, extractConnections(root));
  const positions = layoutTreePositions(uniqueIds, rawEdges);

  const mainChildren = new Map(uniqueIds.map((id) => [id, [] as string[]]));
  const secondaryChildren = new Map(uniqueIds.map((id) => [id, [] as string[]]));
  rawEdges.forEach(({ source, target, connectionType }) => {
    if (connectionType === 'main') {
      if (!mainChildren.get(source)?.includes(target)) mainChildren.get(source)?.push(target);
    } else {
      if (!secondaryChildren.get(source)?.includes(target)) secondaryChildren.get(source)?.push(target);
    }
  });

  const nodes = rawNodes.map((node, index) => {
    const id = uniqueIds[index];
    const color = nodeColor(node.type);
    return {
      id,
      position: positions.get(id) ?? { x: index * COLUMN_GAP, y: 0 },
      data: {
        title: typeof node.name === 'string' && node.name ? node.name : id,
        subtitle: shortType(node.type),
        color,
        iconLetter: iconLetterFor(typeof node.name === 'string' && node.name ? node.name : id),
        disabled: node.disabled,
        isTrigger: isTriggerType(node.type),
        description: describeN8nNode(node),
        connectsTo: mainChildren.get(id) ?? [],
        secondaryTo: secondaryChildren.get(id) ?? [],
      } satisfies FlowNodeDatum,
    };
  });

  // Execution order = topological walk over main edges, then any leftovers.
  const order: string[] = [];
  const orderSeen = new Set<string>();
  const orderVisiting = new Set<string>();
  const visit = (id: string) => {
    if (orderSeen.has(id) || orderVisiting.has(id)) return;
    orderVisiting.add(id);
    (mainChildren.get(id) ?? []).forEach(visit);
    orderVisiting.delete(id);
    orderSeen.add(id);
    order.push(id);
  };
  const indeg = new Map(uniqueIds.map((id) => [id, 0]));
  rawEdges.forEach(({ source, target }) => {
    if (mainChildren.get(source)?.includes(target)) indeg.set(target, (indeg.get(target) ?? 0) + 1);
  });
  [...uniqueIds.filter((id) => (indeg.get(id) ?? 0) === 0), ...uniqueIds].forEach(visit);

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const steps: FlowStep[] = order.reverse().map((id, i) => {
    const n = byId.get(id)!;
    return {
      order: i + 1,
      id,
      title: n.data.title,
      subtitle: n.data.subtitle,
      color: n.data.color,
      description: n.data.description,
      connectsTo: n.data.connectsTo,
      secondaryTo: n.data.secondaryTo,
    };
  });

  const seenEdges = new Set<string>();
  const edges: ParsedFlowEdge[] = [];
  rawEdges.forEach(({ source, target, connectionType }) => {
    const key = `${source}->${target}->${connectionType}`;
    if (seenEdges.has(key)) return;
    seenEdges.add(key);
    edges.push({ source, target, connectionType });
  });

  return { nodes, edges, steps };
}

/** Plain-text workflow brief for the AI assistant prompt. */
export function summarizeWorkflowForAI(title: string, steps: FlowStep[]): string {
  if (steps.length === 0) return '';
  const lines = steps.map((s) => {
    const next = s.connectsTo.length > 0 ? ` -> connects to: ${s.connectsTo.join(', ')}` : ' -> end of this branch';
    const aux = s.secondaryTo.length > 0 ? ` (also feeds: ${s.secondaryTo.join(', ')})` : '';
    return `${s.order}. ${s.title} [${s.subtitle}]: ${s.description}${next}${aux}`;
  });
  return `Workflow "${title}" has ${steps.length} executable nodes in execution order:\n${lines.join('\n')}`;
}
