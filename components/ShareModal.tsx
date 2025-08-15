import React, { useState, useEffect } from 'react';
import { toBlob } from 'html-to-image';

export const ShareModal = ({ isOpen, onClose, summaryText, chartContainerRef }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  
  // Memoize browser capability check
  const canShareFiles = React.useMemo(() => {
    const testFile = new File([], 'test.png', { type: 'image/png' });
    const shareData = { files: [testFile] };
    return navigator.share && navigator.canShare && navigator.canShare(shareData);
  }, []);


  useEffect(() => {
    // Reset state when modal is closed
    if (!isOpen) {
      setIsCopied(false);
      setImageFile(null);
      setIsPreparingImage(false);
      return;
    }
    
    // Proactively generate the image when the modal opens if the browser supports it
    if (isOpen && chartContainerRef.current && canShareFiles) {
      setIsPreparingImage(true);
      toBlob(chartContainerRef.current, { backgroundColor: '#ffffff' })
        .then(blob => {
          if (blob) {
            const file = new File([blob], 'kakeibo-chart.png', { type: 'image/png' });
            setImageFile(file);
          }
        })
        .catch(err => {
          console.error("Failed to generate chart image for sharing:", err);
          setImageFile(null); // Ensure file is null on error
        })
        .finally(() => {
          setIsPreparingImage(false);
        });
    }
  }, [isOpen, chartContainerRef, canShareFiles]);

  if (!isOpen) return null;

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(summaryText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }, (err) => {
      console.error('Could not copy text: ', err);
      alert('クリップボードへのコピーに失敗しました。');
    });
  };
  
  const handleShareWithImage = async () => {
    if (!imageFile) {
      alert('共有する画像の準備ができていません。少し待ってからもう一度お試しください。');
      return;
    }

    const shareData = {
        text: summaryText,
        files: [imageFile],
        title: summaryText.split('\n')[0],
    };

    try {
        // This call is now immediate on user click, resolving the error.
        await navigator.share(shareData);
    } catch (err) {
        // Don't show an error if the user simply cancels the share sheet
        if (err.name !== 'AbortError') {
            console.error('Could not share with image: ', err);
            alert('画像の共有に失敗しました。');
        }
    }
  };

  const encodedSummary = encodeURIComponent(summaryText);
  const lineUrl = `https://line.me/R/msg/text/?${encodedSummary}`;
  const mailSubject = encodeURIComponent(`${summaryText.split('\n')[0]}`);
  const mailUrl = `mailto:?subject=${mailSubject}&body=${encodedSummary}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-lg transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">サマリーを共有</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">共有内容プレビュー</label>
          <textarea
            readOnly
            value={summaryText}
            className="w-full h-48 p-3 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 text-sm text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          {canShareFiles && (
            <button
              onClick={handleShareWithImage}
              disabled={isPreparingImage || !imageFile}
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 disabled:bg-purple-400 disabled:cursor-not-allowed"
            >
              {isPreparingImage ? (
                  <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>画像準備中...</span>
                  </>
              ) : (
                  '画像とテキストを共有'
              )}
            </button>
          )}
          <a href={lineUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#06C755] border border-transparent rounded-md shadow-sm hover:bg-opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#06C755]">
            LINEで共有 (テキストのみ)
          </a>
          <a href={mailUrl} className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
            メールで共有 (テキストのみ)
          </a>
          <button
            onClick={handleCopyToClipboard}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 border border-transparent rounded-md hover:bg-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
          >
            {isCopied ? 'コピーしました！' : 'クリップボードにコピー'}
          </button>
        </div>

      </div>
    </div>
  );
};
