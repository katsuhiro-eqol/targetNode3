'use client';
import React from "react";
import { useState } from 'react';

export default function VoiceTest(){
    const [voice, setVoice] = useState<string>("bauncer")
    const [input, setInput] = useState<string>("")
    const voiceList = [0,1,2]
    

    const createVoice = async () => {

        try {
            const response = await fetch("/api/testAudioCreation", {
                method: "POST",
                timeout: 60000,
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ answer: input, id: voice}),
            });
            const audio = await response.json();
            console.log(audio.voiceId)

        } catch (error) {
            console.log(error)
        }
    }


    const selectVoice = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setVoice(e.target.value);
    }
    

    return (
        <div>
            <div>
            <select className="mb-8 w-48 h-8 text-center border-2 border-lime-600" value={voice} onChange={selectVoice}>
            {voiceList.map((name) => {
            return <option key={name} value={name}>{name}</option>;
            })}
            </select>
            </div>
            <div>
            <input className="w-2/3 rounded-md px-4 py-2 bg-inherit border mt-2 mb-6 border-lime-600"
                name="event"
                placeholder="テストする文章"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            </div>
            <button className="mt-20 border-2" onClick={createVoice}>音声合成テスト</button>
        </div>
    )
}