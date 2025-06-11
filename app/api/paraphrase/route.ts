import { OpenAI } from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import { create } from 'domain'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
  const { question, model, history } = await req.json()

  const chatRes = await openai.chat.completions.create({
    model: 'gpt-4.1-nano',
    messages: [{ role: 'user', content: createPrompt(question,history)}],
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

const createPrompt = (question:string, history:{user:string, aicon:string}[]) => {
    if (Array.isArray(history) && history.length>0){
        const content = `Q1:${history[history.length-1].user}\nA1:${history[history.length-1].aicon}\nQ2:${question}`
        const prompt = `以下のQ&Aの流れから最後Q(Q2)の意図を解釈して1文の質問で表現してほしい。その際出来るだけ異なる語彙を使った3つの候補文を生成すること
  
        ${content}
        
        戻り値は次の形式の文字列で返すこと：["文1", "文2", "文3"]
        `
        return prompt
    } else {
        const prompt = `
        次の文章と意味が似ているが、できるだけ異なる語彙や言い回しを使った3つの文を生成してください：
        
        「${question}」
        
        戻り値は次の形式の文字列で返すこと：["文1", "文2", "文3"]
        `
        return prompt        
    }
}

/*
        if (history.length > 3){
            let content = ""
            for (let i = 0; i < 3; i++){
                const s = `Q${i}:${history[history.length+i-3].user}\nA${i}:${history[history.length+i-3].aicon}`
                content += s
            }
            content += `Q4:${question}`
            const prompt = `以下のQ&Aの流れから最後Qの意図を把握し、1文の質問で表現してほしい。その際出来るだけ異なる語彙を使った3つの候補文を生成すること
  
            ${content}
            
            戻り値は次の形式の文字列で返すこと：["文1", "文2", "文3"]
            `
            return prompt
        } else {
            const n = history.length
            let content = ""
            for (let i = 0; i < n; i++){
                const s = `Q${i}:${history[history.length+i-n].user}\nA${i}:${history[history.length+i-n].aicon}`
                content += s
            }
            content += `Q${n+1}:${question}`
            const prompt = `以下のQ&Aの流れから最後Qの意図を把握し、1文の質問で表現してほしい。その際出来るだけ異なる語彙を使った3つの候補文を生成すること
  
            ${content}
            
            戻り値は次の形式の文字列で返すこと：["文1", "文2", "文3"]
            `
            return prompt            
        }
*/