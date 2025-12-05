import React, { useState } from 'react';
import { useApp } from '../store/AppProvider';
import { Plus, Folder, Trash2, Edit2, ArrowRight, Clock, Copy, BookTemplate, Tag, FileStack } from 'lucide-react';
import { PROJECT_CATEGORIES, type ProjectCategory } from '../types/workflow';

export const ProjectList: React.FC = () => {
    const { projects, addProject, selectProject, deleteProject, updateProject, duplicateProject, saveAsTemplate, createFromTemplate, templates } = useApp();
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDesc, setNewProjectDesc] = useState('');
    const [newProjectCategory, setNewProjectCategory] = useState<ProjectCategory | ''>('');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editCategory, setEditCategory] = useState<ProjectCategory | ''>('');

    const [filterCategory, setFilterCategory] = useState<ProjectCategory | 'all'>('all');

    // Filter out templates and apply category filter
    const regularProjects = projects.filter(p => !p.isTemplate);
    const filteredProjects = filterCategory === 'all'
        ? regularProjects
        : regularProjects.filter(p => p.category === filterCategory);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newProjectName.trim()) {
            if (selectedTemplateId) {
                createFromTemplate(selectedTemplateId, newProjectName);
            } else {
                addProject(newProjectName, newProjectDesc, newProjectCategory || undefined);
            }
            setNewProjectName('');
            setNewProjectDesc('');
            setNewProjectCategory('');
            setSelectedTemplateId('');
            setIsCreating(false);
        }
    };

    const startEditing = (project: any) => {
        setEditingId(project.id);
        setEditName(project.name);
        setEditDesc(project.description || '');
        setEditCategory(project.category || '');
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId && editName.trim()) {
            updateProject(editingId, {
                name: editName,
                description: editDesc,
                category: editCategory || undefined
            });
            setEditingId(null);
        }
    };

    const getCategoryColor = (category?: ProjectCategory) => {
        const colors: Record<ProjectCategory, string> = {
            '実験': 'bg-purple-100 text-purple-600',
            '分析': 'bg-blue-100 text-blue-600',
            '製造': 'bg-orange-100 text-orange-600',
            '品質管理': 'bg-green-100 text-green-600',
            '研究開発': 'bg-pink-100 text-pink-600',
            'その他': 'bg-gray-100 text-gray-600'
        };
        return category ? colors[category] : 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">プロジェクト一覧</h1>
                        <p className="text-gray-500 mt-2">実験や研究のフローチャートを管理します</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="btn-glow bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        新規作成
                    </button>
                </header>

                {/* Category Filter */}
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <button
                        onClick={() => setFilterCategory('all')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterCategory === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        すべて
                    </button>
                    {PROJECT_CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterCategory === cat ? 'bg-gray-800 text-white' : getCategoryColor(cat)
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Templates Section */}
                {templates.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <BookTemplate className="w-5 h-5" />
                            テンプレート ({templates.length})
                        </h2>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {templates.map(t => (
                                <div key={t.id} className="flex-shrink-0 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 min-w-[200px]">
                                    <p className="font-bold text-gray-800 text-sm line-clamp-1">{t.name.replace('[テンプレート] ', '')}</p>
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => { setSelectedTemplateId(t.id); setIsCreating(true); }}
                                            className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
                                        >
                                            使用
                                        </button>
                                        <button
                                            onClick={() => deleteProject(t.id)}
                                            className="text-xs text-gray-400 hover:text-red-600"
                                        >
                                            削除
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Create Modal */}
                {isCreating && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">
                                {selectedTemplateId ? 'テンプレートから作成' : '新しいプロジェクトを作成'}
                            </h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                {selectedTemplateId && (
                                    <div className="bg-purple-50 p-3 rounded-lg text-sm text-purple-700 flex items-center gap-2">
                                        <FileStack className="w-4 h-4" />
                                        テンプレート: {templates.find(t => t.id === selectedTemplateId)?.name.replace('[テンプレート] ', '')}
                                    </div>
                                )}
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
                                {!selectedTemplateId && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-600 mb-1">カテゴリ</label>
                                            <select
                                                value={newProjectCategory}
                                                onChange={(e) => setNewProjectCategory(e.target.value as ProjectCategory)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                <option value="">カテゴリを選択</option>
                                                {PROJECT_CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
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
                                    </>
                                )}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setIsCreating(false); setSelectedTemplateId(''); }}
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
                    {filteredProjects.map(project => (
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
                                    <select
                                        value={editCategory}
                                        onChange={(e) => setEditCategory(e.target.value as ProjectCategory)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    >
                                        <option value="">カテゴリなし</option>
                                        {PROJECT_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <textarea
                                        value={editDesc}
                                        onChange={(e) => setEditDesc(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm h-16 resize-none"
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
                                                onClick={(e) => { e.stopPropagation(); duplicateProject(project.id); }}
                                                className="p-2 text-gray-400 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors"
                                                title="複製"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); saveAsTemplate(project.id); }}
                                                className="p-2 text-gray-400 hover:bg-gray-100 hover:text-green-600 rounded-lg transition-colors"
                                                title="テンプレート保存"
                                            >
                                                <BookTemplate className="w-4 h-4" />
                                            </button>
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

                                    {project.category && (
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${getCategoryColor(project.category)}`}>
                                            {project.category}
                                        </span>
                                    )}

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

                    {filteredProjects.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                            <Folder className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">
                                {filterCategory !== 'all' ? `「${filterCategory}」カテゴリのプロジェクトがありません` : 'プロジェクトがありません'}
                            </p>
                            <p className="text-sm mt-2">「新規作成」から新しいフローチャートを作成しましょう</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
