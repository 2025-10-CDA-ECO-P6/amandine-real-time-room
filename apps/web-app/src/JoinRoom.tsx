import { useState } from 'react'

interface Props {
    onJoin: (pseudo: string, room: string) => void
}

export function JoinRoom({ onJoin }: Props) {
    const [pseudo, setPseudo] = useState('')
    const [room, setRoom] = useState('')

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (pseudo.trim() && room.trim()) {
            onJoin(pseudo.trim(), room.trim())
        }
    }

    return (
        <div className="join">
            <form className="join__card" onSubmit={handleSubmit}>
                <h1 className="join__title">RealTime Room</h1>
                <p className="join__subtitle">Rejoins une room et discute en direct.</p>

                <label className="join__label" htmlFor="pseudo">Pseudo</label>
                <input
                    id="pseudo"
                    className="join__input"
                    placeholder="ex: amandine"
                    value={pseudo}
                    maxLength={20}
                    onChange={(e) => setPseudo(e.target.value)}
                    autoFocus
                />

                <label className="join__label" htmlFor="room">Room</label>
                <input
                    id="room"
                    className="join__input"
                    placeholder="ex: general"
                    value={room}
                    maxLength={30}
                    onChange={(e) => setRoom(e.target.value)}
                />

                <button className="join__btn" disabled={!pseudo.trim() || !room.trim()}>
                    Rejoindre →
                </button>
            </form>
        </div>
    )
}