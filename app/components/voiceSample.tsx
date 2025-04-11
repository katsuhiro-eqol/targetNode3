"use client"
import React from "react";
import {useState, useRef} from "react"

interface VoiceProps {
    setIsListen: (isListen: boolean ) => void;
}

export default function VoiceSample({setIsListen}:VoiceProps){
    const audioRef = useRef(null)
    const audioRef2 = useRef(null)

    const closeAudio = () => {
        setIsListen(false)
    }

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50">
            <div className="flex flex-col w-96 h-96 bg-white p-6 rounded-lg shadow-lg relative ml-auto mr-24 mt-auto mb-24">
            <div className="text-sm font-bold ml-2">voice_m</div>
            <audio className="mx-auto mt-8" ref={audioRef} controls>
                <source src="https://firebasestorage.googleapis.com/v0/b/targetproject-394500.appspot.com/o/aicon_audio%2Fvoice_m-977077eb9c74549491ff78ab72b96d05.wav?alt=media&token=b848c5c4-8df7-4793-8950-b6104b7110d7" type="audio/wav" />
                Your browser does not support the audio element.
            </audio>
            <div className="text-sm font-bold mt-10 ml-2">voice_w</div>
            <audio className="mx-auto mt-8" ref={audioRef2} controls>
                <source src="https://firebasestorage.googleapis.com/v0/b/targetproject-394500.appspot.com/o/aicon_audio%2Fvoice_w-a8d7a46bbb821dab45a9e716ec30397c.wav?alt=media&token=4f5d521a-e60b-479d-8c79-c8b1010e583b" type="audio/wav" />
                Your browser does not support the audio element.
            </audio>
            <button className="text-xs border-2 w-16 h-6 mt-auto mb-1 mx-auto bg-slate-100" onClick={() => closeAudio()}>閉じる</button>
            </div>
        </div>
    )
}