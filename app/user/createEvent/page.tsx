"use client"
import React from "react";
import { useState, useEffect } from "react";
import { db } from "@/firebase"
import { doc, getDoc, collection, setDoc, updateDoc, arrayUnion } from "firebase/firestore"
import { Sidebar } from "../../components/sideBar"
import {menuItems} from "../../components/menuData"
import EventOption from "../../components/eventOption"
import { Circle, CircleDot } from 'lucide-react';

export default function CreateEvent(){
    const [newEvent, setNewEvent] = useState<string>("")
    const [organization, setOrganization] = useState<string>("")
    const [events, setEvents] = useState<string[]>([])
    const [comment, setComment] = useState<string>("")
    const [selectedOptions, setSelectedOptions] = useState<string[]>(["日本語"]);
    const [other, setOther] = useState<string>("")//他言語
    const [voice, setVoice] = useState<string>("bauncer")//音声モデル
    const [model, setModel] = useState<string>("text-embedding-3-small")//embeddingモデル
    const [image, setImage] = useState<string>("AI-con_man_01.png")
    const [isEventOption, setIsEventOption] = useState<boolean>(false)

    //<EventOption />で設定する項目：UIの画像、利用期間
    const [startTime, setStartTime] = useState<string>("制限なし")//利用開始時間
    const [endTime, setEndTime] = useState<string>("制限なし")//利用終了時間
    //
    const options = ["英語", "中国語（簡体）", "中国語（繁体）", "韓国語"];
    const otherOptions = ["その他","フランス語","ポルトガル語","スペイン語"]
    const voiceList = ["bauncer", "silva"]
    const uiOptions = ["AI-con_woman_01","AI-con_man_01","AI-con_woman_02","AI-con_man_02"]

    const loadEvents = async () => {
        try {           
            const docRef = doc(db, "Users", organization)
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data()
                setEvents(data.events)
            } else {
                alert("ログインから始めてください")
            }
        } catch (error) {
            console.log(error)
        }
    }

    const judgeNewEvent = () => {
        if (!newEvent){
            alert("イベント名が記入されていません")
            console.log("イベント名が記入されていません")
            return false
        } else if (!events){
            return true
        } else if (events.includes(newEvent)){
            alert("既に同じ名前のイベントが登録されています")
            console.log("既に同じ名前のイベントが登録されています")
            return false
        } else if (selectedOptions.length == 0){
            alert("使用する言語を選択してください")
            console.log("使用する言語を選択してください")
            return false
        } else if (voice == ""){
            alert("AIボイスを選択してください")
            console.log("AIボイスを選択してください")
            return false
        } else if (startTime == ""){
            alert("利用開始日時を登録してください")
            return false
        } else if (endTime == ""){
            alert("利用終了日時を登録してください")
            return false
        } else {
            return true
        }
    }

    const randomStr = (length) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    const registerEvent = async () => {
        const judge = judgeNewEvent()
        const code = randomStr(4)
        console.log(judge)
        if (judge){
            try {
            const id = organization + "_" + newEvent
            const data = {
                organization: organization,
                event: newEvent,
                languages: selectedOptions,
                voice: voice,
                startTime: startTime,
                endTime: endTime,
                embedding: model,
                image:image,
                qaData: false,
                code: code
            }
            
                const eventRef = collection(db, "Events")
                await setDoc(doc(eventRef, id), data)
        
                const usersRef = collection(db, "Users")
                await updateDoc(doc(usersRef, organization), {events: arrayUnion(newEvent)})
                setComment("データ登録完了しました")
            } catch (error) {
                setComment("データ登録時にエラーが発生しました")
        }
        } else {
            alert("設定値を見直してください")
        }
    }

    // 選択されたオプションを管理する状態（配列）


    // オプションがクリックされたときのハンドラー
    const handleOptionClick = (option: string) => {
        setSelectedOptions((prev) => {
        if (prev.includes(option)) {
            // すでに選択されている場合は削除
            return prev.filter((item) => item !== option);
        } else {
            // 選択されていない場合は追加
            return [...prev, option];
        }
        });
    };

    const selectVoice =(e) => {
        setVoice(e.target.value)
    }

    const selectOtherLanguage = (e) => {
        if (e.target.value == "その他"){
            return
        }
        setSelectedOptions((prev) => {
            if (prev.includes(e.target.value)) {
                // すでに選択されている場合は削除
                return prev.filter((item) => item !== e.target.value);
            } else {
                // 選択されていない場合は追加
                return [...prev, e.target.value];
            }
        })
    }

    const pageReload = () => {
        window.location.reload()
    }

    const toggleState = () => {
        setIsEventOption((prev) => !prev); // 現在の状態を反転させる
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const value = sessionStorage.getItem('user');
            const org = sessionStorage.getItem("user")
            console.log("user", org)
            setOrganization(org)
          }
    }, [])
    
    useEffect(() => {
        loadEvents()
    },[organization])

    useEffect(() => {
        console.log(events)
    },[events])

    useEffect(() => {
        console.log(newEvent)
    },[newEvent])

    useEffect(() => {
        console.log(comment)
    },[comment])

    useEffect(() => {
        console.log(image)
    },[image])

    return (
        <div className="flex">
        <div>
            <Sidebar menuItems={menuItems} />
        </div>
        <div className="ml-64 p-8 w-full">
            <div>
            <div className="font-bold text-xl my-3">イベント（Q&Aデータセット）の新規作成</div>
            <div className="text-base font-semibold text-gray-700">ステップ１: イベント（Q&Aデータセット名）を入力</div>
            <input className="w-2/3 rounded-md px-4 py-2 bg-inherit border mt-2 mb-6 border-lime-600"
                name="event"
                placeholder="新規イベント名"
                value={newEvent}
                onChange={(e) => setNewEvent(e.target.value)}
                />
            </div>
            <div className="text-base font-semibold text-gray-700">ステップ２: イベント基本設定</div>
            <div className="text-xs text-red-600">（イベント登録時のみ設定できる項目です。ステップ３の「イベントオプション設定」は何度でも変更可能です。）</div>
            <div className="font-semibold text-sm ml-3 mt-5">対応言語（日本語はデフォルト）</div>
            <div className="flex flex-row gap-x-4">
            {options.map((option) => (
                <div
                key={option}
                className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-3 rounded"
                onClick={() => handleOptionClick(option)}
                >
                {/* 選択されている場合は CircleDot、それ以外は Circle を表示 */}
                {selectedOptions.includes(option) ? <CircleDot className="w-4 h-4 text-blue-500" /> : <Circle className="w-4 h-4 text-gray-400" />}
                <span className="ml-2 text-gray-700 text-sm">{option}</span>
                </div>
            ))}
            <select className="mx-8 my-3 w-20 h-4 text-xs text-center" value={other} label="other" onChange={selectOtherLanguage}>
            {otherOptions.map((name) => {
            return <option key={name} value={name}>{name}</option>;
            })}
            </select>
            </div>

            {/* 選択されたオプションを表示 */}
            <div className="w-2/3 ml-3 mt-1 p-2 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">
                選択した言語: {selectedOptions.join(', ') || 'None'}
                </p>
            </div>
            <div className="font-semibold mt-5 text-sm ml-3">AIボイス</div>
            <select className="my-3 w-48 h-8 text-sm text-center border-2 mb-6" value={voice} label="other" onChange={selectVoice}>
            {voiceList.map((name) => {
            return <option key={name} value={name}>{name}</option>;
            })}
            </select>
            <div className="flex flex-row gap-x-4">
            <div className="text-base font-semibold text-gray-700">ステップ３: イベントオプション設定  </div>
            {!isEventOption && (
                <button className="text-sm px-2 border-2 bg-slate-200 rounded" onClick={toggleState} >オプション入力</button>
            )}
            </div>
            <div className="text-xs text-red-600">（イベント設定後でも設定・修正できる項目です）</div>        
            {isEventOption && (
                <EventOption organization={organization} image={image} setImage={setImage} setStartTime={setStartTime} setEndTime={setEndTime}/>
            )}
                       
            <div className="flex flex-row gap-x-4">
            <button className="h-10 mt-10 px-2 border-2 rounded" onClick={pageReload}>キャンセル</button>
            <button className="h-10 mt-10 px-2 border-2 bg-amber-200 rounded" onClick={() => registerEvent()} >新規イベント登録</button>
            </div>
            <div className="mt-3">{comment}</div>
        </div>
        </div>
    )
}

/*

    <div className="font-semibold text-sm ml-3 mt-5">AIコン画像</div>
    <div className="flex flex-row gap-x-4">
    {options.map((option) => (
        <div
        key={option}
        className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-3 rounded"
        onClick={() => handleOptionClick(option)}
        >

        {selectedOptions.includes(option) ? <CircleDot className="w-4 h-4 text-blue-500" /> : <Circle className="w-4 h-4 text-gray-400" />}
        <span className="ml-2 text-gray-700 text-sm">{option}</span>
        </div>
    ))}
    <select className="mx-8 my-3 w-20 h-4 text-xs text-center" value={other} label="other" onChange={selectOtherLanguage}>
    {otherOptions.map((name) => {
    return <option key={name} value={name}>{name}</option>;
    })}
    </select>
    </div>
*/