"use client"
import React from "react";
import { useState, useEffect } from "react";



export default function Test(){
    const [now, setNow] = useState<string>("")

    useEffect(() => {
        const today = new Date().toLocaleString("ja-JP")
        setNow(today)
    }, [])


    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <div className="font-bold text-xl">アカウント情報（& テストページ）</div>
        <div className="text-xl font-bold text-red-500 mt-10 mb-20">Under Construction...</div>
        <div>現在時刻：{now}</div>
        </div>
    )
}