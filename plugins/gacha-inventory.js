// ═══════════════════════════════════════════════════════════
//           🔥 INVENTARIO GACHA SASUKE BOT 🔥
// ═══════════════════════════════════════════════════════════

let handler = async (m, { conn, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    
    if (!user.gacha || !user.gacha.characters.length) {
        return m.reply(`📦 *Inventario Vacío*\n\n⚡ Usa *${usedPrefix}claim* para obtener personajes.\n\n🔥 Sharingan Ready`)
    }
    
    // Ordenar por rareza
    const rarityOrder = { 'Mítico': 5, 'Legendario': 4, 'Épico': 3, 'Raro': 2, 'Común': 1 }
    const sortedChars = user.gacha.characters.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity])
    
    // Estadísticas
    const totalChars = sortedChars.length
    const totalValue = sortedChars.reduce((sum, char) => sum + char.price, 0)
    
    const rarityCount = sortedChars.reduce((acc, char) => {
        acc[char.rarity] = (acc[char.rarity] || 0) + 1
        return acc
    }, {})
    
    const rarityEmoji = {
        'Común': '⚪',
        'Raro': '🔵',
        'Épico': '🟣',
        'Legendario': '🟡',
        'Mítico': '🔴'
    }
    
    let texto = `
╔═══════════════════════════════╗
║   📦 INVENTARIO GACHA 📦      ║
╚═══════════════════════════════╝

👤 *Usuario:* @${m.sender.split('@')[0]}
💰 *Coins:* ${user.gacha.coins}
📦 *Total Personajes:* ${totalChars}
💎 *Valor Total:* ${totalValue} coins

━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 *Estadísticas por Rareza:*
${Object.entries(rarityCount).map(([r, c]) => `${rarityEmoji[r]} ${r}: ${c}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━

🎴 *Tus Personajes:*
`
    
    sortedChars.slice(0, 10).forEach((char, i) => {
        texto += `\n${i + 1}. ${rarityEmoji[char.rarity]} *${char.name}*`
        texto += `\n   📺 ${char.series} | ⚧️ ${char.gender}`
        texto += `\n   💰 ${char.price} coins | 🆔 ${char.id}`
        texto += `\n   👍 Votos: ${char.votes || 0}\n`
    })
    
    if (totalChars > 10) {
        texto += `\n_...y ${totalChars - 10} personajes más_`
    }
    
    texto += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━`
    texto += `\n\n📌 *Comandos:*`
    texto += `\n• ${usedPrefix}claim - Obtener personaje`
    texto += `\n• ${usedPrefix}vote <id> - Votar personaje`
    texto += `\n• ${usedPrefix}sell <id> - Vender personaje`
    texto += `\n• ${usedPrefix}rw <id> - Ver detalle`
    texto += `\n\n🔥 Powered By Uchiha Clan`
    
    await conn.sendMessage(m.chat, {
        text: texto.trim(),
        contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
                title: '📦 Tu Inventario Gacha',
                body: `${totalChars} personajes | ${user.gacha.coins} coins`,
                thumbnailUrl: global.icono,
                sourceUrl: global.channel,
                mediaType: 1,
                showAdAttribution: true
            }
        }
    }, { quoted: m })
}

handler.help = ['inventory', 'inv']
handler.tags = ['gacha']
handler.command = ['inventory', 'inv', 'inventario']

export default handler