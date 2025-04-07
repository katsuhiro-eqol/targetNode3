"use client"
import React from "react";
import { useState, useEffect } from "react";
import { db } from "@/firebase"
import { doc, getDoc, collection, query, getDocs, setDoc } from "firebase/firestore"

export default function EventInspector(){
    const [events, setEvents] = useState<string[]>([""]) //firestoreから読み込む
    const [event, setEvent] = useState<string>("")
    const [organization, setOrganization] = useState<string>("")
    const [convs, setConvs] = useState<string[]>([])


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
    
    const loadConversationId = async (event:string) => {
        try {
            const eventId = organization + "_" + event
            const convRef = collection(db,"Events",eventId, "Conversation")
            const q = query(convRef)
            const querySnapshot = await getDocs(q)

            querySnapshot.forEach((doc) => {
                const data = doc.data()
                if (data.conversations.length > 0){
                    console.log(data.conversations)
                    setConvs((prev) => {return [...prev, doc.id]})
                }
            })
        } catch {

        }
    }

    const selectEvent = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEvent(e.target.value);
        if (e.target.value !== ""){
            loadConversationId(e.target.value)
        }
    }

    useEffect(() => {
        console.log(convs)
    }, [convs])

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
            <div>分類できなかった質問のリスト</div>
            <div>QA総数・日別等</div>
            <div>質問ランキング</div>
            </div>
        </div>
    )
}