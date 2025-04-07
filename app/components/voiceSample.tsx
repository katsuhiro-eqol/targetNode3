"use client"
import React from "react";
import {useState, useRef} from "react"
import { Circle, CircleDot } from 'lucide-react'

interface VoiceProps {
    setIsListen: (isListen: boolean ) => void;
}

export default function VoiceSample({setIsListen}:VoiceProps){
    const [voice, setVoice] = useState<string>("voice_m")
    const audioRef = useRef(null)
    const voiceList = ["voice_m", "voice_w"]

    const closeAudio = () => {
        setIsListen(false)
    }

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50">
            <div className="flex flex-col w-96 h-72 bg-white p-6 rounded-lg shadow-lg relative ml-auto mr-24 mt-auto mb-24">
            <div className="flex flex-row gap-x-4">
            {voiceList.map((option) => (
                <div
                key={option}
                className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                onClick={() => setVoice(option)}
                >
                {/* 選択されている場合は CircleDot、それ以外は Circle を表示 */}
                {(voice === option) ? <CircleDot className="w-4 h-4 text-blue-500" /> : <Circle className="w-4 h-4 text-gray-400" />}
                <span className="ml-2 text-gray-700 text-sm">{option}</span>
            </div>
            ))}
            </div>
            <audio className="mx-auto mt-8" ref={audioRef} controls>
                <source src="test.wav" type="audio/wav" />
                Your browser does not support the audio element.
            </audio>
            <button className="text-xs border-2 w-16 h-6 mt-auto mb-1 mx-auto bg-slate-100" onClick={() => closeAudio()}>閉じる</button>
            </div>
        </div>
    )
}