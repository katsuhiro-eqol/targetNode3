'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface Message {
  id: string
  text: string
  senderId: string
  senderName: string
  language: string
  timestamp: number
  translated:string | null
  type: 'user' | 'admin'
}

interface ChatRoom {
  id: string
  userId: string
  username: string
  adminId: string | null
  adminName: string | null
  status: 'waiting' | 'active' | 'closed'
  createdAt: number
  messages: Message[]
}

interface AdminDashboardProps {
  adminId: string
  adminName: string
  event: string
}

export default function AdminDashboard({ adminId, adminName, event }: AdminDashboardProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [waitingRooms, setWaitingRooms] = useState<ChatRoom[]>([])
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [language, setLanguage] = useState<string>("日本語")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const socketUrl = process.env. NEXT_PUBLIC_WEBSOCKET_SERVER
    console.log(process.env. NEXT_PUBLIC_WEBSOCKET_SERVER)
    const socketInstance = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true
    })
    setSocket(socketInstance)

    socketInstance.on('connect', () => {
      socketInstance.emit('register', { userId: adminId, username: adminName, isAdmin: true })
    })

    socketInstance.on('waitingChatRooms', (rooms: ChatRoom[]) => {
      setWaitingRooms(rooms)
    })

    socketInstance.on('newSupportRequest', (room: ChatRoom) => {

      setWaitingRooms(prev => [...prev, room])
      /*
      setTimeout(() => {
        setWaitingRooms(prev => [...prev, room])
      }, 1000)
      */
    })

    socketInstance.on('supportTaken', (data) => {
      setWaitingRooms(prev => prev.filter(room => room.id !== data.roomId))
    })

    socketInstance.on('chatHistory', (history: Message[]) => {
      setMessages(history)
    })

    socketInstance.on('newChatMessage', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    socketInstance.on('chatClosed', () => {
      setActiveRoom(null)
      setMessages([])
      socketInstance.emit('getWaitingChats')
    })

    socketInstance.on('userDisconnected', () => {
      console.log("userDisconnected")
      setActiveRoom(null)
      setMessages([])
      socketInstance.emit('getWaitingChats')
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [adminId, adminName])


  useEffect(() => {
    console.log(waitingRooms)
  }, [waitingRooms])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    console.log(language)
  }, [language])

  const joinChat = (room: ChatRoom) => {
    console.log(room.messages[0].language)
    setLanguage(room.messages[0].language)
    if (socket) {
      socket.emit('joinSupportChat', { roomId: room.id })
      setActiveRoom(room)
    }
  }

  const sendMessage = async(e: React.FormEvent) => {
    e.preventDefault()
    if (socket && inputText.trim() && activeRoom) {
      const translated = await translateText(inputText)
      console.log("admin", translated)
      socket.emit('sendChatMessage', {
        roomId: activeRoom.id,
        text: inputText,
        senderName:adminName,
        translated:translated
      })
      setInputText('')
    }
  }

  const translateText = async (text:string) => {
    if (language !== "日本語"){
        const response = await fetch("/api/translate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            //body: JSON.stringify({ input: userInput, character: character, fewShot: fewShot, previousData: previousData, sca: scaList[character] }),
            body: JSON.stringify({ answer: text, language:language}),
          });
      
          const translated = await response.json()
          return translated.foreign
    } else {
        return text
    }
}

  const closeChat = () => {
    if (socket && activeRoom) {
      socket.emit('closeSupportChat', { roomId: activeRoom.id })
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">メッセージダッシュボード:　{event}</h1>
      <p className="mt-5 mb-2">スタッフ: {adminName}</p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 待機中のチャット一覧 */}
        <div>
          <h2 className="font-semibold mb-4">サポート要請リスト ({waitingRooms.length})</h2>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {waitingRooms.map((room) => (
              <div key={room.id} className="border rounded p-1 bg-gray-50 hover:bg-gray-100">
                <div className="flex justify-between items-start mb-2" >
                  <strong>{room.messages[0].senderName}</strong>
                  <span className="text-xs text-gray-500">
                    {new Date(room.createdAt).toLocaleTimeString()}
                  </span>
                  <span className="text-xs text-gray-500">
                  {room.messages[0].language}
                  </span>
                  {(room.id === activeRoom?.id) ? (
                    <button className="px-3 py-1 text-xs rounded bg-gray-700 text-white" onClick={closeChat}>チャット終了</button>
                  ):(
                    <button
                    onClick={() => joinChat(room)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  >
                    対応開始
                  </button>
                  )}

                </div>      
                <div className="text-sm text-gray-600 mb-2">
                  {room.messages[0]?.text || 'メッセージなし'}
                </div>          
                {room.messages[0].language !=="日本語" && (
                  <div className="text-sm">{room.messages[0]?.translated}</div>
                )}
              </div>
            ))}

            {waitingRooms.length === 0 && (
              <p className="text-gray-500 text-center py-4">待機中のサポート要求はありません</p>
            )}
          </div>
        </div>

        {/* アクティブなチャット */}
        <div className="lg:col-span-2 border rounded-lg flex flex-col">
          {activeRoom ? (
            <>
              
              <div className="flex-1 overflow-y-auto p-4 h-96">
                {messages.map((message) => (
                  <div key={message.id} className={`mb-3 ${
                    message.type === 'admin' ? 'text-right' : 'text-left'
                  }`}>
                    <div className={`inline-block max-w-xs p-2 rounded-lg ${
                      message.type === 'admin' 
                        ? 'bg-gray-200' 
                        : 'bg-green-500 text-white'
                    }`}>
                      <div className="text-xs opacity-70 mb-1">
                        {message.senderName} - {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-sm">{message.text}</div>
                      {language !== "日本語" && (
                        <div className="text-sm">{message.translated}</div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="返信を入力..."
                    className="flex-1 p-2 border rounded"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
                  >
                    送信
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <p className="text-gray-500">チャットを選択してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/*
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">{activeRoom.messages[0].senderName}とのチャット</h2>
                  <button
                    onClick={closeChat}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    チャット終了
                  </button>
                </div>
              </div>
*/