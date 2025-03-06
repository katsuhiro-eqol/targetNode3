"use client"
import React from "react";
import {useState, useEffect, useRef} from "react"
import { db } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"
import createWav from "../functions/createWav"

const no_sound = "https://firebasestorage.googleapis.com/v0/b/targetproject-394500.appspot.com/o/setto%2Fno_sound.mp3?alt=media&token=99787bd0-3edc-4f9a-9521-0b73ad65eb0a"

export default function ListenVoice({voiceUrl, answer, setIsAudio}){
    const audioRef = useRef(null)

    const handlePlay = () => {
        if (audioRef.current) {
          audioRef.current.play();
        }
      };
    
    const handlePause = () => {
    if (audioRef.current) {
        audioRef.current.pause();
    }
    };

    const closeAudio = () => {
        setIsAudio(false)
    }

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="flex flex-col w-96 h-48 bg-white p-6 rounded-lg shadow-lg relative ml-auto mr-24 mt-auto mb-24">
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