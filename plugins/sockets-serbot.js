import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import * as ws from 'ws'
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

const imagenSerBot = global.logo || fs.readFileSync('./lib/menu.jpg')

let rtx = `╭─〔 ⚡ SASUKE BOT • MODO QR 〕─╮
│
│  📲 Escanea este *QR* desde otro celular
│  para convertirte en un *Sub-Bot* de Sasuke.
│
│  1️⃣  Pulsa los ⋮ tres puntos arriba
│  2️⃣  Ve a *Dispositivos vinculados*
│  3️⃣  Escanea el QR y ¡listo! 🔥
│
│  ⏳  *Expira en 45 segundos.*
│  🔥  Sharingan Ready
╰───────────────────────`

let rtx2 = `╭─[ ⚡ SASUKE BOT • MODO CODE ]─╮
│
│  🧠  Este es el *Modo CODE* de Sasuke Bot.
│  Usa el código de 8 dígitos para vincular
│  y convertirte en un *Sub-Bot*.
│
│  1️⃣  Pulsa los ⋮ tres puntos arriba
│  2️⃣  Entra en *Dispositivos vinculados*
│  3️⃣  Ingresa el código y ¡listo! 🔥
│
│  ⏳  *Expira en 45 segundos.*
│  🔥  Sharingan Activado
╰────────────────────────╯`

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SasukeJBOptions = {}

if (global.conns instanceof Array) console.log()
else global.conns = []

function isSubBotConnected(jid) { 
    return global.conns.some(sock => sock?.user?.jid && sock.user.jid.split("@")[0] === jid.split("@")[0]) 
}

let handler = async (m, { conn, args, usedPrefix, command, isOwner, isPrems }) => {
    const isBotOwner = isOwner || isPrems
    
    if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) {
        return m.reply(`⚠️ El Comando *${command}* está desactivado temporalmente.`)
    }
    
    let time = global.db.data.users[m.sender].Subs + 120000
    if (new Date - global.db.data.users[m.sender].Subs < 120000) {
        return conn.reply(m.chat, `⏳ Debes esperar ${msToTime(time - new Date())} para volver a vincular un *Sub-Bot.*`, m)
    }
    
    let socklimit = global.conns.filter(sock => sock?.user).length
    if (socklimit >= 5000) {
        return m.reply(`⚠️ No hay espacios disponibles para *Sub-Bots*.`)
    }
    
    let mentionedJid = await m.mentionedJid
    let who = mentionedJid && mentionedJid[0] ? mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let id = `${who.split`@`[0]}`
    let pathSasukeJadiBot = path.join(`./${jadi}/`, id)
    
    if (!fs.existsSync(pathSasukeJadiBot)){
        fs.mkdirSync(pathSasukeJadiBot, { recursive: true })
    }
    
    SasukeJBOptions.pathSasukeJadiBot = pathSasukeJadiBot
    SasukeJBOptions.m = m
    SasukeJBOptions.conn = conn
    SasukeJBOptions.args = args
    SasukeJBOptions.usedPrefix = usedPrefix
    SasukeJBOptions.command = command
    SasukeJBOptions.fromCommand = true
    SasukeJBOptions.isBotOwner = isBotOwner
    
    SasukeJadiBot(SasukeJBOptions)
    global.db.data.users[m.sender].Subs = new Date * 1
}

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code', 'serbot', 'jadibot']

export default handler 

export async function SasukeJadiBot(options) {
    let { pathSasukeJadiBot, m, conn, args, usedPrefix, command, isBotOwner } = options
    
    if (command === 'code') {
        command = 'qr'
        args.unshift('code')
    }
    
    const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : 
                  args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
    let txtCode, codeBot, txtQR
    
    if (mcode) {
        args[0] = args[0].replace(/^--code$|^code$/, "").trim()
        if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
        if (args[0] == "") args[0] = undefined
    }
    
    const pathCreds = path.join(pathSasukeJadiBot, "creds.json")
    
    if (!fs.existsSync(pathSasukeJadiBot)){
        fs.mkdirSync(pathSasukeJadiBot, { recursive: true })
    }
    
    try {
        args[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
    } catch {
        conn.reply(m.chat, `⚠️ Use correctamente el comando » ${usedPrefix + command}`, m)
        return
    }
    
    let { version, isLatest } = await fetchLatestBaileysVersion()
    const msgRetryCache = new NodeCache()
    const { state, saveState, saveCreds } = await useMultiFileAuthState(pathSasukeJadiBot)
    
    const connectionOptions = {
        logger: pino({ level: "fatal" }),
        printQRInTerminal: false,
        auth: { 
            creds: state.creds, 
            keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) 
        },
        msgRetryCounterCache: msgRetryCache,
        browser: isBotOwner ? ['Sasuke Bot Principal', 'Chrome', '1.0.0'] : ['Sasuke Sub-Bot', 'Chrome', '1.0.0'],
        version: version,
        generateHighQualityLinkPreview: true
    }
    
    let sock = makeWASocket(connectionOptions)
    sock.isInit = false
    let isInit = true
    
    setTimeout(async () => {
        if (!sock.user) {
            try { fs.rmSync(pathSasukeJadiBot, { recursive: true, force: true }) } catch {}
            try { sock.ws?.close() } catch {}
            sock.ev.removeAllListeners()
            let i = global.conns.indexOf(sock)
            if (i >= 0) global.conns.splice(i, 1)
            console.log(`[AUTO-LIMPIEZA] Sesión ${path.basename(pathSasukeJadiBot)} eliminada por credenciales inválidas.`)
        }
    }, 60000)
    
    async function connectionUpdate(update) {
        const { connection, lastDisconnect, isNewLogin, qr } = update
        
        if (isNewLogin) sock.isInit = false
        
        if (qr && !mcode) {
            if (m?.chat) {
                txtQR = await conn.sendMessage(m.chat, { 
                    image: await qrcode.toBuffer(qr, { scale: 8 }), 
                    caption: rtx.trim()
                }, { quoted: m })
                
                await conn.sendMessage(m.chat, {
                    image: imagenSerBot,
                    caption: '🔥 *Sub-Bot de Sasuke*\n\n¡Escanea el QR de arriba! ⬆️\n⚡ Sharingan Ready'
                }, { quoted: m })
            }
            
            if (txtQR && txtQR.key) {
                setTimeout(() => { conn.sendMessage(m.chat, { delete: txtQR.key })}, 30000)
            }
            return
        } 
        
        if (qr && mcode) {
            let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
            secret = secret.match(/.{1,4}/g)?.join("-")
            
            txtCode = await conn.sendMessage(m.chat, {
                image: imagenSerBot,
                caption: rtx2 + `\n\n🔑 *Tu código:* ${secret}\n\n⚡ Powered By Uchiha Clan`
            }, { quoted: m })
            
            console.log(chalk.red(`🔥 Código Sasuke: ${secret}`))
        }
        
        if (txtCode && txtCode.key) {
            setTimeout(() => { conn.sendMessage(m.chat, { delete: txtCode.key })}, 30000)
        }
        
        const endSesion = async (loaded) => {
            if (!loaded) {
                try { sock.ws.close() } catch {}
                sock.ev.removeAllListeners()
                let i = global.conns.indexOf(sock)                
                if (i < 0) return 
                delete global.conns[i]
                global.conns.splice(i, 1)
            }
        }
        
        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
        
        if (connection === 'close') {
            if (reason === 428) {
                console.log(chalk.bold.red(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Conexión (+${path.basename(pathSasukeJadiBot)}) cerrada inesperadamente. Reconectando...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
                await creloadHandler(true).catch(console.error)
            }
            if (reason === 408) {
                console.log(chalk.bold.red(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Conexión perdida (+${path.basename(pathSasukeJadiBot)}). Reconectando...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
                await creloadHandler(true).catch(console.error)
            }
            if (reason === 440) {
                console.log(chalk.bold.red(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Sesión (+${path.basename(pathSasukeJadiBot)}) reemplazada por otra activa.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
                try {
                    if (options.fromCommand) {
                        m?.chat ? await conn.sendMessage(`${path.basename(pathSasukeJadiBot)}@s.whatsapp.net`, {
                            text: '⚠️ Hemos detectado una nueva sesión. Borra la antigua para continuar.\n\n> 🔥 Si hay algún problema, vuelve a conectarte.'
                        }, { quoted: m || null }) : ""
                    }
                } catch (error) {
                    console.error(chalk.bold.yellow(`⚠️ Error 440: no se pudo enviar mensaje a +${path.basename(pathSasukeJadiBot)}`))
                }
            }
            if (reason == 405 || reason == 401) {
                console.log(chalk.bold.red(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Sesión (+${path.basename(pathSasukeJadiBot)}) cerrada. Credenciales inválidas.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
                try {
                    if (options.fromCommand) {
                        m?.chat ? await conn.sendMessage(`${path.basename(pathSasukeJadiBot)}@s.whatsapp.net`, {
                            text: '⚠️ Sesión cerrada.\n\n> 🔥 Vuelve a intentar ser *SUB-BOT* de Sasuke.'
                        }, { quoted: m || null }) : ""
                    }
                } catch (error) {
                    console.error(chalk.bold.yellow(`⚠️ Error 405: no se pudo enviar mensaje`))
                }
                fs.rmdirSync(pathSasukeJadiBot, { recursive: true })
            }
        }
        
        if (global.db.data == null) loadDatabase()
        
        if (connection == `open`) {
            if (!global.db.data?.users) loadDatabase()
            await joinChannels(sock)
            
            let userName = sock.authState.creds.me.name || 'Anónimo'
            let userJid = sock.authState.creds.me.jid || `${path.basename(pathSasukeJadiBot)}@s.whatsapp.net`
            
            const botType = isBotOwner ? 'PRINCIPAL-SUB' : 'SUB-BOT'
            
            console.log(chalk.bold.red(`\n❒⸺⸺⸺⸺【 🔥 ${botType} 🔥 】⸺⸺⸺⸺❒\n│\n│ ⚡ ${userName} (+${path.basename(pathSasukeJadiBot)}) conectado.\n│\n❒⸺⸺⸺【 🔥 SHARINGAN READY 🔥 】⸺⸺⸺❒`))
            
            sock.isInit = true
            global.conns.push(sock)
            
            m?.chat ? await conn.sendMessage(m.chat, { 
                text: isSubBotConnected(m.sender) ? 
                    `@${m.sender.split('@')[0]}, ya estás conectado como ${botType}, leyendo mensajes...` : 
                    `🔥 Has registrado un nuevo *${botType}!* [@${m.sender.split('@')[0]}]\n\n> 🔥 Sharingan Activado\n> ⚡ Powered By Uchiha Clan`, 
                mentions: [m.sender] 
            }, { quoted: m }) : ''
        }
    }
    
    setInterval(async () => {
        if (!sock.user) {
            try { sock.ws.close() } catch (e) {}
            sock.ev.removeAllListeners()
            let i = global.conns.indexOf(sock)
            if (i < 0) return
            delete global.conns[i]
            global.conns.splice(i, 1)
        }
    }, 60000)
    
    let handler = await import('../handler.js')
    
    let creloadHandler = async function (restatConn) {
        try {
            const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
            if (Object.keys(Handler || {}).length) handler = Handler
        } catch (e) {
            console.error('⚠️ Error:', e)
        }
        
        if (restatConn) {
            const oldChats = sock.chats
            try { sock.ws.close() } catch { }
            sock.ev.removeAllListeners()
            sock = makeWASocket(connectionOptions, { chats: oldChats })
            isInit = true
        }
        
        if (!isInit) {
            sock.ev.off("messages.upsert", sock.handler)
            sock.ev.off("connection.update", sock.connectionUpdate)
            sock.ev.off('creds.update', sock.credsUpdate)
        }
        
        sock.handler = handler.handler.bind(sock)
        sock.connectionUpdate = connectionUpdate.bind(sock)
        sock.credsUpdate = saveCreds.bind(sock, true)
        
        sock.ev.on("messages.upsert", sock.handler)
        sock.ev.on("connection.update", sock.connectionUpdate)
        sock.ev.on("creds.update", sock.credsUpdate)
        
        isInit = false
        return true
    }
    
    creloadHandler(false)
}

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    
    hours = (hours < 10) ? '0' + hours : hours
    minutes = (minutes < 10) ? '0' + minutes : minutes
    seconds = (seconds < 10) ? '0' + seconds : seconds
    
    return minutes + ' m y ' + seconds + ' s '
}

async function joinChannels(sock) {
    for (const value of Object.values(global.ch)) {
        if (typeof value === 'string' && value.endsWith('@newsletter')) {
            await sock.newsletterFollow(value).catch(() => {})
        }
    }
}