"use client"
import "regenerator-runtime";
import React from "react";
import { useSearchParams as useSearchParamsOriginal } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk"
//import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, Send, Eraser, Paperclip, X, LoaderCircle } from 'lucide-react';
import { db } from "@/firebase";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import Modal from "../../components/modalModal"
import UsersManual from "../../components/usersManual"
import {Message, EmbeddingsData, EventData} from "@/types"
type LanguageCode = 'ja-JP' | 'en-US' | 'zh-CN' | 'zh-TW' | 'ko-KR' | 'fr-FR' | 'pt-BR' | 'es-ES'

const no_sound = "https://firebasestorage.googleapis.com/v0/b/targetproject-394500.appspot.com/o/aicon_audio%2Fno_sound.wav?alt=media&token=85637458-710a-44f9-8a1e-1ceb30f1367d"

export default function Aicon() {
    const [windowHeight, setWindowHeight] = useState<number>(0)
    const [initialSlides, setInitialSlides] = useState<string|null>(null)
    const [userInput, setUserInput] = useState<string>("")
    const [messages, setMessages] = useState<Message[]>([])
    const [history, setHistory] = useState<{user: string, aicon: string}[]>([])
    const [eventData, setEventData] = useState<EventData|null>(null)
    const [langList, setLangList] = useState<string[]>([])
    const [dLang, setDLang] = useState<string>("日本語")//表示用言語
    const [language, setLanguage] = useState<string>("日本語")
    const [embeddingsData, setEmbeddingsData] = useState<EmbeddingsData[]>([])
    const [wavUrl, setWavUrl] = useState<string>(no_sound);
    const [slides, setSlides] = useState<string[]|null>(null)
    const [currentIndex, setCurrentIndex] = useState<number>(0)
    const [wavReady, setWavReady] = useState<boolean>(false)
    const [record,setRecord] = useState<boolean>(false)
    //const [isListening, setIsListening] = useState<boolean>(false)   
    const [canSend, setCanSend] = useState<boolean>(false)
    const [isModal, setIsModal] = useState<boolean>(false)
    const [modalUrl, setModalUrl] = useState<string|null>(null)
    const [modalFile, setModalFile] = useState<string|null>(null)
    const [convId, setConvId] = useState<string>("")
    const [startText, setStartText] = useState<EmbeddingsData|null>(null)

    const [recognizing, setRecognizing] = useState<boolean>(false)
    const [interim, setInterim] = useState<string>("")
    const [finalTranscript, setFinalTranscript] = useState<string>("")
    const [sttStartTime, setSttStartTime] = useState<number>(0)
    const [sttDuration, setSttDuration] = useState<number>(0)
    const [isManual, setIsManual] = useState<boolean>(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const nativeName = {"日本語":"日本語", "英語":"English","中国語（簡体）":"简体中文","中国語（繁体）":"繁體中文","韓国語":"한국어","フランス語":"Français","スペイン語":"Español","ポルトガル語":"Português"}
    const japaneseName = {"日本語":"日本語", "English":"英語","简体中文":"中国語（簡体）","繁體中文":"中国語（繁体）","한국어":"韓国語","Français":"フランス語","Español":"スペイン語","Português":"ポルトガル語"}
    
    const foreignLanguages: Record<string, LanguageCode> = {"日本語": "ja-JP","英語": "en-US","中国語（簡体）": "zh-CN","中国語（繁体）": "zh-TW","韓国語": "ko-KR","フランス語": "fr-FR","ポルトガル語": "pt-BR","スペイン語": "es-ES"}
    const audioRef = useRef<HTMLAudioElement>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null)
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)

    const useSearchParams = ()  => {
        const searchParams = useSearchParamsOriginal();
        return searchParams;
    }
    const searchParams = useSearchParams()
    const attribute = searchParams.get("attribute")
    const code = searchParams.get("code")

    async function getAnswer() {        
        await sttStop()
        setFinalTranscript("")
        setInterim("")
        setWavUrl(no_sound)
        setCanSend(false)//同じInputで繰り返し送れないようにする
        setSlides(Array(1).fill(initialSlides))
        setModalUrl(null)
        setModalFile(null)
        console.log("sttDuration", sttDuration)

        const date = new Date()
        const offset = date.getTimezoneOffset() * 60000
        const localDate = new Date(date.getTime() - offset)
        const now = localDate.toISOString()
  
        const userMessage: Message = {
            id: now,
            text: userInput,
            sender: 'user',
            modalUrl:null,
            modalFile:null,
            similarity:null,
            nearestQ:null
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
          const translatedQuestion = data.input
          const similarityList = findMostSimilarQuestion(data.embedding)
  
          //類似質問があったかどうかで場合わけ
          if (similarityList.similarity > 0.5){
              setWavUrl(embeddingsData[similarityList.index].voiceUrl)
              const answer = setAnswer(embeddingsData[similarityList.index], language)
              console.log(similarityList.similarity )
              const aiMessage: Message = {
                id: `A${now}`,
                text: answer,
                sender: 'AIcon',
                modalUrl:judgeNull(embeddingsData[similarityList.index].modalUrl),
                modalFile:judgeNull(embeddingsData[similarityList.index].modalFile),
                similarity:similarityList.similarity,
                nearestQ:embeddingsData[similarityList.index].question
            };
            setMessages(prev => [...prev, aiMessage]);
            if (attribute){
                await saveMessage(userMessage, aiMessage, attribute, translatedQuestion, similarityList.index)
            }
            const sl = createSlides(embeddingsData[similarityList.index].frame)
            setSlides(sl)
          //類似質問不在の場合に会話履歴も考慮して質問意図を把握し、質問文候補を複数生成の上、それとの一致度を比較するアルゴリズムを追加
          }else{
            console.log(history)
            try {
              const response = await fetch("/api/paraphrase", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ question: translatedQuestion, model: eventData?.embedding ?? "text-embedding-3-small", history:history }),
              });
              const data = await response.json();
              console.log(data.paraphrases)
              let maxValue = 0
              let properAnswer = ""
              let index = 0
              for (const embedding of data.embeddings){
                  const similarityList2 = findMostSimilarQuestion(embedding)
                  if (similarityList2.similarity > maxValue){
                      maxValue = similarityList2.similarity
                      properAnswer = setAnswer(embeddingsData[similarityList2.index], language)
                      index = similarityList2.index
                  }
              }
              if (maxValue > 0.5) {
                console.log(maxValue)
                setWavUrl(embeddingsData[index].voiceUrl)
                const aiMessage: Message = {
                  id: `A${now}`,
                  text: properAnswer,
                  sender: 'AIcon',
                  modalUrl:judgeNull(embeddingsData[index].modalUrl),
                  modalFile:judgeNull(embeddingsData[index].modalFile),
                  similarity:maxValue,
                  nearestQ:embeddingsData[index].question
                };
                console.log("frame",embeddingsData[index].frame)
                const sl = createSlides(embeddingsData[index].frame)
                setSlides(sl)
                setMessages(prev => [...prev, aiMessage]);
                if (attribute){
                    await saveMessage(userMessage, aiMessage, attribute, translatedQuestion, index)
                }
  
              //類似質問が見つからなかった場合のアルゴリズム。分類できなかった質問の回答文が複数あることを想定
              } else {
                const badQuestion = embeddingsData.filter((obj) => obj.question == "分類できなかった質問")
                const n = Math.floor(Math.random() * badQuestion.length)
                setWavUrl(badQuestion[n].voiceUrl)
                const answer = setAnswer(badQuestion[n], language)
                const aiMessage: Message = {
                  id: `A${now}`,
                  text: answer,
                  sender: 'AIcon',
                  modalUrl:judgeNull(badQuestion[n].modalUrl),
                  modalFile:judgeNull(badQuestion[n].modalFile),
                  similarity:similarityList.similarity,
                  nearestQ:embeddingsData[similarityList.index].question
                };
                setMessages(prev => [...prev, aiMessage]);
                if (attribute){
                    await saveMessage(userMessage, aiMessage, attribute, translatedQuestion,-1)
                }   
                  const sl = createSlides(badQuestion[n].frame)
                  setSlides(sl)                             
                }
            } catch (error) {
                console.error(error);
            }
          }
          // 現在進行中のSTT時間も含めて計算
          const currentSttDuration = sttStartTime !== 0 ? sttDuration + (new Date().getTime() - sttStartTime) : sttDuration;
          await incrementCounter(attribute!, currentSttDuration)
          
          // getAnswer実行後にsttDurationをリセット
          setSttDuration(0)

        } catch(error) {
        console.error(error);
        }
      }
  
      const judgeNull = (value:string) => {
        if (value === ""){
          return null
        } else {
          return value
        }
      }

    function setAnswer(selectedData:EmbeddingsData, lang:string){
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
        imageList = imageList.concat(Array(4).fill(initialSlides))
        //imageList = imageList.concat(initialSlides)
        return imageList
    }

    const incrementCounter = async (attribute:string, duration:number) => {
        const counterRef = doc(db, "Events", attribute)
        await updateDoc(counterRef, { counter: increment(1), sttDuration: increment(duration) })
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

    const saveMessage = async (userMessage:Message, message:Message, attr:string, translatedQuestion:string, index:number) => {
        if (index === -1){
            const hdata = {
                user:translatedQuestion,
                aicon:"回答不能です"
            }
            setHistory(prev => [...prev, hdata])

            const data = {
                id:userMessage.id,
                user:userMessage.text,
                uJapanese:translatedQuestion,
                aicon:message.text,
                aJapanese: "回答不能",
                nearestQ:message.nearestQ,
                similarity:message.similarity
            }
            await setDoc(doc(db, "Events",attr, "Conversation", convId), {conversations: arrayUnion(data), language:language, date:userMessage.id}, {merge:true})
        }else {
            const hdata = {
                user:translatedQuestion,
                aicon:embeddingsData[index].answer
            }
            setHistory(prev => [...prev, hdata])

            const data = {
                id:userMessage.id,
                user:userMessage.text,
                uJapanese:translatedQuestion,
                aicon:message.text,
                aJapanese: embeddingsData[index].answer,
                nearestQ:message.nearestQ,
                similarity:message.similarity
            }
            await setDoc(doc(db, "Events",attr, "Conversation", convId), {conversations: arrayUnion(data), language:language, date:userMessage.id}, {merge:true})
        }
    }


    
    const createConvId = async (attr:string) => {
        const date = new Date()
        const offset = date.getTimezoneOffset() * 60000
        const localDate = new Date(date.getTime() - offset)
        const now = localDate.toISOString()
        setConvId(now)
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
        const date = new Date()
        const offset = date.getTimezoneOffset() * 60000
        const localDate = new Date(date.getTime() - offset)
        const now = localDate.toISOString()
        setTimeout(() => {
            if (startText){
                if (language=="日本語"){
                    const aiMessage: Message = {
                        id: now,
                        text: startText.answer,
                        sender: 'AIcon',
                        modalUrl:null,
                        modalFile:null,
                        similarity:null,
                        nearestQ:null
                    };
                    setMessages(prev => [...prev, aiMessage])
                }else{
                    //const jLang = japaneseName[language as keyof typeof japaneseName]
                    const foreign = startText.foreign
                    if (Array.isArray(foreign)){
                        const foreignText = foreign.find(item => language in item)
                        const aiMessage: Message = {
                            id: now,
                            text: foreignText[language],
                            sender: 'AIcon',
                            modalUrl:null,
                            modalFile:null,
                            similarity:null,
                            nearestQ:null
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
        if (audioRef.current) {
            audioRef.current.play().catch((error) => {
                console.error('音声再生エラー:', error);
            });
        }
        setCurrentIndex(0);
    }

    const inputClear = () => {
        sttStop()
        setUserInput("")
        setFinalTranscript("")
        setInterim("")
    }

    const clearSilenceTimer = () => {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
    };

    const scheduleSilenceStop = () => {
        clearSilenceTimer();
        silenceTimerRef.current = setTimeout(() => stopRecognition(), 4000);
    };

    const startRecognition = (langCode:string) => {
        if (recognizerRef.current) return;

        const speechKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY!;
        const serviceRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION!;
        const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(speechKey, serviceRegion);
        speechConfig.speechRecognitionLanguage = langCode
        speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "3000")
        speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs,"2000")

        const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
        //sttの積算時間を把握するためのコード
        const now = new Date()
        const startTime = now.getTime()
        setSttStartTime(startTime)

        recognizer.recognizing = (_s, e) => {
            setInterim(e.result.text);
            //clearSilenceTimer()
        };

        recognizer.recognized = (_s, e) => {
            if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech && e.result.text) {
            setFinalTranscript((prev) => prev + e.result.text + " ");
            }
            setInterim("");
        };

        recognizer.canceled = (_s, e) => {
            console.error("Recognition canceled:", e);
            stopRecognition();
        };

        recognizer.sessionStopped = () => {
            stopRecognition();
        };

        recognizer.startContinuousRecognitionAsync(
            () => {
            recognizerRef.current = recognizer;
            setRecognizing(true);
            }
        );
    };
    
    const stopRecognition = async() => {
        const recognizer = recognizerRef.current;
        clearSilenceTimer();
        if (!recognizer) return;

        //sttの積算時間を取得するためのコード
        const now = new Date()
        const endTime = now.getTime()
        if (sttStartTime !== 0){
            const currentDuration = endTime - sttStartTime
            setSttDuration((prev) => prev + currentDuration)
            setSttStartTime(0)
        }
        recognizer.stopContinuousRecognitionAsync(
            () => {
            recognizer.close();
            recognizerRef.current = null;
            setRecognizing(false);
            }
        );
    };

    const sttStart = () => {
        clearSilenceTimer()
        setUserInput("")
        setFinalTranscript("")
        setInterim("")       
        setRecord(true)
        if (audioRef.current) {
            audioRef.current.pause();
        }
        const langCode = foreignLanguages[language] || "ja-JP"
        startRecognition(langCode)
        scheduleSilenceStop()
    }

    const sttStop = () => {
        setRecord(false)
        stopRecognition()
    }

    const selectLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const lang = e.target.value
        setDLang(lang)
        const jLang = japaneseName[lang as keyof typeof japaneseName]
        setLanguage(jLang);
    }

    const closeApp = () => {
        stopRecognition()
        window.location.reload()
    }
        
    useEffect(() => {
        console.log("sttDuration:", sttDuration)
    }, [sttDuration])

    useEffect(() => {
        return () => {
            clearSilenceTimer();
            if (recognizerRef.current) {
            recognizerRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        if (recognizing){
            setRecord(true)
        } else {
            setRecord(false)
        }
    }, [recognizing])

    useEffect(() => {
        const updateHeight = () => {
            setWindowHeight(window.innerHeight);
          };
      
          updateHeight(); // 初期値設定
          window.addEventListener("resize", updateHeight);

        return () => {
            window.removeEventListener("resize", updateHeight);
            if (intervalRef.current !== null){
                clearInterval(intervalRef.current);
                intervalRef.current = null// コンポーネントがアンマウントされたらタイマーをクリア
            }
            stopRecognition()
        };
    },[])


    useEffect(() => {
        if (attribute && code){
            loadEventData(attribute, code)
            createConvId(attribute)
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

    useEffect(() => {
        if (Array.isArray(slides) && slides.length>1 && wavUrl!= no_sound){
            audioPlay()
            setCurrentIndex(0)
            if (intervalRef.current !== null) {//タイマーが進んでいる時はstart押せないように//2
                return;
            }
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
        setUserInput(finalTranscript + interim)
    }, [finalTranscript, interim])

    useEffect(() => {
        clearSilenceTimer()
        if (userInput.length !== 0){
            setCanSend(true)
        } else {
            setCanSend(false)
        }
        if (recognizing){
            scheduleSilenceStop()
        }
    }, [userInput])

    // 音声ファイルの読み込み完了時の処理
    useEffect(() => {
        const handleCanPlay = () => {
            if (audioRef.current) {
                // デバイスのボリュームに追随
                audioRef.current.volume = 1.0;
            }
        };

        const audioElement = audioRef.current;
        if (audioElement) {
            audioElement.addEventListener('canplay', handleCanPlay);
        }

        return () => {
            if (audioElement) {
                audioElement.removeEventListener('canplay', handleCanPlay);
            }
        };
    }, []);

    return (
        <div className="flex flex-col w-full overflow-hidden" style={{ height: windowHeight || "100dvh" }}>
        {wavReady ? (
        <div className="fixed inset-0 flex flex-col items-center h-full bg-stone-200">
            <div className="flex-none h-[35vh] w-full mb-5">
                {Array.isArray(slides) && (<img className="mx-auto h-[35vh] " src={slides[currentIndex]} alt="Image" />)}
            </div>
            <div className="flex-none h-[32vh] w-11/12 max-w-96 overflow-auto">
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
                    {message.modalUrl && <Paperclip size={24} className="text-green-500" onClick={() => {setIsModal(true); setModalUrl(message.modalUrl); setModalFile(message.modalFile)}} />}
                    </div>
                    {isModal && (<Modal setIsModal={setIsModal} modalUrl={modalUrl} modalFile={modalFile} />)}
                    </div>
                </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex-none h-[18%] w-full max-w-96 overflow-auto">
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
                <button className="flex items-center ml-5 mx-auto border-2 bg-sky-600 text-white p-2 text-xs rounded" onClick={() => {getAnswer()}}>
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
            <div>
            {!isManual ? (
            <div className="flex flex-col h-screen bg-stone-200">
            <button className={`w-2/3 ${eventData ? `bg-cyan-500 hover:bg-cyan-700 text-white` : `bg-slate-300 text-white`}  mx-auto mt-24 px-4 py-2 rounded`} disabled={!eventData} onClick={() => {talkStart()}}>
                <div className="text-2xl font-bold">AIコンシェルジュ</div>
                <div>click to start</div>
            </button>
            {eventData ? (
                <div className="flex flex-col">
                    <div className="mx-auto mt-32 text-sm">使用言語(language)</div>
                    <select className="mt-3 mx-auto text-sm w-36 h-8 text-center border-2 border-lime-600" value={dLang} onChange={selectLanguage}>
                        {langList.map((lang, index) => {
                        return <option className="text-center" key={index} value={lang}>{lang}</option>;
                        })}
                    </select>
                </div>
            ):(
                <div className="flex flex-row gap-x-4 mx-auto mt-32">
                <LoaderCircle size={24} className="text-slate-500 animate-spin" />
                <p className="text-slate-500">データ読み込み中(Data Loading...)</p>
                </div>
            )}
            {language === "日本語" && (<button onClick={() => setIsManual(true)} className="mt-auto mb-32 text-blue-500 hover:text-blue-700 text-sm">はじめにお読みください</button>)}
            {language === "英語" && (<button onClick={() => setIsManual(true)} className="mt-auto mb-32 text-blue-500 hover:text-blue-700 text-sm">Please read this first</button>)}
            {language === "中国語（簡体）" && (<button onClick={() => setIsManual(true)} className="mt-auto mb-32 text-blue-500 hover:text-blue-700 text-sm">请先阅读此内容</button>)}
            {language === "中国語（繁体）" && (<button onClick={() => setIsManual(true)} className="mt-auto mb-32 text-blue-500 hover:text-blue-700 text-sm">請先閱讀此內容</button>)}
            {language === "韓国語" && (<button onClick={() => setIsManual(true)} className="mt-auto mb-32 text-blue-500 hover:text-blue-700 text-sm">먼저 읽어주세요</button>)}
            </div>
            ):(
            <div>
                <UsersManual setIsManual={setIsManual} language={language} />
            </div>
            )}
            </div>             
            )}
            {wavReady && (

            <div className="flex flex-row w-20 h-5 bg-white hover:bg-gray-200 p-1 rounded-lg shadow-lg relative ml-auto mr-3 mt-5 mb-auto" onClick={() => closeApp()}>
            <X size={14} />
            <div className="ml-2 text-xxs">終了する</div>
            </div>

            )}
            <audio src={wavUrl} ref={audioRef} preload="auto"/>
            <div className="hidden">{wavUrl}</div>
        </div>
    );
}

/*
            <div className="flex flex-col h-screen bg-stone-200">
            <button className="bg-cyan-500 hover:bg-cyan-700 text-white mx-auto mt-24 px-4 py-2 rounded text-base font-bold" onClick={() => {talkStart()}}>AIコンを始める</button>
            <div className="mx-auto mt-32 text-sm">使用言語(language)</div>
            <select className="mt-3 mx-auto text-sm w-36 h-8 text-center border-2 border-lime-600" value={dLang} onChange={selectLanguage}>
                {langList.map((lang, index) => {
                return <option key={index} value={lang}>{lang}</option>;
                })}
            </select>
            <button className="mt-auto mb-32 text-blue-500 hover:text-blue-700 text-sm">はじめにお読みください</button>
            </div>   
*/