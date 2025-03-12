"use client"
import "regenerator-runtime";
import React from "react";
//import Head from "next/head";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, Send, Eraser, Paperclip, X } from 'lucide-react';
import { db } from "@/firebase";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import Modal from "../../components/modalModal"

//aicon_audio/no_sound.wav
const no_sound = "https://firebasestorage.googleapis.com/v0/b/targetproject-394500.appspot.com/o/aicon_audio%2Fno_sound.wav?alt=media&token=85637458-710a-44f9-8a1e-1ceb30f1367d"

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'AIcon';
    modalUrl: string | null;
    modalFile: string | null;
}
type EmbeddingsData = {
    vector: number[];
    question: string;
    answer: string;
    modalUrl: string;
    modalFile: string;
    foreign: Foreign;
    voiceUrl: string;
    frame: number;
}
interface Foreign {
    [key: string]: string;
}
type EventData = {
    image:Image;
    languages:string[];
    voice:string;
    embedding:string;
}
interface Image {
    [key: string]: string;
}

export default function Aicon() {
    const [initialSlides, setInitialSlides] = useState<string[]>(["/AI-con_man_01.png"])
    const [userInput, setUserInput] = useState<string>("")
    const [messages, setMessages] = useState<Message[]>([])
    const [eventData, setEventData] = useState<EventData|null>(null)
    const [langList, setLangList] = useState<string[]>([])
    const [language, setLanguage] = useState<string>("日本語")
    const [embeddingsData, setEmbeddingsData] = useState<EmbeddingsData[]>([])
    //wavUrl：cloud storageのダウンロードurl。初期値は無音ファイル。これを入れることによって次からセッティングされるwavUrlで音がなるようになる。
    const [wavUrl, setWavUrl] = useState<string>(no_sound);
    const [slides, setSlides] = useState<string[]>(initialSlides)
    const [currentIndex, setCurrentIndex] = useState<number>(0)
    const [wavReady, setWavReady] = useState<boolean>(false)
    const [record,setRecord] = useState<boolean>(false)
    const [canSend, setCanSend] = useState<boolean>(false)
    const [isModal, setIsModal] = useState<boolean>(false)
    const [modalUrl, setModalUrl] = useState<string|null>(null)
    const [modalFile, setModalFile] = useState<string|null>(null)
    const [convId, setConvId] = useState<string>("")
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const nativeName = {"日本語":"日本語", "英語":"English","中国語（簡体）":"简体中文","中国語（繁体）":"繁體中文","韓国語":"한국어","フランス語":"Français","スペイン語":"Español","ポルトガル語":"Português"}
    const japaneseName = {"日本語":"日本語", "English":"英語","简体中文":"中国語（簡体）","繁體中文":"中国語（繁体）","한국어":"韓国語","Français":"フランス語","Español":"スペイン語","Português":"ポルトガル語"}
    //const [endLimit, setEndLimit] = useState<number>(1767193199000) //2025-12-31
    const audioRef = useRef<HTMLAudioElement>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const {
        transcript,
        resetTranscript
    } = useSpeechRecognition();

    const searchParams = useSearchParams()
    const attribute = searchParams.get("attribute")
    const code = searchParams.get("code")

    async function getAnswer() {
        
        sttStop()
        setWavUrl(no_sound)
        setRecord(false)
        setCanSend(false)//同じInputで繰り返し送れないようにする
        setSlides(initialSlides)
        setModalUrl(null)
        setModalFile(null)

        const userMessage: Message = {
            id: Date.now().toString(),
            text: userInput,
            sender: 'user',
            modalUrl:null,
            modalFile:null,
        };
        
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
                if (embeddingsData[similarityList.index].modalUrl){
                    const aiMessage: Message = {
                        id: Date.now().toString(),
                        text: embeddingsData[similarityList.index].answer,
                        sender: 'AIcon',
                        modalUrl:embeddingsData[similarityList.index].modalUrl,
                        modalFile:embeddingsData[similarityList.index].modalFile,
                    };
                    setMessages(prev => [...prev, aiMessage]);
                } else {
                    const aiMessage: Message = {
                        id: Date.now().toString(),
                        text: embeddingsData[similarityList.index].answer,
                        sender: 'AIcon',
                        modalUrl:null,
                        modalFile:null,
                    };
                    setMessages(prev => [...prev, aiMessage]);
                }
                const sl = createSlides(embeddingsData[similarityList.index].frame)
                setSlides(sl)

            }else{
                const badQuestion = embeddingsData.filter((obj) => obj.question == "分類できなかった質問")
                const n = Math.floor(Math.random() * badQuestion.length)
                setWavUrl(badQuestion[n].voiceUrl)
                if (badQuestion[n].modalUrl){
                    const aiMessage: Message = {
                        id: Date.now().toString(),
                        text: badQuestion[n].answer,
                        sender: 'AIcon',
                        modalUrl:badQuestion[n].modalUrl,
                        modalFile:badQuestion[n].modalFile,
                    };
                    setMessages(prev => [...prev, aiMessage]);
                } else {
                    const aiMessage: Message = {
                        id: Date.now().toString(),
                        text: badQuestion[n].answer,
                        sender: 'AIcon',
                        modalUrl:null,
                        modalFile:null,
                    };
                    setMessages(prev => [...prev, aiMessage]);
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
            case ["/AI-con_man_01.png"]:
                imageArray = ["/AI-con_man_02.png","/AI-con_man_01.png"]
                break;
            case ["/AI-con_man2_01.png"]:
                imageArray = ["/AI-con_man2_02.png","/AI-con_man2_01.png"]
                break;
            case ["/AI-con_woman_01.png"]:
                imageArray = ["/AI-con_woman_02.png","/AI-con_woman_01.png"]
                break;
            case ["/AI-con_woman2_01.png"]:
                imageArray = ["/AI-con_woman2_02.png","/AI-con_woman2_01.png"]
                break;
            default:
                imageArray = ["/AI-con_man_02.png","/AI-con_man_01.png"]
                break;
        }

        console.log(imageArray)
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
                    frame:data.frame
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
                const event_data = {
                    image:data.image.url,
                    languages:data.languages,
                    voice:data.voice,
                    embedding:data.embedding,
                }
                setEventData(event_data)
                loadQAData(attribute)
            } else {
                alert("QRコードをもう一度読み込んでください")
            }
        } else {
            alert("イベントが登録されていません")
        }
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
        sttStart()
        setTimeout(() => {
            sttStop()
            resetTranscript()
        }, 500);
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
        SpeechRecognition.startListening()
    }

    const sttStop = () => {
        setRecord(false)
        SpeechRecognition.stopListening()
    }

    const selectLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value);
    }

    const closeApp = () => {
        console.log("close app")
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
            const convid = randomStr(12)
            console.log(convid)
            if (!convId){
                setConvId(convid)
                createConvField(convid, attribute)
            }
        }        
    }, [attribute, code])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, [messages]);

    useEffect(() => {
        if (eventData){
            getLanguageList()
            const s = new Array(1).fill(eventData?.image)
            setInitialSlides(s)
        }
    }, [eventData])
    
    useEffect(() => {
        console.log(embeddingsData)
    }, [embeddingsData])

    //20240228ヴァージョンはアニメーション省略なのでwavUrlが更新されたらaudioPlayする
    useEffect(() => {
        if (wavUrl != no_sound ){
            console.log(wavUrl)
        audioPlay()
        setCurrentIndex(0)
        if (slides.length !== 1){
            if (intervalRef.current !== null) {//タイマーが進んでいる時はstart押せないように//2
                return;
            }
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % (slides.length))
            }, 250)

        } else {

        }   
    }
    }, [wavUrl])

    useEffect(() => {
        console.log(slides)
    }, [slides])

    useEffect(() => {
        if (currentIndex === slides.length-2 && currentIndex != 0){
            const s = initialSlides
            setCurrentIndex(0)
            setSlides(initialSlides)
            if (intervalRef.current !== null){
                clearInterval(intervalRef.current);
                intervalRef.current = null
            }
            if (modalUrl){
                setIsModal(true)
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
    <div className="w-full h-full bg-stone-200">
        <div className="flex flex-col h-screen">

      <div>
      {(wavReady) ? (
      <div className="flex flex-col h-screen">
        <img className="max-h-72 max-w-96 md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto" src={slides[currentIndex]} alt="Image" />

        <div>
        <div className="h-72 flex-1 p-4 overflow-y-auto">
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
              {message.modalUrl && <Paperclip size={16} onClick={() => {setIsModal(true); setModalUrl(message.modalUrl); setModalFile(message.modalFile)}} />}
            </div>
            {isModal && (<Modal setIsModal={setIsModal} modalUrl={modalUrl} modalFile={modalFile} />)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
        </div>
        <div className="hidden">{currentIndex}</div>
        <div className="absolute top-1 right-1" onClick={closeApp}>
            <div className="flex flex-row gap-x-4 border-2 bg-white">
            <X size={20} />
            <div className="text-sm ml-1">終了</div>
            </div>
        </div>
        <div className="">
        <div className="absolute bottom-4">
        <div className="flex flex-col w-screen">
        <textarea className="w-5/6 mx-auto mb-2 px-2 py-1 text-xs"
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
        </div>
        </div>
        ) : (
        <div className="flex flex-col h-screen">
        <button className="bg-cyan-500 hover:bg-cyan-700 text-white mx-auto mt-24 px-4 py-2 rounded text-base font-bold" onClick={() => {talkStart()}}>AIコンを始める</button>
        <div className="mx-auto mt-32 text-sm">使用言語(language)</div>
        <select className="mt-3 mx-auto text-sm w-36 h-8 text-center border-2 border-lime-600" value={language} onChange={selectLanguage}>
            {langList.map((lang, index) => {
            return <option key={index} value={lang}>{lang}</option>;
            })}
            </select>
        </div>
        )}
        </div>
        <audio src={wavUrl} ref={audioRef} preload="auto"/>
        <div className="hidden">{wavUrl}</div>
    </div>
    </div>
  );
}
/*
<Head>
    <title>target</title>
    Feature-Policy: autoplay 'self' https://firebasestorage.googleapis.com/v0/b/targetproject-394500.appspot.com/
</Head>
*/