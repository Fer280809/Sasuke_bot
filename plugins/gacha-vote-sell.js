import fs from 'fs'

export async function voteHandler(m, { conn, args, usedPrefix, command }) {
    if (!args[0]) {
        return m.reply(`⚠️ *Uso incorrecto*\n\n📌 Usa: *${usedPrefix + command} <id>*\n\nEjemplo: ${usedPrefix + command} CHAR_12345`)
    }
    
    const characterId = args[0]
    let characterFound = false
    let ownerJid = null
    
    // Buscar el personaje en todos los usuarios
    for (let jid in global.db.data.users) {
        let targetUser = global.db.data.users[jid]
        if (targetUser.gacha && targetUser.gacha.characters) {
            const char = targetUser.gacha.characters.find(c => c.id === characterId)
            if (char) {
                characterFound = true
                ownerJid = jid
                
                // Verificar cooldown de voto (1 hora)
                const voteKey = `vote_${m.sender}_${characterId}`
                if (!global.votesCooldown) global.votesCooldown = {}
                
                const lastVote = global.votesCooldown[voteKey] || 0
                const cooldown = 3600000 // 1 hora
                
                if (Date.now() - lastVote < cooldown) {
                    const timeLeft = msToTime(cooldown - (Date.now() - lastVote))
                    return m.reply(`⏳ *Cooldown Activo*\n\n⚡ Debes esperar *${timeLeft}* para volver a votar este personaje.`)
                }
                
                // Agregar voto
                char.votes = (char.votes || 0) + 1
                
                // Aumentar precio por voto
                const priceIncrease = Math.floor(char.price * 0.05) // 5% por voto
                char.price += priceIncrease
                
                // Guardar cooldown
                global.votesCooldown[voteKey] = Date.now()
                
                const texto = `
╔═══════════════════════════════╗
║     👍 VOTO REGISTRADO 👍     ║
╚═══════════════════════════════╝

✅ Has votado por *${char.name}*

━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 *Estadísticas actualizadas:*
👍 Total votos: ${char.votes}
💰 Nuevo precio: ${char.price} coins
📈 Incremento: +${priceIncrease} coins

━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 *Propietario:* @${ownerJid.split('@')[0]}

🔥 Powered By Uchiha Clan
                `.trim()
                
                await conn.sendMessage(m.chat, {
                    text: texto,
                    contextInfo: {
                        mentionedJid: [ownerJid],
                        externalAdReply: {
                            title: `${char.name} | ${char.votes} votos`,
                            body: `${char.series}`,
                            thumbnailUrl: char.image,
                            sourceUrl: global.channel,
                            mediaType: 1
                        }
                    }
                }, { quoted: m })
                
                m.react('👍')
                break
            }
        }
    }
    
    if (!characterFound) {
        return m.reply(`❌ *Personaje no encontrado*\n\n📌 Verifica el ID del personaje.`)
    }
}


export async function sellHandler(m, { conn, args, usedPrefix, command }) {
    let user = global.db.data.users[m.sender]
    
    if (!user.gacha || !user.gacha.characters.length) {
        return m.reply(`📦 *No tienes personajes para vender*\n\n⚡ Usa *${usedPrefix}claim* para obtener personajes.`)
    }
    
    if (!args[0]) {
        return m.reply(`⚠️ *Uso incorrecto*\n\n📌 Usa: *${usedPrefix + command} <id>*\n\nEjemplo: ${usedPrefix + command} CHAR_12345`)
    }
    
    const characterId = args[0]
    const charIndex = user.gacha.characters.findIndex(c => c.id === characterId)
    
    if (charIndex === -1) {
        return m.reply(`❌ *Personaje no encontrado en tu inventario*\n\n📌 Verifica el ID con *${usedPrefix}inventory*`)
    }
    
    const character = user.gacha.characters[charIndex]
    const sellPrice = Math.floor(character.price * 0.7) // Vende al 70% del precio
    
    // Eliminar personaje y dar coins
    user.gacha.characters.splice(charIndex, 1)
    user.gacha.coins += sellPrice
    
    const rarityEmoji = {
        'Común': '⚪',
        'Raro': '🔵',
        'Épico': '🟣',
        'Legendario': '🟡',
        'Mítico': '🔴'
    }
    
    const texto = `
╔═══════════════════════════════╗
║     💰 VENTA EXITOSA 💰       ║
╚═══════════════════════════════╝

✅ Has vendido a *${character.name}*

━━━━━━━━━━━━━━━━━━━━━━━━━━

${rarityEmoji[character.rarity]} *Rareza:* ${character.rarity}
📺 *Serie:* ${character.series}
💰 *Precio de venta:* ${sellPrice} coins

━━━━━━━━━━━━━━━━━━━━━━━━━━

💼 *Tu estado actual:*
💰 Coins: ${user.gacha.coins}
📦 Personajes restantes: ${user.gacha.characters.length}

━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 Powered By Uchiha Clan
    `.trim()
    
    await conn.sendMessage(m.chat, {
        text: texto,
        contextInfo: {
            externalAdReply: {
                title: `Vendido: ${character.name}`,
                body: `+${sellPrice} coins`,
                thumbnailUrl: global.icono,
                sourceUrl: global.channel,
                mediaType: 1
            }
        }
    }, { quoted: m })
    
    m.react('💰')
}


let voteHandlerObj = async (m, ctx) => await voteHandler(m, ctx)
voteHandlerObj.help = ['vote <id>']
voteHandlerObj.tags = ['gacha']
voteHandlerObj.command = ['vote', 'votar']

let sellHandlerObj = async (m, ctx) => await sellHandler(m, ctx)
sellHandlerObj.help = ['sell <id>']
sellHandlerObj.tags = ['gacha']
sellHandlerObj.command = ['sell', 'vender']

export { voteHandlerObj as vote, sellHandlerObj as sell }

function msToTime(duration) {
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((duration / (1000 * 60)) % 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}