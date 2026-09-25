'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from '@xyflow/react';
import { Focus, RotateCcw, X } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import {
  parseN8nWorkflow,
  type FlowNodeDatum,
} from '@/lib/n8nWorkflow';

type WorkflowFlowNode = Node<FlowNodeDatum>;

type N8nWorkflowViewerProps = {
  workflowJson: string;
  isDark?: boolean;
};

/** Faithful n8n node card: white rounded card, icon tile, name + type, connection dots. */
const WorkflowNode = memo(function WorkflowNode({ data, selected }: NodeProps<WorkflowFlowNode>) {
  const d = data;
  return (
    <div
      className={`relative w-[220px] rounded-[10px] border-2 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.12)] transition-shadow dark:bg-[#2b2b30] ${
        selected ? 'shadow-[0_0_0_2px_#EA4B35,0_4px_18px_rgba(0,0,0,0.25)]' : ''
      } ${d.disabled ? 'opacity-55 saturate-50' : ''}`}
      style={{ borderColor: selected ? '#EA4B35' : d.color }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !rounded-full !border-2 !border-white dark:!border-[#2b2b30]"
        style={{ background: d.color, left: -7 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !rounded-full !border-2 !border-white dark:!border-[#2b2b30]"
        style={{ background: d.color, right: -7 }}
      />
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !rounded-full !border-2 !border-white dark:!border-[#2b2b30]"
        style={{ background: d.color }}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !rounded-full !border-2 !border-white dark:!border-[#2b2b30]"
        style={{ background: d.color }}
      />

      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] text-[13px] font-black text-white"
          style={{ backgroundColor: d.color }}
        >
          {d.iconLetter}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-bold leading-tight text-zinc-900 dark:text-zinc-50">
            {d.title}
          </span>
          <span className="block truncate text-[11px] leading-tight text-zinc-500 dark:text-zinc-400">
            {d.subtitle}
          </span>
        </span>
        {d.isTrigger && (
          <span className="shrink-0 rounded-full bg-green-500/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-green-600 dark:text-green-400">
            Trig
          </span>
        )}
      </div>
      <div className="h-[5px] rounded-b-[8px]" style={{ backgroundColor: d.color, opacity: 0.85 }} />
    </div>
  );
});

export default function N8nWorkflowViewer({ workflowJson, isDark = true }: N8nWorkflowViewerProps) {
  const parsed = useMemo(() => parseN8nWorkflow(workflowJson), [workflowJson]);

  const initialNodes: WorkflowFlowNode[] = useMemo(
    () =>
      parsed.nodes.map((n) => ({
        id: n.id,
        type: 'workflowNode',
        position: n.position,
        data: n.data,
      })),
    [parsed],
  );
  const initialEdges: Edge[] = useMemo(
    () =>
      parsed.edges.map(({ source, target, connectionType }, index) => {
        const isMain = connectionType === 'main';
        return {
          id: `${source}->${target}->${connectionType}-${index}`,
          source,
          target,
          type: 'smoothstep',
          animated: false,
          sourceHandle: isMain ? undefined : 'bottom',
          targetHandle: isMain ? undefined : 'top',
          markerEnd: { type: MarkerType.ArrowClosed, color: '#909298', width: 14, height: 14 },
          style: {
            stroke: isMain ? '#52525b' : '#8b5cf6',
            strokeWidth: 2,
            strokeDasharray: isMain ? undefined : '5 5',
          },
        };
      }),
    [parsed],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance<WorkflowFlowNode> | null>(null);
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const nodeTypes = useMemo(() => ({ workflowNode: WorkflowNode }), []);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setInspectedId(null);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Belt-and-suspenders: fit the view once the canvas is ready so nodes are
  // always on screen even if the first automatic fit raced the layout.
  useEffect(() => {
    if (!flowInstance || nodes.length === 0) return;
    const t = window.setTimeout(() => {
      flowInstance.fitView({ padding: 0.22, duration: 250 });
    }, 80);
    return () => window.clearTimeout(t);
  }, [flowInstance, nodes.length]);

  const resetView = useCallback(() => {
    flowInstance?.fitView({ padding: 0.22, duration: 250 });
  }, [flowInstance]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: WorkflowFlowNode) => {
    setInspectedId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setInspectedId(null);
  }, []);

  const inspected = inspectedId ? nodes.find((n) => n.id === inspectedId) ?? null : null;

  if (parsed.error) {
    return (
      <div className={`flex h-full min-h-[420px] flex-col items-center justify-center gap-2 p-8 text-center text-sm ${isDark ? 'bg-[#101014] text-red-300' : 'bg-zinc-100 text-red-600'}`}>
        <p className="font-semibold">{parsed.error}</p>
        <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
          Open this workflow in n8n, choose Download, and re-upload the JSON file from the admin panel.
        </p>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className={`flex h-full min-h-[420px] items-center justify-center text-sm ${isDark ? 'bg-[#101014] text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}>
        No workflow nodes found.
      </div>
    );
  }

  return (
    <div className={`relative h-full min-h-[520px] w-full ${isDark ? 'n8n-canvas-dark' : 'n8n-canvas-light'}`}>
      <ReactFlow<WorkflowFlowNode>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={setFlowInstance}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.22 }}
        minZoom={0.2}
        maxZoom={1.75}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        panOnScroll={false}
        zoomOnScroll
        zoomOnPinch
        defaultEdgeOptions={{ interactionWidth: 20 }}
        proOptions={{ hideAttribution: true }}
        colorMode={isDark ? 'dark' : 'light'}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.4} color={isDark ? '#3f3f46' : '#d4d4d8'} bgColor="transparent" />
        <MiniMap
          pannable
          zoomable
          nodeColor={(node) => (node.data as FlowNodeDatum).color as string}
          maskColor={isDark ? 'rgba(10,10,12,0.72)' : 'rgba(244,244,245,0.75)'}
          className={isDark ? '!border !border-white/10 !bg-[#17171b]' : '!border !border-zinc-300 !bg-white'}
        />
        <Controls
          showInteractive={false}
          className={isDark ? '!border !border-white/10 !bg-[#17171b] [&_button]:!border-white/10 [&_button]:!bg-[#17171b] [&_button]:!text-zinc-200' : '!border !border-zinc-300 !bg-white [&_button]:!border-zinc-200 [&_button]:!bg-white [&_button]:!text-zinc-700'}
        />
      </ReactFlow>

      {/* Reset view */}
      <button
        type="button"
        onClick={resetView}
        title="Reset view — fit all nodes on screen"
        className={`absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider shadow-lg transition-all active:scale-95 ${
          isDark ? 'border-white/10 bg-[#17171b]/95 text-zinc-300 hover:border-yellow-400/50 hover:text-yellow-400' : 'border-zinc-300 bg-white/95 text-zinc-600 hover:border-amber-400 hover:text-amber-600'
        }`}
      >
        <RotateCcw size={12} /> Reset view
      </button>

      {/* Click a node → what it does + where it connects */}
      {inspected && (
        <div
          className={`absolute bottom-3 left-3 z-10 max-w-[320px] rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
            isDark ? 'border-white/10 bg-[#17171b]/95 text-zinc-200' : 'border-zinc-200 bg-white/95 text-zinc-700'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-black text-white"
                style={{ backgroundColor: inspected.data.color }}
              >
                {inspected.data.iconLetter}
              </span>
              <div className="min-w-0">
                <p className={`truncate text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{inspected.data.title}</p>
                <p className="truncate text-[11px] uppercase tracking-wider text-zinc-500">{inspected.data.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setInspectedId(null)}
              aria-label="Close node details"
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'}`}
            >
              <X size={14} />
            </button>
          </div>
          <p className="mt-2.5 text-[13px] leading-relaxed">{inspected.data.description}</p>
          {inspected.data.connectsTo.length > 0 && (
            <p className="mt-2 text-[12px] leading-relaxed">
              <span className="font-bold text-[#EA4B35]">Connects to → </span>
              {inspected.data.connectsTo.join(', ')}
            </p>
          )}
          {inspected.data.secondaryTo.length > 0 && (
            <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">
              Also feeds: {inspected.data.secondaryTo.join(', ')}
            </p>
          )}
          {inspected.data.connectsTo.length === 0 && inspected.data.secondaryTo.length === 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-[12px] text-zinc-500">
              <Focus size={12} /> End of this branch — nothing downstream.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
