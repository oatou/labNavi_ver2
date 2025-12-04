import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppProvider';
import { StepItem } from './StepItem';
import { ChevronLeft, ChevronRight, Edit2, Save, X, Plus, Trash2, GitBranch } from 'lucide-react';
import type { WorkflowNode, SubProcess, StepContent } from '../types/workflow';

export const DetailsPanel: React.FC = () => {
    const {
        workflow,
        progress,
        setNode,
        completeStep,
        updateNode
    } = useApp();

    const currentNode = workflow.nodes.find(n => n.id === progress.currentNodeId);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editedNode, setEditedNode] = useState<WorkflowNode | null>(null);

    // Sync editedNode when entering edit mode or when node changes (if not editing)
    useEffect(() => {
        if (currentNode && !isEditing) {
            setEditedNode(JSON.parse(JSON.stringify(currentNode)));
        }
    }, [currentNode, isEditing]);

    if (!currentNode) return <div className="p-8 text-center text-gray-500">手順を選択してください</div>;

    const handleSave = () => {
        if (editedNode) {
            updateNode(editedNode.id, editedNode);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedNode(JSON.parse(JSON.stringify(currentNode)));
    };

    // --- Edit Handlers ---

    const updateNodeTitle = (title: string) => {
        if (editedNode) setEditedNode({ ...editedNode, title });
    };

    const updateSubProcessTitle = (spIndex: number, title: string) => {
        if (!editedNode) return;
        const newSubProcesses = [...editedNode.subProcesses];
        newSubProcesses[spIndex] = { ...newSubProcesses[spIndex], title };
        setEditedNode({ ...editedNode, subProcesses: newSubProcesses });
    };

    const addSubProcess = () => {
        if (!editedNode) return;
        const newId = `${editedNode.id}-${editedNode.subProcesses.length + 1}`;
        const newSubProcess: SubProcess = {
            id: newId,
            title: '新しいサブプロセス',
            contents: []
        };
        setEditedNode({
            ...editedNode,
            subProcesses: [...editedNode.subProcesses, newSubProcess]
        });
    };

    const deleteSubProcess = (spIndex: number) => {
        if (!editedNode) return;
        if (!confirm('このサブプロセスを削除しますか？')) return;
        const newSubProcesses = editedNode.subProcesses.filter((_, i) => i !== spIndex);
        setEditedNode({ ...editedNode, subProcesses: newSubProcesses });
    };

    const addStep = (spIndex: number) => {
        if (!editedNode) return;
        const newSubProcesses = [...editedNode.subProcesses];
        const sp = newSubProcesses[spIndex];
        const newStep: StepContent = {
            id: `c-${sp.id}-${sp.contents.length + 1}-${Date.now()}`,
            type: 'text',
            text: '',
            required: false
        };
        sp.contents = [...sp.contents, newStep];
        setEditedNode({ ...editedNode, subProcesses: newSubProcesses });
    };

    const updateStep = (spIndex: number, stepIndex: number, field: keyof StepContent, value: any) => {
        if (!editedNode) return;
        const newSubProcesses = [...editedNode.subProcesses];
        const sp = newSubProcesses[spIndex];
        const newContents = [...sp.contents];
        newContents[stepIndex] = { ...newContents[stepIndex], [field]: value };
        sp.contents = newContents;
        setEditedNode({ ...editedNode, subProcesses: newSubProcesses });
    };

    const deleteStep = (spIndex: number, stepIndex: number) => {
        if (!editedNode) return;
        const newSubProcesses = [...editedNode.subProcesses];
        const sp = newSubProcesses[spIndex];
        sp.contents = sp.contents.filter((_, i) => i !== stepIndex);
        setEditedNode({ ...editedNode, subProcesses: newSubProcesses });
    };

    // --- Decision Handlers ---
    const addDecisionOption = () => {
        if (!editedNode) return;
        const newOptions = [...(editedNode.decisionOptions || [])];
        newOptions.push({ label: '新しい選択肢', targetNodeId: '' });

        // Ensure type is decision
        setEditedNode({
            ...editedNode,
            type: 'decision',
            decisionOptions: newOptions
        });
    };

    const updateDecisionOption = (index: number, field: 'label' | 'targetNodeId', value: string) => {
        if (!editedNode || !editedNode.decisionOptions) return;
        const newOptions = [...editedNode.decisionOptions];
        newOptions[index] = { ...newOptions[index], [field]: value };
        setEditedNode({ ...editedNode, decisionOptions: newOptions });
    };

    const deleteDecisionOption = (index: number) => {
        if (!editedNode || !editedNode.decisionOptions) return;
        const newOptions = editedNode.decisionOptions.filter((_, i) => i !== index);

        if (newOptions.length === 0) {
            // Revert to process if no options left
            setEditedNode({
                ...editedNode,
                type: 'process',
                decisionOptions: undefined
            });
        } else {
            setEditedNode({ ...editedNode, decisionOptions: newOptions });
        }
    };

    // --- Navigation Handlers ---
    const handleNext = () => {
        currentNode.subProcesses.forEach(sp => completeStep(sp.id));
        const edge = workflow.edges.find(e => e.source === currentNode.id);
        if (edge) setNode(edge.target);
    };

    const handleBack = () => {
        const edge = workflow.edges.find(e => e.target === currentNode.id);
        if (edge) setNode(edge.source);
    };

    const handleDecision = (targetNodeId: string) => {
        currentNode.subProcesses.forEach(sp => completeStep(sp.id));
        setNode(targetNodeId);
    };

    // --- Render ---

    if (isEditing && editedNode) {
        return (
            <div className="flex flex-col h-full bg-gray-50">
                {/* Edit Header */}
                <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 flex justify-between items-center shadow-sm">
                    <h2 className="text-lg font-bold text-gray-700">詳細編集モード</h2>
                    <div className="flex gap-2">
                        <button onClick={handleCancel} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-sm">
                            <Save className="w-4 h-4" />
                            保存
                        </button>
                    </div>
                </div>

                {/* Edit Content */}
                <div className="flex-1 p-6 overflow-y-auto space-y-8">
                    {/* Node Title */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">工程タイトル</label>
                        <input
                            type="text"
                            value={editedNode.title}
                            onChange={(e) => updateNodeTitle(e.target.value)}
                            className="w-full text-xl font-bold border-b-2 border-gray-200 focus:border-blue-500 outline-none py-1 px-1 bg-transparent transition-colors"
                        />
                    </div>

                    {/* Decision Branches (Only if it's a decision node or user wants to make it one) */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase">条件分岐 (次の工程)</label>
                            <button
                                onClick={addDecisionOption}
                                className="text-xs flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded font-bold"
                            >
                                <Plus className="w-3 h-3" />
                                分岐を追加
                            </button>
                        </div>

                        {editedNode.decisionOptions && editedNode.decisionOptions.length > 0 ? (
                            <div className="space-y-3">
                                {editedNode.decisionOptions.map((option, index) => (
                                    <div key={index} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        <GitBranch className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                value={option.label}
                                                onChange={(e) => updateDecisionOption(index, 'label', e.target.value)}
                                                className="w-full text-sm font-medium border border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="条件ラベル (例: はい)"
                                            />
                                            <select
                                                value={option.targetNodeId}
                                                onChange={(e) => updateDecisionOption(index, 'targetNodeId', e.target.value)}
                                                className="w-full text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                <option value="">-- 移動先を選択 --</option>
                                                {workflow.nodes
                                                    .filter(n => n.id !== editedNode.id)
                                                    .map(n => (
                                                        <option key={n.id} value={n.id}>
                                                            {n.title}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => deleteDecisionOption(index)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400 italic p-2">
                                分岐がありません。通常は次の工程へ自動的に進みます。
                            </div>
                        )}
                    </div>

                    {/* SubProcesses */}
                    <div className="space-y-6">
                        {editedNode.subProcesses.map((sp, spIndex) => (
                            <div key={sp.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative group">
                                <button
                                    onClick={() => deleteSubProcess(spIndex)}
                                    className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                    title="サブプロセスを削除"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                {/* SubProcess Title */}
                                <div className="mb-4 pr-8">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">サブプロセス {spIndex + 1}</label>
                                    <input
                                        type="text"
                                        value={sp.title}
                                        onChange={(e) => updateSubProcessTitle(spIndex, e.target.value)}
                                        className="w-full font-bold text-gray-700 border-b border-gray-200 focus:border-blue-500 outline-none py-1 bg-transparent"
                                    />
                                </div>

                                {/* Steps */}
                                <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                                    {sp.contents.map((step, stepIndex) => (
                                        <div key={step.id} className="flex gap-3 items-start group/step">
                                            {/* Type Selector */}
                                            <div className="flex-shrink-0 mt-1">
                                                <select
                                                    value={step.type}
                                                    onChange={(e) => updateStep(spIndex, stepIndex, 'type', e.target.value)}
                                                    className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                                                >
                                                    <option value="text">通常</option>
                                                    <option value="warning">注意</option>
                                                    <option value="check">確認</option>
                                                </select>
                                            </div>

                                            {/* Text Input */}
                                            <textarea
                                                value={step.text}
                                                onChange={(e) => updateStep(spIndex, stepIndex, 'text', e.target.value)}
                                                className="flex-1 text-sm border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[60px]"
                                                placeholder="手順の内容..."
                                            />

                                            {/* Delete Step */}
                                            <button
                                                onClick={() => deleteStep(spIndex, stepIndex)}
                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover/step:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => addStep(spIndex)}
                                        className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all text-sm font-bold flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        手順を追加
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={addSubProcess}
                            className="w-full py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:shadow-md transition-all font-bold flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            新しいサブプロセスを追加
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // View Mode (Existing Code with Edit Button added)
    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">{currentNode.title}</h2>
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 rounded-full transition-colors"
                    title="詳細を編集"
                >
                    <Edit2 className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                {currentNode.subProcesses.map(sp => (
                    <div key={sp.id} className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-sm">{sp.id}</span>
                            {sp.title}
                        </h3>
                        <div className="space-y-3">
                            {sp.contents.map(content => (
                                <StepItem key={content.id} content={content} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Navigation */}
            <div className="p-6 border-t border-gray-200 bg-white sticky bottom-0">
                <div className="flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        disabled={!workflow.edges.find(e => e.target === currentNode.id)}
                    >
                        <ChevronLeft className="w-5 h-5" />
                        戻る
                    </button>

                    {currentNode.type === 'decision' && currentNode.decisionOptions ? (
                        <div className="flex gap-3">
                            {currentNode.decisionOptions.map(option => (
                                <button
                                    key={option.targetNodeId}
                                    onClick={() => handleDecision(option.targetNodeId)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                        >
                            次へ
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
