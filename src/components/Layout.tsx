import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { FlowPanel } from './FlowPanel';
import { DetailsPanel } from './DetailsPanel';
import { WorkflowEditor } from './WorkflowEditor';
import { QRCodeButton } from './QRCodeButton';
import { HistoryPanel } from './HistoryPanel';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { useApp } from '../store/AppProvider';

export const Layout: React.FC = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { currentProject } = useApp();

    return (
        <div className="flex h-full w-full overflow-hidden bg-gray-50 text-gray-900">
            {/* Top Control Bar */}
            <div className="absolute top-3 left-3 z-50 flex gap-2">
                <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="btn-glow bg-white hover:bg-gray-100 border border-gray-200 rounded-lg p-2 shadow-sm"
                    title={isFullscreen ? "サイドバー表示" : "全画面表示"}
                >
                    {isFullscreen ? (
                        <PanelLeft className="w-5 h-5 text-gray-600" />
                    ) : (
                        <PanelLeftClose className="w-5 h-5 text-gray-600" />
                    )}
                </button>

                <QRCodeButton
                    projectId={currentProject?.id}
                    projectName={currentProject?.name}
                />

                <HistoryPanel />
            </div>

            {isFullscreen ? (
                // Fullscreen Mode: Horizontal Layout
                <div className="w-full h-full relative">
                    <ReactFlowProvider>
                        <FlowPanel isHorizontal={true} />
                    </ReactFlowProvider>
                </div>
            ) : (
                // Normal Mode: Sidebar Layout
                <>
                    {/* Left Panel: Navigation / Flow View */}
                    <div className="w-1/3 h-full border-r border-gray-200 bg-white relative">
                        <ReactFlowProvider>
                            <FlowPanel isHorizontal={false} />
                        </ReactFlowProvider>
                    </div>

                    {/* Right Panel: Action / Detail View */}
                    <div className="w-2/3 h-full overflow-y-auto bg-gray-50 relative">
                        <DetailsPanel />
                    </div>
                </>
            )}

            {/* Floating Editor Controls */}
            <WorkflowEditor />
        </div>
    );
};
