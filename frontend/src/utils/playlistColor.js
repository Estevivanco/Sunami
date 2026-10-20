const GRADIENTS = [
    ['#1db954', '#158a3e'],
    ['#e13300', '#a32500'],
    ['#8d67ab', '#5e3d7a'],
    ['#bc5900', '#8a4000'],
    ['#0d73ec', '#0952a8'],
    ['#e91429', '#a80e1e'],
    ['#148a08', '#0b5705'],
    ['#c38b00', '#8c6400'],
    ['#7358ff', '#4a33cc'],
    ['#1e3264', '#111d3e'],
]

export const getPlaylistGradient = (name = '') => {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const [from, to] = GRADIENTS[Math.abs(hash) % GRADIENTS.length]
    return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`
}
