import { describe, it, expect } from 'vitest'
import { getWordOfTheDay, WORDS } from './wordOfTheDay'

describe('getWordOfTheDay', () => {
    it('retourne un mot de la liste', () => {
        const word = getWordOfTheDay()
        expect(WORDS).toContain(word)
    })

    it('retourne toujours le même mot dans la même journée', () => {
        expect(getWordOfTheDay()).toBe(getWordOfTheDay())
    })

    it('fonctionne avec une liste personnalisée', () => {
        const list = ['POMME', 'POIRE']
        const word = getWordOfTheDay(list)
        expect(list).toContain(word)
    })

    it('ne retourne jamais undefined', () => {
        expect(getWordOfTheDay()).toBeDefined()
    })
})
