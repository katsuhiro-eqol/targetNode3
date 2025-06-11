"use client"
import React from "react";
import { useState, useEffect } from 'react'
import { db } from "@/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import EventOption from "../../components/eventOption"

import { Event, Pronunciation, Image } from "@/types"

export default function UpdateEvent(){
    const [events, setEvents] = useState<string[]>([""]) //firestoreから読み込む
    const [event, setEvent] = useState<string>("")
    const [organization, setOrganization] = useState<string>("")
    const [eventData, setEventData] = useState<Event|null>(null)
    const [isHumanStaff, setIsHumanStaff] = useState<boolean>(false)
    const [startTime, setStartTime] = useState<string>("制限なし")//利用開始時間
    const [endTime, setEndTime] = useState<string>("制限なし")//利用終了時間
    const [image, setImage] = useState<Image>({name:"AI-con_man_01.png", url:"/AI-con_man_01.png"})
    const [status, setStatus] = useState<string>("")

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

    const loadEventData = async (Event:string) => {
        if (Event){
            try {
                const id = organization + "_" + Event
                const docRef = doc(db, "Events", id)
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data()
                    const lang = data.languages.toString()
                    const period = "開始日時:" + data.startTime + "〜  終了日時:" + data.endTime
                    let pronunceArray
                    if (data.pronunciation){
                        pronunceArray = data.pronunciation.map((item:Pronunciation) => ( `${item.text}->${item.read}`))
                    }else{
                        pronunceArray = [""]
                    }                    
                    const eData:Event = {
                        id: id,
                        name: Event,
                        code: data.code,
                        image: data.image.name,
                        voice: data.voice,
                        languages: data.languages,
                        period: period,
                        qaData:data.qaData,
                        langString:lang,
                        pronunceStr:pronunceArray.toString()
                    }
                    setEventData(eData)
                    setImage(data.image)
                }
            } catch (error) {
                console.log(error)
            }
        } else {
            alert("イベントを選択してください")
        }
    }

    const updateEvent = async () => {
        if (eventData){
            const eventId = eventData.id
            const data = {
                startTime: startTime,
                endTime: endTime,
                image:image,               
            }
            await setDoc(doc(db,"Events", eventId), data, {merge:true})
            setStatus("イベント情報の更新が完了しました")
        }
    }

    const pageReload = () => {
        window.location.reload()
    }

    const selectEvent = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEvent(e.target.value);
        loadEventData(e.target.value)
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
        <div className="font-bold text-xl">イベント設定更新</div>
        <div className="text-xs text-red-500">更新できる項目は「UI画像」と「利用期間」のみです</div>
        <div className="text-base mt-5">イベントを選択</div>
            <select className="mb-4 w-48 h-6 text-center border-2 border-lime-600" value={event} onChange={selectEvent}>
            {events.map((name) => {
            return <option key={name} value={name}>{name}</option>;
            })}
            </select>
            <div>
            {(event&&eventData) && (
                <div>
                <div className="flex flex-row gap-x-4">
                <div className="text-sm font-semibold text-blue-600">UI画像（現在の設定）</div>
                <div className="text-sm font-semibold text-blue-600">{eventData.image}</div>
                </div>
                <div className="flex flex-row gap-x-4 mb-10">
                <div className="text-sm font-semibold text-blue-600">利用期間（現在の設定）</div>
                <div className="text-sm font-semibold text-blue-600">{eventData.period}</div>
                </div>
                <EventOption organization={organization} setImage={setImage} setStartTime={setStartTime} setEndTime={setEndTime} isHumanStaff={isHumanStaff} setIsHumanStaff={setIsHumanStaff}/>
                <div className="flex flex-row gap-x-4">
                <button className="h-10 mt-10 px-2 border-2 rounded" onClick={pageReload}>キャンセル</button>
                <button className="h-10 mt-10 px-2 border-2 bg-amber-200 rounded hover:bg-amber-300" onClick={() => updateEvent()} >イベント更新</button>
                </div>
                <div className="text-green-500 font-semibold mt-3">{status}</div>
                </div>
            )}    
            </div>
        </div>
    )
}
/*
<EventInfo eventData={eventData} />
*/