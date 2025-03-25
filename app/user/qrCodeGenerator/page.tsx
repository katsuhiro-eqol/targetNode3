'use client';
import { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { db } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"
import { toJpeg } from 'html-to-image';

const hostUrl = process.env.NEXT_PUBLIC_HOST_URL;

export default function DownloadableQRCode(){
    const [events, setEvents] = useState<string[]>([""]) //firestoreから読み込む
    const [event, setEvent] = useState<string>("")
    const [organization, setOrganization] = useState<string>("")
    const [code, setCode] = useState<string>("")
    const [url, setUrl] = useState<string|null>(null)
    const qrCodeRef = useRef(null);
    const size:number = 256

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
                    if (data.code){
                        setCode(data.code)
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

    useEffect(() => {
        if (code!==""){
            const eventUrl = `${hostUrl}aicon/chat?attribute=${organization}_${event}&code=${code}`
            console.log(eventUrl)
            setUrl(eventUrl)
        }
    }, [code])

    useEffect(() => {
        const org = sessionStorage.getItem("user")
        if (org){
            setOrganization(org)
            loadEvents(org)
        }
    },[])

  
    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <div className="font-bold text-xl">QRコード生成</div>
        <div className="text-base mt-5">イベントを選択</div>
            <select className="mb-8 w-48 h-8 text-center border-2 border-lime-600" value={event} onChange={selectEvent}>
            {events.map((name) => {
            return <option key={name} value={name}>{name}</option>;
            })}
            </select>
        <div className="">
        {url && (
            <div>
            <div className="mb-10 w-full"><a className="text-indigo-700" href={url}  target="_blank" rel="noreferrer">{url}</a></div>
            <div 
            ref={qrCodeRef} 
            className="ml-3 bg-white"
            style={{ display: 'inline-block' }}
        >
            <QRCode value={url} size={size} level="H"/>
            <button onClick={downloadQRAsJPG} className="ml-3 mt-10 px-2 py-1 text-sm bg-amber-300 rounded hover:bg-amber-400">ダウンロード</button>
            </div>
            </div>
        )}
        </div>
        </div>
    );
};