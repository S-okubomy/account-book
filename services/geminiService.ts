import { GoogleGenAI, Type } from "@google/genai";
import { Expense, Income, Category } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we will log an error to the console.
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export async function getSavingsTips(expenses: Expense[], incomes: Income[], currentMonth: Date): Promise<string> {
  const monthString = `${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月`;
  
  if ((!expenses || expenses.length === 0) && (!incomes || incomes.length === 0)) {
    return `まずは${monthString}の収入か支出を追加してみましょう。記録がたまると、あなたに合った節約のヒントを提案できます！`;
  }

  const formattedExpenses = expenses.length > 0
    ? expenses
      .map(e => `- カテゴリ: ${e.category}, 金額: ${e.amount.toLocaleString('ja-JP')}円, 内容: ${e.description}`)
      .join('\n')
    : `この月の支出は記録されていません。`;

  const formattedIncomes = incomes.length > 0
    ? incomes
      .map(i => `- 金額: ${i.amount.toLocaleString('ja-JP')}円, 内容: ${i.description}`)
      .join('\n')
    : `この月の収入は記録されていません。`;


  const prompt = `
    あなたは「節約先生」、フレンドリーで、励ましてくれる、鋭いファイナンシャルアドバイザーです。
    あなたの目標は、ユーザーの収入と消費習慣を分析して、お金を節約するのを助けることです。
    批判的または厳しい態度は避けてください。あなたのトーンはポジティブで、元気づけるようなものでなければなりません。

    以下の【${monthString}】の収入と支出のリストに基づき、実行可能でパーソナライズされた節約のヒントを日本語で3〜5個提案してください。
    マークダウンのリスト形式で提示してください。フレンドリーな挨拶で始め、励ましの言葉で締めくくってください。

    これがユーザーの【${monthString}】の収入データです：
    ${formattedIncomes}

    これがユーザーの【${monthString}】の支出データです：
    ${formattedExpenses}

    これらの収入と支出のパターンを分析し、具体的で創造的なアドバイスを提供してください。
    例えば、「食費」の支出が多い場合は、作り置きやスーパーのアプリ活用などの具体的な戦略を提案します。「娯楽」費が高い場合は、無料の地域イベントやサブスクリプションの見直しなどを提案します。収入に対して支出が多い場合は、その点にも優しく触れてください。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching savings tips from Gemini API:", error);
    return "すみません、今ちょっとヒントを考えるのに苦労しています。APIキーの設定を確認して、後でもう一度お試しください。";
  }
}

export async function analyzeReceipt(base64Image: string): Promise<Partial<Omit<Expense, 'id'>>> {
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  };

  const today = new Date().toISOString().split('T')[0];
  const categories = Object.values(Category).join(', ');

  const textPart = {
    text: `あなたは知的なレシートスキャナーです。提供されたレシートの画像を分析し、以下の情報をJSON形式で抽出してください:
- 取引の合計金額。
- 取引の日付を「YYYY-MM-DD」形式で。日付が見つからない場合は、今日の日付を使用してください: ${today}。
- 店舗名や目立つ商品名などの簡単な説明。
- 支出のカテゴリ。次のリストから選択してください: ${categories}。最も関連性の高いカテゴリを選択し、適合するものがない場合は「${Category.Other}」を使用してください。

提供されたJSONスキーマに厳密に従って出力を提供してください。`,
  };

  const schema = {
    type: Type.OBJECT,
    properties: {
      amount: { type: Type.NUMBER, description: '合計金額' },
      date: { type: Type.STRING, description: '日付 (YYYY-MM-DD)' },
      description: { type: Type.STRING, description: '内容（店名など）' },
      category: { type: Type.STRING, enum: Object.values(Category), description: 'カテゴリ' },
    },
    required: ['amount', 'date', 'description', 'category'],
  };

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, imagePart] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema,
        },
    });
    
    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);

    // Validate category
    if (!Object.values(Category).includes(parsedData.category as Category)) {
        parsedData.category = Category.Other;
    }

    return parsedData;
  } catch(error) {
    console.error("Error analyzing receipt from Gemini API:", error);
    throw new Error("レシートの解析に失敗しました。画像の鮮明さを確認するか、後でもう一度お試しください。");
  }
}

interface GroundingChunk {
  web: {
    uri: string;
    title?: string;
  };
}

interface LocationInput {
  latitude?: number;
  longitude?: number;
  address?: string;
}

export async function getSalesInfo(location: LocationInput): Promise<{ text: string; sources: GroundingChunk[] }> {
  let locationInfo: string;
  let locationContext: string;

  if (location.address) {
    locationInfo = `【検索場所】\n${location.address}`;
    locationContext = `この【検索場所】の周辺エリアに限定して`;
  } else if (location.latitude !== undefined && location.longitude !== undefined) {
    locationInfo = `【現在地】\n緯度: ${location.latitude}\n経度: ${location.longitude}`;
    locationContext = `この【現在地】が含まれる都道府県と市区町村を特定し、その市区町村内または非常に近い隣接地域に限定して`;
  } else {
    throw new Error("位置情報（緯度・経度）または住所のいずれかを提供する必要があります。");
  }

  const prompt = `
    あなたは地域情報に詳しい、賢いショッピングアシスタントです。
    ユーザーが指定した以下の場所の情報を基に、Google検索を最大限活用して、スーパーマーケットの具体的なセール情報やお得情報を教えてください。

    ${locationInfo}

    回答のポイント:
    - 必ず、${locationContext}、スーパーマーケットの情報を検索してください。
    - スーパーマーケットの名前と、簡単な場所や支店名を明記してください。
    - 現在実施中の具体的なセール品（例：「〇〇スーパーで本日、卵が99円」「△△ストアで週末限定、野菜詰め放題」など）。
    - 時間帯による割引情報（タイムセールなど）があれば含めてください。
    - 近隣の店舗で共通するお買い得な曜日や傾向も役立ちます。

    回答は、ユーザーがすぐに行動に移せるような、具体的で実践的なヒントを、店ごとに分かりやすくマークダウン形式で生成してください。
    もし指定された地域で具体的な店舗情報が見つからない場合は、その地域で役立ちそう一般的な買い物術を提案してください。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    
    const sources: GroundingChunk[] = groundingChunks
      .filter(chunk => chunk.web?.uri)
      .map(chunk => ({
        web: {
          uri: chunk.web!.uri!,
          title: chunk.web!.title,
        }
      }));

    return {
      text: response.text,
      sources: sources,
    };
  } catch (error) {
    console.error("Error fetching sales info from Gemini API:", error);
    throw new Error("セール情報の取得に失敗しました。後でもう一度お試しください。");
  }
}