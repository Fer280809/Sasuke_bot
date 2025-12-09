import fetch from 'node-fetch'
import fs from 'fs'

// ═══════════════════════════════════════════════════════════
//        🔥 SISTEMA DE GACHA SASUKE BOT 🔥
//        Personajes ilimitados desde API
// ═══════════════════════════════════════════════════════════

let handler = async (m, { conn, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    
    // Inicializar sistema de gacha si no existe
    if (!user.gacha) {
        user.gacha = {
            characters: [],
            lastClaim: 0,
            totalClaims: 0,
            coins: 100
        }
    }
    
    // Cooldown de 10 minutos
    const cooldown = 600000 // 10 minutos
    const timeSinceLastClaim = Date.now() - user.gacha.lastClaim
    
    if (timeSinceLastClaim < cooldown && !user.premium) {
        const timeLeft = msToTime(cooldown - timeSinceLastClaim)
        return m.reply(`⏳ *Cooldown Activo*\n\n⚡ Debes esperar *${timeLeft}* para reclamar otro personaje.\n\n💎 *Premium*: Sin cooldown`)
    }
    
    // Verificar si tiene coins suficientes
    const claimCost = 10
    if (user.gacha.coins < claimCost) {
        return m.reply(`⚠️ *Coins Insuficientes*\n\n💰 Necesitas *${claimCost} coins* para reclamar.\n\n🔹 Tus coins: *${user.gacha.coins}*\n\n📌 Gana coins con comandos o juegos.`)
    }
    
    m.react('🎲')
    
    try {
        // ═══════════════════════════════════════════════════════════
        //           OBTENER PERSONAJE ALEATORIO DE API
        // ═══════════════════════════════════════════════════════════
        
        let character
        let imageUrl
        let characterData
        
        // API 1: Waifu.pics (Anime)
        try {
            const waifuRes = await fetch('https://api.waifu.pics/sfw/waifu')
            const waifuData = await waifuRes.json()
            imageUrl = waifuData.url
            
            // Obtener info adicional del personaje
            const anilistRes = await fetch('https://api.jikan.moe/v4/random/characters')
            const anilistData = await anilistRes.json()
            
            if (anilistData.data) {
                characterData = anilistData.data
                character = {
                    name: characterData.name || characterData.name_kanji || 'Desconocido',
                    series: characterData.anime?.[0]?.anime?.title || 'Original',
                    rarity: getRarity(),
                    gender: Math.random() > 0.5 ? 'Masculino' : 'Femenino',
                    id: `${characterData.mal_id || Date.now()}`,
                    image: characterData.images?.jpg?.image_url || imageUrl,
                    about: characterData.about ? characterData.about.slice(0, 200) + '...' : 'Sin descripción',
                    claimedAt: Date.now(),
                    votes: 0,
                    price: calculatePrice(getRarity())
                }
            } else {
                // Fallback si no hay datos de API
                character = generateRandomCharacter(imageUrl)
            }
        } catch (error) {
            console.error('Error al obtener personaje:', error)
            // Generar personaje genérico
            character = generateRandomCharacter()
        }
        
        // Guardar personaje en inventario
        user.gacha.characters.push(character)
        user.gacha.lastClaim = Date.now()
        user.gacha.totalClaims += 1
        user.gacha.coins -= claimCost
        
        // Dar coins bonus por rareza
        const coinsBonus = {
            'Común': 5,
            'Raro': 15,
            'Épico': 30,
            'Legendario': 50,
            'Mítico': 100
        }
        user.gacha.coins += coinsBonus[character.rarity] || 5
        
        // ═══════════════════════════════════════════════════════════
        //                    MENSAJE DE RESULTADO
        // ═══════════════════════════════════════════════════════════
        
        const rarityEmoji = {
            'Común': '⚪',
            'Raro': '🔵',
            'Épico': '🟣',
            'Legendario': '🟡',
            'Mítico': '🔴'
        }
        
        const texto = `
╔═══════════════════════════════╗
║     🎲 GACHA BOT 🎲    ║
╚═══════════════════════════════╝

🎊 *¡Nuevo Personaje Obtenido!*

━━━━━━━━━━━━━━━━━━━━━━━━━━

${rarityEmoji[character.rarity]} *Rareza:* ${character.rarity}
👤 *Nombre:* ${character.name}
📺 *Serie:* ${character.series}
⚧️ *Género:* ${character.gender}
💰 *Valor:* ${character.price} coins
🆔 *ID:* ${character.id}

━━━━━━━━━━━━━━━━━━━━━━━━━━

💼 *Tu Inventario:*
📦 Total personajes: ${user.gacha.characters.length}
💰 Coins restantes: ${user.gacha.coins}
🎯 Total claims: ${user.gacha.totalClaims}

━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 *Comandos disponibles:*
• ${usedPrefix}inventory - Ver tu colección
• ${usedPrefix}vote <id> - Votar personaje
• ${usedPrefix}sell <id> - Vender personaje
• ${usedPrefix}trade - Intercambiar

🔥 Powered By Uchiha Clan
        `.trim()
        
        await conn.sendMessage(m.chat, {
            image: { url: character.image },
            caption: texto,
            contextInfo: {
                externalAdReply: {
                    title: `${character.name} | ${character.rarity}`,
                    body: `${character.series}`,
                    thumbnailUrl: character.image,
                    sourceUrl: global.channel,
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })
        
        m.react('✅')
        
    } catch (error) {
        console.error('Error en gacha:', error)
        m.reply('⚠️ Error al obtener personaje. Intenta nuevamente.')
        m.react('❌')
    }
}

handler.help = ['claim', 'c', 'gacha']
handler.tags = ['gacha']
handler.command = ['claim', 'c', 'gacha']

export default handler

// ═══════════════════════════════════════════════════════════
//                  FUNCIONES AUXILIARES
// ═══════════════════════════════════════════════════════════

function getRarity() {
    const random = Math.random() * 100
    
    if (random < 40) return 'Común'         // 40%
    if (random < 70) return 'Raro'          // 30%
    if (random < 88) return 'Épico'         // 18%
    if (random < 97) return 'Legendario'    // 9%
    return 'Mítico'                         // 3%
}

function calculatePrice(rarity) {
    const prices = {
        'Común': 50,
        'Raro': 150,
        'Épico': 400,
        'Legendario': 1000,
        'Mítico': 5000
    }
    return prices[rarity] || 50
}

function generateRandomCharacter(imageUrl = 'https://i.pravatar.cc/500') {
    const names = ['Sasuke', 'Naruto', 'Sakura', 'Kakashi', 'Itachi', 'Madara', 'Hinata', 'Gaara', 'Rock Lee', 'Neji']
    const series = ['Naruto', 'One Piece', 'Dragon Ball', 'Bleach', 'Attack on Titan', 'My Hero Academia', 'Demon Slayer', 'Jujutsu Kaisen']
    
    return {
        name: names[Math.floor(Math.random() * names.length)],
        series: series[Math.floor(Math.random() * series.length)],
        rarity: getRarity(),
        gender: Math.random() > 0.5 ? 'Masculino' : 'Femenino',
        id: `CHAR_${Date.now()}`,
        image: imageUrl,
        about: 'Personaje misterioso del universo anime.',
        claimedAt: Date.now(),
        votes: 0,
        price: calculatePrice(getRarity())
    }
}

function msToTime(duration) {
    const minutes = Math.floor((duration / (1000 * 60)) % 60)
    const seconds = Math.floor((duration / 1000) % 60)
    return `${minutes}m ${seconds}s`
}