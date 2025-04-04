'use client';
import { useState, useEffect, useRef } from 'react';
import { db } from "@/firebase"
import { doc, getDoc, collection, getDocs, setDoc, deleteDoc } from "firebase/firestore"
import UploadFiles from "../../components/uploadFiles"
import QADataSelection from "../../components/qaDataSelection"
import { PronunciationRegistration } from "../../components/pronunciation"
import {registerVoice} from "../../functions/updateWav"
import createForeign from "../../functions/createForeign"
import createEmbedding from "../../functions/createEmbedding"
import { Circle, CircleDot, ArrowBigRight } from 'lucide-react'
import { EventData, QaData, ModalData, Pronunciation } from "@/types"
import md5 from 'md5';

const hostUrl = process.env.NEXT_PUBLIC_HOST_URL;

export default function UpdaateQA(){
    const [events, setEvents] = useState<string[]>([""]) //firestoreから読み込む
    const [event, setEvent] = useState<string>("")
    const [organization, setOrganization] = useState<string>("")
    const [eventData, setEventData] = useState<EventData|null>(null)
    const [qaData, setQaData] = useState<QaData[]>([])
    const [selectedOption, setSelectedOption] = useState<string>("")
    const [selectedButton, setSelectedButton] = useState<string>("")
    const [searchText, setSearchText] = useState<string>("")
    const [searchedData, setSearchedData] = useState<QaData[]|null>(null)
    const [selectedRowId, setSelectedRowId] = useState<string|null>(null)
    const [selectedQA, setSelectedQA] = useState<QaData|null>(null)
    const [newQuestion, setNewQuestion] = useState<string>("")
    const [newAnswer, setNewAnswer] = useState<string>("")
    const [newModal, setNewModal] = useState<string>("")
    const [modalFiles, setModalFiles] = useState<string[]|null>(null)
    const [modalData, setModalData] = useState<ModalData[]|null>(null)
    const [newRead, setNewRead] = useState<Pronunciation[]|null>(null)
    const [pronunciations, setPronunciations] = useState<Pronunciation[]|null>([])
    const [isNewPronunciation, setIsNewPronunciation] = useState<boolean>(false)
    const [isReady, setIsReady] = useState<boolean>(false)
    const [status, setStatus] = useState<string>("")
    const options = ["id", "question", "answer", "modal_file"];

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

    const judgeQADB = async (Event:string) => {
        if (Event){
            try {
                const id = organization + "_" + Event
                const docRef = doc(db, "Events", id)
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data()
                    if (data.qaData){
                        setEvent(Event)     
                    } else {
                        alert("このイベントはQ&Aデータ未登録です")
                    }
                }
            } catch (error) {
                console.log(error)
            }
        } else {
            alert("イベントを選択してください")
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
                    const data3 = {
                        image: data.image,
                        languages: data.languages,
                        voice: data.voice,
                        embedding: data.embedding,
                        qaData: data.qaData,
                        code:data.code,
                        pronunciations:data.pronunciation
                    }
                    setEventData(data3)
                    
                }
            } catch (error) {
                console.log(error)
            }
        } else {
            alert("イベントを選択してください")
        }
    }

    const loadQADB = async () => {
        if (event){
            const id = organization + "_" + event
            const querySnapshot = await getDocs(collection(db, "Events", id, "QADB"));
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
                    vector:vector,
                    read:data.read,
                    pronunciations:data.pronunciations
                }
                qa.push(qadata)
            })
            qa.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id));
            setQaData(qa)
        }
    }

    const buttons = [
        { key: 'modify', label: 'Q&A更新'},
        { key: 'modal', label: '添付書類更新'},
        { key: 'read', label: '読み修正'},
        { key: 'add', label: 'Q&A追加'},
        { key: 'delete', label: 'Q&A削除'}
    ]

    const cancelButton = () => {
        setSelectedRowId(null)
        setSelectedQA(null)
        setSearchedData(null)
        setNewQuestion("")
        setNewAnswer("")
        setSelectedOption("")
        setSearchText("")
        setModalData([])
        setModalFiles(null)
        setNewModal("")
        setPronunciations([])
        setIsNewPronunciation(false)
    }

    const selectEvent = (e: React.ChangeEvent<HTMLSelectElement>) => {
        judgeQADB(e.target.value)
    }

    const searchQA = () => {
        switch (selectedOption) {
            case "":
                alert("検索項目を選択してください")
                break;
            case "id":
                const searched_id = qaData.filter((item) => item.id == searchText)
                setSearchedData(searched_id)
                break;
            case "question":
                const searched_q = qaData.filter((item) => item.question.includes(searchText))
                setSearchedData(searched_q)                
                break;
            case "answer":
                const searched_a = qaData.filter((item) => item.answer.includes(searchText))
                setSearchedData(searched_a)         
                break;
            case "modal_file":
                const searched_mf = qaData.filter((item) => item.modalFile.includes(searchText))
                setSearchedData(searched_mf)   
                break;
            default:
                console.log("selectedOtionエラー")
                break;
        }
    }

    const updateQA = async () => {
        if ((newAnswer !== ""&& newQuestion !== "") && selectedQA){
            setStatus("音声合成の準備をしています・・・")
            const readText = convertPronunciation(eventData!.pronunciations, newAnswer)
            const foreign = await createForeign(newAnswer, eventData!.languages)
            const foreignAns = foreign[newAnswer]
            const hashString = md5(readText)
            const voiceId = eventData!.voice + "-" + hashString
            const embedding = await createEmbedding(newQuestion,eventData!.embedding)
            const eventId = organization + "_" + event
            const qaId = selectedQA.id
            await registerVoice(organization, event, newAnswer, readText, eventData!.voice, qaId)
            const data = {
                question:newQuestion,
                answer:newAnswer,
                read:readText,
                foreign:foreignAns,
                voiceId:voiceId,
                vector:embedding
            }
            const docRef = doc(db, "Events", eventId, "QADB",qaId)
            await setDoc(docRef, data, {merge:true})
            setStatus("Q&Aの更新が完了しました")
            //cancelButton()
        } else if ((newQuestion === "" && newAnswer !== "") && selectedQA) {
            setStatus("音声合成の準備をしています・・・")
            const readText = convertPronunciation(eventData!.pronunciations, newAnswer)
            const foreign = await createForeign(newAnswer, eventData!.languages)
            const foreignAns = foreign[newAnswer]
            const hashString = md5(readText)
            const voiceId = eventData!.voice + "-" + hashString
            const eventId = organization + "_" + event
            const qaId = selectedQA.id
            await registerVoice(organization, event, newAnswer, readText, eventData!.voice, qaId)
            const data = {
                answer:newAnswer,
                read:readText,
                foreign:foreignAns,
                voiceId:voiceId,
            }
            const docRef = doc(db, "Events", eventId, "QADB",qaId)
            await setDoc(docRef, data, {merge:true})
            setStatus("Q&Aの更新が完了しました")
            //cancelButton()
        } else if ((newQuestion !== "" && newAnswer === "") && selectedQA){
            setStatus("ベクトル化を開始しました")
            const embedding = await createEmbedding(newQuestion,eventData!.embedding)
            const eventId = organization + "_" + event
            const qaId = selectedQA.id
            const data = {
                question:newQuestion,
                vector:embedding
            }
            const docRef = doc(db, "Events", eventId, "QADB",qaId)
            await setDoc(docRef, data, {merge:true})
            //cancelButton()
            setStatus("Q&Aの更新が完了しました")
        } else {
            alert("更新するquestion and/or anwerが入力されていません")
        }
    }

    const updateModal = async() => {
        if (modalData && selectedQA){
            const data = {
                modalFile:modalData[0].name,
                modalPath:modalData[0].path,
                modalUrl:modalData[0].url
            }
            const eventId = organization + "_" + event
            const docRef = doc(db, "Events", eventId, "QADB",selectedQA!.id)
            await setDoc(docRef, data, {merge:true})
            setStatus("添付書類の登録が完了しました")
            //cancelButton()
        } else {
            alert("更新する添付書類(modal_file)が登録されていません")
        }
    }

    const convertPronunciation = (pronunciations: Pronunciation[]|null, text:string) => {
        if (pronunciations){
            let newRead = text
            pronunciations.forEach((pronunciation) => {
               newRead = newRead?.replaceAll(pronunciation.text,pronunciation.read)
            })
            return newRead
        }else{
            return text
        }        
    }


    const updateVoice = async() => {
        const readText = convertPronunciation(pronunciations, selectedQA!.read)
        console.log(readText)
        setStatus("音声合成を開始しました")
        if (eventData && selectedQA){
            await registerVoice(organization, event, selectedQA.answer, readText, eventData.voice, selectedQA.id)
            const data = {
                read:readText,
                pronunciations:pronunciations
            }
            const eventId = organization + "_" + event
            const docRef = doc(db, "Events", eventId, "QADB", selectedQA?.id)
            await setDoc(docRef, data, {merge:true})
            setStatus("読みの更新が完了しました")
            //cancelButton()
        }
    }
        
    const addQA = async() => {
        if (newQuestion && newAnswer){
            setStatus("Q&A登録を開始しました")
            //読み補正したstringに対してvoiceIdを設定する。
            const readText = convertPronunciation(eventData!.pronunciations ||null, newAnswer)
            const hashString = md5(readText)
            const voiceId = eventData!.voice + "-" + hashString
            const foreign = await createForeign(newAnswer, eventData!.languages)
            setStatus("外国語対抗が完了しました")
            const foreignAns = foreign[newAnswer]
            const embedding = await createEmbedding(newQuestion,eventData!.embedding)
            setStatus("ベクトル化が完了しました")
            const lastId = qaData.at(-1)
            if (lastId){
                const newId = String(parseInt(lastId?.id)+1)
                const eventId = organization + "_" + event
                const docRef = doc(db, "Events", eventId, "QADB",newId)
                if (modalData){
                    const data = {
                        question:newQuestion,
                        answer:newAnswer,
                        read:readText,
                        pronunciations:[],
                        modalFile:modalData[0].name,
                        modalUrl: modalData[0].url,
                        modalPath: modalData[0].path,
                        vector:embedding,
                        foreign:foreignAns,
                        voiceId:voiceId
                    }
                    await setDoc(docRef, data)
                    setStatus("音声合成を開始しました")
                    await registerVoice(organization, event, newAnswer, readText, eventData!.voice, "") 
                    setStatus("追加Q&Aの登録が完了しました")       
                    //cancelButton()     
                } else if (newModal && !modalData) {
                    alert("添付書類が登録されていません")
                } else {
                    const data = {
                        question:newQuestion,
                        answer:newAnswer,
                        read:readText,
                        pronunciations:[],
                        modalFile:"",
                        modalUrl: "",
                        modalPath: "",
                        vector:embedding,
                        foreign:foreignAns,
                        voiceId:voiceId
                    }
                    await setDoc(docRef, data)
                    await registerVoice(organization, event, newAnswer, readText, eventData!.voice, "") 
                    setStatus("追加Q&Aの登録が完了しました")  
                    //cancelButton()
                }
            }
            
        } else {
            alert("入力不備があります")
        }
        
    }

    const deleteQA = async() => {
        if (eventData && selectedQA){
            const dQA = confirm(`本当にこのQ&A(id:${selectedQA.id})を削除しますか？`)
            if (dQA){
                const eventId = organization + "_" + event
                const docRef = doc(db, "Events", eventId, "QADB", selectedQA.id)
                await deleteDoc(docRef)
                setStatus(`Q&A(id:${selectedQA.id})の削除が完了しました`) 
                //cancelButton()
            }
        }else{
            alert("Q&Aが選択されていまさん")
        }
    }

    useEffect(() => {
        setStatus("")
    }, [selectedButton])

    useEffect(() => {
        if (newModal != ""){
            setModalFiles(Array(1).fill(newModal))
        } else {
            setModalFiles(null)
        }  
    }, [newModal])

    useEffect(() => {
        if (selectedQA){
            setPronunciations(selectedQA.pronunciations)
        }
        setStatus("")
    }, [selectedQA])

    useEffect(() => {
        const data = qaData.filter((item) => item.id == selectedRowId)
        if (data){
            setSelectedQA(data[0])
        }
    }, [selectedRowId])

    useEffect(() => {
        setStatus("")
    }, [searchedData])

    useEffect(() => {
        console.log(eventData)
    }, [eventData])

    useEffect(() => {
        if (event){
            loadQADB()
            loadEventData(event)
        }
    }, [event])

    useEffect(() => {
        const org = sessionStorage.getItem("user")
        if (org){
            setOrganization(org)
            loadEvents(org)
        }
    },[])

  
    return (
        <div>
        <div className="mb-5 font-bold text-xl">Q&Aデータの更新</div>
        <div className="text-base">・イベントを選択</div>
            <select className="mb-5 w-48 h-8 text-center border-2 border-lime-600" value={event} onChange={selectEvent}>
            {events.map((name) => {
            return <option key={name} value={name}>{name}</option>;
            })}
            </select>
        <div>・アクションを選択</div>

        <div className="flex flex-row gap-x-4">
            {buttons.map((button) => (
                <div key={button.key} onClick={() => setSelectedButton(button.key)}>
                    {(selectedButton === button.key) ? (
                        <button className="w-36 h-8 mt-2 px-2 border-2 text-sm bg-gray-500 hover:bg-gray-600 text-white">{button.label}</button>
                    ):(
                        <button className="w-36 h-8 mt-2 px-2 border-2 text-sm bg-gray-100 hover:bg-gray-200 text-black">{button.label}</button>
                    )}
                </div>
            ))}
        </div>
        
        {(event && (
        <div>
            {(selectedButton !== "add" && selectedButton !== "" ) && (
            <div>
                <div className="mt-5 text-sm">対象のQ&Aデータを下記項目で検索</div>
                <div className="flex flex-row gap-x-4">
                {options.map((option) => (
                    <div
                    key={option}
                    className="flex items-center mb-2 cursor-pointer hover:bg-gray-200 p-2 rounded"
                    onClick={() => setSelectedOption(option)}
                    >
                    {(selectedOption === option) ? <CircleDot className="w-4 h-4 text-blue-500" /> : <Circle className="w-4 h-4 text-gray-400" />}
                    <span className="ml-2 text-gray-700 text-sm">{option}</span>
                </div>
                ))}
            </div>
            <div className="flex flex-row gap-x-4">
            <input
                className="w-96 rounded px-2 bg-inherit border text-sm"
                name="search"
                placeholder="検索ワード"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                />
            <button className="bg-cyan-500 hover:bg-cyan-700 text-white ml-3 mt-3 px-2 py-1 my-2 rounded text-xs" onClick={searchQA}>検索</button>
            </div>
            {searchedData && (
            <div>
                <div className="text-sm mt-2">検索結果（修正するQ&Aを選択してください）</div>
                <QADataSelection qaData={searchedData} selectedRowId={selectedRowId} setSelectedRowId={setSelectedRowId}/>
                {(selectedQA && selectedButton === "modify") && (
                    <div>
                    <div className="flex flex-row gap-x-4">
                    <div className="w-16 ml-3 mt-2 text-sm font-semibold">question:</div>
                    <div className=" w-64 ml-2 mt-2 text-sm">{selectedQA.question}</div>
                    <ArrowBigRight className="mt-1"/>
                    <input
                        className="w-96 rounded px-2 py-1 bg-inherit border-2 text-sm"
                        name="question"
                        placeholder="変更しない場合は未入力"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-row gap-x-4">
                    <div className="w-16 ml-3 mt-2 text-sm font-semibold">answer:</div>
                    <div className="w-64 ml-2 mt-2 text-sm">{selectedQA.answer}</div>
                    <ArrowBigRight className="mt-2" />
                    <input
                        className="w-96 rounded px-2 py-1 mt-1 bg-inherit border-2 text-sm"
                        name="answer"
                        placeholder="変更しない場合は未入力"
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        />
                    </div>
                    <div className="ml-3 mt-5">
                    <div className="flex flex-row gap-x-4">
                    <button className="h-10 my-5 px-2 border-2 rounded" onClick={cancelButton}>別の変更をする</button>
                    <button className="h-10 my-5 ml-3 px-2 border-2 bg-amber-200 rounded hover:bg-amber-300"  onClick={() => updateQA()}>Q&A更新</button>
                    </div>
                    
                    </div>
                    </div>)}

                    {selectedQA && selectedButton === "modal" && (
                    <div className="ml-3">
                    <div className="text-xs text-red-500">既存のQ&Aに添付ファイル追加、あるいは追加します</div>
                    <div className="flex flex-row gap-x-4 mb-5">
                    <div className="w-16 ml-3 mt-2 text-sm font-semibold">modal_file:</div>
                    <div className=" w-32 ml-2 mt-2 text-sm">{selectedQA.modalFile}</div>
                    <ArrowBigRight className="mt-2" />
                    <input
                        className="w-96 rounded px-2 py-1 mt-1 bg-inherit border-2 text-sm"
                        name="modal_file"
                        placeholder="更新する添付ファイル名"
                        value={newModal}
                        onChange={(e) => setNewModal(e.target.value)}
                        />                   
                    </div>
                    {modalFiles && (
                        <div className="w-2/3">
                        <UploadFiles modal={modalFiles} setIsReady={setIsReady} setModalData={setModalData} organization={organization} event={event} />
                        </div>
                    )}
                    <div className="ml-3 mt-5">
                    <div className="flex flex-row gap-x-4">
                    <button className="h-10 my-5 px-2 border-2 rounded" onClick={cancelButton}>別の変更をする</button>
                    <button className="h-10 my-5 ml-3 px-2 border-2 bg-amber-200 rounded hover:bg-amber-300"  onClick={() => updateModal()}>添付書類更新</button>
                    </div>
                    </div>                    
                    
                    </div>)}

                    {(selectedQA && selectedButton === "read") && (
                    <div>
                    <div className="flex flex-row gap-x-4">
                    <div className="font-semibold mt-2 text-sm ml-3">読み登録</div>
                    <button className="px-2 ml-3 mt-1 text-xs border-2 bg-gray-200 hover:bg-gray-300" onClick={() => setIsNewPronunciation(true)}>+追加</button>
                    </div>
                    <PronunciationRegistration pronunciations={pronunciations} setPronunciations={setPronunciations} isNewPronunciation={isNewPronunciation} setIsNewPronunciation={setIsNewPronunciation} />
                    {pronunciations && (
                    <div className="ml-3 mt-5">
                    <div className="text-xs text-red-500">注意：現在の読みに対して追加で読み辞書を適用します。</div>
                    <div className="flex flex-row gap-x-4">
                    <button className="h-10 my-5 px-2 border-2 rounded" onClick={cancelButton}>別の変更をする</button>
                    <button className="h-10 my-5 ml-3 px-2 border-2 bg-amber-200 rounded hover:bg-amber-300"  onClick={() => updateVoice()}>読みを修正</button>
                    </div>
                    </div>
                    )}

                    </div>)}


                    {(selectedQA && selectedButton === "delete") && (
                    <div>
                        <div>このデータを削除しますか？</div>
                        <button className="h-10 my-5 px-2 border-2 rounded" onClick={cancelButton}>別の変更をする</button>
                        <button className="h-10 my-5 ml-3 px-2 border-2 bg-amber-200 rounded hover:bg-amber-300"  onClick={() => deleteQA()}>データ削除</button>
                    </div>)}
                </div>)}
            </div>)}

            {(selectedButton === "add") && (            
            <div className="mt-3">
            <div className="mt-2 text-xs text-red-500">idは自動で付与されます</div>
            <div className="flex flex-row gap-x-4 mt-2">
            <label className="w-24 text-sm mt-3 ml-3">question</label>
            <input
            className="w-96 rounded px-2 py-1 bg-inherit border mt-2 ml-7 text-sm"
            name="question"
            placeholder="新規登録するquestionを入力"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            />
            </div>
            <div className="flex flex-row gap-x-4">
            <label className="w-24 text-sm mt-3 ml-3">answer</label>
            <input
            className="w-96 rounded px-2 py-1 bg-inherit border ml-7 mt-2 text-sm"
            name="answer"
            placeholder="新規登録するanswerを入力"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            />
            </div>
            <div className="flex flex-row gap-x-4">
            <label className="w-24 text-sm mt-3 ml-3">添付書類</label>
            <input
            className="w-96 rounded px-2 py-1 bg-inherit border ml-7 mt-2 text-sm"
            name="answer"
            placeholder="ファイル名を入力（添付書類がある場合）"
            value={newModal}
            onChange={(e) => setNewModal(e.target.value)}
            />
            </div>            
            <div className="w-2/3">
            {modalFiles && (
            <UploadFiles modal={modalFiles} setIsReady={setIsReady} setModalData={setModalData} organization={organization} event={event} />
            )}
            </div>
            <div className="flex flex-row gap-x-4">
            <button className="h-10 my-5 px-2 border-2 rounded" onClick={cancelButton}>別の変更をする</button>
            <button className="h-10 my-5 ml-3 px-2 border-2 bg-amber-200 rounded hover:bg-amber-300"  onClick={() => addQA()}>Q&Aを追加登録</button>
            </div>
            </div>)}   
            <div className="text-green-500 font-semibold">{status}</div>
        </div>     
        ))}
        </div>
    );
};


/*
    return (
        <div className="flex">
        <div>
            <Sidebar menuItems={menuItems} />
        </div>
        <div className="ml-64 p-8 w-full">

        <div className="mb-5 font-bold text-xl">Q&Aデータの更新</div>
        <div className="text-base">・イベントを選択</div>
            <select className="mb-5 w-48 h-8 text-center border-2 border-lime-600" value={event} onChange={selectEvent}>
            {events.map((name) => {
            return <option key={name} value={name}>{name}</option>;
            })}
            </select>
        <div>・アクションを選択</div>
        <div className="flex flex-row gap-x-4">
            {buttons.map((button) => (
                <div key={button.key} onClick={() => setSelectedButton(button.key)}>
                    {(selectedButton === button.key) ? (
                        <button className="w-36 h-8 mt-2 px-2 border-2 text-sm bg-gray-500 hover:bg-gray-600 text-white">{button.label}</button>
                    ):(
                        <button className="w-36 h-8 mt-2 px-2 border-2 text-sm bg-white hover:bg-gray-100 text-black">{button.label}</button>
                    )}
                </div>
            ))}
        </div>
        {(event && (
        <div>
            {(selectedButton === "modify") && (
                <div className="mt-5">
                    <div className="flex flex-row gap-x-4">
                    {options.map((option) => (
                        <div
                        key={option}
                        className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                        onClick={() => setSelectedOption(option)}
                        >
                        {(selectedOption === option) ? <CircleDot className="w-4 h-4 text-blue-500" /> : <Circle className="w-4 h-4 text-gray-400" />}
                        <span className="ml-2 text-gray-700 text-sm">{option}</span>
                    </div>
                    ))}
                    </div>
                    <div className="flex flex-row gap-x-4">
                        <input
                            className="w-96 rounded px-2 py-1 bg-inherit border text-sm"
                            name="search"
                            placeholder="検索ワード"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            />
                        <button className="bg-cyan-500 hover:bg-cyan-700 text-white ml-3 mt-3 px-2 py-1 my-2 rounded text-xs" onClick={searchQA}>検索</button>
                    </div>
                {searchedData && (
                <div>
                <div className="text-sm">検索結果（修正するQ&Aを選択してください）</div>
                <QADataSelection qaData={searchedData} selectedRowId={selectedRowId} setSelectedRowId={setSelectedRowId}/>
                {(selectedQA) && (
                    <div>
                    <div className="flex flex-row gap-x-4">
                    <div className="w-16 ml-2 mt-1 text-xs">question:</div>
                    <div className=" w-56 ml-2 mt-1 text-xs">{selectedQA.question}</div>
                    <ArrowBigRight />
                    <input
                        className="w-96 rounded px-2 py-1 bg-inherit border-2 text-xs"
                        name="question"
                        placeholder="変更しない場合は未入力"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-row gap-x-4">
                    <div className="w-16 ml-2 mt-1 text-xs">answer:</div>
                    <div className="w-56 ml-2 mt-1 text-xs">{selectedQA.answer}</div>
                    <ArrowBigRight />
                    <input
                        className="w-96 rounded px-2 py-1 bg-inherit border-2 text-xs"
                        name="answer"
                        placeholder="変更しない場合は未入力"
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        />
                    </div>
                    </div>)}
                    </div>)}
                </div>
                )} 
            {(selectedButton === "add") && (<div>Q&A追加</div>)}   
            {(selectedButton === "modal") && (
                <div>
                <div>添付ファイル修正</div>
                </div>)}
            {(selectedButton === "read") && (<div>読み修正</div>)}
            {(selectedButton === "delete") && (<div>読み修正</div>)}
            <div className="mt-6">
            {searchedData && (
                <div>
                <div className="text-sm">検索結果（修正するQ&Aを選択してください）</div>
                <QADataSelection qaData={searchedData} selectedRowId={selectedRowId} setSelectedRowId={setSelectedRowId}/>
                {(selectedQA) && (
                    <div>
                    <div className="flex flex-row gap-x-4">
                    <div className="w-16 ml-2 mt-1 text-xs">question:</div>
                    <div className=" w-56 ml-2 mt-1 text-xs">{selectedQA.question}</div>
                    <ArrowBigRight />
                    <input
                        className="w-96 rounded px-2 py-1 bg-inherit border-2 text-xs"
                        name="question"
                        placeholder="変更しない場合は未入力"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-row gap-x-4">
                    <div className="w-16 ml-2 mt-1 text-xs">answer:</div>
                    <div className="w-56 ml-2 mt-1 text-xs">{selectedQA.answer}</div>
                    <ArrowBigRight />
                    <input
                        className="w-96 rounded px-2 py-1 bg-inherit border-2 text-xs"
                        name="answer"
                        placeholder="変更しない場合は未入力"
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-row gap-x-4">
                    <div className="w-16 ml-2 mt-1 text-xs">modal_file:</div>
                    <div className="w-56 ml-2 mt-1 text-xs">{selectedQA.modalFile}</div>
                    <ArrowBigRight />
                    <input
                        className="w-96 rounded px-2 py-1 bg-inherit border-2 text-xs"
                        name="modal_file"
                        placeholder="変更しない場合は未入力（ファイル名）"
                        value={newModal}
                        onChange={(e) => setNewModal(e.target.value)}
                        />                   
                    </div>
                    {modalFiles && (
                        <div className="w-2/3">
                        <UploadFiles modal={modalFiles} setIsReady={setIsReady} setModalData={setModalData} organization={organization} event={event} />
                        </div>
                    )}
                    
                    </div>
                )}
            </div>)}
            </div>
        </div>     
        ))}
        </div>
        </div>
    );
*/