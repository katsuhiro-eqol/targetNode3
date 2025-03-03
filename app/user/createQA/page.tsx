"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {Sidebar} from "../../components/sideBar"
import UploadFiles from "../../components/uploadFiles"
import { db } from "@/firebase"
import { doc, getDoc, collection, setDoc, query, where } from "firebase/firestore"
import md5 from 'md5';

interface CsvData {
  [key: string]: string;
}
interface ModalData {
    [key: string]: string;
}

export default function RegisterCSV(props) {
    const [jsonData, setJsonData] = useState<CsvData[]>([]);
    const [error, setError] = useState<string>('');
    const [modalFiles, setModalFiles] = useState<string[]>([])
    const [events, setEvents] = useState<string[]>([""]) //firestoreから読み込む
    const [event, setEvent] = useState<string>("")
    const [organization, setOrganization] = useState<string>("")
    const [isModal, setIsModal] = useState<boolean>(false)
    const [isReady, setIsReady] = useState<boolean>(false)
    const [modalData, setModalData] = useState<ModalData[]>([])
    const [eventData, setEventData] = useState({})
    const [translatedAnswers, setTranslatedAnswers] = useState({})
    const [isSecondStep, setIsSecondStep] = useState<boolean>(false)
    const [isThirdStep, setIsThirdStep] = useState<boolean>(true)
    const [status, setStatus] = useState<string>("")
    
    const parseCsv = (csvText: string): CsvData[] => {
        try {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(header => header.trim());
        const result: CsvData[] = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = lines[i].split(',').map(value => value.trim());
            const entry: CsvData = {};
            
            headers.forEach((header, index) => {
            entry[header] = values[index] || '';
            });
            
            result.push(entry);
        }

        return result;
        } catch (error) {
        throw new Error('CSVの解析に失敗しました');
        }
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        try {
        setError('');
        const file = acceptedFiles[0];
        
        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            throw new Error('CSVファイルのみ対応しています');
        }

        const text = await file.text();
        const data = parseCsv(text);
        setJsonData(data);
        } catch (err) {
        setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
        setJsonData([]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
        'text/csv': ['.csv']
        }
    });

  //音声合成し、Voiceに登録
    const registerVoice = async () => {
        const answerList = jsonData.map((item) => item.answer)
        const answerSet = new Set(answerList)
        for (const answer of answerSet){
            try {
                const response = await fetch("/api/createAudioData", {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ answer: answer, voice: eventData.voice}),
                });
                const audio = await response.json();
                
                if (audio.status == "0"){
                    continue
                } else {
                //URLsafe Base64からの変換
                const audioString = audio.audioContent.replace(/-/g, '+').replace(/_/g, '/')
                const frame = frameCount(audioString)
                const data = {
                    id: audio.voiceId,
                    audio: audioString,
                    frame:frame,
                    answer: answer
                }
                const voiceId = audio.voiceId
                const voiceRef = doc(db, "Voice",voiceId)
                await setDoc(voiceRef,data)
            }
            } catch (error) {
            console.log(error);
            }
        }
        setStatus("40%完了")
    }

    //EmbeddingをEventのサブコレクションQADBに登録
    const registerQADB = async (foreinLang) => {
        let count = 0
        for (const item of jsonData){
            if (item.id=="" || item.question=="" || item.answer==""){
                alert("id、question、answerに空欄がないようにしてください")
            } else {
            try {
                const response = await fetch("/api/embedding", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    //body: JSON.stringify({ input: userInput, character: character, fewShot: fewShot, previousData: previousData, sca: scaList[character] }),
                    body: JSON.stringify({ input: item.question, model: eventData.embedding}),
                  });
                const embedding = await response.json()

                const hashString = md5(item.answer)
                const voiceId = eventData.voice + "-" + hashString
                
                let data2 = {}
                if (item.modal_file){
                    const modalList = modalData.filter((m) => m.name == item.modal_file )
                    data2 = {
                        question: item.question,
                        answer: item.answer,
                        modalFile:item.modal_file,
                        modalUrl: modalList[0].url,
                        modalPath: modalList[0].path,
                        vector: embedding.embedding,
                        voiceId: voiceId,
                        foreign:foreinLang[item.answer]
                    }          
                } else {
                    data2 = {
                        question: item.question,
                        answer: item.answer,
                        modalFile:"",
                        modalUrl: "",
                        modalPath: "",
                        vector: embedding.embedding,
                        voiceId: voiceId,
                        foreign:foreinLang[item.answer]
                    }          
                }
                const id = organization + "_" + event
                const docRef = doc(db, "Events", id, "QADB", item.id)
                await setDoc(docRef,data2)
                count += 1
                const ratio = Math.floor(count*60/jsonData.length) + 40
                setStatus(String(ratio) + "%のデータ登録完了済み")
            } catch (error) {
              console.log(error);
            }
            }
        }
    }

    const registerForeignLang = async () => {
        setStatus("0%完了")
        const answerList = jsonData.map((item) => item.answer)
        const answerSet = new Set(answerList)
        const languages = eventData.languages
        const translateLang = languages.filter((item) => item != "日本語")

        let translated = {}
        for (const answer of answerSet){
            translated[answer] = []
            for (const language of translateLang){
                const response = await fetch("/api/translate", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    //body: JSON.stringify({ input: userInput, character: character, fewShot: fewShot, previousData: previousData, sca: scaList[character] }),
                    body: JSON.stringify({ answer: answer, language:language}),
                  });
          
                const lang = await response.json();
                //const key = answer + "-" + language
                translated[answer].push({[language]:lang.foreign})
            }
        }
        setStatus("10%完了")
        return translated
    }

    const updateEventStatus = async () => {
        const id = organization + "_" + event
        const data = {
            qaData:true
        }
        const eventRef = doc(db, "Events", id)
        await setDoc(eventRef,data)
    }

    const registerToFirestore = async () => {
        const translated = await registerForeignLang()
        await registerVoice()
        await registerQADB(translated)
        await updateEventStatus()
        setStatus("Q&Aデータベースの登録が完了しました")
    }

    const frameCount = (base64Data) => {
        const byteCharacters = atob(base64Data)
        const bytesLength = byteCharacters.length
        const frameCount = bytesLength/2
        return frameCount
    }

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

    const loadEventData = async () => {
        if (event){
            try {
                const id = organization + "_" + event
                const docRef = doc(db, "Events", id)
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data()
                    if (data.qaData){
                        let overwrite = confirm("Q6Aデータは既に登録されています。データを上書きしますか？")
                        if (overwrite){
                            setEventData(data)
                        } else {
                            setEvent("")
                        }
                    }
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
  
    const pageReload = () => {
        window.location.reload()
    }

    useEffect(() => {
        console.log(jsonData)
        if (jsonData.length>0){
            setIsSecondStep(false)
        }
        const array1 = jsonData.map(item => item.modal_file)
        const array2 = array1.filter(item => item != "")
        const array3 = [...new Set(array2)]
        //const files = array3.toString()
        setModalFiles(array3)
        if (array3.length != 0){
            setIsModal(true)
            setIsThirdStep(true)
        } else if (array3.length == 0 && jsonData.length > 0) {
            setIsReady(true)
        }
    }, [jsonData])

    useEffect(() => {
        console.log(modalData)
        setIsThirdStep(false)
    }, [modalData])

    useEffect(() => {
        loadEventData()
        setJsonData([])
        setIsThirdStep(false)
        setIsModal(false)
        setModalData([])
    }, [event])

    useEffect(() => {
        console.log(eventData)
        setIsSecondStep(true)
    }, [eventData])

    useEffect(() => {
        console.log(translatedAnswers)
    }, [translatedAnswers])

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
            <div className="font-bold text-xl my-3">CSVファイルからQ&Aデータベースを作成</div>
            <div className="text-base">ステップ１: イベント（Q&Aデータセット名）を選択</div>
            <div className="text-xs">（未設定の場合は「イベント管理」メニューから「イベント新規登録」を行なってください）</div>
            <select className="my-3 w-48 h-8 text-center border-2 border-lime-600" value={event} label="event" onChange={selectEvent}>
            {events.map((name) => {
            return <option key={name} value={name}>{name}</option>;
            })}
            </select>
            {event && (
                <div>
            <div className="text-base">ステップ２: CSVファイルを登録</div>
            {isSecondStep && (
                <div 
                {...getRootProps()} 
                className={`
                p-8 
                text-center 
                border-2 
                border-dashed 
                rounded-lg
                cursor-pointer 
                transition-colors
                ${isDragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }
                `}
                    >
                <input {...getInputProps()} />
                <p className="text-gray-600">
                {isDragActive 
                    ? 'ファイルをドロップしてください' 
                    : 'ここにCSVファイルをドラッグ&ドロップしてください'
                }
                </p>
            </div>
            )}

                </div>
            )}

        {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
            </div>
        )}

        {isModal && (
            <div>
            <div className="py-4">データ数: {jsonData.length}</div>
            <div className="text-base">ステップ３：添付ファイルがある場合はファイルを登録</div>
            {isThirdStep && (
                <UploadFiles modal={modalFiles} setIsReady={setIsReady} setModalData={setModalData} organization={organization} event={event}/>
            )}
            
            </div>       
        )}


        {isReady && (
            <div>
            <div className="text-base">ステップ４：データベースに登録する準備ができました</div>
            <div className="flex flex-row gap-x-4">
            <button className="h-10 my-10 px-2 border-2" onClick={pageReload}>キャンセル</button>
            <button className="h-10 my-10 px-2 border-2 bg-amber-200" onClick={() => registerToFirestore()}>データベースに登録</button>
            </div>
            <div className="text-lime-500">{status}</div>
            </div>
            )}
        </div>
        </div>
        </div>
    );
}

