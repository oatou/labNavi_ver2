import React, { createContext, useContext, useEffect, useState } from 'react';
import type { UserProgress, WorkflowDefinition, WorkflowNode, Project, WorkflowGroup } from '../types/workflow';
import { experimentalWorkflow } from '../data/workflow';

interface AppContextType {
    // Project Management
    projects: Project[];
    currentProjectId: string | null;
    currentProject: Project | undefined;
    addProject: (name: string, description?: string) => void;
    updateProject: (id: string, data: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    selectProject: (id: string) => void;
    backToMenu: () => void;

    // Workflow Actions (operate on current project)
    workflow: WorkflowDefinition;
    progress: UserProgress;
    setNode: (nodeId: string) => void;
    completeStep: (stepId: string) => void;
    checkContent: (contentId: string, checked: boolean) => void;
    resetProgress: () => void;
    isStepCompleted: (stepId: string) => boolean;
    isContentChecked: (contentId: string) => boolean;

    // Editing actions
    addNode: (title: string, type?: 'process' | 'decision') => void;
    updateNode: (id: string, data: Partial<WorkflowNode>) => void;
    deleteNode: (id: string) => void;

    // Group actions
    addGroup: (title: string, nodeIds: string[], color?: string) => void;
    updateGroup: (id: string, data: Partial<WorkflowGroup>) => void;
    deleteGroup: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const PROJECTS_STORAGE_KEY = 'lab-flow-projects';
// Legacy keys for migration
const LEGACY_PROGRESS_KEY = 'lab-flow-progress';
const LEGACY_WORKFLOW_KEY = 'lab-flow-data-v2';

const INITIAL_PROGRESS: UserProgress = {
    currentNodeId: 'step-1',
    completedStepIds: [],
    checkedContentIds: [],
    inputValues: {},
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>(() => {
        const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
        if (savedProjects) {
            return JSON.parse(savedProjects);
        }

        // Migration Logic: Check for legacy data
        const legacyWorkflow = localStorage.getItem(LEGACY_WORKFLOW_KEY);
        const legacyProgress = localStorage.getItem(LEGACY_PROGRESS_KEY);

        if (legacyWorkflow || legacyProgress) {
            const initialWorkflow = legacyWorkflow ? JSON.parse(legacyWorkflow) : experimentalWorkflow;
            const initialProgress = legacyProgress ? JSON.parse(legacyProgress) : INITIAL_PROGRESS;

            const defaultProject: Project = {
                id: `proj-${Date.now()}`,
                name: 'デフォルトプロジェクト',
                description: '以前のデータから移行されました',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                workflow: initialWorkflow,
                progress: initialProgress
            };
            return [defaultProject];
        }

        // Fresh start
        const defaultProject: Project = {
            id: `proj-${Date.now()}`,
            name: 'デフォルトプロジェクト',
            description: '初期フローチャート',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            workflow: JSON.parse(JSON.stringify(experimentalWorkflow)),
            progress: { ...INITIAL_PROGRESS }
        };
        return [defaultProject];
    });

    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

    // Persist projects whenever they change
    useEffect(() => {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    }, [projects]);

    // Helpers to update current project
    const updateCurrentProject = (updater: (project: Project) => Project) => {
        if (!currentProjectId) return;
        setProjects(prev => prev.map(p => {
            if (p.id === currentProjectId) {
                const updated = updater(p);
                return { ...updated, updatedAt: Date.now() };
            }
            return p;
        }));
    };

    // --- Project Management Actions ---

    const addProject = (name: string, description?: string) => {
        const newProject: Project = {
            id: `proj-${Date.now()}`,
            name,
            description,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            workflow: JSON.parse(JSON.stringify(experimentalWorkflow)), // Start with default template
            progress: { ...INITIAL_PROGRESS }
        };
        setProjects(prev => [...prev, newProject]);
    };

    const updateProject = (id: string, data: Partial<Project>) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data, updatedAt: Date.now() } : p));
    };

    const deleteProject = (id: string) => {
        if (!confirm('プロジェクトを削除しますか？この操作は取り消せません。')) return;
        setProjects(prev => prev.filter(p => p.id !== id));
        if (currentProjectId === id) {
            setCurrentProjectId(null);
        }
    };

    const selectProject = (id: string) => {
        setCurrentProjectId(id);
    };

    const backToMenu = () => {
        setCurrentProjectId(null);
    };

    // --- Derived State for Current Project ---

    const currentProject = projects.find(p => p.id === currentProjectId);

    // Fallback for when no project is selected (should handle in UI, but safe defaults here)
    const workflow = currentProject?.workflow || experimentalWorkflow;
    const progress = currentProject?.progress || INITIAL_PROGRESS;

    // --- Workflow Actions (Wrapped to update current project) ---

    const setNode = (nodeId: string) => {
        updateCurrentProject(p => ({
            ...p,
            progress: { ...p.progress, currentNodeId: nodeId }
        }));
    };

    const completeStep = (stepId: string) => {
        updateCurrentProject(p => {
            if (p.progress.completedStepIds.includes(stepId)) return p;
            return {
                ...p,
                progress: { ...p.progress, completedStepIds: [...p.progress.completedStepIds, stepId] }
            };
        });
    };

    const checkContent = (contentId: string, checked: boolean) => {
        updateCurrentProject(p => {
            const newChecked = checked
                ? [...p.progress.checkedContentIds, contentId]
                : p.progress.checkedContentIds.filter(id => id !== contentId);
            return {
                ...p,
                progress: { ...p.progress, checkedContentIds: newChecked }
            };
        });
    };

    const resetProgress = () => {
        if (confirm('進捗をリセットしますか？')) {
            updateCurrentProject(p => ({
                ...p,
                progress: { ...INITIAL_PROGRESS }
            }));
        }
    };

    // --- Editing Actions (Wrapped) ---

    const addNode = (title: string, type: 'process' | 'decision' = 'process') => {
        const newId = `step-${Date.now()}`;
        let newNode: WorkflowNode;

        if (type === 'decision') {
            newNode = {
                id: newId,
                title,
                type: 'decision',
                icon: 'GitBranch',
                subProcesses: [
                    {
                        id: `${newId}-1`,
                        title: '判断基準',
                        contents: [
                            { id: `c-${newId}-1`, type: 'text', text: '判断基準を入力してください', required: false }
                        ]
                    }
                ],
                decisionOptions: [
                    { label: 'はい', targetNodeId: '' },
                    { label: 'いいえ', targetNodeId: '' }
                ]
            };
        } else {
            newNode = {
                id: newId,
                title,
                type: 'process',
                subProcesses: [
                    {
                        id: `${newId}-1`,
                        title: '新しい手順',
                        contents: [
                            { id: `c-${newId}-1`, type: 'text', text: '詳細を入力してください', required: false }
                        ]
                    }
                ]
            };
        }

        updateCurrentProject(p => {
            const prev = p.workflow;
            const lastNode = prev.nodes[prev.nodes.length - 1];
            const newEdges = [...prev.edges];
            if (lastNode) {
                newEdges.push({
                    id: `e-${lastNode.id}-${newId}`,
                    source: lastNode.id,
                    target: newId
                });
            }
            return {
                ...p,
                workflow: {
                    nodes: [...prev.nodes, newNode],
                    edges: newEdges,
                    groups: prev.groups
                }
            };
        });
    };

    const updateNode = (id: string, data: Partial<WorkflowNode>) => {
        updateCurrentProject(p => {
            const prev = p.workflow;
            const updatedNodes = prev.nodes.map(n => n.id === id ? { ...n, ...data } : n);
            let updatedEdges = prev.edges;

            // Case 1: Updating Decision Options -> Sync Edges
            if (data.decisionOptions) {
                updatedEdges = updatedEdges.filter(e => e.source !== id);
                data.decisionOptions.forEach((option, index) => {
                    if (option.targetNodeId) {
                        updatedEdges.push({
                            id: `e-${id}-${option.targetNodeId}-${index}`,
                            source: id,
                            target: option.targetNodeId
                        });
                    }
                });
            }
            // Case 2: Reverting to Process
            else if (data.type === 'process' || data.decisionOptions === undefined) {
                const currentNodeIndex = prev.nodes.findIndex(n => n.id === id);
                if (currentNodeIndex !== -1 && currentNodeIndex < prev.nodes.length - 1) {
                    const nextNode = prev.nodes[currentNodeIndex + 1];
                    const existingEdge = updatedEdges.find(e => e.source === id && e.target === nextNode.id);
                    if (!existingEdge) {
                        updatedEdges = updatedEdges.filter(e => e.source !== id);
                        updatedEdges.push({
                            id: `e-${id}-${nextNode.id}`,
                            source: id,
                            target: nextNode.id
                        });
                    }
                }
            }

            return {
                ...p,
                workflow: {
                    nodes: updatedNodes,
                    edges: updatedEdges,
                    groups: prev.groups
                }
            };
        });
    };

    const deleteNode = (id: string) => {
        if (!confirm('本当に削除しますか？')) return;
        updateCurrentProject(p => {
            const prev = p.workflow;
            const nodeIndex = prev.nodes.findIndex(n => n.id === id);
            if (nodeIndex === -1) return p;

            const incomingEdge = prev.edges.find(e => e.target === id);
            const outgoingEdge = prev.edges.find(e => e.source === id);
            let newEdges = prev.edges.filter(e => e.target !== id && e.source !== id);

            if (incomingEdge && outgoingEdge) {
                newEdges.push({
                    id: `e-${incomingEdge.source}-${outgoingEdge.target}`,
                    source: incomingEdge.source,
                    target: outgoingEdge.target
                });
            }

            return {
                ...p,
                workflow: {
                    ...prev,
                    nodes: prev.nodes.filter(n => n.id !== id),
                    edges: newEdges,
                    groups: prev.groups
                }
            };
        });
    };

    const addGroup = (title: string, nodeIds: string[], color: string = '#ef4444') => {
        const newGroup: WorkflowGroup = {
            id: `group-${Date.now()}`,
            title,
            nodeIds,
            color
        };
        updateCurrentProject(p => ({
            ...p,
            workflow: {
                ...p.workflow,
                groups: [...(p.workflow.groups || []), newGroup]
            }
        }));
    };

    const updateGroup = (id: string, data: Partial<WorkflowGroup>) => {
        updateCurrentProject(p => ({
            ...p,
            workflow: {
                ...p.workflow,
                groups: (p.workflow.groups || []).map(g => g.id === id ? { ...g, ...data } : g)
            }
        }));
    };

    const deleteGroup = (id: string) => {
        if (!confirm('グループを削除しますか？（中の工程は削除されません）')) return;
        updateCurrentProject(p => ({
            ...p,
            workflow: {
                ...p.workflow,
                groups: (p.workflow.groups || []).filter(g => g.id !== id)
            }
        }));
    };

    const isStepCompleted = (stepId: string) => progress.completedStepIds.includes(stepId);
    const isContentChecked = (contentId: string) => progress.checkedContentIds.includes(contentId);

    return (
        <AppContext.Provider value={{
            projects,
            currentProjectId,
            currentProject,
            addProject,
            updateProject,
            deleteProject,
            selectProject,
            backToMenu,
            workflow,
            progress,
            setNode,
            completeStep,
            checkContent,
            resetProgress,
            isStepCompleted,
            isContentChecked,
            addNode,
            updateNode,
            deleteNode,
            addGroup,
            updateGroup,
            deleteGroup
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
