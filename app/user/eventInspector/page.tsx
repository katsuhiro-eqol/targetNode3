"use client"
import React from "react";
import { useState, useEffect, useMemo } from "react";
import { db } from "@/firebase"
import { doc, getDoc, collection, query, getDocs, orderBy, limit, deleteDoc, getCountFromServer, startAfter, setDoc, where } from "firebase/firestore"
import { ConvData } from "@/types"
import { constants } from "fs";

type Cursor = { date: string } | null

interface CData {
    id:string;
    userNumber:string;
    language:string;
    question:string;
    uJapanese:string;
    nearestQ:string;
    similarity:number;
    answer:string;
    unanswerable:boolean;
}

export default function EventInspector(){
    const [events, setEvents] = useState<string[]>([""]) //firestoreから読み込む
    const [event, setEvent] = useState<string>("")
    const [organization, setOrganization] = useState<string>("")
    const [convData, setConvData] = useState<CData[]>([])
    const [totalCount, setTotalCount] = useState<number>(0)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [page, setPage] = useState<number>(1)
    const [cursors, setCursors] = useState<Cursor[]>([])
    const [selectedAnalysis, setSelectedAnalysis] = useState<string>("")
    const [convCount, setConvCount] = useState<number>(0)

    const PAGE_SIZE = 10
    
    const columns = [
        { key: 'id', label: 'id' },
        { key: 'userNumber', label: 'userNumber' },
        { key: 'language', label: 'language' },
        { key: 'question', label: 'q' },
        { key: 'uJapanese', label: 'q (JP)' },
        { key: 'nearestQ', label: 'nearestQ' },
        { key: 'similarity', label: 'similarity' },
        { key: 'answer', label: 'a (JP)' }
    ]

    const buttons = [
        { key: 'all', label: '全会話閲覧'}
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

    const loadConvData = async (event:string, page:number) => {
        //cursorsに前pageの情報があるかどうか確認し、なければ生成する
        const knownPrevCursor = page > 1 ? cursors[page - 2] : null
        //cursorsに記録された最後のindexをbasseIndexとする
        let baseIndex = -1
        if (!knownPrevCursor && page > 1) {
            for (let i = page - 2; i >= 0; i--) {
              if (cursors[i]) {
                baseIndex = i; // i は「ページ(i+1)の最後尾カーソル」
                break;
              }
            }
        }

        let currentPage = baseIndex + 2; // cursorを取得するための変数。初期値がこれ
        let lastCursor = baseIndex >= 0 ? cursors[baseIndex]! : null;
        const nextCursors = [...cursors];

        //目標ページの前ページまでのcursor(最後のdate情報)を取得する
        const eventId = organization + "_" + event
        const convRef = collection(db,"Events",eventId, "Conversation")
        let q = query(convRef, orderBy("date", "desc"), limit(PAGE_SIZE))

        while (currentPage <= page) {
            if (currentPage > 1){
                if (!lastCursor){
                    throw new Error("Missing cursor while walking pages")
                }
                q = query(
                    convRef,
                    orderBy("date", "desc"),
                    startAfter(lastCursor.date),
                    limit(PAGE_SIZE)
                );
            }
            const querySnapshot = await getDocs(q)
            const lastDoc = querySnapshot.docs.at(-1);
            const pageCursor:Cursor = lastDoc ? {date: lastDoc!.data().date} : null
            nextCursors[currentPage - 1] = pageCursor

            if (currentPage === page){
                const rows: CData[] = []
                let userNumber = (page-1)*10 +1
                querySnapshot.forEach((doc) => {
                    const data = doc.data()
                    const conversations = data.conversations
                    if (Array.isArray(conversations)){
                        conversations.forEach((c) => {
    
                            const con:CData = {
                                id: c.id.replace(/T/g, '\n'),
                                userNumber:`user-${userNumber}`,
                                language:data.language,
                                question:c.user,
                                uJapanese: c.uJapanese,
                                nearestQ: c.nearestQ,
                                similarity:c.similarity,
                                answer:c.aicon,
                                unanswerable:c.unanswerable
                            }
                            rows.push(con)
                        })
                    }
                    userNumber++
                })
                setConvData(rows)
                setConvCount(rows.length)
            }
            lastCursor = pageCursor;
            currentPage++;
        }
        setCursors(nextCursors)
    }    

    const selectEvent = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEvent(e.target.value);
        if (e.target.value !== ""){
            const eventId = organization + "_" + e.target.value
            const convRef = collection(db,"Events", eventId, "Conversation")
            const snapshot = await getCountFromServer(query(convRef))
            const total = snapshot.data().count
            setTotalCount(total)
            setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)))
            if (selectedAnalysis === "all"){
                await loadConvData(e.target.value, 1)
            } 
        }
    }

    const selectAnalysis = async (analysis:string) => {
        setSelectedAnalysis(analysis)
        if (analysis === "all" && event !== ""){
            await loadConvData(event, 1)
        } else if (analysis === "unanswerable"){

        }

    }

    const convertDate = (date:string) => {
        const day = date.split("T")[0]
        const time = date.split("T")[1].split(":")
        const cDate = `${day} ${time[0]}:${time[1]}`
        return cDate
    }

    const pages = useMemo(() => {
        if (totalPages>20) return Array.from({ length: 20 }, (_, i) => i + 1);
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }, [totalPages]);

    const loadPage = (page:number) => {
        loadConvData(event,page)
        setPage(page)
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
            <div className="font-bold text-xl">会話応答分析：{event}</div>
            <div className="text-base mt-5">イベントを選択</div>
            <select className="mb-8 w-96 h-8 text-center border-2 border-lime-600" value={event} onChange={selectEvent}>
            {events.map((name) => {
            return <option key={name} value={name}>{name}</option>;
            })}
            </select>

            <div className="flex flex-row gap-x-4 mb-10">
            {buttons.map((button) => (
                <div key={button.key} onClick={() => selectAnalysis(button.key)}>
                    {(selectedAnalysis === button.key) ? (
                        <button className="w-36 h-8 mt-2 px-2 border-2 text-sm bg-gray-500 hover:bg-gray-600 text-white">{button.label}</button>
                    ):(
                        <button className="w-36 h-8 mt-2 px-2 border-2 text-sm bg-gray-100 hover:bg-gray-200 text-black">{button.label}</button>
                    )}
                </div>
            ))}
            </div>
            <div>全会話スレッド(user)数（最新200スレッドまで表示可能)：　{totalCount}</div>
            <nav className="flex items-center gap-2">
            {pages.map((p) => (
            <button
                key={p}
                onClick={() => loadPage(p)}
                disabled={p === page}
                className={`text-xs my-1 px-3 py-1 rounded border ${
                p === page ? "bg-black text-white" : ""
                }`}
            >
                {p}
            </button>
            ))}
        </nav>
            {(selectedAnalysis === "all") && (
            <div>
            <div>1スレッドあたりの平均会話数：　{(convCount/10).toFixed(1)}</div>
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
                    {convData.map(conv => (
                        <tr key={conv.id} className={`border border-gray-300 ${conv.unanswerable ? "bg-yellow-200" : "bg-slate-100"}`}>
                            <td className="border border-gray-300 text-xs px-1">{conv.id}</td>
                            <td className="border border-gray-300 text-xs px-1">{conv.userNumber}</td>
                            <td className="border border-gray-300 text-xs px-1">{conv.language}</td>
                            <td className="border border-gray-300 text-xs px-1">{conv.question}</td>
                            <td className="border border-gray-300 text-xs px-1">{conv.uJapanese}</td>
                            <td className="border border-gray-300 text-xs px-1">{conv.nearestQ}</td>
                            <td className="border border-gray-300 text-xs px-1">{conv.similarity.toFixed(3)}</td>
                            <td className="border border-gray-300 text-xs px-1">{conv.answer}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
            )}
            {(selectedAnalysis ==="unanswerable") && (<div className="text-red-500">Under Construction</div>)}
            {(selectedAnalysis ==="time_series") && (<div className="text-red-500">Under Construction</div>)}
        </div>
    )
}




/*

                id:userMessage.id,
                user:userMessage.text,
                uJapanese:translatedQuestion,
                aicon:message.text,
                aJapanese: embeddingsData[index].answer,
                nearestQ:message.nearestQ,
                similarity:message.similarity


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
    */