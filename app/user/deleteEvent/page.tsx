"use client"
import React from "react";
import { useState, useEffect } from "react";
import { db } from "@/firebase"
import { doc, getDoc, deleteDoc, setDoc } from "firebase/firestore"


export default function Account(){
    const [events, setEvents] = useState<string[]>([]) //firestoreから読み込む
    const [eventList, setEventList] = useState<string[]>([""])
    const [event, setEvent] = useState<string>("")
    const [organization, setOrganization] = useState<string>("")
    const [status, setStatus] = useState<string>("")

    const loadEvents = async (org:string) => {
        try {
            const docRef = doc(db, "Users", org)
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data()
                setEvents(data.events)
                const array1 = [""]
                const array2 = array1.concat(data.events)
                setEventList(array2)
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

    const cancelButton = () => {
        setEvent("")
    }

    const deleteEvent = async() => {
        if (event !== ""){
        const dEvent = confirm(`本当に${event}を削除しますか？`)
            if (dEvent){
                if (events){
                    const newEvents = events.filter((item) => item !== event)
                    const userRef = doc(db, "Users",organization)
                    const data = {
                        events: newEvents
                    }
                    await setDoc(userRef, data, {merge:true})
                    setEvents(newEvents)
                    setEvent("")
                }
                const eventId = organization + "_" + event
                const docRef = doc(db, "Events",eventId)
                await deleteDoc(docRef)
                setStatus(`${event}の削除が完了しました`)
            }
        } else {
            alert("削除するイベント名が入力されていません")
        }
    }

    const selectEvent = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEvent(e.target.value);
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
        <div className="font-bold text-xl mt-3 mb-7">イベント削除（付属するQ&Aも削除されます）</div>
        <div className="text-base font-bold">削除するイベントを選択 </div>
        
        {events && (
        <select className="mt-3 ml-3 w-48 h-8 text-center border-2 border-lime-600" value={event} onChange={selectEvent}>
        {eventList.map((name) => {
        return <option key={name} value={name}>{name}</option>;
        })}
        </select>
        )}

        {event && (
        <div>
            <div className="text-red-500 font-bold mt-16 text-sm">このイベントを削除しますか？復元はできません。</div>
            <div className="flex flex-row gap-x-4">
            <button className="h-10 my-5 px-2 border-2 rounded" onClick={cancelButton}>キャンセル</button>
            <button className="h-10 my-5 ml-3 px-2 border-2 bg-amber-200 rounded hover:bg-amber-300"  onClick={() => deleteEvent()}>イベント削除</button>
            </div>               
        </div>
        )}
        <div className="text-green-500 font-semibold mt-20">{status}</div>
        </div>
    )
}