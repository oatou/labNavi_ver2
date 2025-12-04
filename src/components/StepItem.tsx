import React from 'react';
import type { StepContent } from '../types/workflow';
// import { useApp } from '../store/AppProvider';
import { AlertTriangle, Info, Calculator } from 'lucide-react';

interface StepItemProps {
    content: StepContent;
}

export const StepItem: React.FC<StepItemProps> = ({ content }) => {
    // Removed state hooks as recording is no longer needed
    // const { isContentChecked, setInput, getInputValue } = useApp();

    const renderContent = () => {
        switch (content.type) {
            case 'warning':
                return (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-bold mb-1">{content.text}</p>
                            {content.detail && <p className="text-sm opacity-90">{content.detail}</p>}
                        </div>
                    </div>
                );

            case 'check':
                return (
                    <div className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="pt-1">
                            {/* Static check icon for notation */}
                            <div className="w-5 h-5 border-2 border-green-600 rounded flex items-center justify-center">
                                <div className="w-3 h-3 bg-green-600 rounded-sm opacity-50" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-gray-900">{content.text}</p>
                            {content.detail && <p className="text-sm text-gray-500 mt-1">{content.detail}</p>}
                        </div>
                    </div>
                );

            case 'input':
                return (
                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {content.text}
                            {content.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {/* Visual-only input (disabled/readonly) to represent the flow without recording */}
                        <div className="relative">
                            <input
                                type="text"
                                disabled
                                placeholder={content.placeholder || "（ここに入力します）"}
                                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>
                );

            case 'formula':
                return (
                    <div className="flex flex-col gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                        <div className="flex items-start gap-3">
                            <Calculator className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-mono font-medium">{content.text}</p>
                                {content.detail && <p className="text-sm mt-1">{content.detail}</p>}
                            </div>
                        </div>

                        {/* Naming Helper for c-5-1-1 */}
                        {content.id === 'c-5-1-1' && (
                            <div className="mt-2 p-3 bg-white rounded border border-blue-100">
                                <p className="text-sm text-gray-600 mb-2 font-medium">命名補助ツール (δ-n-V-t)</p>
                                <div className="flex flex-wrap gap-2 items-end">
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500">δ (Gap)</label>
                                        <input id="nh-gap" className="w-16 p-1 border rounded text-sm" placeholder="mm" />
                                    </div>
                                    <span className="mb-2">-</span>
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500">n (RPM)</label>
                                        <input id="nh-rpm" className="w-16 p-1 border rounded text-sm" placeholder="rpm" />
                                    </div>
                                    <span className="mb-2">-</span>
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500">V (Volt)</label>
                                        <input id="nh-volt" className="w-16 p-1 border rounded text-sm" placeholder="V" />
                                    </div>
                                    <span className="mb-2">-</span>
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500">t (Time)</label>
                                        <input id="nh-time" className="w-16 p-1 border rounded text-sm" placeholder="sec" />
                                    </div>

                                    <button
                                        onClick={() => {
                                            const gap = (document.getElementById('nh-gap') as HTMLInputElement).value;
                                            const rpm = (document.getElementById('nh-rpm') as HTMLInputElement).value;
                                            const volt = (document.getElementById('nh-volt') as HTMLInputElement).value;
                                            const time = (document.getElementById('nh-time') as HTMLInputElement).value;
                                            const name = `${gap}-${rpm}-${volt}-${time}`;
                                            navigator.clipboard.writeText(name);
                                            alert(`コピーしました: ${name}`);
                                        }}
                                        className="ml-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                    >
                                        結合 & コピー
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'text':
            default:
                return (
                    <div className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-lg">
                        <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">{content.text}</p>
                    </div>
                );
        }
    };

    return (
        <div className="mb-4">
            {renderContent()}
        </div>
    );
};
