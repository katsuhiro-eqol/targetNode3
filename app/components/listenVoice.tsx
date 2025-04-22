"use client"
import React from "react";
import {useRef} from "react"

interface VoiceProps {
    voiceUrl: string;
    answer: string;
    setIsAudio: (isAudio: boolean ) => void;
}

export default function ListenVoice({voiceUrl, answer, setIsAudio}:VoiceProps){
    const audioRef = useRef(null)

    const closeAudio = () => {
        setIsAudio(false)
    }

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50">
            <div className="flex flex-col w-96 h-60 bg-white p-6 rounded-lg shadow-lg relative ml-auto mr-24 mt-auto mb-24">
            <div className="mb-2 text-center text-sm">{answer}</div>
            <audio className="mx-auto" ref={audioRef} controls>
                <source src={voiceUrl} type="audio/wav" />
                Your browser does not support the audio element.
            </audio>
            <button className="text-xs border-2 w-16 h-6 mt-auto mb-1 mx-auto bg-slate-100" onClick={() => closeAudio()}>閉じる</button>
            </div>
        </div>
    )
}