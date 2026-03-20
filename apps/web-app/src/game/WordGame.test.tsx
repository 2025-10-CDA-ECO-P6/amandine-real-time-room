import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WordGame } from './WordGame'

beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ word: 'CHAT' }),
    } as any)
})

describe('WordGame — affichage initial', () => {
    it('affiche les underscores pour chaque lettre', async () => {
        render(<WordGame />)
        await waitFor(() => expect(screen.getAllByText('_').length).toBe(4))
    })

    it('affiche le clavier avec les 26 lettres', async () => {
        render(<WordGame />)
        await waitFor(() => expect(screen.getByRole('button', { name: 'A' })).toBeInTheDocument())
        expect(screen.getByRole('button', { name: 'Z' })).toBeInTheDocument()
    })

    it('affiche la zone interdite vide au départ', async () => {
        render(<WordGame />)
        await waitFor(() => expect(screen.getByTestId('wrong-zone')).toBeInTheDocument())
    })
})

describe('WordGame — interaction', () => {
    it('révèle la lettre correcte dans le mot', async () => {
        render(<WordGame />)
        await waitFor(() => screen.getByRole('button', { name: 'C' }))
        fireEvent.click(screen.getByRole('button', { name: 'C' }))
        expect(screen.getAllByText('_').length).toBe(3)
        expect(screen.getAllByText('C').length).toBeGreaterThanOrEqual(1)
    })

    it('envoie la mauvaise lettre dans la zone interdite', async () => {
        render(<WordGame />)
        await waitFor(() => screen.getByRole('button', { name: 'Z' }))
        fireEvent.click(screen.getByRole('button', { name: 'Z' }))
        expect(screen.getByTestId('wrong-zone')).toHaveTextContent('Z')
    })

    it('désactive un bouton après utilisation', async () => {
        render(<WordGame />)
        await waitFor(() => screen.getByRole('button', { name: 'Z' }))
        const btn = screen.getByRole('button', { name: 'Z' })
        fireEvent.click(btn)
        expect(btn).toBeDisabled()
    })

    it('affiche le message de victoire', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            json: () => Promise.resolve({ word: 'OK' }),
        } as any)
        render(<WordGame />)
        await waitFor(() => screen.getByRole('button', { name: 'O' }))
        fireEvent.click(screen.getByRole('button', { name: 'O' }))
        fireEvent.click(screen.getByRole('button', { name: 'K' }))
        await waitFor(() => expect(screen.getByTestId('result-won')).toBeInTheDocument())
    })

    it('affiche le message de défaite', async () => {
        render(<WordGame />)
        await waitFor(() => screen.getByRole('button', { name: 'Z' }))

        for (const l of ['Z', 'X', 'W', 'V', 'U', 'Y', 'S', 'R', 'Q', 'P', 'O', 'N', 'M', 'L', 'K']) {
            const btn = screen.getByRole('button', { name: l })
            fireEvent.click(btn)
            await waitFor(() => expect(btn).toBeDisabled())
        }

        await waitFor(() => expect(screen.getByTestId('result-lost')).toBeInTheDocument())
    })
})
