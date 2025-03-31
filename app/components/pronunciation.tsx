"use client"
import React from "react";
import { useState, useEffect } from 'react';
import { Pronunciation } from "@/types"

interface PronunciationsProps {
    pronunciations:Pronunciation[]|null;
    setPronunciations:(pronunciations:Pronunciation[]|null) => void;
    isNewPronunciation:boolean;
    setIsNewPronunciation:(isNewPronunciation:boolean) => void;
}

export const PronunciationRegistration = ({pronunciations, setPronunciations, isNewPronunciation, setIsNewPronunciation}:PronunciationsProps) => {
    const [newText, setNewText] = useState<string>("")
    const [read, setRead] = useState<string>("")
    const [pronunciationArray, setPronunciationArray] = useState<string[]>([])
    
    const columns = [
        { key: 'text', label: 'テキスト' },
        { key: 'read', label: '読み' }
    ]

    const isHiraganaOnly = (input:string) => {
        const hiraganaRegex = /^[\u3041-\u3096\u3099-\u309C\u309Dー\s]*$/;
        return hiraganaRegex.test(input);
      }
    const registrationPronunciation = () => {
        if (!newText || !read){
            alert("入力がされていません")
        } else {
            if (isHiraganaOnly(read)){
                const data ={
                    text:newText,
                    read:read
                }
                if (pronunciations){
                    setPronunciations([...pronunciations,data])
                } else {
                    setPronunciations(Array(1).fill(data))
                }
                setIsNewPronunciation(false)
                setNewText("")
                setRead("")
            } else {
                alert("読みはひらがなで入力してください")
            }
        }

    }

    useEffect(() => {
        if (pronunciations){
            const pronunciation = pronunciations.map((item) => {
                return ` ${item.text} → ${item.read}`
            })
            setPronunciationArray(pronunciation)
        }
    }, [pronunciations])

    return (
        <div>
        <div className="w-2/3 ml-3 my-1 p-2 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">
            登録された読み: {pronunciationArray.join(', ') || 'なし'}
            </p>
        </div>
        {isNewPronunciation && (
            <div>
            <div className="flex flex-row gap-x-4">
                <div className="mt-2 ml-5 text-sm">読み登録する単語</div>
                <input
                    className="w-48 rounded px-2 py-1 bg-inherit border-2 text-xs"
                    name="text"
                    placeholder="読みを登録する単語を入力"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                />
                <div className="mt-2 ml-5 text-sm">読み（ひらがな）</div>
                <input
                    className="w-48 rounded px-2 py-1 bg-inherit border-2 text-xs"
                    name="read"
                    placeholder="ひらがなで読みを登録"
                    value={read}
                    onChange={(e) => setRead(e.target.value)}
                />
            </div>
            <div className="flex flex-row gap-x-4">
            <button className="ml-5 mb-5 mt-3 p-1 text-xs border-2 bg-white hover:bg-gray-100" onClick={() => {setNewText("");setRead("");setIsNewPronunciation(false)}}>キャンセル</button>
            <button className="ml-3 mb-5 mt-3 px-4 text-xs bg-gray-500 hover:bg-gray-600 text-white" onClick={registrationPronunciation}>登録</button>
            </div>
            </div>
        )}
        </div>
    )
}

/*
            {pronunciations && (
            <table className="min-w-full border border-gray-300">
            <thead>
                <tr className="bg-gray-100 w-24">
                    {columns.map((column) => (
                    <th 
                        key={column.key}
                        className="border border-gray-300 px-2 py-1 text-left font-medium text-gray-700 text-sm"
                    >
                        {column.label}
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                    {pronunciations && pronunciations.map((item,index) => (
                        <tr key={index}>
                            {columns.map((column) => 
                                <td key={`${index}-${column.key}`}></td>
                            )}
                        </tr>
                    ))}
            </tbody>
        </table>
        )}
*/