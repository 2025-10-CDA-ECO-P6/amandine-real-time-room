import { useEffect, useRef, useState } from 'react'
import { type Socket } from 'socket.io-client'

interface Message {
    id: string
    pseudo?: string
    content: string
    time: string
    own: boolean
    system: boolean
}

interface Props {
    socket: Socket
    pseudo: string
    room: string
    onLeave: () => void
}

export function ChatRoom({ socket, pseudo, room, onLeave }: Props) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        const add = (content: string, system = false, msgPseudo?: string, own = false) => {
            setMessages((prev) => [
                ...prev,
                { id: crypto.randomUUID(), content, system, pseudo: msgPseudo, own, time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) },
            ])
        }

        socket.on('new-message', (d: { pseudo: string; content: string }) =>
            add(d.content, false, d.pseudo, d.pseudo === pseudo))
        socket.on('user-joined', (d: { pseudo: string }) => add(`${d.pseudo} a rejoint la room.`, true))
        socket.on('user-left', (d: { pseudo: string }) => add(`${d.pseudo} a quitté la room.`, true))

        return () => { socket.off('new-message').off('user-joined').off('user-left') }
    }, [socket, pseudo])

    function handleSend(e: React.FormEvent) {
        e.preventDefault()
        if (!input.trim()) return
        socket.emit('send-message', { content: input.trim() })
        setInput('')
    }

    return (
        <div className="chat">
            <aside className="chat__sidebar">
                <p className="chat__sidebar-title">Connecté en tant que</p>
                <p className="chat__pseudo">{pseudo}</p>
            </aside>

            <header className="chat__header">
                <span className="chat__room">{room}</span>
                <button className="chat__leave" onClick={onLeave}>Quitter</button>
            </header>

            <main className="chat__messages">
                {messages.map((msg) =>
                    msg.system ? (
                        <p key={msg.id} className="chat__system">{msg.content}</p>
                    ) : (
                        <div key={msg.id} className={`chat__msg${msg.own ? ' chat__msg--own' : ''}`}>
                            {!msg.own && <span className="chat__msg-pseudo">{msg.pseudo}</span>}
                            <span className="chat__bubble">{msg.content}</span>
                            <span className="chat__time">{msg.time}</span>
                        </div>
                    )
                )}
                <div ref={bottomRef} />
            </main>

            <form className="chat__composer" onSubmit={handleSend}>
                <input
                    className="chat__input"
                    placeholder="Écris un message..."
                    value={input}
                    maxLength={500}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button className="chat__send" disabled={!input.trim()}>↑</button>
            </form>
        </div>
    )
}