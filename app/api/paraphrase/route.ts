import { OpenAI } from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
  const { question, model } = await req.json()

  // Step 1: パラフレーズ生成
  const prompt = `
次の文章と意味が似ているが、できるだけ異なる語彙や言い回しを使った5つの文を生成してください：

「${question}」

戻り値は次の形式の文字列で返すこと：["文1", "文2", "文3", "文4", "文5"]
`

  const chatRes = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8
  })

  let paraphrases: string[] = []
  try {
    // 出力をJSONパース
    paraphrases = JSON.parse(chatRes.choices[0].message.content || '[]')
  } catch (err) {
    return NextResponse.json({ error: 'Failed to parse paraphrases' }, { status: 500 })
  }

  // Step 2: Embedding取得
  const embeddingRes = await openai.embeddings.create({
    model: model,
    input: paraphrases
  })

  const embeddings = embeddingRes.data.map(d => {
    const buffer = new Float32Array(d.embedding);
    const vectorBase64 = Buffer.from(buffer.buffer).toString('base64');
    return vectorBase64
})

  return NextResponse.json({
    paraphrases,
    embeddings  // number[][]（文数 × ベクトル次元）
  })
}