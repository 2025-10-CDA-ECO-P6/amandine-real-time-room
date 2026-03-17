export type GameStatus = 'playing' | 'won' | 'lost'

export interface GameState {
    word: string
    revealed: string[]
    wrongLetters: string[]
    status: GameStatus
}

// Nombre maximum d'erreurs autorisées
export const MAX_WRONG = 15

export function createGame(word: string): GameState {
    const w = word.toUpperCase()
    return {
        word: w,
        revealed: Array(w.length).fill('_'), // masque toutes les lettres
        wrongLetters: [],
        status: 'playing',
    }
}

export function guessLetter(state: GameState, raw: string): GameState {
    if (state.status !== 'playing') return state

    const letter = raw.toUpperCase()
    const alreadyWrong = state.wrongLetters.includes(letter)
    const alreadyRevealed = state.revealed.includes(letter)
    if (alreadyWrong || alreadyRevealed) return state

    const isCorrect = state.word.includes(letter)

    if (isCorrect) {
        const revealed = state.word.split('').map((l, i) =>
            l === letter ? letter : state.revealed[i]
        )
        const won = revealed.every((l) => l !== '_')
        return { ...state, revealed, status: won ? 'won' : 'playing' }
    } else {
        const wrongLetters = [...state.wrongLetters, letter]
        const lost = wrongLetters.length >= MAX_WRONG
        return { ...state, wrongLetters, status: lost ? 'lost' : 'playing' }
    }
}
