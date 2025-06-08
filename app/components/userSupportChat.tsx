'use client'

import { useState, useEffect, useRef } from 'react'
//import { useSearchParams as useSearchParamsOriginal } from "next/navigation";
//import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client'
import { Send } from 'lucide-react';

interface Message {
  id: string
  text: string
  senderId: string
  senderName: string
  language: string
  timestamp: number
  translated: string |null
  type: 'user' | 'admin'
}

interface UserSupportProps {
  eventId: string;
  setStaffModal:(staffModal: boolean ) => void;
  language: string
}

export default function UserSupportChat({eventId, setStaffModal, language}:UserSupportProps) {
    const [windowHeight, setWindowHeight] = useState<number>(0)
    const [socket, setSocket] = useState<Socket | null>(null)
    const [registered, setRegistered] = useState<boolean>(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputText, setInputText] = useState('')
    const [roomId, setRoomId] = useState<string | null>(null)
    const [chatStatus, setChatStatus] = useState<'none' | 'waiting' | 'active' | 'closed'>('none')
    const [adminName, setAdminName] = useState<string | null>(null)
    const [senderName, setSenderName] = useState<string>("")
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const userName = "AIcon-User"

    useEffect(() => {

        const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_SERVER
        console.log(process.env.NEXT_PUBLIC_WEBSOCKET_SERVER)

        const socketInstance = io(socketUrl, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        withCredentials: true
        })

    setSocket(socketInstance)

    socketInstance.on('connect', () => {
        socketInstance.emit('register', { userId:eventId, username:userName, isAdmin: false })
    })

    
    socketInstance.on("registerd", () => {
        console.log("registerd")
        setRegistered(true)
    })
    

    socketInstance.on('chatRoomCreated', (data) => {
        console.log("chatRoomCreated",data)
        setRoomId(data.roomId)
        setChatStatus('waiting')
    })

    socketInstance.on('adminJoined', (data) => {
        setAdminName(data.adminName)
        setChatStatus('active')
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: data.message,
            senderId: 'system',
            senderName: 'システム',
            language:"日本語",
            timestamp: Date.now(),
            translated: data.message,
            type: 'admin'
        }])
    })

    socketInstance.on('newChatMessage', (message: Message) => {
        console.log(message)
        setMessages(prev => [...prev, message])
    })

    socketInstance.on('chatClosed', (data) => {
        setChatStatus('closed')
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: data.message,
            senderId: 'system',
            senderName: 'システム',
            language:"日本語",
            timestamp: Date.now(),
            translated: data.message,
            type: 'admin'
        }])
    })

    socketInstance.on('adminDisconnected', (data) => {
        setChatStatus('waiting')
        setAdminName(null)
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: data.message,
            senderId: 'system',
            senderName: 'システム',
            language:"日本語",
            timestamp: Date.now(),
            translated: data.message,
            type: 'admin'
        }])
    })

    return () => {
        socketInstance.disconnect()
        }
    }, [eventId, userName])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const startSupportChat = async() => {
        if (socket && registered) {
            if (eventId && inputText.trim()){
                const translated = await translateText(inputText, language)
                if (senderName !== ""){
                    const firstMessage:Message[] = [{
                        id: Date.now().toString(),
                        text: inputText,
                        senderId: eventId,
                        senderName: senderName,
                        language: language,
                        timestamp: Date.now(),
                        translated: translated,
                        type: 'user'
                    }]
                    setMessages( firstMessage)
                    socket.emit('startSupportChat', {
                        initialMessage: inputText,
                        senderName:senderName,
                        language: language,
                        translated: translated
                    })
                    setInputText('')
                } else {
                    const firstMessage:Message[] = [{
                        id: Date.now().toString(),
                        text: inputText,
                        senderId: eventId,
                        senderName: userName,
                        language: language,
                        timestamp: Date.now(),
                        translated: translated,
                        type: 'user'
                    }]
                    setSenderName(userName)
                    setMessages( firstMessage)
                    socket.emit('startSupportChat', {
                        initialMessage: inputText,
                        senderName:"AIcon-User",
                        language:language,
                        translated: translated
                    })
                    setInputText('')                    
                }
            }
        } else {
            console.log("socketがありません")
        }
    }

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()

        if ((chatStatus === "none") && inputText.trim()){
            startSupportChat()
        } else if ((socket && inputText.trim() && roomId) ) {
            const translated = await translateText(inputText, language)
            socket.emit('sendChatMessage', {
                roomId,
                text: inputText,
                senderName: senderName,
                language: language,
                translated: translated
            })            
            setInputText('')
        }
    }

    const translateText = async (text:string, lang:string) => {
        if (lang !== "日本語"){
            const response = await fetch("/api/translateToJP", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                //body: JSON.stringify({ input: userInput, character: character, fewShot: fewShot, previousData: previousData, sca: scaList[character] }),
                body: JSON.stringify({ answer: text, language:lang}),
              });
          
              const translated = await response.json()
              return translated.japanese
        } else {
            return null
        }
    }

    const closeChat = () => {
        if (socket && roomId) {
        socket.emit('closeSupportChat', { roomId })
        }
    }

    const getStatusText = () => {
        switch (chatStatus) {
        case 'none': return 'サポートチャットを開始できます'
        case 'waiting': return '管理者の応答をお待ちください...'
        case 'active': return `${adminName}が対応中`
        case 'closed': return 'チャットが終了しました'
        default: return ''
        }
    }

    const backToAicon = () => {
        const abort = confirm(`このチャットルームを終了します`)
        if (abort){
            if (chatStatus === "active"){
                closeChat()
            }
            setStaffModal(false)
        } else {
            return
        }
    }

    useEffect(() => {
        const updateHeight = () => {
            setWindowHeight(window.innerHeight);
          };
      
          updateHeight(); // 初期値設定
          window.addEventListener("resize", updateHeight);

        return () => {
            window.removeEventListener("resize", updateHeight);
        };
    },[])

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50">
            <div className="flex flex-col w-96 h-[90vh] bg-white p-6 rounded-lg shadow-lg relative mx-auto mt-auto mb-10">
        <div className="flex flex-col w-full overflow-hidden" style={{ height: windowHeight || "100dvh" }}>
        <div>
            <div className="flex flex-row justify-between gap-x-4 mx-5 my-3">
            <h2 className="font-bold mb-2">スタッフサポート</h2>
            <button className="mb-2 px-2 bg-gray-600 text-white text-xs rounded" onClick={backToAicon}>AIconに戻る</button>
            </div>
            {(chatStatus === "none") && (
                <div>
                <div className="text-xs ml-2 my-1">あなたの名前または部屋番号</div>
                <input className="block w-5/6 max-w-96 mx-auto mb-2 px-2 py-1 text-xs bg-gray-100"
                    placeholder="未入力でも可"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                     />
                </div>
            )}

            <div className="flex items-center gap-2 mb-2 ml-3">
            <div className={`w-3 h-3 rounded-full ${
                chatStatus === 'active' ? 'bg-green-500' : 
                chatStatus === 'waiting' ? 'bg-yellow-500' : 'bg-gray-500'
            }`}></div>
            <span className="text-xs text-gray-600">{getStatusText()}</span>
            </div>
        </div>


            <>
            <div className="flex-none h-[48vh] w-11/12 min-w-80 max-w-96 mx-auto overflow-auto bg-yellow-100">
                {messages.map((message) => (
                <div key={message.id} className={`m-2 ${
                    message.type === 'user' ? 'text-right' : 'text-left'
                }`}>
                    <div className={`inline-block max-w-xs p-2 rounded-lg ${
                    message.type === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : message.senderId === 'system'
                        ? 'bg-gray-200 text-black'
                        : 'bg-white border'
                    }`}>
                    <div className="text-xs opacity-70 mb-1">
                        {message.senderName} - {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                    {message.type !== "admin" ? (
                        <div className="text-xs">{message.text}</div>
                    ):(
                        <div className="text-xs">{message.translated}</div>
                    )}
                    
                    
                    </div>
                </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2 mt-3 mx-2">
                <form onSubmit={sendMessage} className="flex-1 flex gap-2">
                <textarea
                    name="message"
                    rows={2}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="メッセージを入力..."
                    className="flex-1 p-1 border rounde text-sm"
                    disabled={chatStatus !== 'active' && chatStatus !== 'none'}
                />
                <button
                    type="submit"
                    disabled={(chatStatus !== 'active' && chatStatus !== 'none') || !inputText.trim()}
                    className="px-2 py-1 text-sm bg-blue-500 text-white rounded disabled:bg-gray-300"
                >
                    <Send className="mx-aute" size={18} />
                </button>
                </form>
            </div>
            </>
        </div>
        </div>
        </div>
    )
}

/*
                {messages.map((message) => (
                <div key={message.id} className={`m-2 ${
                    message.type === 'user' ? 'text-right' : 'text-left'
                }`}>
                    <div className={`inline-block max-w-xs p-2 rounded-lg ${
                    message.type === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : message.senderId === 'system'
                        ? 'bg-gray-200 text-black'
                        : 'bg-white border'
                    }`}>
                    <div className="text-xs opacity-70 mb-1">
                        {message.senderName} - {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                    {message.type === "user" ? (
                        <div className="text-xs">{message.text}</div>
                    ): message.senderId ? (
                        <div className="text-xs">{message.text}</div>
                    ): message.type === "admin" ? (
                        <div className="text-xs">{message.translated}</div>
                    ) :(<div>no message</div>)}
                    
                    </div>
                </div>
                ))}
                */