"use client"
import React from "react";
import { useState, useEffect } from "react";
import { db } from "@/firebase"
import { doc, getDoc, collection, getDocs } from "firebase/firestore"
import {Sidebar} from "../../components/sideBar"

export default function QAList(){
    const [events, setEvents] = useState<string[]>([""]) //firestoreから読み込む
    const [event, setEvent] = useState<string>("")
    const [organization, setOrganization] = useState<string>("")
    const [eventData, setEventData] = useState({})
    const [qaData, setQaData] = useState([])

    const loadEvents = async () => {
        try {
            const org = sessionStorage.getItem("user")
            setOrganization(org)
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
            alert("データベースエラー")
        }
    }

    const loadQADB = async () => {
        const id = organization + "_" + event
        const querySnapshot = await getDocs(collection(db, "Events", id, "QADB"));
        const qa = []
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            const qadata = {
                id: doc.id,
                question:data.question,
                answer:data.answer,
                modalFile:data.modalFile,
                modalUrl:data.modalUrl,
                voiceId:data.voiceId,
                foreign:data.foreign.toString() || null,
                vector:data.vector
            }
            qa.push(qadata)
          })
          setQaData(qa)
    }

    const loadEventData = async () => {
        if (event){
            try {
                const id = organization + "_" + event
                const docRef = doc(db, "Events", id)
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data()
                    setEventData(data)
                }
            } catch (error) {
                console.log("イベントデータ取得に失敗しました")
            }
        }
    }

    const selectEvent = (e) => {
        setEvent(e.target.value);
        console.log(e.target.value);
    }

    useEffect(() => {
        console.log(qaData)
    }, [qaData])

    useEffect(() => {
        loadQADB()
    },[eventData])

    useEffect(() => {
        loadEventData()
    },[event])

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
            <div className="font-bold text-xl">Q&Aデータ内容確認</div>
            <div className="flex flex-row gap-x-4">
                <div className="my-4 text-base">イベント名：</div>
                <select className="my-3 w-48 h-8 text-center border-2 border-lime-600" value={event} label="event" onChange={selectEvent}>
                {events.map((name) => {
                return <option key={name} value={name}>{name}</option>;
                })}
                </select>
            </div>

            </div>
        </div>
        </div>
    )
}