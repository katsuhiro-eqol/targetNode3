'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface Message {
  id: string
  text: string
  senderId: string
  senderName: string
  timestamp: number
  type: 'user' | 'admin'
}

interface UserSupportChatProps {
  userId: string
  username: string
}

export default function UserSupportChat({ userId, username }: UserSupportChatProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [roomId, setRoomId] = useState<string | null>(null)
  const [chatStatus, setChatStatus] = useState<'none' | 'waiting' | 'active' | 'closed'>('none')
  const [adminName, setAdminName] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {

    const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_SERVER

    const socketInstance = io(socketUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true
    })

    setSocket(socketInstance)

    socketInstance.on('connect', () => {
      socketInstance.emit('register', { userId, username, isAdmin: false })
      console.log(userId)
    })

    socketInstance.on('chatRoomCreated', (data) => {
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
  }, [userId, username])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startSupportChat = () => {
    if (socket) {
      socket.emit('startSupportChat', {
        initialMessage: 'こんにちは、サポートをお願いします。'
      })
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

  return (
    <div className="max-w-2xl mx-auto p-4 border rounded-lg">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">サポートチャット</h2>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${
            chatStatus === 'active' ? 'bg-green-500' : 
            chatStatus === 'waiting' ? 'bg-yellow-500' : 'bg-gray-500'
          }`}></div>
          <span className="text-sm text-gray-600">{getStatusText()}</span>
        </div>
      </div>

      {chatStatus === 'none' && (
        <div className="text-center py-8">
          <p className="mb-4">サポートが必要ですか？</p>
          <button
            onClick={startSupportChat}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            サポートチャットを開始
          </button>
        </div>
      )}

      {chatStatus !== 'none' && (
        <>
          <div className="h-64 overflow-y-auto border rounded p-4 mb-4 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id} className={`mb-3 ${
                message.type === 'user' ? 'text-right' : 'text-left'
              }`}>
                <div className={`inline-block max-w-xs p-2 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : message.senderId === 'system'
                    ? 'bg-gray-300 text-gray-700'
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
                className="flex-1 p-2 border rounded"
                disabled={chatStatus !== 'active'}
              />
              <button
                type="submit"
                disabled={chatStatus !== 'active' || !inputText.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                送信
              </button>
            </form>
            
            {(chatStatus === 'active' || chatStatus === 'waiting') && (
              <button
                onClick={closeChat}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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