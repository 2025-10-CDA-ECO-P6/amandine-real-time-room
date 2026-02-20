import { useState, useEffect } from 'react'
import { io, type Socket } from 'socket.io-client'
import { JoinRoom } from './JoinRoom'
import { ChatRoom } from './ChatRoom'
import './styles/main.scss'

const SOCKET_URL = import.meta.env.VITE_API_URL ?? ''

export default function App() {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [pseudo, setPseudo] = useState('')
    const [room, setRoom] = useState('')

    useEffect(() => () => { socket?.disconnect() }, [socket])

    function handleJoin(p: string, r: string) {
        const s = io(SOCKET_URL, { transports: ['websocket', 'polling'] })
        s.on('connect', () => {
            s.emit('join-room', { pseudo: p, room: r })
            setPseudo(p)
            setRoom(r)
            setSocket(s)
        })
    }

    function handleLeave() {
        socket?.disconnect()
        setSocket(null)
    }

    if (socket) {
        return <ChatRoom socket={socket} pseudo={pseudo} room={room} onLeave={handleLeave} />
    }

    return <JoinRoom onJoin={handleJoin} />
}
