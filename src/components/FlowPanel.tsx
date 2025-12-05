import React, { useMemo, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
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
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    label,
    data
}) => {
    const detourWidth = data?.detourWidth || 50;
    const direction = sourcePosition === Position.Left ? -1 : 1;
    const isHorizontalLayout = data?.isHorizontal || false;

    let path = '';
    let labelX = sourceX;
    let labelY = sourceY;

    if (isHorizontalLayout) {
        // ========== HORIZONTAL LAYOUT EDGES ==========

        // Horizontal straight line (Right to Left connection)
        if (sourcePosition === Position.Right && targetPosition === Position.Left) {
            if (sourceX > targetX) {
                // Going backwards - loop above main flow
                const loopY = sourceY - 120;
                path = `M ${sourceX},${sourceY} L ${sourceX + 40},${sourceY} L ${sourceX + 40},${loopY} L ${targetX - 30},${loopY} L ${targetX - 30},${targetY} L ${targetX},${targetY}`;
                labelX = (sourceX + targetX) / 2;
                labelY = loopY - 15;
            } else {
                // Normal forward connection
                path = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
                labelX = (sourceX + targetX) / 2 - 30;
                labelY = sourceY - 15;
            }
        }
        // Right to Top (process to decision)
        else if (sourcePosition === Position.Right && targetPosition === Position.Top) {
            const midX = (sourceX + targetX) / 2;
            path = `M ${sourceX},${sourceY} L ${midX},${sourceY} L ${midX},${targetY - 30} L ${targetX},${targetY - 30} L ${targetX},${targetY}`;
            labelX = midX - 30;
            labelY = sourceY - 15;
        }
        // Decision branches (loop back arrows) 
        else if (sourcePosition === Position.Left) {
            // Loop back to earlier node (goes left, down, then to target)
            const loopY = sourceY + 80;
            path = `M ${sourceX},${sourceY} L ${sourceX - 40},${sourceY} L ${sourceX - 40},${loopY} L ${targetX - 40},${loopY} L ${targetX - 40},${targetY} L ${targetX},${targetY}`;
            labelX = (sourceX + targetX) / 2 - 50;
            labelY = loopY + 10;
        }
        else if (sourcePosition === Position.Top) {
            // Top handle - goes up then left
            const loopY = sourceY - 60;
            path = `M ${sourceX},${sourceY} L ${sourceX},${loopY} L ${targetX - 30},${loopY} L ${targetX - 30},${targetY} L ${targetX},${targetY}`;
            labelX = (sourceX + targetX) / 2;
            labelY = loopY - 15;
        }
        else {
            // Default horizontal
            path = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
        }
    } else {
        // ========== VERTICAL LAYOUT EDGES (Original) ==========

        if (sourcePosition === Position.Bottom || !sourcePosition) {
            // Straight down (Main Flow) - also default when sourcePosition is undefined
            const [edgePath] = getSmoothStepPath({
                sourceX,
                sourceY,
                sourcePosition: Position.Bottom,
                targetX,
                targetY,
                targetPosition: targetPosition || Position.Top,
            });
            path = edgePath;
            labelX = sourceX - 75;
            labelY = sourceY + 10;
        } else {
            // Detour (Branch) - Original logic that avoids overlap
            const p1x = sourceX + (direction * detourWidth);
            const p1y = sourceY;
            const p2x = p1x;
            const p2y = targetY - 30;
            const p3x = targetX;
            const p3y = p2y;
            path = `M ${sourceX},${sourceY} L ${p1x},${p1y} L ${p2x},${p2y} L ${p3x},${p3y} L ${targetX},${targetY}`;
            labelX = p1x - 75;
            labelY = (p1y + p2y) / 2 - 20;
        }
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

            {/* Horizontal handles for horizontal layout */}
            <Handle type="target" position={Position.Left} id="left" className="!opacity-0" />
            <Handle type="source" position={Position.Right} id="right" className="!opacity-0" />

            <Handle type="source" position={Position.Bottom} id="bottom" className="!opacity-0" />
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
            <Handle type="source" position={Position.Top} id="top-source" className="!opacity-0" />
            <Handle type="source" position={Position.Right} id="right" className="!opacity-0" />
            <Handle type="source" position={Position.Bottom} id="bottom" className="!opacity-0" />
            <Handle type="source" position={Position.Left} id="left" className="!opacity-0" />
        </div>
    );
};

// Custom Group Node
const GroupNode: React.FC<NodeProps> = ({ data }) => {
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

interface FlowPanelProps {
    isHorizontal?: boolean;
}

export const FlowPanel: React.FC<FlowPanelProps> = ({ isHorizontal = false }) => {
    const { workflow, progress, setNode } = useApp();

    const initialNodes: Node[] = useMemo(() => {
        const nodes: Node[] = [];

        // Layout constants based on orientation
        const HORIZONTAL_SPACING = 300;
        const START_X = 100;
        const START_Y = 200;

        // 1. Create Group Nodes (Background) - Skip in horizontal mode for now
        if (workflow.groups && !isHorizontal) {
            workflow.groups.forEach(group => {
                if (!group.nodeIds || group.nodeIds.length === 0) return;

                const groupNodes = workflow.nodes
                    .map((n, i) => ({ node: n, index: i }))
                    .filter(item => group.nodeIds.includes(item.node.id));

                if (groupNodes.length === 0) return;

                const minIndex = Math.min(...groupNodes.map(n => n.index));
                const maxIndex = Math.max(...groupNodes.map(n => n.index));

                const startY = minIndex * VERTICAL_SPACING + 25;
                const height = (maxIndex - minIndex) * VERTICAL_SPACING + 130;
                const width = 500;
                const x = CENTER_X - (width / 2) + (NODE_WIDTH / 2);

                nodes.push({
                    id: group.id,
                    position: { x, y: startY },
                    data: { label: group.title, color: group.color },
                    type: 'groupNode',
                    style: { width, height, zIndex: -1 },
                    draggable: false,
                    selectable: false,
                });
            });
        }

        // 1b. Create Group Nodes for Horizontal Mode
        if (workflow.groups && isHorizontal) {
            // Get process nodes for index calculation
            const processNodesForGroups = workflow.nodes.filter(n => n.type !== 'decision');

            workflow.groups.forEach(group => {
                if (!group.nodeIds || group.nodeIds.length === 0) return;

                // Filter only process nodes in this group
                const groupProcessNodes = processNodesForGroups
                    .map((n, i) => ({ node: n, index: i }))
                    .filter(item => group.nodeIds.includes(item.node.id));

                if (groupProcessNodes.length === 0) return;

                const minIndex = Math.min(...groupProcessNodes.map(n => n.index));
                const maxIndex = Math.max(...groupProcessNodes.map(n => n.index));

                // Calculate gap between nodes (HORIZONTAL_SPACING - NODE_WIDTH)
                const gapBetweenNodes = HORIZONTAL_SPACING - NODE_WIDTH;
                const gapThird = gapBetweenNodes / 3;

                // Left edge: 1/3 of gap before first node (from previous node end)
                // Right edge: 1/3 of gap after last node (toward next node)
                const startX = minIndex * HORIZONTAL_SPACING + START_X - gapThird;
                const endX = maxIndex * HORIZONTAL_SPACING + START_X + NODE_WIDTH + gapThird;
                const width = endX - startX;

                // Height that spans from 1/3 above nodes to 1/3 below nodes
                const nodeHeight = 80; // Approximate node height
                const groupPadding = nodeHeight / 3;
                const height = nodeHeight + (groupPadding * 2) + 40;
                const y = START_Y - groupPadding - 20;

                nodes.push({
                    id: group.id,
                    position: { x: startX, y },
                    data: { label: group.title, color: group.color },
                    type: 'groupNode',
                    style: { width, height, zIndex: -1 },
                    draggable: false,
                    selectable: false,
                });
            });
        }

        // 2. Create Process/Decision Nodes
        // Count process nodes for positioning decision node
        const processNodes = workflow.nodes.filter(n => n.type !== 'decision');
        const processNodeCount = processNodes.length;

        workflow.nodes.forEach((node, index) => {
            const isCurrent = node.id === progress.currentNodeId;
            const isCompleted = progress.completedStepIds.includes(node.id) ||
                (node.subProcesses.every(sp => progress.completedStepIds.includes(sp.id)));

            const nodeData = {
                label: node.title,
                icon: node.icon,
                isCompleted
            };

            let x: number;
            let y: number;

            if (isHorizontal) {
                if (node.type === 'decision') {
                    // Decision node: below the last process node
                    x = (processNodeCount - 1) * HORIZONTAL_SPACING + START_X + 50;
                    y = START_Y + 150;
                } else {
                    // Process nodes: horizontal row, but skip decision node in index
                    const processIndex = processNodes.findIndex(n => n.id === node.id);
                    x = processIndex * HORIZONTAL_SPACING + START_X;
                    y = START_Y;
                }
            } else {
                // Vertical layout
                x = CENTER_X + (node.type === 'decision' ? (NODE_WIDTH - 220) / 2 : 0);
                y = index * VERTICAL_SPACING + 50;
            }

            if (node.type === 'decision') {
                nodes.push({
                    id: node.id,
                    position: { x, y },
                    data: nodeData,
                    type: 'decisionNode',
                    selected: isCurrent,
                });
            } else {
                nodes.push({
                    id: node.id,
                    position: { x, y },
                    data: nodeData,
                    type: 'processNode',
                    selected: isCurrent,
                });
            }
        });

        return nodes;
    }, [workflow.nodes, workflow.groups, progress.currentNodeId, progress.completedStepIds, isHorizontal]);

    const initialEdges: Edge[] = useMemo(() => {
        // Calculate incoming edge counts for each node to determine target handle
        const incomingEdgeCounts: Record<string, number> = {};
        workflow.edges.forEach(edge => {
            incomingEdgeCounts[edge.target] = (incomingEdgeCounts[edge.target] || 0) + 1;
        });



        return workflow.edges.map(edge => {
            const sourceNode = workflow.nodes.find(n => n.id === edge.source);
            const targetNode = workflow.nodes.find(n => n.id === edge.target);
            const sourceIndex = workflow.nodes.findIndex(n => n.id === edge.source);
            const targetIndex = workflow.nodes.findIndex(n => n.id === edge.target);

            let label = '';
            let strokeColor = '#64748b';
            let strokeWidth = 2;
            let strokeDasharray: string | undefined = undefined;
            let sourceHandle = 'bottom';
            let targetHandle = 'target-center';
            let detourWidth = 50;

            if (isHorizontal) {
                // Horizontal layout edge logic
                if (sourceNode?.type === 'decision' && sourceNode.decisionOptions) {
                    // Decision node branches
                    const option = sourceNode.decisionOptions.find(opt => opt.targetNodeId === edge.target);
                    if (option) {
                        label = option.label.replace(/\s*\([^)]*\)/, ''); // Remove parenthetical text
                        strokeDasharray = '5,5';

                        const optionIndex = sourceNode.decisionOptions.indexOf(option);

                        if (optionIndex === 0) {
                            // First option: goes up-left (red arrow to step-1)
                            sourceHandle = 'left';
                            targetHandle = 'left';
                            strokeColor = '#ef4444';
                            detourWidth = 80;
                        } else {
                            // Second option: goes from right side (green arrow to step-2)
                            sourceHandle = 'right';
                            targetHandle = 'left';
                            strokeColor = '#22c55e';
                            detourWidth = 50;
                        }
                    }
                } else if (targetNode?.type === 'decision') {
                    // Edge to decision node: from right of process to top of decision
                    sourceHandle = 'right';
                    targetHandle = 'top';
                    strokeColor = '#64748b';
                } else {
                    // Normal process-to-process: horizontal arrow
                    sourceHandle = 'right';
                    targetHandle = 'left';
                    strokeColor = '#64748b';
                }
            } else {
                // Vertical layout edge logic (original)
                if (sourceNode?.type === 'decision' && sourceNode.decisionOptions) {
                    const option = sourceNode.decisionOptions.find(opt => opt.targetNodeId === edge.target);
                    if (option) {
                        label = option.label;
                        strokeDasharray = '5,5';

                        const isMainFlow = targetIndex === sourceIndex + 1;

                        if (isMainFlow) {
                            sourceHandle = 'bottom';
                            strokeColor = '#2563eb';
                            strokeWidth = 3;
                        } else {
                            detourWidth = 30 + (label.length * 8);
                            const optionIndex = sourceNode.decisionOptions.indexOf(option);
                            const isUniqueIncoming = incomingEdgeCounts[edge.target] <= 1;

                            if (optionIndex % 2 === 0) {
                                sourceHandle = 'left';
                                targetHandle = isUniqueIncoming ? 'target-center' : 'target-left';
                                strokeColor = '#ef4444';
                            } else {
                                sourceHandle = 'right';
                                targetHandle = isUniqueIncoming ? 'target-center' : 'target-right';
                                strokeColor = '#22c55e';
                            }
                        }
                    }
                } else {
                    sourceHandle = 'bottom';
                    targetHandle = 'target-center';
                }
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
                data: { detourWidth, isHorizontal }, // Pass layout mode
            };
        });
    }, [workflow.edges, workflow.nodes, progress.currentNodeId, isHorizontal]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    return (
        <div className="w-full h-full flowchart-gradient">
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
                <Background color="#94a3b8" gap={20} size={1} />
                <Controls />
                <MiniMap
                    nodeColor={(node) => {
                        if (node.type === 'decisionNode') return '#f59e0b';
                        if (node.type === 'groupNode') return 'transparent';
                        return '#3b82f6';
                    }}
                    maskColor="rgba(0, 0, 0, 0.1)"
                    position="bottom-right"
                />
            </ReactFlow>
        </div>
    );
};
