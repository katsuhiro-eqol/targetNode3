"use client"
import React from "react";
import { useState, useEffect } from "react";
import { db } from "@/firebase"
import { doc, getDoc, collection, query, getDocs, orderBy, limit, deleteDoc, setDoc, where } from "firebase/firestore"
import { ConvData } from "@/types"

export default function EventInspector(){
    const [events, setEvents] = useState<string[]>([""]) //firestoreから読み込む
    const [event, setEvent] = useState<string>("")
    const [organization, setOrganization] = useState<string>("")
    const [convData, setConvData] = useState<ConvData[]>([])
    const [emptyCount, setEmptyCount] = useState<number>(0)
    



    const loadEvents = async (org:string) => {
        try {
            const docRef = doc(db, "Users", org)
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data()
                const array1 = [""]
                const array2 = array1.concat(data.events)
                setEvents(array2)
                if (!data.events){
                    alert("イベントが登録されていません")
                }
            } else {
                alert("ログインから始めてください")
            }
        } catch (error) {
            console.log(error)
        }
    }

    const loadConvData = async (event:string) => {
        const conv = []
        let empty = 0
        try {
            const eventId = organization + "_" + event
            const convRef = collection(db,"Events",eventId, "Conversation")
            const q = query(convRef, limit(50))
            const querySnapshot = await getDocs(q)
            for (const document of querySnapshot.docs) {
                const data = document.data()
                if (data.conversations.length === 0){
                    console.log("no conv", document.id)
                    const docRef = doc(db, "Events",eventId,"Conversation", document.id);
                    await deleteDoc(docRef);
                    empty ++
                } else {
                    conv.push(data.conversations)
                }
            }
            setEmptyCount(empty)
            if (conv.length > 0){
                setConvData(conv)
            } else {
                alert("このイベントには会話履歴情報がありません")
            }
        } catch {
            alert("データのロード時にエラーが発生しました")
        }
    }

    const selectEvent = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEvent(e.target.value);
        if (e.target.value !== ""){
            loadConvData(e.target.value)
        }
    }

    useEffect(() => {
        const org = sessionStorage.getItem("user")
        if (org){
            setOrganization(org)
            loadEvents(org)
        }
    },[])

    return (
        <div>
            <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
            <div className="font-bold text-xl">イベント進捗状況</div>
            <div className="text-xl font-bold text-red-500 mt-10 mb-20">Under Construction...</div>
            <div className="text-base mt-5">イベントを選択</div>
            <select className="mb-8 w-48 h-8 text-center border-2 border-lime-600" value={event} onChange={selectEvent}>
            {events.map((name) => {
            return <option key={name} value={name}>{name}</option>;
            })}
            </select>
            <div>会話スレッド数：{String(convData.length)}</div>
            <div>無会話スレッド数：{String(emptyCount)}</div>
            <div></div>
            <div>分類できなかった質問のリスト</div>
            <div>QA総数・日別等</div>
            <div>質問ランキング</div>
            </div>
        </div>
    )
}