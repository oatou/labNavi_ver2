import React, { useState } from 'react';
import { QrCode, X, Download } from 'lucide-react';
import QRCode from 'qrcode';

interface QRCodeButtonProps {
    projectId?: string;
    projectName?: string;
}

export const QRCodeButton: React.FC<QRCodeButtonProps> = ({ projectId, projectName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState<string>('');

    const generateQR = async () => {
        // Generate URL for the current project
        const baseUrl = window.location.origin + window.location.pathname;
        const url = projectId ? `${baseUrl}?project=${projectId}` : baseUrl;

        try {
            const dataUrl = await QRCode.toDataURL(url, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#1e293b',
                    light: '#ffffff'
                }
            });
            setQrDataUrl(dataUrl);
            setIsOpen(true);
        } catch (err) {
            console.error('QR Code generation failed:', err);
        }
    };

    const downloadQR = () => {
        const link = document.createElement('a');
        link.download = `${projectName || 'project'}-qrcode.png`;
        link.href = qrDataUrl;
        link.click();
    };

    return (
        <>
            <button
                onClick={generateQR}
                className="btn-glow p-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 hover:text-blue-600"
                title="QRコードを生成"
            >
                <QrCode className="w-5 h-5" />
            </button>

            {/* QR Code Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">QRコード</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100">
                                <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
                            </div>

                            <p className="text-sm text-gray-500 text-center">
                                {projectName ? `「${projectName}」` : 'このプロジェクト'}へのリンク
                            </p>

                            <button
                                onClick={downloadQR}
                                className="btn-glow flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Download className="w-4 h-4" />
                                ダウンロード
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
