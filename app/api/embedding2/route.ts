//外国語に対応
import {decode} from "html-entities"
import OpenAI from "openai";
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const translateUrl = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GCP_API_KEY}`;

const foreignLanguages: Record<string, string> = {
    "日本語": "ja-JP",
    "英語": "en-US",
    "中国語（簡体）": "zh-CN",
    "中国語（繁体）": "zh-TW",
    "韓国語": "ko-KR",
    "フランス語": "fr-FR",
    "ポルトガル語": "pt-BR",
    "スペイン語": "es-ES"
};
export async function POST(req: NextRequest): Promise<NextResponse>  {
    const params = await req.json()
    const lang = params.language as keyof typeof foreignLanguages
    const input = params.input
    const model = params.model
    if (lang != "日本語"){
        //const langCode = foreignLanguages[lang as keyof typeof foreignLanguages]
        const response = await fetch(translateUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              q: input,
              target: "ja-JP",
            }),
        });
        const data = await response.json();
        const decoded = decode(data.data.translations[0].translatedText)
        console.log(decoded)
        try {
            const response = await openai.embeddings.create({
            model: model,
            input: decoded,
            encoding_format: "float",
            });
    
            const embedding = response.data[0].embedding;
            const buffer = new Float32Array(embedding);
            const vectorBase64 = Buffer.from(buffer.buffer).toString('base64');
            return NextResponse.json({ input: decoded, embedding: vectorBase64 });
        } catch (error) {
            return NextResponse.json({ embedding: error });
        }        
    } else {
        try {
            console.log(input)
            const response = await openai.embeddings.create({
            model: model,
            input: input,
            encoding_format: "float",
            });
    
            const embedding = response.data[0].embedding;
            const buffer = new Float32Array(embedding);
            const vectorBase64 = Buffer.from(buffer.buffer).toString('base64');
            return NextResponse.json({ input: input, embedding: vectorBase64 });
        } catch (error) {
            return NextResponse.json({ embedding: error });
        }        
    }
}

