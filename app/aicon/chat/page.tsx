"use client"
import "regenerator-runtime";
import React from "react";
//import Head from "next/head";
import { useSearchParams as useSearchParamsOriginal } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, Send, Eraser, Paperclip, X } from 'lucide-react';
import { db } from "@/firebase";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import Modal from "../../components/modalModal"
import {Message, EmbeddingsData, EventData, Foreign} from "@/types"
type LanguageCode = 'ja-JP' | 'en-US' | 'zh-CN' | 'zh-TW' | 'ko-KR' | 'fr-FR' | 'pt-BR' | 'es-ES'

const no_sound = "https://firebasestorage.googleapis.com/v0/b/targetproject-394500.appspot.com/o/aicon_audio%2Fno_sound.wav?alt=media&token=85637458-710a-44f9-8a1e-1ceb30f1367d"

export default function Aicon() {
    const [initialSlides, setInitialSlides] = useState<string|null>(null)
    const [userInput, setUserInput] = useState<string>("")
    const [messages, setMessages] = useState<Message[]>([])
    const [eventData, setEventData] = useState<EventData|null>(null)
    const [langList, setLangList] = useState<string[]>([])
    const [dLang, setDLang] = useState<string>("日本語")//表示用言語
    const [language, setLanguage] = useState<string>("日本語")
    const [embeddingsData, setEmbeddingsData] = useState<EmbeddingsData[]>([])
    //const [attribute, setAttribute] = useState<string|null>(null)
    //wavUrl：cloud storageのダウンロードurl。初期値は無音ファイル。これを入れることによって次からセッティングされるwavUrlで音がなるようになる。
    const [wavUrl, setWavUrl] = useState<string>(no_sound);
    const [slides, setSlides] = useState<string[]|null>(null)
    const [currentIndex, setCurrentIndex] = useState<number>(0)
    const [wavReady, setWavReady] = useState<boolean>(false)
    const [record,setRecord] = useState<boolean>(false)
    const [canSend, setCanSend] = useState<boolean>(false)
    const [isModal, setIsModal] = useState<boolean>(false)
    const [modalUrl, setModalUrl] = useState<string|null>(null)
    const [modalFile, setModalFile] = useState<string|null>(null)
    const [convId, setConvId] = useState<string>("")
    const [startText, setStartText] = useState<EmbeddingsData|null>(null)


    const messagesEndRef = useRef<HTMLDivElement>(null)
    const nativeName = {"日本語":"日本語", "英語":"English","中国語（簡体）":"简体中文","中国語（繁体）":"繁體中文","韓国語":"한국어","フランス語":"Français","スペイン語":"Español","ポルトガル語":"Português"}
    const japaneseName = {"日本語":"日本語", "English":"英語","简体中文":"中国語（簡体）","繁體中文":"中国語（繁体）","한국어":"韓国語","Français":"フランス語","Español":"スペイン語","Português":"ポルトガル語"}
    
    const foreignLanguages: Record<string, LanguageCode> = {"日本語": "ja-JP","英語": "en-US","中国語（簡体）": "zh-CN","中国語（繁体）": "zh-TW","韓国語": "ko-KR","フランス語": "fr-FR","ポルトガル語": "pt-BR","スペイン語": "es-ES"}

    //const [endLimit, setEndLimit] = useState<number>(1767193199000) //2025-12-31
    const audioRef = useRef<HTMLAudioElement>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const {
        transcript,
        resetTranscript
    } = useSpeechRecognition();

    const useSearchParams = ()  => {
        const searchParams = useSearchParamsOriginal();
        return searchParams;
    }
    const searchParams = useSearchParams()
    const attribute = searchParams.get("attribute")
    const code = searchParams.get("code")

    async function getAnswer() {
        
        sttStop()
        setWavUrl(no_sound)
        setRecord(false)
        setCanSend(false)//同じInputで繰り返し送れないようにする
        setSlides(Array(1).fill(initialSlides))
        setModalUrl(null)
        setModalFile(null)

        const userMessage: Message = {
            id: Date.now().toString(),
            text: userInput,
            sender: 'user',
            modalUrl:null,
            modalFile:null,
            similarity:null
        };
        if (attribute){
            await saveMessage(userMessage, attribute)
        }
         
        
        setMessages(prev => [...prev, userMessage]);

        try {
            const response = await fetch("/api/embedding2", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ input: userInput, model: eventData?.embedding ?? "text-embedding-3-small", language: language }),
            });
            setUserInput("")
            const data = await response.json();
            if (response.status !== 200) {
                throw data.error || new Error(`Request failed with status ${response.status}`);
                }
            const similarityList = findMostSimilarQuestion(data.embedding)

            if (similarityList.similarity > 0.45){
                console.log("voiceUrl:",embeddingsData[similarityList.index].voiceUrl)
                setWavUrl(embeddingsData[similarityList.index].voiceUrl)
                const answer = setAnser(embeddingsData[similarityList.index], language)
                if (embeddingsData[similarityList.index].modalUrl){
                    const aiMessage: Message = {
                        id: Date.now().toString(),
                        text: answer,
                        sender: 'AIcon',
                        modalUrl:embeddingsData[similarityList.index].modalUrl,
                        modalFile:embeddingsData[similarityList.index].modalFile,
                        similarity:similarityList.similarity 
                    };
                    setMessages(prev => [...prev, aiMessage]);
                    if (attribute){
                        await saveMessage(aiMessage, attribute)
                    }
                } else {
                    const aiMessage: Message = {
                        id: Date.now().toString(),
                        text: answer,
                        sender: 'AIcon',
                        modalUrl:null,
                        modalFile:null,
                        similarity:similarityList.similarity 
                    };
                    setMessages(prev => [...prev, aiMessage]);
                    if (attribute){
                        await saveMessage(aiMessage, attribute)
                    }
                }
                const sl = createSlides(embeddingsData[similarityList.index].frame)
                setSlides(sl)

            }else{
                const badQuestion = embeddingsData.filter((obj) => obj.question == "分類できなかった質問")
                const n = Math.floor(Math.random() * badQuestion.length)
                setWavUrl(badQuestion[n].voiceUrl)
                const answer = setAnser(badQuestion[n], language)
                if (badQuestion[n].modalUrl){
                    const aiMessage: Message = {
                        id: Date.now().toString(),
                        text: answer,
                        sender: 'AIcon',
                        modalUrl:badQuestion[n].modalUrl,
                        modalFile:badQuestion[n].modalFile,
                        similarity:similarityList.similarity 
                    };
                    setMessages(prev => [...prev, aiMessage]);
                    if (attribute){
                        await saveMessage(aiMessage, attribute)
                    }
                } else {
                    const aiMessage: Message = {
                        id: Date.now().toString(),
                        text: answer,
                        sender: 'AIcon',
                        modalUrl:null,
                        modalFile:null,
                        similarity:similarityList.similarity 
                    };
                    setMessages(prev => [...prev, aiMessage]);
                    if (attribute){
                        await saveMessage(aiMessage, attribute)
                    }
                }                
                const sl = createSlides(badQuestion[n].frame)
                setSlides(sl)           
            }
            console.log(similarityList.similarity)
            console.log(embeddingsData[similarityList.index])
        } catch(error) {
        console.error(error);
        }
    }

    function setAnser(selectedData:EmbeddingsData, lang:string){
        if (lang === "日本語"){
            return selectedData.answer
        } else {
            const foreign = selectedData.foreign
            if (Array.isArray(foreign)){
            const foreignText = foreign.find(item => lang in item)
            return foreignText[lang]
            } else {
                return selectedData.answer
            }
        }
    }

    function cosineSimilarity(vec1:number[], vec2:number[]) {
        if (vec1.length !== vec2.length) {
          throw new Error('ベクトルの次元数が一致しません');
        }
        const dotProduct = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
        const magnitude1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
        const magnitude2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0));
        if (magnitude1 === 0 || magnitude2 === 0) {
          return 0;
        }
        return dotProduct / (magnitude1 * magnitude2);
      }
    
    function findMostSimilarQuestion(base64Data:string){
        const inputVector = binaryToList(base64Data)
        const similarities = embeddingsData.map((item, index) => ({
            index,
            similarity: cosineSimilarity(inputVector, item.vector)
          }));
        similarities.sort((a, b) => b.similarity - a.similarity);

        // 最も類似度の高いベクトルの情報を返す
        return similarities[0];
    }

    function binaryToList(binaryStr:string){
        const decodedBuffer = Buffer.from(binaryStr, 'base64')
        const embeddingsArray = new Float32Array(
            decodedBuffer.buffer, 
            decodedBuffer.byteOffset, 
            decodedBuffer.byteLength / Float32Array.BYTES_PER_ELEMENT
          )
          const embeddingsList = Array.from(embeddingsArray)
          return embeddingsList
    }

    const createSlides = (frame:number) => {
        let imageArray = []
        switch (initialSlides) {
            case "/AI-con_man_01.png":
                imageArray = ["/AI-con_man_02.png","/AI-con_man_01.png"]
                break;
            case "/AI-con_man2_01.png":
                imageArray = ["/AI-con_man2_02.png","/AI-con_man2_01.png"]
                break;
            case "/AI-con_woman_01.png":
                imageArray = ["/AI-con_woman_02.png","/AI-con_woman_01.png"]
                break;
            case "/AI-con_woman2_01.png":
                imageArray = ["/AI-con_woman2_02.png","/AI-con_woman2_01.png"]
                break;
            default:
                imageArray = Array(2).fill(initialSlides)
                break;
        }
        let imageList:string[] = []
        const n = Math.floor(frame/44100*2)+2
        console.log("n:", n)
        for (let i = 0; i<n; i++){
            imageList = imageList.concat(imageArray)
        }
        //imageList = imageList.concat(initialSlides)
        return imageList
    }

    async function loadQAData(attr:string){
        try {
            const querySnapshot = await getDocs(collection(db, "Events",attr, "QADB"));
            const qaData = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                const embeddingsArray = binaryToList(data.vector)
                const embeddingsData = {
                    vector: embeddingsArray,
                    question:data.question,
                    answer:data.answer,
                    modalUrl:data.modalUrl,
                    modalFile:data.modalFile,
                    foreign:data.foreign,
                    voiceUrl:data.voiceUrl,
                    frame:data.frame,
                    read:data.read
                }
                return embeddingsData
                })
            setEmbeddingsData(qaData)
        } catch {
            return null
        }
    }
    
    async function loadEventData(attribute:string, code:string){
        console.log("event", attribute)
        const eventRef = doc(db, "Events", attribute);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
            const data = eventSnap.data()
            const memocode = data.code
            if (memocode == code){
                const event_data:EventData = {
                    image:data.image,
                    languages:data.languages,
                    voice:data.voice,
                    embedding:data.embedding,
                    qaData:data.qaData,
                    code:data.code,
                    pronunciations:data.pronunciation
                }
                setEventData(event_data)
                setInitialSlides(data.image.url)
                setSlides(Array(1).fill(data.image.url))
                console.log(data.image.url)
                loadQAData(attribute)
            } else {
                alert("QRコードをもう一度読み込んでください")
            }
        } else {
            alert("イベントが登録されていません")
        }
    }

    const saveMessage = async (message:Message, attr:string) => {
        await updateDoc(doc(db, "Events",attr, "Conversation", convId), {conversations: arrayUnion(message)})
    }

    const createConvField = async (id:string, attr:string) => {
        await setDoc(doc(db,"Events",attr,"Conversation",id), {"conversations":[]})
    }

    const getLanguageList = () => {
        if (eventData?.languages){
            const langs = eventData.languages.map((item) => {return nativeName[item as keyof typeof nativeName]})
            setLangList(langs)
        }
    }

    const randomStr = (length:number) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    
    const talkStart = async () => {
        audioPlay()
        setWavReady(true)
        setTimeout(() => {
            if (startText){
                if (language=="日本語"){
                    const aiMessage: Message = {
                        id: Date.now().toString(),
                        text: startText.answer,
                        sender: 'AIcon',
                        modalUrl:null,
                        modalFile:null,
                        similarity:null
                    };
                    setMessages(prev => [...prev, aiMessage])
                }else{
                    //const jLang = japaneseName[language as keyof typeof japaneseName]
                    const foreign = startText.foreign
                    if (Array.isArray(foreign)){
                        const foreignText = foreign.find(item => language in item)
                        const aiMessage: Message = {
                            id: Date.now().toString(),
                            text: foreignText[language],
                            sender: 'AIcon',
                            modalUrl:null,
                            modalFile:null,
                            similarity:null
                        };
                        setMessages(prev => [...prev, aiMessage])   
                    }                     
                }               
                setWavUrl(startText.voiceUrl)   
                const sl = createSlides(startText.frame)
                setSlides(sl)            
            }
        }, 1500);
    }

    const audioPlay = () => {
        if (audioRef){
        audioRef.current?.play().catch((error) => {
            console.log(error)
        })
        }
        setCurrentIndex(0)
    
    }

    const inputClear = () => {
        sttStop()
        setUserInput("")
    }

    const sttStart = () => {
        setUserInput("")
        setRecord(true)
        const langCode = foreignLanguages[language] || "ja-JP"
        SpeechRecognition.startListening({language:langCode})
    }

    const sttStop = () => {
        setRecord(false)
        SpeechRecognition.stopListening()
    }

    const selectLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const lang = e.target.value
        setDLang(lang)
        const jLang = japaneseName[lang as keyof typeof japaneseName]
        setLanguage(jLang);
    }

    const closeApp = () => {
        window.location.reload()
    }

    useEffect(() => {
        return () => {
            if (intervalRef.current !== null){
                clearInterval(intervalRef.current);
                intervalRef.current = null// コンポーネントがアンマウントされたらタイマーをクリア
            }
            resetTranscript()
        };
    },[])


    useEffect(() => {
        if (attribute && code){
            loadEventData(attribute, code)
            const now = new Date().toJSON()
            const today = now.split("T")[0]
            const random = randomStr(6)
            
            const convId = `${today}-${random}`
            console.log(convId)
            if (convId){
                setConvId(convId)
                createConvField(convId, attribute)
            }
                
        }        
    }, [attribute, code])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, [messages]);

    useEffect(() => {
        if (eventData){
            getLanguageList()
            //setInitialSlides(eventData?.image.url)
            
        }
    }, [eventData])
    
    useEffect(() => {
        const sText = embeddingsData.filter((item) => item.question === "最初の挨拶")
        if (sText.length>0){
            setStartText(sText[0])
        }
    }, [embeddingsData])

    //20240228ヴァージョンはアニメーション省略なのでwavUrlが更新されたらaudioPlayする
    /*
    useEffect(() => {
        if (wavUrl != no_sound ){
            console.log("check1")
        audioPlay()
        setCurrentIndex(0)
        if (Array.isArray(slides) && slides.length !== 1){
            if (intervalRef.current !== null) {//タイマーが進んでいる時はstart押せないように//2
                console.log("check2")
                return;
            }
            console.log("check3")
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % (slides.length))
            }, 250)

        } else {
            console.log("isArray",Array.isArray(slides))
            console.log("slides",slides)
            console.log("check4")
        }   
    }
    }, [wavUrl])
    */

    useEffect(() => {
        if (Array.isArray(slides) && slides.length>1 && wavUrl!= no_sound){
            audioPlay()
            setCurrentIndex(0)
            if (intervalRef.current !== null) {//タイマーが進んでいる時はstart押せないように//2
                console.log("check2")
                return;
            }
            console.log("check3")
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % (slides.length))
            }, 250)

        }
    }, [slides])

    useEffect(() => {
        if (Array.isArray(slides)){
            if (currentIndex === slides.length-2 && currentIndex != 0){
                const s = initialSlides
                setCurrentIndex(0)
                setWavUrl(no_sound)
                setSlides(Array(1).fill(initialSlides))
                if (intervalRef.current !== null){
                    clearInterval(intervalRef.current);
                    intervalRef.current = null
                }
                /*
                if (modalUrl){
                    setIsModal(true)
                } 
                */
            }
        }
    }, [currentIndex]);


    useEffect(() => {
        setUserInput(transcript)
    }, [transcript])

    useEffect(() => {
        if (userInput.length !== 0){
            setCanSend(true)
        } else {
            setCanSend(false)
        }
    }, [userInput])

    return (
        <div>
        {wavReady ? (
        <div className="fixed inset-0 flex flex-col items-center h-full bg-stone-200">
            <div className="flex-none h-[40vh] w-full max-w-96 mb-5">
                {Array.isArray(slides) && (<img className="mx-auto h-[40vh] " src={slides[currentIndex]} alt="Image" />)}
            </div>
            <div className="flex-none h-[42vh] w-11/12 max-w-96 overflow-auto">
            {messages.map((message) => (
                <div 
                    key={message.id} 
                    className={`mb-2 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div 
                    className={`max-w-xs p-3 rounded-lg ${
                        message.sender === 'user' 
                        ? 'bg-blue-500 text-white rounded-br-none text-xs' 
                        : 'bg-yellow-50 rounded-bl-none shadow text-xs'
                    }`}
                    >
                    <div className="flex flex-row gap-x-4 justify-center">
                    <p>{message.text}</p>
                    {message.modalUrl && <Paperclip size={20} className="text-green-500" onClick={() => {setIsModal(true); setModalUrl(message.modalUrl); setModalFile(message.modalFile)}} />}
                    </div>
                    {isModal && (<Modal setIsModal={setIsModal} modalUrl={modalUrl} modalFile={modalFile} />)}
                    </div>
                </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex-none h-[18%] w-full max-w-96">
            <div className="mt-2">
            <textarea className="block w-5/6 max-w-96 mx-auto mb-2 px-2 py-2 text-xs"
                name="message"
                placeholder="質問内容(question)"
                rows={2}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
            />
            <div  className="flex flex-row gap-x-4 justify-center">
            {!record ?(     
                <button className="flex items-center mr-5 mx-auto border-2 border-sky-600 p-2 text-sky-800 bg-white text-xs rounded" disabled={!wavReady} onClick={sttStart}>
                <Mic size={16} />
                音声入力(mic)
                </button>
            ):(
                <button className="flex items-center mr-5 mx-auto text-xs border-2 bg-pink-600 text-white p-2 rounded" onClick={inputClear}>
                <Eraser size={16} />
                クリア(clear)
                </button>)}
            {canSend ? (
                <button className="flex items-center ml-5 mx-auto border-2 bg-sky-600 text-white p-2 text-xs rounded" onClick={() => getAnswer()}>
                <Send size={16} />
                送信(send)
                </button>):(
                <button className="flex items-center ml-5 mx-auto border-2 bg-slate-200 text-slate-400 p-2 text-xs rounded">
                <Send size={16}/>
                送信(send)
                </button>
                )}
                </div>
                {isModal && (
                    <Modal setIsModal={setIsModal} modalUrl={modalUrl} modalFile={modalFile}/>
                )}
                </div>
            </div>
        </div>):(
            <div className="flex flex-col h-screen bg-stone-200">
            <button className="bg-cyan-500 hover:bg-cyan-700 text-white mx-auto mt-24 px-4 py-2 rounded text-base font-bold" onClick={() => {talkStart()}}>AIコンを始める</button>
            <div className="mx-auto mt-32 text-sm">使用言語(language)</div>
            <select className="mt-3 mx-auto text-sm w-36 h-8 text-center border-2 border-lime-600" value={dLang} onChange={selectLanguage}>
                {langList.map((lang, index) => {
                return <option key={index} value={lang}>{lang}</option>;
                })}
            </select>
            </div>            
            )}
            <div className="flex flex-row w-20 h-6 bg-white hover:bg-gray-200 p-1 rounded-lg shadow-lg relative ml-auto mr-3 mt-5 mb-auto" onClick={() => closeApp()}>
            <X size={16} />
            <div className="text-xs">{currentIndex}</div>
            </div>
            <audio src={wavUrl} ref={audioRef} preload="auto"/>
            <div className="hidden">{wavUrl}</div>
        </div>
    );
}
