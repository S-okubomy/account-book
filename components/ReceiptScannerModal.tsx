import React, { useRef, useEffect, useCallback } from 'react';

export const ReceiptScannerModal = ({ isOpen, onClose, onCapture, isProcessing }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const cleanupCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          alert("カメラにアクセスできませんでした。ブラウザの設定でカメラへのアクセスを許可してください。");
          onClose();
        }
      };
      startCamera();
    } else {
      cleanupCamera();
    }
    
    return () => {
        cleanupCamera();
    };
  }, [isOpen, onClose, cleanupCamera]);

  const handleCapture = () => {
    if (videoRef.current && !isProcessing) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        onCapture(imageData);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="relative bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100 overflow-hidden" onClick={e => e.stopPropagation()}>
        {isProcessing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center z-20">
                 <svg className="animate-spin h-10 w-10 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-white text-lg font-semibold">解析中...</p>
            </div>
        )}
        <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-t-lg" />
        <div className="p-4 flex justify-center items-center">
             <button
                onClick={handleCapture}
                disabled={isProcessing}
                className="w-20 h-20 bg-white rounded-full border-4 border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white transition-transform transform hover:scale-105 disabled:opacity-50"
                aria-label="レシートを撮影"
             >
                 <span className="sr-only">撮影</span>
             </button>
        </div>
         <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors" aria-label="閉じる">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
    </div>
  );
};