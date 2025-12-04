import React, { useMemo, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MarkerType,
    useNodesState,
    useEdgesState,
    Position,
    Handle,
    BaseEdge,
    getSmoothStepPath,
} from 'reactflow';
import type { Node, Edge, NodeProps, EdgeProps } from 'reactflow';
import { useApp } from '../store/AppProvider';
import * as LucideIcons from 'lucide-react';

const NODE_WIDTH = 250;
const VERTICAL_SPACING = 150;
const CENTER_X = 400;

// Helper to render icon dynamically
const DynamicIcon: React.FC<{ name?: string; className?: string }> = ({ name, className }) => {
    if (!name) return <LucideIcons.Circle className={className} />;
    const Icon = (LucideIcons as any)[name];
    if (!Icon) {
        console.warn(`Icon "${name}" not found in lucide-react`);
        return <LucideIcons.HelpCircle className={className} />;
    }
    return <Icon className={className} />;
};

// Custom Edge with Dynamic Detour
const DetourEdge: React.FC<EdgeProps> = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    label,
    labelStyle,
    labelBgStyle,
    data
}) => {
    const detourWidth = data?.detourWidth || 50;
    const direction = sourcePosition === Position.Left ? -1 : 1;

    let path = '';
    let labelX = sourceX;
    let labelY = sourceY;

    if (sourcePosition === Position.Bottom) {
        // Straight down (Main Flow)
        const [edgePath] = getSmoothStepPath({
            sourceX,
            sourceY,
            sourcePosition,
            targetX,
            targetY,
            targetPosition,
        });
        path = edgePath;

        // Label position for main flow
        labelX = sourceX - 75;
        labelY = sourceY + 10;
    } else {
        // Detour (Branch)
        // 1. Move out horizontally by detourWidth
        const p1x = sourceX + (direction * detourWidth);
        const p1y = sourceY;

        // 2. Go down to just above target
        const p2x = p1x;
        const p2y = targetY - 30;

        // 3. Go horizontal to target
        const p3x = targetX;
        const p3y = p2y;

        // 4. Go down to target
        path = `M ${sourceX},${sourceY} L ${p1x},${p1y} L ${p2x},${p2y} L ${p3x},${p3y} L ${targetX},${targetY}`;

        // Label position for detour flow: Center on vertical segment
        labelX = p1x - 75;
        labelY = (p1y + p2y) / 2 - 20;
    }

    return (
        <>
            <BaseEdge path={path} markerEnd={markerEnd} style={style} />
            {label && (
                <foreignObject
                    width={150}
                    height={40}
                    x={labelX}
                    y={labelY}
                    className="overflow-visible pointer-events-none"
                >
                    <div className="flex justify-center items-center h-full">
                        <span style={{
                            background: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: style.stroke as string,
                            border: `1px solid ${style.stroke}`,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}>
                            {label}
                        </span>
                    </div>
                </foreignObject>
            )}
        </>
    );
};

// Custom Process Node with multiple handles
const ProcessNode: React.FC<NodeProps> = ({ data, selected }) => {
    return (
        <div style={{
            width: NODE_WIDTH,
            padding: '15px',
            borderRadius: '8px',
            border: selected ? '2px solid #3b82f6' : '1px solid #94a3b8',
            background: selected ? '#eff6ff' : '#fff',
            boxShadow: selected ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'left',
            minHeight: '60px',
            position: 'relative'
        }}>
            <div className={`flex-shrink-0 p-2 rounded-full ${selected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                <DynamicIcon name={data.icon} className="w-6 h-6" />
            </div>
            <div className="font-medium text-gray-800 text-sm whitespace-pre-wrap flex-1">
                {data.label}
            </div>

            {/* Multiple Target Handles for better spacing */}
            <Handle type="target" position={Position.Top} id="target-left" style={{ left: '30%' }} className="!opacity-0" />
            <Handle type="target" position={Position.Top} id="target-center" style={{ left: '50%' }} className="!opacity-0" />
            <Handle type="target" position={Position.Top} id="target-right" style={{ left: '70%' }} className="!opacity-0" />

            <Handle type="source" position={Position.Bottom} className="!opacity-0" />
        </div>
    );
};

// Custom Decision Node
const DecisionNode: React.FC<NodeProps> = ({ data, selected }) => {
    const width = 220;
    const height = 110; // Flatter aspect ratio

    return (
        <div style={{
            width: `${width}px`,
            height: `${height}px`,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Use drop-shadow filter for the SVG shape shadow
            filter: selected ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))' : 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
        }}>
            {/* SVG Diamond Shape */}
            <svg
                width={width}
                height={height}
                style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
            >
                <path
                    d={`M ${width / 2} 0 L ${width} ${height / 2} L ${width / 2} ${height} L 0 ${height / 2} Z`}
                    fill={selected ? '#fffbeb' : '#fff'}
                    stroke="#f59e0b"
                    strokeWidth={selected ? 3 : 2}
                    strokeLinejoin="round"
                />
            </svg>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-1 text-center px-8 w-full">
                <DynamicIcon name={data.icon} className="w-5 h-5 text-orange-600" />
                <div className="font-bold text-xs text-gray-800 leading-tight line-clamp-2 w-full">
                    {data.label}
                </div>
            </div>

            {/* Handles - Standard positions work for the bounding box */}
            <Handle type="target" position={Position.Top} id="top" className="!opacity-0" />
            <Handle type="source" position={Position.Right} id="right" className="!opacity-0" />
            <Handle type="source" position={Position.Bottom} id="bottom" className="!opacity-0" />
            <Handle type="source" position={Position.Left} id="left" className="!opacity-0" />
        </div>
    );
};

// Custom Group Node
const GroupNode: React.FC<NodeProps> = ({ data, selected }) => {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            border: `2px dashed ${data.color || '#ef4444'}`,
            borderRadius: '12px',
            position: 'relative',
            background: `${data.color || '#ef4444'}10`, // 10% opacity background
            pointerEvents: 'none', // Allow clicking through to nodes underneath
        }}>
            <div style={{
                position: 'absolute',
                top: '-14px',
                left: '20px',
                background: data.color || '#ef4444',
                color: 'white',
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
            }}>
                {data.label}
            </div>
        </div>
    );
};

const nodeTypes = {
    processNode: ProcessNode,
    decisionNode: DecisionNode,
    groupNode: GroupNode,
};

const edgeTypes = {
    detour: DetourEdge,
};

export const FlowPanel: React.FC = () => {
    const { workflow, progress, setNode } = useApp();

    const initialNodes: Node[] = useMemo(() => {
        const nodes: Node[] = [];

        // 1. Create Group Nodes (Background)
        if (workflow.groups) {
            workflow.groups.forEach(group => {
                if (!group.nodeIds || group.nodeIds.length === 0) return;

                // Find min/max Y of nodes in the group to determine bounds
                // We assume nodes are laid out vertically by index
                const groupNodes = workflow.nodes
                    .map((n, i) => ({ node: n, index: i }))
                    .filter(item => group.nodeIds.includes(item.node.id));

                if (groupNodes.length === 0) return;

                const minIndex = Math.min(...groupNodes.map(n => n.index));
                const maxIndex = Math.max(...groupNodes.map(n => n.index));

                // Calculate bounds
                // Y position: Start of first node - padding
                // Calculate bounds centered between nodes
                // Node starts at index * 150 + 50
                // Gap is approx 70px. 1/3 is approx 23px.
                // Top: 50 - 25 = 25
                // Bottom: 130 + 25 = 155 (Height 130 for single node)
                const startY = minIndex * VERTICAL_SPACING + 25;
                const height = (maxIndex - minIndex) * VERTICAL_SPACING + 130;

                // Width: Wide enough to encompass nodes + detour lines
                // Center X is 400. Node width 250.
                // Let's make it 500px wide centered at 400.
                const width = 500;
                const x = CENTER_X - (width / 2) + (NODE_WIDTH / 2);

                nodes.push({
                    id: group.id,
                    position: { x, y: startY },
                    data: { label: group.title, color: group.color },
                    type: 'groupNode',
                    style: { width, height, zIndex: -1 }, // Ensure background
                    draggable: false,
                    selectable: false,
                });
            });
        }

        // 2. Create Process/Decision Nodes
        workflow.nodes.forEach((node, index) => {
            const isCurrent = node.id === progress.currentNodeId;
            const isCompleted = progress.completedStepIds.includes(node.id) ||
                (node.subProcesses.every(sp => progress.completedStepIds.includes(sp.id)));

            const nodeData = {
                label: node.title,
                icon: node.icon,
                isCompleted
            };

            if (node.type === 'decision') {
                nodes.push({
                    id: node.id,
                    position: { x: CENTER_X + (NODE_WIDTH - 220) / 2, y: index * VERTICAL_SPACING + 50 },
                    data: nodeData,
                    type: 'decisionNode',
                    selected: isCurrent,
                });
            } else {
                nodes.push({
                    id: node.id,
                    position: { x: CENTER_X, y: index * VERTICAL_SPACING + 50 },
                    data: nodeData,
                    type: 'processNode',
                    selected: isCurrent,
                });
            }
        });

        return nodes;
    }, [workflow.nodes, workflow.groups, progress.currentNodeId, progress.completedStepIds]);

    const initialEdges: Edge[] = useMemo(() => {
        // Calculate incoming edge counts for each node to determine target handle
        const incomingEdgeCounts: Record<string, number> = {};
        workflow.edges.forEach(edge => {
            incomingEdgeCounts[edge.target] = (incomingEdgeCounts[edge.target] || 0) + 1;
        });

        return workflow.edges.map(edge => {
            const sourceNode = workflow.nodes.find(n => n.id === edge.source);
            const sourceIndex = workflow.nodes.findIndex(n => n.id === edge.source);
            const targetIndex = workflow.nodes.findIndex(n => n.id === edge.target);

            let label = '';
            let strokeColor = '#64748b';
            let strokeWidth = 2;
            let strokeDasharray = undefined;
            let sourceHandle = 'bottom'; // Default to bottom (Main Flow)
            let targetHandle = 'target-center';
            let detourWidth = 50;

            if (sourceNode?.type === 'decision' && sourceNode.decisionOptions) {
                const option = sourceNode.decisionOptions.find(opt => opt.targetNodeId === edge.target);
                if (option) {
                    label = option.label;
                    strokeDasharray = '5,5';

                    // Determine if this is the "Main Flow" (next sequential node)
                    const isMainFlow = targetIndex === sourceIndex + 1;

                    if (isMainFlow) {
                        sourceHandle = 'bottom';
                        strokeColor = '#2563eb'; // Blue for main flow
                        strokeWidth = 3;
                    } else {
                        // Branch logic
                        // Calculate dynamic width based on label length
                        // Base 30px + 8px per character (Tighter spacing)
                        detourWidth = 30 + (label.length * 8);

                        // Alternate sides based on option index or simple hash
                        const optionIndex = sourceNode.decisionOptions.indexOf(option);

                        // Determine target handle: if multiple incoming, offset. If unique, center.
                        const isUniqueIncoming = incomingEdgeCounts[edge.target] <= 1;

                        if (optionIndex % 2 === 0) {
                            sourceHandle = 'left';
                            targetHandle = isUniqueIncoming ? 'target-center' : 'target-left';
                            strokeColor = '#ef4444'; // Red-ish for branch 1
                        } else {
                            sourceHandle = 'right';
                            targetHandle = isUniqueIncoming ? 'target-center' : 'target-right';
                            strokeColor = '#22c55e'; // Green-ish for branch 2
                        }
                    }
                }
            } else {
                // Normal process node connection
                sourceHandle = 'bottom';
                targetHandle = 'target-center';
            }

            return {
                id: edge.id,
                source: edge.source,
                target: edge.target,
                type: 'detour', // Use custom edge
                sourceHandle,
                targetHandle,
                markerEnd: { type: MarkerType.ArrowClosed, color: strokeColor },
                style: { stroke: strokeColor, strokeWidth, strokeDasharray },
                animated: edge.source === progress.currentNodeId,
                label: label,
                data: { detourWidth }, // Pass calculated width
            };
        });
    }, [workflow.edges, workflow.nodes, progress.currentNodeId]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                attributionPosition="bottom-left"
                nodesDraggable={false}
                nodesConnectable={false}
                onNodeClick={(_, node) => {
                    setNode(node.id);
                }}
            >
                <Background color="#f8fafc" gap={16} />
                <Controls />
            </ReactFlow>
        </div>
    );
};
