import {decode} from "html-entities"
import { NextRequest, NextResponse } from 'next/server';


const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GCP_API_KEY}`;

export async function POST(req: NextRequest): Promise<NextResponse>  {

    const params = await req.json()
    const answer = params.answer
    const language = params.language
    console.log("request", language)
    const foreignLang = {"日本語":"ja-JP", "英語":"en-US", "中国語（簡体）":"zh-CN", "中国語（繁体）":"zh-TW", "韓国語":"ko-KR", "フランス語":"fr-FR", "ポルトガル語":"pt-BR","スペイン語":"es-ES"}
    const langCode = foreignLang[language]
    console.log(langCode)
    const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: answer,
          target: langCode,
        }),
      });
        const data = await response.json();
        const decoded = decode(data.data.translations[0].translatedText)

    return NextResponse.json({answer: answer, code:langCode, foreign:decoded})
}