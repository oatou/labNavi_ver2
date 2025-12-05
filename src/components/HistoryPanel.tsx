import React, { useState } from 'react';
import { History, X, Clock, User, CheckCircle, RotateCcw, Edit, FileText } from 'lucide-react';
import { useApp } from '../store/AppProvider';
import type { HistoryEntry } from '../types/workflow';

const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getActionIcon = (action: HistoryEntry['action']) => {
    switch (action) {
        case 'complete':
            return <CheckCircle className="w-4 h-4 text-green-500" />;
        case 'reset':
            return <RotateCcw className="w-4 h-4 text-orange-500" />;
        case 'update':
            return <Edit className="w-4 h-4 text-blue-500" />;
        case 'create':
            return <FileText className="w-4 h-4 text-purple-500" />;
        default:
            return <Clock className="w-4 h-4 text-gray-500" />;
    }
};

export const HistoryPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { currentProject } = useApp();

    const history = currentProject?.history || [];
    const reversedHistory = [...history].reverse(); // Show newest first

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn-glow p-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 hover:text-purple-600"
                title="変更履歴"
            >
                <History className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl max-h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <History className="w-5 h-5 text-purple-600" />
                                変更履歴
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* History List */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {reversedHistory.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>まだ履歴がありません</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {reversedHistory.map((entry) => (
                                        <div
                                            key={entry.id}
                                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex-shrink-0 mt-0.5">
                                                {getActionIcon(entry.action)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-800 font-medium">
                                                    {entry.details}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(entry.timestamp)}
                                                    </span>
                                                    {entry.userEmail && (
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3 h-3" />
                                                            {entry.userEmail.split('@')[0]}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
                            <p className="text-xs text-gray-500 text-center">
                                最新100件の履歴を表示
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
