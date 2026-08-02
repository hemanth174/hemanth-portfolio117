'use client';

import { memo, useMemo } from 'react';
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

type N8nNode = {
  id?: string;
  name?: string;
  type?: string;
};

type N8nConnection = {
  node: string;
  type?: string;
  index?: number;
};

type N8nWorkflowJson = {
  nodes?: N8nNode[];
  connections?: Record<string, Record<string, N8nConnection[][]>>;
  workflow?: N8nWorkflowJson;
};

type WorkflowNodeData = {
  title: string;
  nodeType: string;
  color: string;
  muted?: boolean;
};

type N8nWorkflowViewerProps = {
  workflowJson: string;
};

const NODE_WIDTH = 240;
const NODE_HEIGHT = 92;
const COLUMN_GAP = 360;
const ROW_GAP = 150;

const nodeColor = (type?: string) => {
  const normalized = type?.toLowerCase() ?? '';
  if (normalized.includes('trigger') || normalized.includes('webhook')) return '#22c55e';
  if (normalized.includes('openai') || normalized.includes('agent') || normalized.includes('lm')) return '#8b5cf6';
  if (normalized.includes('memory')) return '#f97316';
  if (normalized.includes('http') || normalized.includes('request')) return '#3b82f6';
  if (normalized.includes('code') || normalized.includes('function') || normalized.includes('if')) return '#f59e0b';
  if (normalized.includes('telegram')) return '#EA4B35';
  return '#71717a';
};

const typeLabel = (type?: string) => {
  const raw = type?.split('.').pop() || 'n8n Node';
  return raw.replace(/([A-Z])/g, ' $1').replace(/^n8n /i, '').trim();
};

const WorkflowNode = memo(function WorkflowNode({ data }: NodeProps<Node<WorkflowNodeData>>) {
  return (
    <div
      className="relative w-[240px] rounded-lg border bg-zinc-950 px-4 py-3 shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
      style={{ borderColor: data.color }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !border-2 !border-zinc-950"
        style={{ background: data.color }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border-2 !border-zinc-950"
        style={{ background: data.color }}
      />
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-2 !border-zinc-950"
        style={{ background: data.color }}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-2 !border-zinc-950"
        style={{ background: data.color }}
      />

      <div className="mb-2 flex items-center gap-2">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: data.color }} />
        <span className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
          {data.nodeType}
        </span>
      </div>
      <div className="line-clamp-2 text-sm font-black leading-snug text-white">{data.title}</div>
    </div>
  );
});

function collectEdges(workflow: N8nWorkflowJson, ids: Set<string>) {
  const edges: Array<{ source: string; target: string; connectionType: string }> = [];

  Object.entries(workflow.connections ?? {}).forEach(([source, outputs]) => {
    Object.entries(outputs ?? {}).forEach(([connectionType, outputGroups]) => {
      outputGroups?.forEach((group) => {
        group?.forEach((connection) => {
          if (!ids.has(source) || !ids.has(connection.node) || source === connection.node) return;
          edges.push({ source, target: connection.node, connectionType });
        });
      });
    });
  });

  return edges;
}

function buildLayeredPositions(ids: string[], edges: Array<{ source: string; target: string }>) {
  const indegree = new Map(ids.map((id) => [id, 0]));
  const outgoing = new Map(ids.map((id) => [id, [] as string[]]));
  const rank = new Map(ids.map((id) => [id, 0]));

  edges.forEach(({ source, target }) => {
    outgoing.get(source)?.push(target);
    indegree.set(target, (indegree.get(target) ?? 0) + 1);
  });

  const queue = ids.filter((id) => (indegree.get(id) ?? 0) === 0);
  const ordered: string[] = [];

  while (queue.length > 0) {
    const source = queue.shift()!;
    ordered.push(source);

    outgoing.get(source)?.forEach((target) => {
      rank.set(target, Math.max(rank.get(target) ?? 0, (rank.get(source) ?? 0) + 1));
      indegree.set(target, (indegree.get(target) ?? 0) - 1);
      if ((indegree.get(target) ?? 0) === 0) queue.push(target);
    });
  }

  ids.forEach((id) => {
    if (!ordered.includes(id)) {
      const previous = ids[Math.max(0, ids.indexOf(id) - 1)];
      rank.set(id, Math.max(rank.get(id) ?? 0, (rank.get(previous) ?? 0) + 1));
    }
  });

  const columns = new Map<number, string[]>();
  ids.forEach((id) => {
    const column = rank.get(id) ?? 0;
    columns.set(column, [...(columns.get(column) ?? []), id]);
  });

  const positions = new Map<string, { x: number; y: number }>();
  Array.from(columns.entries()).forEach(([column, columnIds]) => {
    const totalHeight = (columnIds.length - 1) * ROW_GAP;
    columnIds.forEach((id, row) => {
      positions.set(id, {
        x: column * COLUMN_GAP,
        y: row * ROW_GAP - totalHeight / 2,
      });
    });
  });

  return positions;
}

function parseWorkflow(workflowJson: string): { nodes: Node<WorkflowNodeData>[]; edges: Edge[]; error?: string } {
  try {
    const parsed = JSON.parse(workflowJson) as N8nWorkflowJson;
    const workflow = parsed.workflow ?? parsed;
    const sourceNodes = Array.isArray(workflow.nodes) ? workflow.nodes : [];
    const ids = sourceNodes.map((node, index) => node.name || node.id || `node-${index}`);
    const idSet = new Set(ids);
    const rawEdges = collectEdges(workflow, idSet);
    const positions = buildLayeredPositions(ids, rawEdges);

    const nodes: Node<WorkflowNodeData>[] = sourceNodes.map((node, index) => {
      const id = node.name || node.id || `node-${index}`;
      const color = nodeColor(node.type);

      return {
        id,
        type: 'workflowNode',
        position: positions.get(id) ?? { x: index * COLUMN_GAP, y: 0 },
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        data: {
          title: node.name || id,
          nodeType: typeLabel(node.type),
          color,
        },
      };
    });

    const seenEdges = new Set<string>();
    const edges: Edge[] = rawEdges.flatMap(({ source, target, connectionType }, index) => {
      const key = `${source}->${target}->${connectionType}`;
      if (seenEdges.has(key)) return [];
      seenEdges.add(key);

      const isMain = connectionType === 'main';
      return [{
        id: `${key}-${index}`,
        source,
        target,
        type: 'smoothstep',
        animated: isMain,
        sourceHandle: isMain ? undefined : 'bottom',
        targetHandle: isMain ? undefined : 'top',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isMain ? '#EA4B35' : '#8b5cf6',
          width: 16,
          height: 16,
        },
        style: {
          stroke: isMain ? '#EA4B35' : '#8b5cf6',
          strokeWidth: isMain ? 2.4 : 1.8,
          strokeDasharray: isMain ? undefined : '6 6',
        },
      }];
    });

    return { nodes, edges };
  } catch {
    return { nodes: [], edges: [], error: 'This workflow JSON could not be rendered.' };
  }
}

export default function N8nWorkflowViewer({ workflowJson }: N8nWorkflowViewerProps) {
  const { nodes, edges, error } = useMemo(() => parseWorkflow(workflowJson), [workflowJson]);
  const nodeTypes = useMemo(() => ({ workflowNode: WorkflowNode }), []);

  if (error) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center bg-zinc-950 text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center bg-zinc-950 text-sm text-zinc-400">
        No workflow nodes found.
      </div>
    );
  }

  return (
    <div className="h-full min-h-[520px] w-full bg-[#050505]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.2}
        maxZoom={1.4}
        defaultEdgeOptions={{ interactionWidth: 18 }}
      >
        <Background color="#27272a" gap={22} size={1} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(node) => (node.data as WorkflowNodeData).color}
          maskColor="rgba(5,5,5,0.72)"
          className="!border !border-white/10 !bg-zinc-950/95"
        />
        <Controls className="!border !border-white/10 !bg-zinc-950/95 [&_button]:!border-white/10 [&_button]:!bg-zinc-950 [&_button]:!text-zinc-200" />
      </ReactFlow>
    </div>
  );
}
