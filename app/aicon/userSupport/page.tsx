'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams as useSearchParamsOriginal } from "next/navigation";
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client'

interface Message {
  id: string
  text: string
  senderId: string
  senderName: string
  timestamp: number
  type: 'user' | 'admin'
}

export default function UserSupportChat() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [registered, setRegistered] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [roomId, setRoomId] = useState<string | null>(null)
  const [chatStatus, setChatStatus] = useState<'none' | 'waiting' | 'active' | 'closed'>('none')
  const [adminName, setAdminName] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const useSearchParams = ()  => {
      const searchParams = useSearchParamsOriginal();
      return searchParams;
  }
  const searchParams = useSearchParams()
  const eventId = searchParams.get("eventId")
  const userName = searchParams.get("userName")
  const startMessage = searchParams.get("startMessage")
  //外国語対応
  //const language = searchParams.get("language")

  const router = useRouter()

  useEffect(() => {
      console.log(eventId, userName, startMessage)
  },[])

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
        timestamp: Date.now(),
        type: 'admin'
      }])
    })

    socketInstance.on('newChatMessage', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    socketInstance.on('chatClosed', (data) => {
      setChatStatus('closed')
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: data.message,
        senderId: 'system',
        senderName: 'システム',
        timestamp: Date.now(),
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
        timestamp: Date.now(),
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

  const startSupportChat = () => {
    console.log("startChat")
    if (socket && registered) {
        console.log(socket)
        if (eventId && userName && startMessage){
            console.log("start2")
            const firstMessage:Message[] = [{
                id: Date.now().toString(),
                text: startMessage,
                senderId: eventId,
                senderName: userName,
                timestamp: Date.now(),
                type: 'user'
            }]
            setMessages( firstMessage)
            socket.emit('startSupportChat', {
                initialMessage: startMessage
            })
        } else {
        alert("スタッフとのチャットに必要な情報が不足しています。最初からやり直してください。")
        }
    } else {
        console.log("socketがありません")
    }
  }

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (socket && inputText.trim() && roomId) {
      socket.emit('sendChatMessage', {
        roomId,
        text: inputText
      })
      setInputText('')
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
    const abort = confirm(`AIコンに戻ります。このページには戻れません。`)
    if (abort){
        router.back()
    } else {
        return
    }
  }



  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <div className="flex flex-row justify-between gap-x-4">
        <h2 className="font-bold text-lg mb-2">スタッフサポート</h2>
        <button className="mb-2 px-2 bg-gray-600 text-white text-xs rounded" onClick={backToAicon}>AIconに戻る</button>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${
            chatStatus === 'active' ? 'bg-green-500' : 
            chatStatus === 'waiting' ? 'bg-yellow-500' : 'bg-gray-500'
          }`}></div>
          <span className="text-sm text-gray-600">{getStatusText()}</span>
          {chatStatus === 'none' && (
        <div className="text-center py-8">
          <button
            onClick={startSupportChat}
            className="ml-6 px-1 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            サポートを要請する
          </button>
        </div>
      )}
        </div>
      </div>

      {chatStatus !== 'none' && (
        <>
          <div className="h-104 overflow-y-auto border rounded p-4 mb-4 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id} className={`mb-3 ${
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
                  <div className="text-sm">{message.text}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <form onSubmit={sendMessage} className="flex-1 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="メッセージを入力..."
                className="flex-1 p-1 border rounde text-sm"
                disabled={chatStatus !== 'active'}
              />
              <button
                type="submit"
                disabled={chatStatus !== 'active' || !inputText.trim()}
                className="px-4 py-1 text-sm bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                送信
              </button>
            </form>
            
            {(chatStatus === 'active' || chatStatus === 'waiting') && (
              <button
                onClick={closeChat}
                className="px-4 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                終了
              </button>
            )}
          </div>
        </>
      )}
      
    </div>
  )
}

/*

      {chatStatus === 'none' && (
        <div className="text-center py-8">
          <p className="mb-4">サポートが必要ですか？</p>
          <button
            onClick={startSupportChat}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            サポート開始
          </button>
        </div>
      )}
*/