import { describe, it, expect } from 'vitest'
import { createGame, guessLetter, GameState } from './gameLogic'

describe('createGame', () => {
    it('crée un jeu avec le mot donné en majuscules', () => {
        const g = createGame('chat')
        expect(g.word).toBe('CHAT')
    })

    it('démarre avec des lettres masquées', () => {
        const g = createGame('chat')
        expect(g.revealed).toEqual(['_', '_', '_', '_'])
    })

    it('démarre avec une liste de mauvaises lettres vide', () => {
        const g = createGame('chat')
        expect(g.wrongLetters).toEqual([])
    })

    it('démarre avec le statut "playing"', () => {
        const g = createGame('chat')
        expect(g.status).toBe('playing')
    })
})

describe('guessLetter — bonne lettre', () => {
    it('révèle la lettre dans revealed', () => {
        const g = createGame('chat')
        const next = guessLetter(g, 'C')
        expect(next.revealed[0]).toBe('C')
    })

    it('révèle toutes les occurrences (ex: MAMAN)', () => {
        const g = createGame('maman')
        const next = guessLetter(g, 'M')
        expect(next.revealed).toEqual(['M', '_', 'M', '_', 'N'].map((l, i) =>
            l === 'M' ? 'M' : '_'
        ))
        // version claire :
        expect(next.revealed[0]).toBe('M')
        expect(next.revealed[2]).toBe('M')
        expect(next.revealed[1]).toBe('_')
    })

    it('ne modifie pas wrongLetters', () => {
        const g = createGame('chat')
        const next = guessLetter(g, 'C')
        expect(next.wrongLetters).toEqual([])
    })

    it('passe le statut à "won" quand toutes les lettres sont trouvées', () => {
        let g = createGame('ok')
        g = guessLetter(g, 'O')
        g = guessLetter(g, 'K')
        expect(g.status).toBe('won')
    })
})

describe('guessLetter — mauvaise lettre', () => {
    it('ajoute la lettre dans wrongLetters', () => {
        const g = createGame('chat')
        const next = guessLetter(g, 'Z')
        expect(next.wrongLetters).toContain('Z')
    })

    it('ne modifie pas revealed', () => {
        const g = createGame('chat')
        const next = guessLetter(g, 'Z')
        expect(next.revealed).toEqual(['_', '_', '_', '_'])
    })

    it('passe le statut à "lost" après 6 mauvaises lettres', () => {
        let g = createGame('chat')
        for (const l of ['Z', 'X', 'W', 'V', 'U', 'Y']) {
            g = guessLetter(g, l)
        }
        expect(g.status).toBe('lost')
    })
})

describe('guessLetter — cas limites', () => {
    it('ignore une lettre déjà jouée (bonne)', () => {
        let g = createGame('chat')
        g = guessLetter(g, 'C')
        const next = guessLetter(g, 'C') // rejouer C
        expect(next.wrongLetters.length).toBe(0)
        expect(next.revealed[0]).toBe('C')
    })

    it('ignore une lettre déjà jouée (mauvaise)', () => {
        let g = createGame('chat')
        g = guessLetter(g, 'Z')
        const next = guessLetter(g, 'Z')
        expect(next.wrongLetters.length).toBe(1) // toujours 1, pas 2
    })

    it('ne joue pas si le jeu est terminé', () => {
        let g = createGame('ok')
        g = guessLetter(g, 'O')
        g = guessLetter(g, 'K')
        const next = guessLetter(g, 'Z')
        expect(next.wrongLetters.length).toBe(0)
    })
})
