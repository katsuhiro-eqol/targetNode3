//CSVファイルで追加
"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import UploadFiles2 from "@/app/components/uploadFiles2"
import { db } from "@/firebase"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import {registerVoice} from "@/app/func/updateWav"
import createEmbedding from "@/app//func/createEmbedding"
import validateCreatedQA from '@/app/func/verificationQA';
import {ProgressBar} from "@/app/components/progressBar"
import { ModalData, EventData, ForeignAnswers, CsvData, Pronunciation, QaData } from "@/types"
import md5 from 'md5';
import { Check} from 'lucide-react'
import Papa from 'papaparse'
//import { ParseResult } from 'papaparse'
import jschardet from 'jschardet'

//interface Voice {organization:string, event:string, answer:string, read:string, voice:string, qaId:string}
interface Read {answer:string, read:string, voiceId:string}
interface AddCSVProps {
    qaData: QaData[];
    eventData: EventData;
    organization: string;
    event: string;
}

export default function AddCSV({qaData, eventData, organization, event}:AddCSVProps) {
    const [jsonData, setJsonData] = useState<CsvData[]>([])
    const [fileType, setFileType] = useState<string>("")
    const [columns, setColumns] = useState<string[]>([])
    const [fileName, setFileName] = useState<string>("");
    const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
    const [detectedEncoding, setDetectedEncoding] = useState<string>("");
    const [selectedEncoding, setSelectedEncoding] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [modalFiles, setModalFiles] = useState<string[]>([])
    const [events, setEvents] = useState<string[]>([""]) //firestoreから読み込む
    //const [event, setEvent] = useState<string>("")
    //const [organization, setOrganization] = useState<string>("")
    const [isModal, setIsModal] = useState<boolean>(false)
    const [isReady, setIsReady] = useState<boolean>(false)
    const [modalData, setModalData] = useState<ModalData[]>([])
    //const [eventData, setEventData] = useState<EventData|null>(null)
    const [isSecondStep, setIsSecondStep] = useState<boolean>(false)
    const [isThirdStep, setIsThirdStep] = useState<boolean>(false)
    const [status, setStatus] = useState<string>("")
    const [foreignProgress, setForeignProgress] = useState<number>(0)
    const [vectorProgress, setVectorProgress] = useState<number>(0)
    const [voiceProgress, setVoiceProgress] = useState<number>(0)
    const [errors, setErrors] = useState<string>("")

    const steps = [
        { name: '外国語翻訳', progress: foreignProgress },
        { name: 'ベクトル化', progress: vectorProgress },
        { name: '音声合成', progress: voiceProgress },
    ];

    const detectDelimiter = (text:string) => {
        const firstLine = text.split('\n')[0]
        const tabCount = (firstLine.match(/\t/g) || []).length
        const commaCount = (firstLine.match(/,/g) || []).length
        return tabCount > commaCount ? '\t' : ','
    }


    const onDrop = useCallback(async (acceptedFiles:File[]) => {
        const file = acceptedFiles[0];
        
        if (file) {
          const fileExtension = file.name.split(".").pop()?.toLowerCase()||""
          setFileType(fileExtension)
          setFileName(file.name)
          setError("")
          
          const reader = new FileReader();
          reader.onload = () => {
            const buffer = reader.result as ArrayBuffer
            setFileBuffer(buffer);
            
            // 文字コードを検出
            const result = jschardet.detect(Buffer.from(new Uint8Array(buffer)));
            const encoding = result.encoding;
            console.log(encoding)
            setDetectedEncoding(encoding);
            setSelectedEncoding(encoding); // デフォルトで検出されたエンコーディングを選択
    
            // 検出されたエンコーディングでファイルを読み込む
            parseFileWithEncoding(buffer, encoding);
          };
          
          reader.readAsArrayBuffer(file);
        }
      }, []);

    const parseFileWithEncoding = (buffer: ArrayBuffer, encoding:string) => {
        try {
          const decoder = new TextDecoder(encoding, { fatal: true });
          const text = decoder.decode(new Uint8Array(buffer));
          const delimiter = detectDelimiter(text);

          Papa.parse<CsvData>(text, {
            header: true,
            delimiter: delimiter,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.errors && results.errors.length > 0) {
                console.warn('Parse warnings:', results.errors);
              }
              
              setJsonData(results.data);
              if (results.data.length > 0) {
                setColumns(Object.keys(results.data[0]));
              } else {
                setColumns([]);
              }
              setError('');
            },
          });
        } catch (error) {
          setError(`文字コードの変換中にエラーが発生しました`);
          setJsonData([]);
          setColumns([]);
        }
    }
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        accept: {
          'text/csv': ['.csv'],
          'text/tab-separated-values': ['.tsv', '.txt']
        }
    })

    const convertPronunciation = (pronunciations: Pronunciation[]|null, text:string) => {
        if (pronunciations){
            let newRead = text.trim()
            pronunciations.forEach((pronunciation) => {
               newRead = newRead?.replaceAll(pronunciation.text,pronunciation.read)
            })
            //const readByOpenAI = await getHiragana(newRead)
            return newRead
        }else{
            //const readByOpenAI = await getHiragana(text)
            return text.trim()
        }        
    }
  //音声合成し、Voiceに登録
    const readRegistration = async () => {
        const answerList = jsonData.map((item) => item.answer)
        const answerSet = new Set(answerList)
        const readings = []
        for (const answer of answerSet){
            const newRead = convertPronunciation(eventData?.pronunciations||null, answer)
            const hashString = md5(newRead)
            const voiceId = eventData?.voice + "-" + hashString            
            const data = {
                answer: answer,
                read: newRead,
                voiceId: voiceId
            }
            readings.push(data)
        }
        return readings
    }

    const voiceRegistration = async (readings:Read[]) => {
        setStatus("音声合成を準備しています")
        const answerCount = readings.length
        let n = 0
        for (const item of readings){
            //const newRead = await convertPronunciation(eventData?.pronunciations||null, answer)
            await registerVoice(organization, event, item.answer, item.read, eventData?.voice??"", item.voiceId, "")
            n += 1
            if (n>0){
                setStatus("音声合成を行っています")
            }
            const ratio = Math.floor(n*100/answerCount)
            setVoiceProgress(ratio)
        }
    }

    //EmbeddingをEventのサブコレクションQADBに登録
    const registerQADB = async (foreinAnswers:ForeignAnswers, readings:Read[]) => {
        //既存のquestionと重ならないようにする。
        const questionList = qaData.map((item) => item.question)
        const idList = qaData.map((item) => item.id)

        setStatus("ベクトル化を行っています")
        let count = 0
        for (const item of jsonData){
            if (item.id == "" || item.question=="" || item.answer==""){
                alert("id、question、answerに空欄がないようにしてください")
            } else if (questionList.includes(item.question) || idList.includes(item.id)) {
                console.log("既存のid or questionと重複", item.id, item.question)
            } else {
            try {
                const embedding = await createEmbedding(item.question, eventData.embedding)
                const ans = readings.filter((read) => read.answer === item.answer)
                let data2 = {}
                if (item.modal_file && modalData){
                    const modalList = modalData.filter((m) => m.name == item.modal_file )
                    data2 = {
                        question: item.question,
                        answer: item.answer,
                        modalFile:item.modal_file,
                        modalUrl: modalList[0].url,
                        modalPath: modalList[0].path,
                        vector: embedding,
                        voiceId: ans[0].voiceId,
                        read: ans[0].read,
                        foreign:foreinAnswers[item.answer],
                        pronunciations:[]
                    }          
                } else {
                    data2 = {
                        question: item.question,
                        answer: item.answer,
                        modalFile:"",
                        modalUrl: "",
                        modalPath: "",
                        vector: embedding,
                        voiceId: ans[0].voiceId,
                        read: ans[0].read,
                        foreign:foreinAnswers[item.answer],
                        pronunciations:[]
                    }          
                }
                const id = organization + "_" + event
                const docRef = doc(db, "Events", id, "QADB", item.id)
                await setDoc(docRef,data2, {merge:true})
                count += 1
                const ratio = Math.floor(count*100/jsonData.length)
                setVectorProgress(ratio)
                //setStatus(`ベクトル化：${ratio}%完了`)
            } catch (error) {
              console.log(error);
            }
            }
        }
    }

    const registerForeignLang = async () => {
        setStatus("外国語に翻訳しています")
        const answerList = jsonData.map((item) => item.answer)
        const answerSet = new Set(answerList)
        const languages = eventData?.languages ?? ["日本語"]
        const translateLang = languages.filter((item) => item != "日本語")
        let count = 0
        const translated:ForeignAnswers = {}
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
            count += 1
            const ratio = Math.floor(count*100/answerSet.size)
            //setStatus(`外国語翻訳：${ratio}%完了`)
            setForeignProgress(ratio)
        }
        return translated
    }

    const registerToFirestore = async () => {
        if (judgeNewQA()){
            setStatus("Q&Aデータ登録を始めます")
            const readings = await readRegistration()
            const translated = await registerForeignLang()
            await registerQADB(translated, readings)
            await voiceRegistration(readings)
            setStatus("データを検証しています")
            const comment = await validateCreatedQA(organization, event, eventData!.voice, eventData!.embedding, eventData!.languages)
            setStatus(comment)
        }
    }
  
    const pageReload = () => {
        window.location.reload()
    }

    const judgeNewQA = () => {
        const qaCount = jsonData.length
        const idL = jsonData.map((item) => item.id)
        const idList = idL.filter((item) => item != "")
        const idSet = new Set(idList)
        const qL = jsonData.map((item) => item.question)
        const qList = qL.filter((item) => item != "")
        const qSet = new Set(qList)
        const aL = jsonData.map((item) => item.answer)
        const aList = aL.filter((item) => item != "")
        if (idList.length != qaCount){
            alert("idの値に欠損があります")
            return false
        } else if (idList.length != idSet.size){
            alert("idに重複があります")
            return false
        } else if (qList.length != qaCount){
            alert("questionに欠損があります")
            return false
        } else if (qList.length != qSet.size){
            alert("questionに重複があります")
            return false
        } else if (aList.length != qaCount){
            alert("answerに欠損があります")
            return false
        } else {
            return true
        }
    }

    useEffect(() => {        //const judge = judgeNewQA()
        if (jsonData){
            const array1 = jsonData.map(item => item.modal_file)
            const array2 = array1.filter(item => item != "")
            const array3 = [...new Set(array2)]
            setModalFiles(array3)
            if (array3.length != 0){
                setIsModal(true)
                setIsThirdStep(true)
            } else if (array3.length == 0 && jsonData.length > 0) {
                setIsReady(true)               
            }
        } else {
            setJsonData([])
            alert("CSVファイルを修正して再登録してください")
        }
    }, [jsonData])

    useEffect(() => {
        if (isReady){
            setStatus("以下のステップでデータベース登録します")
        }
    }, [isReady])

    useEffect(() => {
        if (fileBuffer && selectedEncoding) {
          parseFileWithEncoding(fileBuffer, selectedEncoding);
        }
      }, [selectedEncoding]);
    
    useEffect(() => {
        //setIsThirdStep(false)
        console.log(modalData)
    }, [modalData])

    return (
            <div>
            <div className="mt-5">
            <div className="flex flex-row gap-x-4">
            <div className="text-sm font-bold">・ステップ１: 追加するCSVを登録</div>
            {(isThirdStep||isReady) && (
                <div>
                <Check className="text-green-500"/>
                </div>
            )}
            </div>
            <div className="text-red-500 text-xs ml-3">既存QAに存在するqestionは追加できません</div>
            </div>
            <div className="ml-3">
            <div 
            {...getRootProps()} 
            className={`
            p-6
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
            <p className="text-gray-600 text-sm ml-3">
            {isDragActive 
                ? 'ファイルをドロップしてください' 
                : 'ここにCSVまたはTSVファイルをドラッグ&ドロップしてください'
            }
            </p>
        </div>
        </div>

        {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
            </div>
        )}
        {(isThirdStep||isReady) && (
            <div className="text-sm text-green-500 ml-3">Q&Aデータ数: {jsonData.length}</div>
        )}
            <div className="mt-10">
            <div className="flex flex-row gap-x-4">
            <div className="text-sm font-bold">・ステップ２：添付ファイルがある場合はファイルを登録</div>
            
            {(isReady) && (
                <div><Check className="text-green-500"/>
                </div>
            )}
            </div>
            </div>
            {isThirdStep && (
                <div className="ml-3">
                <UploadFiles2 modal={modalFiles} setIsReady={setIsReady} setModalData={setModalData} organization={organization} event={event} setErrors={setErrors} />
                <div className="text-green-500 font-semibold text-sm mb-5">{errors}</div>
                </div>
            )}
            {isReady && (<div className="text-sm ml-3 text-green-500">ファイル登録完了</div>)}

            <div className="text-sm font-bold mt-10">・ステップ３：データベースに追加登録</div>
            {isReady && (
            <div className="ml-3">
            <div className="flex flex-row gap-x-4">
            <button className="h-10 my-5 px-2 border-2 rounded" onClick={pageReload}>キャンセル</button>
            <button className="h-10 my-5 px-2 border-2 bg-amber-200 rounded hover:bg-amber-300" onClick={() => registerToFirestore()}>データベースに追加</button>
            </div>
            <div className="text-green-500 font-semibold text-sm mb-5">{status}</div>
            <ProgressBar steps={steps} />
            </div>
            )}
        </div>

    );
}
