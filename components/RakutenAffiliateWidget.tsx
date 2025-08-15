import React, { useRef, useEffect } from 'react';

export const RakutenAffiliateWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // React.StrictModeでの二重実行を避けるためのチェック
    if (containerRef.current.querySelector('iframe')) return;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('srcdoc', `
      <html>
        <head>
          <style>body { margin: 0; }</style>
        </head>
        <body>
          <script type="text/javascript">
            rakuten_affiliateId="0ea62065.34400275.0ea62066.204f04c0";
            rakuten_items="ranking";
            rakuten_genreId="0";
            rakuten_recommend="on";
            rakuten_design="slide";
            rakuten_size="120x240";
            rakuten_target="_blank";
            rakuten_border="on";
            rakuten_auto_mode="on";
            rakuten_adNetworkId="a8Net";
            rakuten_adNetworkUrl="https%3A%2F%2Frpx.a8.net%2Fsvt%2Fejp%3Fa8mat%3D2C0EMO%2B8DUU0Y%2B2HOM%2BBS629%26rakuten%3Dy%26a8ejpredirect%3D";
            rakuten_pointbackId="a14110686267_2C0EMO_8DUU0Y_2HOM_BS629";
            rakuten_mediaId="20011816";
          <\/script>
          <script type="text/javascript" src="//xml.affiliate.rakuten.co.jp/widget/js/rakuten_widget.js"><\/script>
        </body>
      </html>
    `);
    iframe.style.width = '120px';
    iframe.style.height = '240px';
    iframe.style.border = 'none';
    iframe.scrolling = 'no';
    
    // コンテナをクリアしてiframeを追加
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(iframe);
    
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div ref={containerRef} aria-label="楽天アフィリエイトウィジェット" />
      <img
        width="1"
        height="1"
        src="https://www19.a8.net/0.gif?a8mat=2C0EMO+8DUU0Y+2HOM+BS629"
        alt=""
        style={{ border: 0 }}
      />
    </div>
  );
};