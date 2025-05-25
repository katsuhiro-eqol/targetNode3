'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface Message {
  id: string
  text: string
  senderId: string
  senderName: string
  targetUserId?: string
  timestamp: number
  type: 'message' | 'private'
}

interface User {
  socketId: string
  username: string
  joinedAt: number
}

export function useSocket(username: string) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  useEffect(() => {
    if (!username) return

    const socketUrl = process.env.NODE_ENV === 'production'
  ? process.env.NEXT_PUBLIC_WEBSOCKET_URL
  : 'http://localhost:3000'

    const socketInstance = io(socketUrl, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        withCredentials: true
    })
    setSocket(socketInstance)

    socketInstance.on('connect', () => {
      setIsConnected(true)
      socketInstance.emit('register', { username })
      //console.log(username)
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
    })

    socketInstance.on('newMessage', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    socketInstance.on('newPrivateMessage', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    socketInstance.on('userList', (userList: User[]) => {
        //console.log("userList", userList)
      setUsers(userList)
    })

    socketInstance.on('userJoined', (user: { userId: string; username: string }) => {
      setUsers(prev => [...prev, { socketId: user.userId, username: user.username, joinedAt: Date.now() }])
    })

    socketInstance.on('userLeft', (user: { userId: string; username: string }) => {
      setUsers(prev => prev.filter(u => u.socketId !== user.userId))
    })

    socketInstance.on('userTyping', (data: { userId: string; username: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        if (data.isTyping) {
          return prev.includes(data.username) ? prev : [...prev, data.username]
        } else {
          return prev.filter(user => user !== data.username)
        }
      })
    })

    socketInstance.on('messageReaction', (data) => {
      console.log('Reaction received:', data)
    })

    socketInstance.on('reactionNotification', (data) => {
      console.log('Someone reacted to your message!', data)
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [username])

  const sendMessage = (text: string) => {
    if (socket && text.trim()) {
      socket.emit('sendMessage', { text })
    }
  }

  const sendPrivateMessage = (targetUserId: string, text: string) => {
    if (socket && text.trim()) {
      socket.emit('sendPrivateMessage', { targetUserId, text })
    }
  }

  const reactToMessage = (messageId: string, reaction: string, targetUserId?: string) => {
    if (socket) {
      socket.emit('reactToMessage', { messageId, reaction, targetUserId })
    }
  }

  const setTyping = (isTyping: boolean) => {
    if (socket) {
      socket.emit('typing', { isTyping })
    }
  }

  return {
    socket,
    messages,
    users,
    isConnected,
    typingUsers,
    sendMessage,
    sendPrivateMessage,
    reactToMessage,
    setTyping
  }
}