"use client"
import React from "react";

interface UsersManualProps {
    setIsManual: (setIsManual: boolean ) => void;
}

export default function UsersManual({setIsManual}:UsersManualProps){

    return (
        <div className="flex justify-center">
            <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
            <div className="mt-10 font-bold text-xl text-center">ユーザーマニュアル</div>
            <div className="mt-10 text-center">ここに使用方法や注意事項を記載します</div>
            <button onClick={()=>setIsManual(false)} className="mt-64 text-blue-500 hover:text-blue-700 text-sm">戻る(back)</button>
            </div>
        </div>
    )
}