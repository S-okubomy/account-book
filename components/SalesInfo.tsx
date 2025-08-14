import React, { useState, useCallback } from 'react';
import { getSalesInfo } from '../services/geminiService.ts';

export const SalesInfo = ({ formatMarkdown }) => {
  const [info, setInfo] = useState('');
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');
  const [loadingAction, setLoadingAction] = useState(null);

  const handleFetchByAddress = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      setError("住所やランドマークを入力してください。");
      return;
    }
    
    setLoadingAction('address');
    setIsLoading(true);
    setError('');
    setInfo('');
    setSources([]);

    try {
      const result = await getSalesInfo({ address: address.trim() });
      setInfo(result.text);
      setSources(result.sources);
    } catch (err) {
      setError(err.message || '予期せぬエラーが発生しました。');
      console.error(err);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleFetchByGeo = () => {
    if (!navigator.geolocation) {
      setError("お使いのブラウザは位置情報機能に対応していません。");
      return;
    }

    setLoadingAction('geo');
    setIsLoading(true);
    setError('');
    setInfo('');
    setSources([]);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const result = await getSalesInfo({ latitude, longitude });
          setInfo(result.text);
          setSources(result.sources);
        } catch (err) {
          setError(err.message || '予期せぬエラーが発生しました。');
          console.error(err);
        } finally {
          setIsLoading(false);
          setLoadingAction(null);
        }
      },
      (geoError) => {
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setError("位置情報へのアクセスが拒否されました。ブラウザの設定を確認して、このサイトへの位置情報アクセスを許可してください。");
            break;
          case geoError.POSITION_UNAVAILABLE:
            setError("現在地の情報を取得できませんでした。ネットワーク接続を確認するか、後でもう一度お試しください。");
            break;
          case geoError.TIMEOUT:
            setError("位置情報の取得がタイムアウトしました。");
            break;
          default:
            setError("位置情報の取得中に不明なエラーが発生しました。");
            break;
        }
        setIsLoading(false);
        setLoadingAction(null);
      }
    );
  };

  const renderSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">お買い得情報を探す</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1">住所または現在地から、AIが近くのスーパーのセール情報を探します。</p>
          
          <form onSubmit={handleFetchByAddress} className="mt-4 space-y-3">
            <div>
              <label htmlFor="address-input" className="block text-sm font-medium text-slate-600 dark:text-slate-300">住所で検索</label>
              <div className="mt-1 flex items-stretch gap-2">
                <input
                  id="address-input"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="例：東京都千代田区、東京駅周辺"
                  className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 disabled:opacity-50"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !address.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
                  aria-label="住所で検索"
                >
                  {isLoading && loadingAction === 'address' ? renderSpinner() : '検索'}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <span className="flex-grow border-t border-slate-200 dark:border-slate-700"></span>
              <span className="px-2 text-xs text-slate-500">または</span>
              <span className="flex-grow border-t border-slate-200 dark:border-slate-700"></span>
            </div>
            
            <button
              type="button"
              onClick={handleFetchByGeo}
              disabled={isLoading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500 disabled:bg-teal-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && loadingAction === 'geo' ? (
                <>
                  {renderSpinner()}
                  <span>情報収集中...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>現在地から探す</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      
      {error && <div className="mt-4 text-red-500 bg-red-100 dark:bg-red-900/20 p-3 rounded-md">{error}</div>}
      
      {info && (
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={formatMarkdown(info)} />
          {sources.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-sm text-slate-500 dark:text-slate-400">参照元:</h4>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                {sources.map((source, index) => (
                  <li key={index}>
                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400 break-all">
                      {source.web.title || source.web.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};