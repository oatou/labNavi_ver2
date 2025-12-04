import React, { useState } from 'react';
import { useApp } from '../store/AppProvider';
import { Plus, Trash2, Edit2, Save, X, GitBranch, FileText, Layers } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const AVAILABLE_ICONS = [
    'ClipboardList', 'Box', 'Settings', 'Droplet', 'PlayCircle', 'Trash2', 'BarChart2', 'GitBranch',
    'AlertTriangle', 'CheckCircle', 'FileText', 'Cpu', 'Database', 'Activity', 'Clock', 'Zap',
    'Monitor', 'Save', 'HardDrive', 'FlaskConical', 'Beaker'
];

export const WorkflowEditor: React.FC = () => {
    const { workflow, progress, addNode, updateNode, deleteNode, addGroup, updateGroup, deleteGroup } = useApp();

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editIcon, setEditIcon] = useState('');

    // Add State
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newType, setNewType] = useState<'process' | 'decision'>('process');

    // Group Management State
    const [isAddingGroup, setIsAddingGroup] = useState(false);
    const [newGroupTitle, setNewGroupTitle] = useState('');
    const [selectedGroupColor, setSelectedGroupColor] = useState('#ef4444');
    const [groupStartNodeId, setGroupStartNodeId] = useState('');
    const [groupEndNodeId, setGroupEndNodeId] = useState('');
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

    const handleAddGroup = () => {
        if (!newGroupTitle.trim() || !groupStartNodeId || !groupEndNodeId) return;

        // Determine all nodes between start and end
        const startIndex = workflow.nodes.findIndex(n => n.id === groupStartNodeId);
        const endIndex = workflow.nodes.findIndex(n => n.id === groupEndNodeId);

        if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
            alert('開始と終了の工程を正しく選択してください');
            return;
        }

        const nodeIds = workflow.nodes
            .slice(startIndex, endIndex + 1)
            .map(n => n.id);

        if (editingGroupId) {
            updateGroup(editingGroupId, {
                title: newGroupTitle,
                nodeIds,
                color: selectedGroupColor
            });
            setEditingGroupId(null);
        } else {
            addGroup(newGroupTitle, nodeIds, selectedGroupColor);
        }

        setIsAddingGroup(false);
        setNewGroupTitle('');
        setGroupStartNodeId('');
        setGroupEndNodeId('');
        setIsAdding(false); // Close other panels
    };

    const handleEditGroup = (group: any) => {
        setNewGroupTitle(group.title);
        setSelectedGroupColor(group.color || '#ef4444');

        // Find start and end nodes from nodeIds
        if (group.nodeIds && group.nodeIds.length > 0) {
            setGroupStartNodeId(group.nodeIds[0]);
            setGroupEndNodeId(group.nodeIds[group.nodeIds.length - 1]);
        }

        setEditingGroupId(group.id);
        setIsAddingGroup(true);
    };

    const handleCancelGroupEdit = () => {
        setEditingGroupId(null);
        setNewGroupTitle('');
        setGroupStartNodeId('');
        setGroupEndNodeId('');
        setIsAddingGroup(false);
    };

    const [isHovered, setIsHovered] = useState(false);

    // Find current node
    const currentNode = workflow.nodes.find(n => n.id === progress.currentNodeId);

    const handleStartEdit = () => {
        if (currentNode) {
            setEditTitle(currentNode.title);
            setEditIcon(currentNode.icon || 'ClipboardList');
            setIsEditing(true);
            setIsAdding(false); // Close add panel if open
            setIsAddingGroup(false);
        }
    };

    const handleSaveEdit = () => {
        if (currentNode) {
            updateNode(currentNode.id, { title: editTitle, icon: editIcon });
            setIsEditing(false);
        }
    };

    const handleStartAdd = () => {
        setNewTitle('');
        setNewType('process');
        setIsAdding(true);
        setIsEditing(false); // Close edit panel if open
        setIsAddingGroup(false);
    };

    const handleConfirmAdd = () => {
        if (newTitle.trim()) {
            addNode(newTitle, newType);
            setIsAdding(false);
        }
    };

    const handleDeleteStep = () => {
        if (currentNode) {
            if (confirm('本当にこの手順を削除しますか？')) {
                deleteNode(currentNode.id);
            }
        }
    };

    if (!currentNode) return null;

    return (
        <div className="fixed bottom-24 right-8 flex flex-col gap-4 items-end z-50">

            {/* Edit Panel */}
            <div className={`
                transition-all duration-300 ease-in-out origin-bottom-right
                ${isEditing ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none absolute'}
                bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/50 w-80
            `}>
                <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-gray-800 text-lg">手順の編集</span>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">タイトル</label>
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 font-medium"
                            placeholder="手順のタイトル"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">アイコン</label>
                        <div className="grid grid-cols-5 gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200 max-h-40 overflow-y-auto custom-scrollbar">
                            {AVAILABLE_ICONS.map(iconName => {
                                const Icon = (LucideIcons as any)[iconName];
                                if (!Icon) return null;
                                return (
                                    <button
                                        key={iconName}
                                        onClick={() => setEditIcon(iconName)}
                                        className={`
                                            aspect-square rounded-lg flex items-center justify-center transition-all duration-200
                                            ${editIcon === iconName
                                                ? 'bg-blue-600 text-white shadow-md scale-105'
                                                : 'text-gray-500 hover:bg-white hover:shadow-sm hover:text-blue-600'}
                                        `}
                                        title={iconName}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        onClick={handleSaveEdit}
                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30 font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Save className="w-4 h-4" />
                        変更を保存
                    </button>
                </div>
            </div>

            {/* Group Management Panel */}
            <div className={`
                transition-all duration-300 ease-in-out origin-bottom-right
                ${isAddingGroup ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none absolute'}
                bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/50 w-80
            `}>
                <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-gray-800 text-lg">グループ管理</span>
                    <button
                        onClick={handleCancelGroupEdit}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">グループ名</label>
                        <input
                            type="text"
                            value={newGroupTitle}
                            onChange={(e) => setNewGroupTitle(e.target.value)}
                            placeholder="例: 工場"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">開始工程</label>
                            <select
                                value={groupStartNodeId}
                                onChange={(e) => setGroupStartNodeId(e.target.value)}
                                className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                            >
                                <option value="">選択</option>
                                {workflow.nodes.map(n => (
                                    <option key={n.id} value={n.id}>{n.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">終了工程</label>
                            <select
                                value={groupEndNodeId}
                                onChange={(e) => setGroupEndNodeId(e.target.value)}
                                className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                            >
                                <option value="">選択</option>
                                {workflow.nodes.map(n => (
                                    <option key={n.id} value={n.id}>{n.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">色</label>
                        <div className="flex gap-2">
                            {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedGroupColor(color)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${selectedGroupColor === color ? 'border-gray-600 scale-110' : 'border-transparent hover:scale-105'}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {editingGroupId && (
                            <button
                                onClick={() => {
                                    setEditingGroupId(null);
                                    setNewGroupTitle('');
                                    setGroupStartNodeId('');
                                    setGroupEndNodeId('');
                                }}
                                className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-bold transition-all"
                            >
                                キャンセル
                            </button>
                        )}
                        <button
                            onClick={handleAddGroup}
                            disabled={!newGroupTitle.trim() || !groupStartNodeId || !groupEndNodeId}
                            className={`flex-1 py-2.5 bg-gradient-to-r ${editingGroupId ? 'from-blue-600 to-blue-500 shadow-blue-500/30' : 'from-green-600 to-green-500 shadow-green-500/30'} text-white rounded-xl hover:opacity-90 shadow-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <Save className="w-4 h-4" />
                            {editingGroupId ? '更新' : '作成'}
                        </button>
                    </div>

                    {/* Existing Groups List */}
                    {workflow.groups && workflow.groups.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">作成済みグループ</label>
                            <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                                {workflow.groups.map(group => (
                                    <div key={group.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color || '#ef4444' }} />
                                            <span className="text-xs font-bold text-gray-700">{group.title}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleEditGroup(group)}
                                                className="text-gray-400 hover:text-blue-500 p-1 rounded hover:bg-blue-50 transition-colors"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => deleteGroup(group.id)}
                                                className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Panel */}
            <div className={`
                transition-all duration-300 ease-in-out origin-bottom-right
                ${isAdding ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none absolute'}
                bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/50 w-80
            `}>
                <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-gray-800 text-lg">新しい手順を追加</span>
                    <button
                        onClick={() => setIsAdding(false)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Type Selection */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">種類を選択</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setNewType('process')}
                                className={`
                                    flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all
                                    ${newType === 'process'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}
                                `}
                            >
                                <FileText className="w-6 h-6" />
                                <span className="text-xs font-bold">通常作業</span>
                            </button>
                            <button
                                onClick={() => setNewType('decision')}
                                className={`
                                    flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all
                                    ${newType === 'decision'
                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}
                                `}
                            >
                                <GitBranch className="w-6 h-6" />
                                <span className="text-xs font-bold">条件分岐</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">タイトル</label>
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 font-medium"
                            placeholder={newType === 'process' ? "作業のタイトル" : "判断の内容 (例: 合格判定)"}
                            autoFocus
                        />
                    </div>

                    <button
                        onClick={handleConfirmAdd}
                        className={`
                            w-full py-2.5 text-white rounded-xl shadow-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95
                            ${newType === 'process'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-500/30'
                                : 'bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 shadow-orange-500/30'}
                        `}
                    >
                        <Plus className="w-4 h-4" />
                        {newType === 'process' ? '作業を追加' : '分岐を追加'}
                    </button>
                </div>
            </div>

            {/* Floating Action Buttons */}
            <div className="flex items-center gap-3">
                {/* Context Actions (Edit/Delete) - Only show when not editing/adding */}
                {!isEditing && !isAdding && !isAddingGroup && (
                    <div className="flex gap-2 transition-all duration-300">
                        <button
                            onClick={() => setIsAddingGroup(true)}
                            className="p-3 bg-white text-gray-700 rounded-full shadow-lg hover:shadow-xl hover:text-green-600 hover:scale-110 transition-all border border-gray-100 group"
                            title="グループ管理"
                        >
                            <Layers className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleStartEdit}
                            className="p-3 bg-white text-gray-700 rounded-full shadow-lg hover:shadow-xl hover:text-blue-600 hover:scale-110 transition-all border border-gray-100 group"
                            title="編集"
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleDeleteStep}
                            className="p-3 bg-white text-gray-700 rounded-full shadow-lg hover:shadow-xl hover:text-red-600 hover:scale-110 transition-all border border-gray-100 group"
                            title="削除"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Main Add Button */}
                <button
                    onClick={() => {
                        if (isAdding) setIsAdding(false);
                        else handleStartAdd();
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`
                        flex items-center justify-center
                        h-14 w-14 rounded-full
                        ${isAdding ? 'bg-gray-500 rotate-45' : 'bg-gradient-to-r from-blue-600 to-blue-500'} 
                        text-white
                        shadow-lg ${isAdding ? 'shadow-gray-500/40' : 'shadow-blue-500/40'}
                        hover:shadow-xl hover:scale-110
                        transition-all duration-300 ease-out
                        z-50
                    `}
                    title={isAdding ? "閉じる" : "新しい手順を追加"}
                >
                    <Plus className={`w-7 h-7 transition-transform duration-300 ${isHovered && !isAdding ? 'rotate-90' : ''}`} />
                </button>
            </div>
        </div>
    );
};
