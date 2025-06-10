"use client"
import React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';

interface StaffModalProps {
    setStaffModal: (isModal: boolean ) => void;
    attribute: string | null;
    language: string;
}

export default function StaffModal({setStaffModal, attribute, language}: StaffModalProps){
    const [startMessage, setStartMessage] = useState<string>("")   
    const [username, setUsername] = useState<string>("")
    const [eventId, setEventId] = useState("")
    const router = useRouter()

    const closeModal = () => {
        setStaffModal(false)
    }

    const beginStaffChat = () => {
        if (startMessage && username && eventId){
            router.push(`/aicon/userSupport?eventId=${eventId}&userName=${username}&startMessage=${startMessage}&language=${language}`)
        } else {
            alert("入力が不足しています")
        }
    }

    useEffect(() => {
        if (attribute){
            setEventId(attribute)
        }
    }, [attribute])

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50">
            <div className="flex flex-col w-96 h-2/3 bg-white p-6 rounded-lg shadow-lg relative mx-auto mt-auto mb-12">
                <div className="text-center text-base font-bold mb-6">サポートスタッフに連絡しますか？</div>
                <div className="text-sm ml-2 mt-1">あなたの名前または部屋番号</div>
                <input className="block w-5/6 max-w-96 mx-auto mb-2 px-2 py-2 text-xs bg-gray-100"
                    placeholder="名前または部屋番号"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                     />
                <div className="text-sm ml-2 mt-3">ご用件</div>
                <textarea className="block w-5/6 max-w-96 mx-auto mb-2 px-2 py-2 text-xs bg-gray-100"
                    name="message"
                    placeholder="ご用件を記入ください"
                    rows={8}
                    value={startMessage}
                    onChange={(e) => setStartMessage(e.target.value)}
                />
                <div className="flex flex-row gap-x-4 mt-auto mb-1 mx-auto">
                <button onClick={closeModal} className="mt-10 px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">キャンセル</button>
                <button onClick={beginStaffChat} className="ml-2 mt-10 px-2 py-1 text-sm bg-amber-300 rounded hover:bg-amber-400">メッセージ送信</button>
                </div>
            </div>
        </div>
    )
}