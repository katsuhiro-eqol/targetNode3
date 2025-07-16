"use client"
import React from "react";
import { useState, useEffect } from "react";
import { db } from "@/firebase"
import { doc, getDoc, collection, query, getDocs, orderBy, limit, deleteDoc, setDoc, where } from "firebase/firestore"
import { ConvData } from "@/types"

interface SelectedConv {
    id:string;
    uJapanese:string;
    nearestQ:string;
    similarity:number;
}


export default function EventInspector(){
    const [events, setEvents] = useState<string[]>([""]) //firestoreから読み込む
    const [event, setEvent] = useState<string>("")
    const [organization, setOrganization] = useState<string>("")
    const [convData, setConvData] = useState<ConvData[]>([])
    const [emptyCount, setEmptyCount] = useState<number>(0)
    const [selectedConvs, setSelectedConvs] = useState<ConvData[]>([])
    const [selectedAnalysis, setSelectedAnalysis] = useState<string>("")
    
    const columns = [
        { key: 'id', label: 'date' },
        { key: 'uJapanese', label: 'Question(JP)' },
        { key: 'nearestQ', label: 'nearest' },
        { key: 'similarity', label: 'similarity' }
    ]

    const buttons = [
        { key: 'unclassify', label: '回答不能質問'},
        { key: 'FAQ', label: '高頻度質問'},
        { key: 'time_series', label: '会話数推移'}
    ]

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
        //const conv = []
        let empty = 0
        try {
            const eventId = organization + "_" + event
            const convRef = collection(db,"Events",eventId, "Conversation")
            const q = query(convRef, limit(50))
            const querySnapshot = await getDocs(q)
            for (const document of querySnapshot.docs) {
                const data = document.data()
                if (data.conversations.length === 0){
                    const docRef = doc(db, "Events",eventId,"Conversation", document.id);
                    await deleteDoc(docRef);
                    empty ++
                } else {
                    console.log(document.id)
                    if (data.conversations[0].uJapanese){
                        setConvData(prev => [...prev, ...data.conversations])
                    }
                }
            }
            setEmptyCount(empty)
        } catch {
            alert("データのロード時にエラーが発生しました")
        }
    }

    const extractUnclassifiableQuestion = () => {
        const unclassify = convData.filter((conv) => conv.aJapanese == "回答不能")
        console.log(unclassify)
        setSelectedConvs(unclassify)
    }

    const selectEvent = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEvent(e.target.value);
        setSelectedConvs([])
        if (e.target.value !== ""){
            loadConvData(e.target.value)
        }
    }

    const convertDate = (date:string) => {
        const day = date.split("T")[0]
        const time = date.split("T")[1].split(":")
        const cDate = `${day} ${time[0]}:${time[1]}`
        return cDate
    }

    const similarityToString = (similarity:number) => {
        const sim = Math.floor(similarity*1000)/1000
        return sim.toString()
    }

    useEffect(() => {
        console.log(selectedConvs)
    }, [selectedConvs])

    useEffect(() => {
        if (selectedAnalysis === "unclassify"){
            extractUnclassifiableQuestion()
        }
    }, [selectedAnalysis])

    useEffect(() => {
        const org = sessionStorage.getItem("user")
        if (org){
            setOrganization(org)
            loadEvents(org)
        }
    },[])

    return (
        <div>
            <div className="font-bold text-xl">会話応答分析：{event}</div>
            <div className="text-sm text-red-500">2025/6/20以降に作成したイベントのみ分析対象</div>
            <div className="text-base mt-5">イベントを選択</div>
            <select className="mb-8 w-48 h-8 text-center border-2 border-lime-600" value={event} onChange={selectEvent}>
            {events.map((name) => {
            return <option key={name} value={name}>{name}</option>;
            })}
            </select>

            <div className="flex flex-row gap-x-4 mb-10">
            {buttons.map((button) => (
                <div key={button.key} onClick={() => setSelectedAnalysis(button.key)}>
                    {(selectedAnalysis === button.key) ? (
                        <button className="w-36 h-8 mt-2 px-2 border-2 text-sm bg-gray-500 hover:bg-gray-600 text-white">{button.label}</button>
                    ):(
                        <button className="w-36 h-8 mt-2 px-2 border-2 text-sm bg-gray-100 hover:bg-gray-200 text-black">{button.label}</button>
                    )}
                </div>
            ))}
            </div>
            {(selectedAnalysis === "unclassify") && (
            <div>
            <div>全会話数：{String(convData.length)}　うち回答不能と判定した会話数：{String(selectedConvs.length)}</div>
            <div className="mt-5">分類できなかった質問のリスト</div>
            <table className="w-full border border-gray-300">
                <thead>
                <tr className="bg-gray-100">
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
                    {selectedConvs.map(conv => (
                        <tr key={conv.id}>
                            <td className="text-xs px-1">{convertDate(conv.id)}</td>
                            <td className="text-xs px-1">{conv.uJapanese}</td>
                            <td className="text-xs px-1">{conv.nearestQ}</td>
                            <td className="text-sm px-1">{similarityToString(conv.similarity)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
            )}
            {(selectedAnalysis ==="FAQ") && (<div className="text-red-500">Under Construction</div>)}
            {(selectedAnalysis ==="time_series") && (<div className="text-red-500">Under Construction</div>)}
        </div>
    )
}