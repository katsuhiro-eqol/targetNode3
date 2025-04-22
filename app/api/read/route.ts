import OpenAI from "openai";
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const client = new OpenAI();

export async function POST(req: NextRequest): Promise<NextResponse>  {
    const params = await req.json()
    const answer = params.answer
    
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4.1",
            messages: [{
                role: "user",
                content: `{}内の文の読みをひらがなで記述せよ。{${answer}}」`
            }]
        });
        return NextResponse.json({ hiragana: response.choices[0].message.content});
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error });
    }
}

/*
const model = params.model
    console.log(input, model)

    try {
        const response = await openai.embeddings.create({
        model: model,
        input: input,
        encoding_format: "float",
        });

        const embedding = response.data[0].embedding;
        const buffer = new Float32Array(embedding);
        const vectorBase64 = Buffer.from(buffer.buffer).toString('base64');
        //console.log(vectorBase64)

        return NextResponse.json({ prompt: input, embedding: vectorBase64 });
    } catch (error) {
        return NextResponse.json({ embedding: error });
    }
    */