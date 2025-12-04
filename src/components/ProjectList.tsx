import React, { useState } from 'react';
import { useApp } from '../store/AppProvider';
import { Plus, Folder, Trash2, Edit2, ArrowRight, Clock } from 'lucide-react';

export const ProjectList: React.FC = () => {
    const { projects, addProject, selectProject, deleteProject, updateProject } = useApp();
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDesc, setNewProjectDesc] = useState('');

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newProjectName.trim()) {
            addProject(newProjectName, newProjectDesc);
            setNewProjectName('');
            setNewProjectDesc('');
            setIsCreating(false);
        }
    };

    const startEditing = (project: any) => {
        setEditingId(project.id);
        setEditName(project.name);
        setEditDesc(project.description || '');
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId && editName.trim()) {
            updateProject(editingId, { name: editName, description: editDesc });
            setEditingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">プロジェクト一覧</h1>
                        <p className="text-gray-500 mt-2">実験や研究のフローチャートを管理します</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        新規プロジェクト作成
                    </button>
                </header>

                {/* Create Modal */}
                {isCreating && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">新しいプロジェクトを作成</h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">プロジェクト名</label>
                                    <input
                                        type="text"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="例: 〇〇実験の手順"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">説明 (任意)</label>
                                    <textarea
                                        value={newProjectDesc}
                                        onChange={(e) => setNewProjectDesc(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                        placeholder="プロジェクトの概要など"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                                    >
                                        作成する
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Project Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <div key={project.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group relative">
                            {editingId === project.id ? (
                                <form onSubmit={handleUpdate} className="space-y-3">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                        autoFocus
                                    />
                                    <textarea
                                        value={editDesc}
                                        onChange={(e) => setEditDesc(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm h-20 resize-none"
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button type="button" onClick={() => setEditingId(null)} className="text-sm text-gray-500 hover:text-gray-700">キャンセル</button>
                                        <button type="submit" className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">保存</button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                            <Folder className="w-6 h-6" />
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); startEditing(project); }}
                                                className="p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors"
                                                title="編集"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                                                className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                                title="削除"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{project.name}</h3>
                                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10">
                                        {project.description || '説明なし'}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <Clock className="w-3 h-3" />
                                            {new Date(project.updatedAt).toLocaleDateString()}
                                        </div>
                                        <button
                                            onClick={() => selectProject(project.id)}
                                            className="flex items-center gap-1 text-blue-600 font-bold text-sm hover:gap-2 transition-all"
                                        >
                                            開く
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}

                    {projects.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                            <Folder className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">プロジェクトがありません</p>
                            <p className="text-sm mt-2">「新規プロジェクト作成」から新しいフローチャートを作成しましょう</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
