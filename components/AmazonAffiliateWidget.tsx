import React from 'react';

export const AmazonAffiliateWidget = () => {
  const tableStyle: React.CSSProperties = {
    border: '1px solid #ccc',
    width: '90px',
  };

  const trStyle: React.CSSProperties = {
    borderStyle: 'none',
  };

  const td1Style: React.CSSProperties = {
    verticalAlign: 'top',
    borderStyle: 'none',
    padding: '10px 10px 0pt',
    width: '60px',
  };
  
  const td2Style: React.CSSProperties = {
    fontSize: '12px',
    verticalAlign: 'middle',
    borderStyle: 'none',
    padding: '10px',
  };
  
  const p1Style: React.CSSProperties = {
    padding: 0,
    margin: 0,
  };
  
  const p2Style: React.CSSProperties = {
    color: '#cc0000',
    fontWeight: 'bold',
    marginTop: '10px',
  };

  const span1Style: React.CSSProperties = {
    fontWeight: 'normal',
  };

  const span2Style: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 'normal',
  };

  const link = "https://px.a8.net/svt/ejp?a8mat=2C0EMO+8BH3LU+249K+BWGDT&a8ejpredirect=https%3A%2F%2Fwww.amazon.co.jp%2Fdp%2FB0F4CLNHDQ%2F%3Ftag%3Da8-affi-321269-22";

  return (
    <div className="flex flex-col items-center">
      <table cellPadding="0" cellSpacing="0" style={tableStyle}>
        <tbody>
          <tr style={trStyle}>
            <td style={td1Style}>
              <a href={link} rel="nofollow">
                <img
                  alt=""
                  src="https://m.media-amazon.com/images/I/51Nk7rywBbL._SS80_.jpg"
                  style={{ border: 0 }}
                />
              </a>
            </td>
          </tr>
          <tr style={trStyle}>
            <td style={td2Style}>
              <p style={p1Style}>
                <a href={link} rel="nofollow">
                  サントリー天然水 ラベルレス 段ボール無しでお届け(エコフィルム包装) 2L×9本 南アルプス【Amazon.co.jp限定】 まとめ売り実施中
                </a>
              </p>
              <p style={p2Style}>
                新品価格
                <br />
                ￥1,167
                <span style={span1Style}>から</span>
                <br />
                <span style={span2Style}>(2025/8/15 20:38時点)</span>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
      <img
        width="1"
        height="1"
        src="https://www16.a8.net/0.gif?a8mat=2C0EMO+8BH3LU+249K+BWGDT"
        alt=""
        style={{ border: 0 }}
      />
    </div>
  );
};