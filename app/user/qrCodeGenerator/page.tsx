'use client';
import { useState, useEffect, useRef } from 'react';
import {QRCodeCanvas} from 'qrcode.react'
import { db } from "@/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { toJpeg } from 'html-to-image';
import { Circle, CircleDot } from 'lucide-react'

const hostUrl = process.env.NEXT_PUBLIC_HOST_URL;

export default function DownloadableQRCode(){
    const [events, setEvents] = useState<string[]>([""]) //firestoreから読み込む
    const [event, setEvent] = useState<string>("")
    const [organization, setOrganization] = useState<string>("")
    const [code, setCode] = useState<string>("")
    const [url, setUrl] = useState<string|null>(null)
    const [status, setStatus] = useState<string>("")
    const [selectedOption, setSelectedOption] = useState<string>("音声認識（標準）")
    const qrCodeRef = useRef(null);
    const size:number = 144

    const options = ["音声認識（標準）", "音声認識（AZURE）"];

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
                    if (data.qaData){
                        setCode(data.code)
                    }else{
                        alert("イベントにQ&Aデータが登録されていません")
                        setEvent("")
                    }                   
                }
            } catch (error) {
                console.log(error)
            }
        } else {
            alert("イベントを選択してください")
        }
    }

    const downloadQRAsJPG = () => {
        if (qrCodeRef.current) {
        toJpeg(qrCodeRef.current, { quality: 0.95 })
            .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = 'qrcode.jpg';
            link.href = dataUrl;
            link.click();
            })
            .catch((err) => {
            console.error('QRコードの変換に失敗しました:', err);
            });
        }
    };

    const selectEvent = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEvent(e.target.value);
        loadEventData(e.target.value)
    }

    const randomStr = (length: number) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    const setNewEventCode = async () => {
        const nCode = randomStr(4)
        const eventId = organization + "_" + event
        try {
            await setDoc(doc(db,"Events",eventId), {code:nCode}, {merge:true})
            setCode(nCode)
            setStatus("イベントコードの変更が完了しました")
        } catch (error){
            console.log(error)
            alert("codeの更新に失敗しました")
        }
    }


    useEffect(() => {
        /*
        if (code!=="" && selectedOption === "音声認識（標準）"){
            const eventUrl = `${hostUrl}aicon/chat2?attribute=${organization}_${event}&code=${code}`
            setUrl(eventUrl)
        } else if (code!=="" && selectedOption === "音声認識（AZURE）") {
            const eventUrl = `${hostUrl}aicon/chat?attribute=${organization}_${event}&code=${code}`
            setUrl(eventUrl)
        }
        */
        if (code!=="") {
            const eventUrl = `${hostUrl}aicon/chat?attribute=${organization}_${event}&code=${code}`
            setUrl(eventUrl)
        }
    }, [code])

    /*
    useEffect(() => {
        if (code!=="" && selectedOption === "音声認識（標準）"){
            const eventUrl = `${hostUrl}aicon/chat2?attribute=${organization}_${event}&code=${code}`
            setUrl(eventUrl)
        } else if (code!=="" && selectedOption === "音声認識（AZURE）") {
            const eventUrl = `${hostUrl}aicon/chat?attribute=${organization}_${event}&code=${code}`
            setUrl(eventUrl)
        }
    }, [selectedOption])
    */

    useEffect(() => {
        const org = sessionStorage.getItem("user")
        if (org){
            setOrganization(org)
            loadEvents(org)
        }
    },[])

  
    return (
        <div className="flex-1 flex flex-col justify-center gap-2">
        <div className="font-bold text-xl">QRコード生成</div>
        <div className="text-base mt-5">イベントを選択</div>
            <select className="mb-8 w-48 h-8 text-center border-2 border-lime-600" value={event} onChange={selectEvent}>
            {events.map((name) => {
            return <option key={name} value={name}>{name}</option>;
            })}
            </select>


        {url && (
            <div>
            <div className="mb-10 w-1/2"><a className="text-indigo-700" href={url}  target="_blank" rel="noreferrer">{url}</a></div>
            <div 
            ref={qrCodeRef} 
            className="w-60 py-5 px-12 bg-white"
        >

            <QRCodeCanvas value={url} size={size} level="H"/>

            </div>
            </div>
        )}

            <div className="flex flex-row gap-x-4">
            <button onClick={downloadQRAsJPG} className="mt-10 px-2 py-1 text-sm bg-amber-300 rounded hover:bg-amber-400">ダウンロード</button>
            <button onClick={setNewEventCode} className="ml-2 mt-10 px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">イベントコード変更</button>
            </div>
            <div className="text-green-500 font-semibold mt-5">{status}</div>
        
        </div>
    );
};

/*
<div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
            style={{ display: 'inline-block' }}
*/