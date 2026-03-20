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
                <h1 className="join__title">🎮 RealTime Room</h1>
                <p className="join__subtitle">Rejoins une room et joue avec tes amis !</p>

                <details className="join__rules">
                    <summary>📖 Comment jouer au Mot du jour ?</summary>
                    <ul className="join__rules-list">
                        <li>Clique sur une lettre pour deviner le mot du jour.</li>
                        <li>Si la lettre est dans le mot, elle apparaît ! 🎉</li>
                        <li>Sinon, elle va dans la <strong>zone interdite</strong> 🚫</li>
                        <li>15 erreurs et c'est perdu… Bonne chance !</li>
                    </ul>
                </details>

                <label className="join__label" htmlFor="pseudo">Pseudo</label>
                <input
                    id="pseudo"
                    className="join__input"
                    placeholder="ex: Amandine"
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
