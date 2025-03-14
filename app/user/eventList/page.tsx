"use client"
import React from "react";
import { useState, useEffect } from "react";
import { db } from "@/firebase"
import { doc, getDoc, collection, getDocs } from "firebase/firestore"
import {Sidebar} from "../../components/sideBar"
import {menuItems} from "../../components/menuData"
import EventsList from "../../components/eventsList"
import QADataList from "../../components/qADataList"
import { Event, QaData } from "@/types"

export default function EventList(){
    const [events, setEvents] = useState<string[]>([""]) //firestoreから読み込む
    const [eventsData, setEventsData] = useState<Event[]>([])
    //const [selectedRowId, setSelectedRowId] = useState(null)
    const [eventId, setEventId] = useState<string|null>(null)
    const [organization, setOrganization] = useState<string>("")
    const [qaData, setQaData] = useState<QaData[]>([])
    const [isQAData, setIsQAData] = useState<boolean>(false)


    const loadEvents = async (org:string) => {
        try {
            if (org){
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
        }
        } catch (error) {
            console.log(error)
        }
    }

    const loadEventsData = async () => {
        const esData:Event[] = []
        for (const item  of events){
            try {
                const id = organization + "_" + item
                const docRef = doc(db, "Events", id)
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data()
                    const lang = data.languages.toString()
                    const period = "開始日時：" + data.startTime + "〜  終了日時:" + data.endTime
                    const eData:Event = {
                        id: id,
                        name: item,
                        code: data.code,
                        image: data.image.name,
                        voice: data.voice,
                        languages: data.languages,
                        period: period,
                        qaData:data.qaData,
                        langString:lang
                    }
                    esData.push(eData)
                }
            } catch (error) {
                console.log(error)
            }     
        }
        setEventsData(esData)
    }

    const loadQADB = async () => {
        if (eventId){
        const querySnapshot = await getDocs(collection(db, "Events", eventId, "QADB"));
        const qa:QaData[] = []
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            const vector = data.vector.substr(0,10) + "..."
            const qadata:QaData = {
                id: doc.id,
                code:data.code,
                question:data.question,
                answer:data.answer,
                modalFile:data.modalFile,
                modalUrl:data.modalUrl,
                voiceId:data.voiceId,
                voiceUrl:data.voiceUrl,
                foreignStr:"",
                foreign:data.foreign,
                vector:vector
            }
            qa.push(qadata)
          })
          qa.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id));
          setQaData(qa)
        }
    }

    useEffect(() => {
        if (qaData.length > 0){
            setIsQAData(true)
        }
    }, [qaData])

    useEffect(() => {
        if (eventId){
            loadQADB()
        }
    }, [eventId])

    /*
    useEffect(() => {
    },[eventsData])
    */
    useEffect(() => {
        if (events){
            loadEventsData()
        }
    },[events])
/*
    useEffect(() => {
        loadEvents()
    },[organization])
*/
    useEffect(() => {
        const org = sessionStorage.getItem("user")
        if (org){
            setOrganization(org)
            loadEvents(org)
        }
    },[])

    return (
        <div className="flex">
        <div>
            <Sidebar menuItems={menuItems} />
        </div>
        <div className="ml-64 p-8 w-full">
            <div>
               <div className="font-bold text-xl my-3">イベントデータ一覧</div>
               <EventsList eventsData={eventsData} setEventId={setEventId} />
            </div>
            <div>
            {isQAData && (<QADataList qaData={qaData} />)}
            </div>
        </div>
        </div>
    )
}

/*
<EventsList eventsData={eventsData} setEventId={setEventId}/>

*/

/*
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
        console.log(3)
        console.log(eventsData)
    },[eventsData])

    useEffect(() => {
        console.log(2)
        loadEventsData()
    },[events])

    useEffect(() => {
        console.log(1)
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
*/