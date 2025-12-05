export type ContentType = 'text' | 'warning' | 'check' | 'input' | 'formula';

export interface StepContent {
    id: string;
    type: ContentType;
    text: string;           // Display text
    detail?: string;        // Supplementary explanation
    required: boolean;      // If true, must be completed/checked to proceed
    placeholder?: string;   // Placeholder for input type
}

export interface SubProcess {
    id: string;             // e.g., "1.1"
    title: string;          // e.g., "Sample Purchase"
    contents: StepContent[];
}

export interface WorkflowNode {
    id: string;             // e.g., "step-1"
    title: string;          // e.g., "1. Sample Preparation"
    type: 'process' | 'decision';
    icon?: string;          // Icon name from Lucide
    subProcesses: SubProcess[];

    // For decision nodes
    decisionOptions?: {
        label: string;
        targetNodeId: string;
    }[];
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
}

export interface WorkflowGroup {
    id: string;
    title: string;
    nodeIds: string[];
    color?: string;
}

export interface WorkflowDefinition {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    groups: WorkflowGroup[];
}

export interface UserProgress {
    currentNodeId: string;        // Currently active node
    completedStepIds: string[];   // List of completed SubProcess IDs
    checkedContentIds: string[];  // List of checked Content IDs
    inputValues: Record<string, string>; // { contentId: value }
}

// Version History Entry
export interface HistoryEntry {
    id: string;
    timestamp: number;
    userId: string;
    userEmail?: string;
    action: 'create' | 'update' | 'complete' | 'reset';
    details: string;
}

// Category type for organizing projects
export type ProjectCategory =
    | '実験'
    | '分析'
    | '製造'
    | '品質管理'
    | '研究開発'
    | 'その他';

export const PROJECT_CATEGORIES: ProjectCategory[] = [
    '実験',
    '分析',
    '製造',
    '品質管理',
    '研究開発',
    'その他'
];

export interface Project {
    id: string;
    name: string;
    description?: string;
    category?: ProjectCategory;   // Project category
    createdAt: number;
    updatedAt: number;
    workflow: WorkflowDefinition;
    progress: UserProgress;
    history?: HistoryEntry[];     // Version history
    isTemplate?: boolean;         // If true, this is a template
    templateId?: string;          // ID of template this was created from
}
