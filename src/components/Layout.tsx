import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { FlowPanel } from './FlowPanel';
import { DetailsPanel } from './DetailsPanel';
import { WorkflowEditor } from './WorkflowEditor';

export const Layout: React.FC = () => {
    return (
        <div className="flex h-full w-full overflow-hidden bg-gray-50 text-gray-900">
            {/* Left Panel: Navigation / Flow View */}
            <div className="w-1/3 h-full border-r border-gray-200 bg-white relative">
                <ReactFlowProvider>
                    <FlowPanel />
                </ReactFlowProvider>
            </div>

            {/* Right Panel: Action / Detail View */}
            <div className="w-2/3 h-full overflow-y-auto bg-gray-50 relative">
                <DetailsPanel />
            </div>

            {/* Floating Editor Controls */}
            <WorkflowEditor />
        </div>
    );
};
