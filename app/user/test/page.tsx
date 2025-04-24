"use client"
import React from "react";
import { useState, useEffect } from "react";
import getHiragana from "../../func/getHiragana"
import deleteFailedVoice from "../../func/deleteFailedVoice"
import {ProgressBar} from "../../components/progressBar"


export default function Test(){
    const [text, setText] = useState<string>("")
    const [read, setRead] = useState<string>("")
    const steps = [
        { name: 'データ取得', progress: 75 },
        { name: 'データ処理', progress: 30 },
        { name: '結果出力', progress: 10 },
      ];

    const getRead = async () => {
        const hiragana = await getHiragana(text)
        setRead(hiragana)
    }

    const deleteNoVoice = async () => {
        await deleteFailedVoice()
    }

    useEffect(() => {
        console.log(read)
    }, [read])

    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <div className="font-bold text-xl">アカウント情報（& テストページ）</div>
        <div className="text-xl font-bold text-red-500 mt-10 mb-20">Under Construction...</div>
        <div className="text-base font-semibold text-gray-700">OpenAI APIにて読みを解析する</div>
        <input className="w-2/3 rounded-md px-4 py-2 bg-inherit border mt-2 mb-6 border-lime-600"
            name="read"
            placeholder="読みを取得する文章"
            value={text}
            onChange={(e) => setText(e.target.value)}
        />
        <button onClick={getRead}>読み取得</button>
        <div>{read}</div>
        <div className="mt-10 text-base font-semibold text-gray-700">音声合成に失敗したVoiceデータを削除</div>
        <button onClick={deleteNoVoice}>音声合成不良データを削除</button>
        <h2 className="text-xl font-bold mb-4 mt-10">処理進捗状況</h2>
        <ProgressBar steps={steps} />
        </div>
    )
}