
import React, { useEffect, useRef } from 'react';

declare global {
    interface Window {
        Html5Qrcode: any;
    }
}

interface ScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess: (decodedText: string) => void;
    t: (key: string) => string;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ isOpen, onClose, onScanSuccess, t }) => {
    const scannerRef = useRef<any>(null);

    useEffect(() => {
        if (isOpen) {
            const html5QrCode = new window.Html5Qrcode("reader");
            scannerRef.current = html5QrCode;
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            const startScanner = async () => {
                try {
                    await html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, (errorMessage: string) => {
                        // console.warn(`QR Code no longer visible.`, errorMessage);
                    });
                } catch (err) {
                    console.error("Failed to start scanner", err);
                    alert("Could not start camera. Please grant permission and try again.");
                    onClose();
                }
            };
            
            startScanner();

        } else if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.stop().catch((err: any) => console.error("Failed to stop scanner", err));
        }

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                 scannerRef.current.stop().catch((err: any) => console.error("Failed to stop scanner on cleanup", err));
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4 p-4 relative">
                <h2 className="text-lg font-bold text-center mb-2">Scan QR Code</h2>
                <div id="reader" className="w-full"></div>
                <button onClick={onClose} className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg">
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ScannerModal;
