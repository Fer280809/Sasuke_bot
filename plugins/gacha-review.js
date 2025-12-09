// ═══════════════════════════════════════════════════════════
//           🔥 VER DETALLE DE PERSONAJE - SASUKE BOT 🔥
// ═══════════════════════════════════════════════════════════

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    
    if (!user.gacha || !user.gacha.characters.length) {
        return m.reply(`📦 *No tienes personajes*\n\n⚡ Usa *${usedPrefix}claim* para obtener personajes.`)
    }
    
    if (!args[0]) {
        return m.reply(`⚠️ *Uso incorrecto*\n\n📌 Usa: *${usedPrefix + command} <id>*\n\nEjemplo: ${usedPrefix + command} CHAR_12345`)
    }
    
    const characterId = args[0]
    const character = user.gacha.characters.find(c => c.id === characterId)
    
    if (!character) {
        return m.reply(`❌ *Personaje no encontrado*\n\n📌 Verifica el ID con *${usedPrefix}inventory*`)
    }
    
    const rarityEmoji = {
        'Común': '⚪',
        'Raro': '🔵',
        'Épico': '🟣',
        'Legendario': '🟡',
        'Mítico': '🔴'
    }
    
    const claimedDate = new Date(character.claimedAt).toLocaleDateString('es-MX')
    
    const texto = `
╔═══════════════════════════════╗
║   🎴 DETALLE DE PERSONAJE 🎴  ║
╚═══════════════════════════════╝

${rarityEmoji[character.rarity]} *Rareza:* ${character.rarity}
👤 *Nombre:* ${character.name}
📺 *Serie/Anime:* ${character.series}
⚧️ *Género:* ${character.gender}
🆔 *ID:* ${character.id}

━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 *Valor Actual:* ${character.price} coins
👍 *Votos Recibidos:* ${character.votes || 0}
📅 *Fecha de Claim:* ${claimedDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 *Descripción:*
${character.about || 'Sin descripción disponible.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 *Acciones disponibles:*
• ${usedPrefix}vote ${character.id} - Votar
• ${usedPrefix}sell ${character.id} - Vender
• ${usedPrefix}trade ${character.id} - Intercambiar

🔥 Powered By Uchiha Clan
    `.trim()
    
    await conn.sendMessage(m.chat, {
        image: { url: character.image },
        caption: texto,
        contextInfo: {
            externalAdReply: {
                title: `${character.name} | ${character.rarity}`,
                body: `${character.series} • ${character.gender}`,
                thumbnailUrl: character.image,
                sourceUrl: global.channel,
                mediaType: 1,
                showAdAttribution: true,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })
}

handler.help = ['review <id>', 'rw <id>']
handler.tags = ['gacha']
handler.command = ['review', 'rw', 'ver']

export default handler