"use client"
import React from "react";
import { useState, useEffect } from "react";
import { db } from "@/firebase"
import { doc, getDoc, getDocs, collection, setDoc, deleteDoc } from "firebase/firestore"
import {Sidebar} from "../../components/sideBar"
import {menuItems} from "../../components/menuData"

export default function DeleteQA(){
    const [events, setEvents] = useState<string[]>([""]) //firestoreから読み込む
    const [event, setEvent] = useState<string>("")
    const [organization, setOrganization] = useState<string>("")
    const [isInitialize, setIsInitialize] = useState<boolean>(false)
    const [status, setStatus] = useState<string>("")

    const loadEvents = async () => {
        if (organization){
            try {
                const docRef = doc(db, "Users", organization)
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
    }

    const confirmEventStatus = async () => {
        if (event){
            try {
                const id = organization + "_" + event
                const docRef = doc(db, "Events", id)
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data()
                    if (data.qaData){
                        const overwrite = confirm(`${event}のQAデータを初期化しますか？`)
                        if (overwrite){
                            setIsInitialize(true)
                        }
                    } else {
                        alert("QAデータは初期化されています")
                    }
                }
            } catch (error) {
                console.log(error)
                console.log("イベントデータ取得に失敗しました")
            }
        }
    }
    
    const pageReload = () => {
        window.location.reload()
    }

    const initializeQA = async () => {
        if (event){
            try {
                const eventId = organization + "_" + event
                const qadbRef = collection(db, "Events", eventId, "QADB")
                const querySnapshot = await getDocs(qadbRef)
                for (const document of querySnapshot.docs) {
                    const docRef = doc(db, "Events", eventId, "QADB", document.id);
                    await deleteDoc(docRef);
                }
                const data = {
                    qaData:false
                }
                await setDoc(doc(db, "Events", eventId), data, {merge:true})
                setStatus(`${event}のQAデータ初期化を完了しました`)
            } catch (error) {
                console.log(error)
            }
        }
    }

    const selectEvent = (e) => {
        setEvent(e.target.value);
        console.log(e.target.value);
    }

    useEffect(() => {
        if (event){
            confirmEventStatus()
        }
    },[event])

    useEffect(() => {
        loadEvents()
    },[organization])

    useEffect(() => {
        const org = sessionStorage.getItem("user")
        console.log(org)
        setOrganization(org)
    },[])

    return (
        <div className="flex">
        <div>
            <Sidebar menuItems={menuItems}  />
        </div>
        <div className="ml-64 p-8 w-full">
            <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
            <div className="font-bold text-xl">Q&Aデータの初期化</div>
            <div className="text-base">QAデータを初期化するイベントを選択</div>
            <select className="my-3 w-48 h-8 text-center border-2 border-lime-600" value={event} label="event" onChange={selectEvent}>
            {events.map((name) => {
            return <option key={name} value={name}>{name}</option>;
            })}
            </select>
            {isInitialize && (
                <div className="flex flex-row gap-x-4">
                    <button className="h-10 my-10 px-2 border-2" onClick={pageReload}>キャンセル</button>
                    <button className="h-10 my-10 px-2 border-2 bg-amber-200" onClick={() => initializeQA()}>QAデータを初期化</button>                                    
                </div>
            )}
            </div>
            <div className="text-lime-500 mt-5 ml-3">{status}</div>                
        </div>
        </div>
    )
}