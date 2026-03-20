import { useState, useEffect } from 'react'
import { createGame, guessLetter, type GameState } from './gameLogic'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function playSound(type: 'correct' | 'wrong' | 'won' | 'lost') {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.connect(g)
        g.connect(ctx.destination)
        const configs = {
            correct: { freq: 520, duration: 0.15, type: 'sine' as OscillatorType },
            wrong:   { freq: 200, duration: 0.2,  type: 'sawtooth' as OscillatorType },
            won:     { freq: 660, duration: 0.5,  type: 'sine' as OscillatorType },
            lost:    { freq: 150, duration: 0.6,  type: 'sawtooth' as OscillatorType },
        }
        const c = configs[type]
        o.type = c.type
        o.frequency.value = c.freq
        g.gain.setValueAtTime(0.3, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + c.duration)
        o.start()
        o.stop(ctx.currentTime + c.duration)
    } catch {
        // AudioContext non disponible en test
    }
}

export function WordGame() {
    const [game, setGame] = useState<GameState | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    function fetchWord() {
        setLoading(true)
        setError(false)
        fetch(`${API_URL}/word-of-the-day`)
            .then((r) => r.json())
            .then(({ word }: { word: string }) => {
                setGame(createGame(word))
                setLoading(false)
            })
            .catch(() => {
                setError(true)
                setLoading(false)
            })
    }

    useEffect(() => { fetchWord() }, [])

    function handleLetter(letter: string) {
        if (!game) return
        const wasCorrect = game.word.includes(letter)
        const next = guessLetter(game, letter)
        if (next === game) return

        if (next.status === 'won') playSound('won')
        else if (next.status === 'lost') playSound('lost')
        else if (wasCorrect) playSound('correct')
        else playSound('wrong')

        setGame(next)
    }

    if (loading) return <div className="word-game__loading"><span>⏳</span><p>Chargement...</p></div>
    if (error) return <div className="word-game__loading"><p>❌ Impossible de charger le mot.</p></div>
    if (!game) return null

    const usedLetters = new Set([
        ...game.wrongLetters,
        ...game.revealed.filter((l) => l !== '_'),
    ])

    return (
        <div className="word-game">
            <h2 className="word-game__title">Mot du jour</h2>

            <div className="word-game__word">
                {game.revealed.map((l, i) => (
                    <span key={i} className="word-game__letter">{l}</span>
                ))}
            </div>

            {game.status === 'won' && (
                <div data-testid="result-won" className="word-game__result word-game__result--won">
                    <span style={{ fontSize: '4rem' }}>🎉</span>
                    <p>Bravo, tu as trouvé !</p>
                    <button className="word-game__replay" onClick={fetchWord}>Rejouer 🔄</button>
                </div>
            )}

            {game.status === 'lost' && (
                <div data-testid="result-lost" className="word-game__result word-game__result--lost">
                    <span style={{ fontSize: '4rem' }}>😢</span>
                    <p>Le mot était : <strong>{game.word}</strong></p>
                    <button className="word-game__replay" onClick={fetchWord}>Rejouer 🔄</button>
                </div>
            )}

            <div data-testid="wrong-zone" className="word-game__wrong-zone">
                <p className="word-game__wrong-title">🚫 Zone interdite</p>
                <div className="word-game__wrong-letters">
                    {game.wrongLetters.map((l) => (
                        <span key={l} className="word-game__wrong-letter">{l}</span>
                    ))}
                </div>
            </div>

            {game.status === 'playing' && (
                <div className="word-game__keyboard">
                    {ALPHABET.map((l) => (
                        <button
                            key={l}
                            onClick={() => handleLetter(l)}
                            disabled={usedLetters.has(l)}
                            className={[
                                'word-game__key',
                                game.wrongLetters.includes(l) ? 'word-game__key--wrong' : '',
                                game.revealed.includes(l) ? 'word-game__key--correct' : '',
                            ].join(' ').trim()}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
