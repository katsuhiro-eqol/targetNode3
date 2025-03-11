"use client"
import "regenerator-runtime";
import React from "react";
import Head from "next/head";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, Send, Eraser } from 'lucide-react';
import { db } from "@/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import Modal from "../components/modalModal"

//aicon_audio/no_sound.wav
const no_sound = "https://firebasestorage.googleapis.com/v0/b/targetproject-394500.appspot.com/o/aicon_audio%2Fno_sound.wav?alt=media&token=85637458-710a-44f9-8a1e-1ceb30f1367d"

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'other';
    timestamp: Date;
  };

export default function Aicon() {
    const [initialSlides, setInitialSlides] = useState<string[]>(["AI-con_man_01.png"])
    //const initialSlides = new Array(1).fill("AI-con_man_01.png")
    const [userInput, setUserInput] = useState<string>("")
    const [messages, setMessages] = useState<Message[]>([])
    const [prompt, setPrompt] = useState<string>("")
    const [result, setResult] = useState<string>("")
    const [eventData, setEventData] = useState({})
    const [langList, setLangList] = useState([])
    const [language, setLanguage] = useState<string>("日本語")
    const [embeddingsData, setEmbeddingsData] = useState([])
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
    const nativeName = {"日本語":"日本語", "英語":"English","中国語（簡体）":"简体中文","中国語（繁体）":"繁體中文","韓国語":"한국어","フランス語":"Français","スペイン語":"Español","ポルトガル語":"Português"}
    const japaneseName = {"日本語":"日本語", "English":"英語","简体中文":"中国語（簡体）","繁體中文":"中国語（繁体）","한국어":"韓国語","Français":"フランス語","Español":"スペイン語","Português":"ポルトガル語"}
    const [endLimit, setEndLimit] = useState<number>(1767193199000) //2025-12-31
    const audioRef = useRef<HTMLAudioElement>(null)
    const intervalRef = useRef(null)
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    const searchParams = useSearchParams();
    const attribute = searchParams.get("attribute");
    const code = searchParams.get("code");

    async function getAnswer() {
        
        /*
        const today = new Date()
        if (today.getTime() > endLimit){
            alert("アプリ利用期間が終わりました")
            setUserInput("")
            setWavReady(false)
            return
        }
        */
        sttStop()
        setWavUrl(no_sound)
        setRecord(false)
        setCanSend(false)//同じInputで繰り返し送れないようにする
        setUserInput("")
        setSlides(initialSlides)
        setModalUrl(null)
        setModalFile(null)

        try {
            const response = await fetch("/api/embedding2", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ input: userInput, model: eventData.embeddingModel, language: language }),
            });

            const data = await response.json();
            if (response.status !== 200) {
                throw data.error || new Error(`Request failed with status ${response.status}`);
                }
            setPrompt(data.prompt)
            const similarityList = findMostSimilarQuestion(data.embedding)

            if (similarityList.similarity > 0.5){
                console.log("voiceUrl:",embeddingsData[similarityList.index].voiceUrl)
                setWavUrl(embeddingsData[similarityList.index].voiceUrl)
                setResult(embeddingsData[similarityList.index].answer)
                const sl = createSlides(embeddingsData[similarityList.index].frame)
                console.log(sl)
                setSlides(sl)
                if (embeddingsData[similarityList.index].modalUrl){
                    setModalUrl(embeddingsData[similarityList.index].modalUrl)
                    setModalFile(embeddingsData[similarityList.index].modalFile)
                }

            }else{
                const badQuestion = embeddingsData.filter((obj) => obj.question == "分類できなかった質問")
                const n = Math.floor(Math.random() * badQuestion.length)
                setWavUrl(badQuestion[n].voiceUrl)
                setResult(badQuestion[n].answer)
                const sl = createSlides(badQuestion[n].frame)
                setSlides(sl)           
            }
            console.log(similarityList.similarity)
            console.log(embeddingsData[similarityList.index])

        } catch(error) {
        console.error(error);
        alert(error.message);
        }
    }

    function cosineSimilarity(vec1, vec2) {
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
    
    function findMostSimilarQuestion(base64Data){
        const inputVector = binaryToList(base64Data)
        const similarities = embeddingsData.map((item, index) => ({
            index,
            similarity: cosineSimilarity(inputVector, item.vector)
          }));
        similarities.sort((a, b) => b.similarity - a.similarity);

        // 最も類似度の高いベクトルの情報を返す
        return similarities[0];
    }

    function binaryToList(binaryStr){
        const decodedBuffer = Buffer.from(binaryStr, 'base64')
        const embeddingsArray = new Float32Array(
            decodedBuffer.buffer, 
            decodedBuffer.byteOffset, 
            decodedBuffer.byteLength / Float32Array.BYTES_PER_ELEMENT
          )
          const embeddingsList = Array.from(embeddingsArray)
    
          return embeddingsList
    }


    const createSlides = (frame) => {
        let imageArray = []
        switch (initialSlides) {
            case "AI-con_man_01.png":
                imageArray = ["AI-con_man_02.png","AI-con_man_01.png"]
                break;
            case "AI-con_man2_01.png":
                imageArray = ["AI-con_man2_02.png","AI-con_man2_01.png"]
                break;
            case "AI-con_woman_01.png":
                imageArray = ["AI-con_woman_02.png","AI-con_woman_01.png"]
                break;
            case "AI-con_woman2_01.png":
                imageArray = ["AI-con_woman2_02.png","AI-con_woman2_01.png"]
                break;
            default:
                imageArray = ["AI-con_man_02.png","AI-con_man_01.png"]
                break;
        }

        console.log(imageArray)
        let imageList = []
        const n = Math.floor(frame/44100*2)+2
        console.log("n:", n)
        for (let i = 0; i<n; i++){
            imageList = imageList.concat(imageArray)
        }
        imageList = imageList.concat(initialSlides)
        return imageList
    }

    async function loadQAData(attr){
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
    
    async function loadEventData(attribute, code){
        console.log("event", attribute)
        const eventRef = doc(db, "Events", attribute);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
            const data = eventSnap.data()
            const memocode = data.code
            if (memocode == code){
                const event_data = {
                    image:data.image.name,
                    languages:data.languages,
                    voice:data.voice,
                    embeddingModel:data.embedding,
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

    const getLanguageList = () => {
        if (eventData.languages){
            const langs = eventData.languages.map((item) => {return nativeName[item]})
            setLangList(langs)
        }
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
        audioRef.current.play().catch((error) => {
            console.log(error)
        })
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

    const selectLanguage = (e) => {
        setLanguage(e.target.value);
        console.log(e.target.value);
        console.log(japaneseName[e.target.value])
    }

    useEffect(() => {
        if (attribute && code){
            loadEventData(attribute, code)
        }
        
        return () => {
            clearInterval(intervalRef.current);
            intervalRef.current = null// コンポーネントがアンマウントされたらタイマーをクリア
            resetTranscript()
        };
    },[])

    useEffect(() => {
        console.log(eventData)
        getLanguageList()
        const s = new Array(1).fill(eventData.image)
        setInitialSlides(s)
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
        //intervalはcreateBauncerSlides()に合わせる
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
            setSlides(s)
            clearInterval(intervalRef.current);
            intervalRef.current = null
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
    <div className="w-full h-full bg-stone-100">
        <div className="flex flex-col h-screen">
        <Head>
            <title>target</title>
            Feature-Policy: autoplay 'self' https://firebasestorage.googleapis.com/v0/b/targetproject-394500.appspot.com/
        </Head>
      <div>
      {(wavReady) ? (
      <div className="flex flex-col h-screen">
        <img className="max-w-full md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto" src={slides[currentIndex]} alt="Image" />
        <div className="mt-5 w-3/4 font-semibold mx-auto">{prompt}</div>
        <div className="mt-5 w-3/4 font-bold mx-auto">{result}</div>
        <div className="hidden">{currentIndex}</div>
        <div className="">
        <div className="absolute bottom-6">
        <div className="flex flex-col w-screen">
        <textarea className="w-5/6 mx-auto mb-5 px-2 py-1"
            type="text"
            name="message"
            placeholder="質問内容(question)"
            rows="3"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
        />
        <div  className="flex flex-row gap-x-4 justify-center">
        {!record ?(     
            <button className="flex items-center mr-5 mx-auto border-2 border-sky-600 p-2 text-sky-800 bg-white text-sm" disabled={!wavReady} onClick={sttStart}>
            <Mic />
            音声入力(mic)
            </button>
        ):(
            <button color="secondary" className="flex items-center mr-5 mx-auto text-sm " onClick={sttStop}>
            <Eraser />
            入力クリア(clear)
            </button>)}
        {canSend ? (
            <button className="flex items-center ml-5 mx-auto border-2 bg-sky-600 text-white p-2 text-sm rounded" onClick={() => getAnswer()}>
            <Send />
            送信(send)
            </button>):(
            <button className="flex items-center ml-5 mx-auto border-2 bg-slate-200 text-slate-400 p-2 text-sm rounded">
            <Send />
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
        <select className="mt-3 mx-auto text-sm w-36 h-8 text-center border-2 border-lime-600" value={language} label="event" onChange={selectLanguage}>
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