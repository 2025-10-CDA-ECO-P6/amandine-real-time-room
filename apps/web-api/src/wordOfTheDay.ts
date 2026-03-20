export const WORDS = [
    'CHAT', 'CHIEN', 'LAPIN', 'OISEAU', 'VACHE',
    'CANARD', 'SOLEIL', 'LUNE', 'ETOILE', 'MAISON',
    'ARBRE', 'FLEUR', 'NUAGE', 'POMME', 'BATEAU',
]

export function getWordOfTheDay(words: string[] = WORDS): string {
    const day = Math.floor(Date.now() / 86_400_000)
    return words[day % words.length]
}
