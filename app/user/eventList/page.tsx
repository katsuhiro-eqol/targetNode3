"use client"
import React from "react";
import { useState, useEffect } from "react";
import { db } from "@/firebase"
import { doc, getDoc, collection, getDocs } from "firebase/firestore"
import {Sidebar} from "../../components/sideBar"
import EventsList from "../../components/eventsList"
import QADataList from "../../components/qADataList"

export default function EventList(){
    const [events, setEvents] = useState<string[]>([""]) //firestoreから読み込む
    const [eventsData, setEventsData] = useState({})
    //const [selectedRowId, setSelectedRowId] = useState(null)
    const [eventId, setEventId] = useState<string>("")
    const [organization, setOrganization] = useState<string>("")
    const [qaData, setQaData] = useState([])
    const [isQAData, setIsQAData] = useState<boolean>(false)


    const loadEvents = async () => {
        try {
            const org = sessionStorage.getItem("user")
            console.log(org)
            setOrganization(org)
            const docRef = doc(db, "Users", org)
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data()
                setEvents(data.events)
                if (!data.events){
                    alert("イベントが登録されていません")
                }
            } else {
                alert("ログインから始めてください")
            }
        } catch (error) {
            alert("データベースエラー")
        }
    }

    const loadEventsData = async () => {
        let esData = []
        for (const item  of events){
            try {
                const id = organization + "_" + item
                const docRef = doc(db, "Events", id)
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data()
                    const lang = data.languages.toString()
                    const period = "開始日時：" + data.startTime + "〜  終了日時:" + data.endTime
                    const eventData = {
                        id: id,
                        name: item,
                        image: data.image,
                        voice: data.voice,
                        languages: lang,
                        period: period
                    }
                    esData.push(eventData)
                }
            } catch (error) {
                console.log("イベントデータ取得に失敗しました")
            }
            setEventsData(esData)
        }
    }

    const loadQADB = async () => {
        if (eventId){
        const querySnapshot = await getDocs(collection(db, "Events", eventId, "QADB"));
        const qa = []
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            console.log(data.foreign)
            const vector = data.vector.substr(0,10) + "..."
            const qadata = {
                id: doc.id,
                question:data.question,
                answer:data.answer,
                modalFile:data.modalFile,
                modalUrl:data.modalUrl,
                voiceId:data.voiceId,
                foreign:data.foreign,
                vector:vector
            }
            qa.push(qadata)
          })
          qa.sort((a, b) => a.id - b.id);
          setQaData(qa)
        }
    }

    useEffect(() => {
        if (qaData.length > 0){
            setIsQAData(true)
        }
    }, [qaData])

    useEffect(() => {
        loadQADB()
    }, [eventId])

    useEffect(() => {
        console.log(eventsData)
    },[eventsData])

    useEffect(() => {
        loadEventsData()
    },[events])

    useEffect(() => {
        loadEvents()
    },[])

    return (
        <div className="flex">
        <div>
            <Sidebar />
        </div>
        <div className="ml-64 p-8 w-full">
            <div>
               <div className="font-bold text-xl my-3">イベントデータ一覧</div>
               <EventsList eventsData={eventsData} setEventId={setEventId}/>
            </div>
            <div>
            {isQAData && (<QADataList qaData={qaData} />)}
            </div>
        </div>
        </div>
    )
}

/*
 <EventList eventsData={eventsData} />
'use client';
import React from "react";
import { useState, useEffect } from 'react';
import { Circle, CircleDot } from 'lucide-react';

export default function EventList({eventsData}){
    const [selectedRowId, setSelectedRowId] = useState(null)

    const columns = [
        { key: 'selection', label: '' },
        { key: 'name', label: 'イベント名' },
        { key: 'image', label: 'UI画像' },
        { key: 'voice', label: 'Voice' },
        { key: 'languages', label: '対応外国語' },
        { key: 'period', label: '利用期間' }
    ]

    const toggleRowSelection = (rowId) => {
        if (selectedRowId === rowId) {
          setSelectedRowId(null); // 選択解除
        } else {
          setSelectedRowId(rowId); // 選択
        }
    }

    return (
        <div>
            <div>設定内容</div>
            <div className="container mx-auto p-4">
            <table className="min-w-full border border-gray-300">
                <thead>
                <tr className="bg-gray-100">
                    {columns.map((column) => (
                    <th 
                        key={column.key}
                        className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700"
                    >
                        {column.label}
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {eventsData.map((row) => (
                    <tr 
                    key={row.id} 
                    className={`hover:bg-gray-50 ${selectedRowId === row.id ? 'bg-blue-50' : ''}`}
                    >
                    {columns.map((column) => {
                        // 選択カラムの場合はアイコンを表示
                        if (column.key === 'selection') {
                        return (
                            <td 
                            key={`${row.id}-${column.key}`}
                            className="border border-gray-300 px-4 py-2 cursor-pointer"
                            onClick={() => toggleRowSelection(row.id)}
                            >
                            {selectedRowId === row.id ? (
                                <CircleDot size={20} className="text-blue-500" />
                            ) : (
                                <Circle size={20} className="text-gray-400" />
                            )}
                            </td>
                        );
                        }
                        // その他のカラムは通常通り表示
                        return (
                        <td 
                            key={`${row.id}-${column.key}`}
                            className="border border-gray-300 px-4 py-2"
                        >
                            {row[column.key]}
                        </td>
                        );
                    })}
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        );
        </div>
    )
}
    */