// ═══════════════════════════════════════════════════════════
//        🔥 SISTEMA DE MENSAJES FAKE - SASUKE BOT 🔥
//        Siempre usa el logo de lib/menu.jpg
// ═══════════════════════════════════════════════════════════

import fs from 'fs'
import fetch from 'node-fetch'

// Logo centralizado
global.logo = global.logo || fs.readFileSync('./lib/menu.jpg')

// ═══════════════════════════════════════════════════════════
//                    CANALES OFICIALES
// ═══════════════════════════════════════════════════════════

global.rcanal = {
    contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: global.ch.ch1,
            serverMessageId: 100,
            newsletterName: '🔥 Sasuke Bot Channel'
        },
        externalAdReply: {
            mediaUrl: global.channel,
            mediaType: 1,
            description: 'Canal Oficial de Sasuke Bot',
            title: global.botname,
            body: '⚡ Sharingan Ready',
            previewType: 0,
            thumbnailUrl: global.icono,
            sourceUrl: global.channel
        }
    }
}

// ═══════════════════════════════════════════════════════════
//                    FAKE CONTACTO
// ═══════════════════════════════════════════════════════════

global.fkontak = { 
    key: { 
        participants: '0@s.whatsapp.net', 
        remoteJid: 'status@broadcast', 
        fromMe: false, 
        id: 'Halo' 
    }, 
    message: { 
        contactMessage: { 
            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${global.owner[0]}:${global.owner[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
        }
    }, 
    participant: '0@s.whatsapp.net' 
}

// ═══════════════════════════════════════════════════════════
//                    FAKE PRODUCTO
// ═══════════════════════════════════════════════════════════

global.fproducto = {
    key: { 
        participants: '0@s.whatsapp.net', 
        remoteJid: 'status@broadcast', 
        fromMe: false, 
        id: 'Halo' 
    },
    message: {
        productMessage: {
            product: {
                productImage: {
                    mimetype: 'image/jpeg',
                    jpegThumbnail: global.logo
                },
                title: global.botname,
                description: global.textbot,
                currencyCode: 'MXN',
                priceAmount1000: '1000000000',
                retailerId: '🔥 Sasuke Bot',
                productImageCount: 1
            },
            businessOwnerJid: `${global.owner[0]}@s.whatsapp.net`
        }
    }
}

// ═══════════════════════════════════════════════════════════
//                    FAKE DOCUMENTO
// ═══════════════════════════════════════════════════════════

global.fdocumento = {
    key: { 
        remoteJid: 'status@broadcast', 
        participant: '0@s.whatsapp.net', 
        fromMe: false, 
        id: '1' 
    },
    message: {
        documentMessage: {
            title: global.botname,
            jpegThumbnail: global.logo,
            mimetype: 'application/pdf',
            fileName: '🔥 Sasuke Bot Documentation.pdf',
            fileLength: 99999999999
        }
    }
}

// ═══════════════════════════════════════════════════════════
//                    FAKE VIDEO
// ═══════════════════════════════════════════════════════════

global.fvideo = {
    key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast'
    },
    message: {
        videoMessage: {
            title: global.botname,
            h: 'Hmm',
            seconds: '99999',
            caption: global.textbot,
            jpegThumbnail: global.logo
        }
    }
}

// ═══════════════════════════════════════════════════════════
//                    FAKE AUDIO
// ═══════════════════════════════════════════════════════════

global.faudio = {
    key: { 
        fromMe: false, 
        participant: '0@s.whatsapp.net', 
        remoteJid: 'status@broadcast' 
    },
    message: { 
        audioMessage: { 
            mimetype: 'audio/mpeg',
            seconds: 359996400,
            ptt: true
        } 
    }
}

// ═══════════════════════════════════════════════════════════
//                    FAKE GIF
// ═══════════════════════════════════════════════════════════

global.fgif = {
    key: {
        remoteJid: 'status@broadcast',
        participant: '0@s.whatsapp.net',
        fromMe: false,
        id: 'Halo'
    },
    message: {
        videoMessage: {
            title: global.botname,
            h: 'Hmm',
            seconds: '99999',
            gifPlayback: true,
            caption: global.textbot,
            jpegThumbnail: global.logo
        }
    }
}

// ═══════════════════════════════════════════════════════════
//                    FAKE GRUPO
// ═══════════════════════════════════════════════════════════

global.fgrupo = {
    key: {
        remoteJid: '0@s.whatsapp.net',
        participant: '0@s.whatsapp.net',
        fromMe: false,
        id: 'Halo'
    },
    message: {
        groupInviteMessage: {
            groupJid: '6285240750713-1610340626@g.us',
            inviteCode: 'xxxxx',
            groupName: '🔥 Sasuke Bot Community',
            caption: global.textbot,
            jpegThumbnail: global.logo
        }
    },
    participant: '0@s.whatsapp.net'
}

// ═══════════════════════════════════════════════════════════
//                    FAKE UBICACIÓN
// ═══════════════════════════════════════════════════════════

global.flocation = {
    key: {
        participants: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast',
        fromMe: false,
        id: 'Halo'
    },
    message: {
        locationMessage: {
            name: '🔥 Sasuke Bot Headquarters',
            jpegThumbnail: global.logo
        }
    },
    participant: '0@s.whatsapp.net'
}

// ═══════════════════════════════════════════════════════════
//                    FAKE STICKER
// ═══════════════════════════════════════════════════════════

global.fsticker = {
    key: {
        remoteJid: 'status@broadcast',
        participant: '0@s.whatsapp.net',
        fromMe: false,
        id: 'Halo'
    },
    message: {
        stickerMessage: {
            fileSha256: 'h',
            pngThumbnail: global.logo,
            mimetype: 'image/webp',
            height: 512,
            width: 512,
            directPath: 'h',
            fileEncSha256: 'h',
            mediaKey: 'h',
            isAnimated: false
        }
    },
    participant: '0@s.whatsapp.net'
}

// ═══════════════════════════════════════════════════════════
//                    FAKE IMAGEN
// ═══════════════════════════════════════════════════════════

global.fimage = {
    key: {
        remoteJid: 'status@broadcast',
        participant: '0@s.whatsapp.net',
        fromMe: false,
        id: 'Halo'
    },
    message: {
        imageMessage: {
            mimetype: 'image/jpeg',
            caption: global.textbot,
            jpegThumbnail: global.logo,
            viewOnce: false
        }
    },
    participant: '0@s.whatsapp.net'
}

// ═══════════════════════════════════════════════════════════
//                    FAKE TEXTO
// ═══════════════════════════════════════════════════════════

global.ftexto = {
    key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast'
    },
    message: {
        extendedTextMessage: {
            text: global.textbot,
            title: global.botname,
            jpegThumbnail: global.logo
        }
    },
    participant: '0@s.whatsapp.net'
}

// ═══════════════════════════════════════════════════════════
//                    FAKE PAYMENT (PAGO)
// ═══════════════════════════════════════════════════════════

global.fpayment = {
    key: {
        remoteJid: '0@s.whatsapp.net',
        fromMe: false,
        id: '12345',
        participant: '0@s.whatsapp.net'
    },
    message: {
        requestPaymentMessage: {
            currencyCodeIso4217: 'MXN',
            amount1000: 999999999,
            requestFrom: '0@s.whatsapp.net',
            noteMessage: {
                extendedTextMessage: {
                    text: global.textbot
                }
            },
            expiryTimestamp: 999999999,
            amount: {
                value: 999999999,
                offset: 1000,
                currencyCode: 'MXN'
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════
//                    FUNCIONES AUXILIARES
// ═══════════════════════════════════════════════════════════

/**
 * Enviar mensaje fake con logo automático
 */
global.sendFake = async (conn, jid, text, fakeType = 'rcanal', quoted) => {
    const fakeTypes = {
        rcanal: global.rcanal,
        kontak: global.fkontak,
        producto: global.fproducto,
        documento: global.fdocumento,
        video: global.fvideo,
        audio: global.faudio,
        gif: global.fgif,
        grupo: global.fgrupo,
        location: global.flocation,
        sticker: global.fsticker,
        image: global.fimage,
        texto: global.ftexto,
        payment: global.fpayment
    }
    
    const fake = fakeTypes[fakeType] || global.rcanal
    
    return await conn.sendMessage(jid, {
        text: text,
        contextInfo: fake.contextInfo || {}
    }, { quoted: quoted || fake })
}

/**
 * Enviar imagen con contexto fake
 */
global.sendImageFake = async (conn, jid, image = global.logo, caption, fakeType = 'rcanal', quoted) => {
    const fakeTypes = {
        rcanal: global.rcanal,
        kontak: global.fkontak,
        producto: global.fproducto
    }
    
    const fake = fakeTypes[fakeType] || global.rcanal
    
    return await conn.sendMessage(jid, {
        image: Buffer.isBuffer(image) ? image : { url: image },
        caption: caption,
        contextInfo: fake.contextInfo || {}
    }, { quoted: quoted || fake })
}

/**
 * Enviar documento con contexto fake
 */
global.sendDocFake = async (conn, jid, doc, fileName, caption, fakeType = 'documento', quoted) => {
    return await conn.sendMessage(jid, {
        document: doc,
        fileName: fileName,
        caption: caption,
        mimetype: 'application/pdf',
        jpegThumbnail: global.logo
    }, { quoted: quoted || global.fdocumento })
}

// ═══════════════════════════════════════════════════════════
//                    MENSAJES PREDETERMINADOS
// ═══════════════════════════════════════════════════════════

global.wait = '⏳ *Cargando...*\n\n> 🔥 Sharingan procesando...'
global.rwait = '⚡'
global.dmoji = '🤭'
global.done = '✅'
global.error = '❌'
global.xmoji = '🔥'

global.estilo = { 
    key: {  
        fromMe: false, 
        participant: `0@s.whatsapp.net`, 
        ...(false ? { remoteJid: '0@s.whatsapp.net' } : {}) 
    }, 
    message: { 
        extendedTextMessage: { 
            text: global.botname, 
            title: global.botname, 
            jpegThumbnail: global.logo
        }
    }
}

// ═══════════════════════════════════════════════════════════
//                    LOGS Y PRINTS
// ═══════════════════════════════════════════════════════════

console.log('✅ Archivo _allfake.js cargado correctamente')
console.log('🔥 Logo centralizado: lib/menu.jpg')
console.log('⚡ Sasuke Bot System Ready')