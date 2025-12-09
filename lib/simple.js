import path from 'path'  
import { toAudio } from './converter.js'
import chalk from 'chalk'
import fetch from 'node-fetch'
import PhoneNumber from 'awesome-phonenumber'
import fs from 'fs'
import util from 'util'
import { fileTypeFromBuffer } from 'file-type' 
import { format } from 'util'
import { fileURLToPath } from 'url'
import store from './store.js'
import pino from 'pino'
import * as baileys from "@whiskeysockets/baileys"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const {
    default: _makeWaSocket,
    makeWALegacySocket,
    proto,
    downloadContentFromMessage,
    jidDecode,
    areJidsSameUser,
    generateWAMessage,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    WAMessageStubType,
    extractMessageContent,
    makeInMemoryStore,
    getAggregateVotesInPollMessage,
    prepareWAMessageMedia,
    WA_DEFAULT_EPHEMERAL,
    PHONENUMBER_MCC,
} = baileys

export function makeWASocket(connectionOptions, options = {}) {
    const conn = (global.opts["legacy"] ? makeWALegacySocket : _makeWaSocket)(connectionOptions)

    const sock = Object.defineProperties(conn, {
        chats: {
            value: { ...(options.chats || {}) },
            writable: true,
        },
        decodeJid: {
            value(jid) {
                if (!jid || typeof jid !== "string") return (!nullish(jid) && jid) || null
                return jid.decodeJid()
            },
        },
        logger: {
            get() {
                return {
                    info(...args) {
                        console.log(chalk.bold.bgRgb(51, 204, 51)("INFO "), `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`, chalk.cyan(format(...args)))
                    },
                    error(...args) {
                        console.log(chalk.bold.bgRgb(247, 38, 33)("ERROR "), `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`, chalk.rgb(255, 38, 0)(format(...args)))
                    },
                    warn(...args) {
                        console.log(chalk.bold.bgRgb(255, 153, 0)("WARNING "), `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`, chalk.redBright(format(...args)))
                    },
                    trace(...args) {
                        console.log(chalk.grey("TRACE "), `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`, chalk.white(format(...args)))
                    },
                    debug(...args) {
                        console.log(chalk.bold.bgRgb(66, 167, 245)("DEBUG "), `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`, chalk.white(format(...args)))
                    },
                }
            },
            enumerable: true,
        },
        sendSasuke: {
            async value(jid, text = '', buffer, title, body, url, quoted, options) {
                if (buffer) try { (type = await conn.getFile(buffer), buffer = type.data) } catch { buffer = buffer }
                let prep = generateWAMessageFromContent(jid, { 
                    extendedTextMessage: { 
                        text: text, 
                        contextInfo: { 
                            externalAdReply: { 
                                title: title, 
                                body: body, 
                                thumbnail: buffer, 
                                sourceUrl: url 
                            }, 
                            mentionedJid: await conn.parseMention(text) 
                        }
                    }
                }, { quoted: quoted })
                return conn.relayMessage(jid, prep.message, { messageId: prep.key.id })
            }
        },
        sendAlbum: {
            async value(jid, medias, options = {}) {
                if (typeof jid !== "string") throw new TypeError(`jid must be string, received: ${jid}`)
                for (const media of medias) {
                    if (!media.type || (media.type !== "image" && media.type !== "video")) {
                        throw new TypeError(`media.type must be "image" or "video"`)
                    }
                    if (!media.data || (!media.data.url && !Buffer.isBuffer(media.data))) {
                        throw new TypeError(`media.data must be object with url or buffer`)
                    }
                }
                if (medias.length < 2) throw new RangeError("Minimum 2 media")
                
                const delay = !isNaN(options.delay) ? options.delay : 500
                delete options.delay
                
                const album = baileys.generateWAMessageFromContent(jid, {
                    messageContextInfo: {},
                    albumMessage: {
                        expectedImageCount: medias.filter(m => m.type === "image").length,
                        expectedVideoCount: medias.filter(m => m.type === "video").length,
                        ...(options.quoted ? {
                            contextInfo: {
                                remoteJid: options.quoted.key.remoteJid,
                                fromMe: options.quoted.key.fromMe,
                                stanzaId: options.quoted.key.id,
                                participant: options.quoted.key.participant || options.quoted.key.remoteJid,
                                quotedMessage: options.quoted.message,
                            }
                        } : {}),
                    },
                }, {})
                
                await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id })
                
                for (let i = 0; i < medias.length; i++) {
                    const { type, data, caption } = medias[i]
                    const message = await baileys.generateWAMessage(album.key.remoteJid, { 
                        [type]: data, 
                        caption: caption || "" 
                    }, { upload: conn.waUploadToServer })
                    
                    message.message.messageContextInfo = {
                        messageAssociation: { associationType: 1, parentMessageKey: album.key }
                    }
                    await conn.relayMessage(message.key.remoteJid, message.message, { messageId: message.key.id })
                    await baileys.delay(delay)
                }
                return album
            }
        },
        getFile: {
            async value(PATH, saveToFile = false) {
                let res, filename
                const data = Buffer.isBuffer(PATH) ? PATH :
                    PATH instanceof ArrayBuffer ? PATH.toBuffer() :
                    /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], "base64") :
                    /^https?:\/\//.test(PATH) ? await (res = await fetch(PATH)).buffer() :
                    fs.existsSync(PATH) ? ((filename = PATH), fs.readFileSync(PATH)) :
                    typeof PATH === "string" ? PATH : Buffer.alloc(0)
                
                if (!Buffer.isBuffer(data)) throw new TypeError("Result is not a buffer")
                const type = (await fileTypeFromBuffer(data)) || { mime: "application/octet-stream", ext: ".bin" }
                
                if (data && saveToFile && !filename) {
                    filename = path.join(__dirname, "../tmp/" + new Date() * 1 + "." + type.ext)
                    await fs.promises.writeFile(filename, data)
                }
                return {
                    res,
                    filename,
                    ...type,
                    data,
                    deleteFile() {
                        return filename && fs.promises.unlink(filename)
                    },
                }
            },
            enumerable: true,
        },
        sendFile: {
            async value(jid, path, filename = "", caption = "", quoted, ptt = false, options = {}) {
                const type = await conn.getFile(path, true)
                let { res, data: file, filename: pathFile } = type
                
                if ((res && res.status !== 200) || file.length <= 65536) {
                    try { throw { json: JSON.parse(file.toString()) } }
                    catch (e) { if (e.json) throw e.json }
                }
                
                const opt = {}
                if (quoted) opt.quoted = quoted
                if (!type) options.asDocument = true
                
                let mtype = ""
                let mimetype = options.mimetype || type.mime
                let convert
                
                if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = "sticker"
                else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = "image"
                else if (/video/.test(type.mime)) mtype = "video"
                else if (/audio/.test(type.mime)) {
                    convert = await toAudio(file, type.ext)
                    file = convert.data
                    pathFile = convert.filename
                    mtype = "audio"
                    mimetype = options.mimetype || "audio/mpeg"
                } else mtype = "document"
                
                if (options.asDocument) mtype = "document"
                
                delete options.asSticker
                delete options.asLocation
                delete options.asVideo
                delete options.asDocument
                delete options.asImage
                
                const message = {
                    ...options,
                    caption,
                    ptt,
                    [mtype]: { url: pathFile },
                    mimetype,
                    fileName: filename || pathFile.split("/").pop(),
                }
                
                let m
                try {
                    m = await conn.sendMessage(jid, message, { ...opt, ...options })
                } catch (e) {
                    console.error(e)
                    m = null
                } finally {
                    if (!m) m = await conn.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options })
                    file = null
                    return m
                }
            },
            enumerable: true,
        },
        sendContact: {
            async value(jid, data, quoted, options) {
                if (!Array.isArray(data[0]) && typeof data[0] === "string") data = [data]
                const contacts = []
                
                for (let [number, name] of data) {
                    number = number.replace(/[^0-9]/g, "")
                    const njid = number + "@s.whatsapp.net"
                    const biz = (await conn.getBusinessProfile(njid).catch(_ => null)) || {}
                    const vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name.replace(/\n/g, "\\n")};;;
FN:${name.replace(/\n/g, "\\n")}
TEL;type=CELL;type=VOICE;waid=${number}:${PhoneNumber("+" + number).getNumber("international")}${
    biz.description ? `
X-WA-BIZ-NAME:${(conn.chats[njid]?.vname || conn.getName(njid) || name).replace(/\n/, "\\n")}
X-WA-BIZ-DESCRIPTION:${biz.description.replace(/\n/g, "\\n")}
`.trim() : ""
}
END:VCARD`.trim()
                    contacts.push({ vcard, displayName: name })
                }
                
                return await conn.sendMessage(jid, {
                    ...options,
                    contacts: {
                        ...options,
                        displayName: (contacts.length >= 2 ? `${contacts.length} contactos` : contacts[0].displayName) || null,
                        contacts,
                    },
                }, { quoted, ...options })
            },
            enumerable: true,
        },
        reply: {
            value(jid, text = "", quoted, options) {
                return Buffer.isBuffer(text) ?
                    conn.sendFile(jid, text, "file", "", quoted, false, options) :
                    conn.sendMessage(jid, { ...options, text }, { quoted, ...options })
            },
        },
    })
    
    return sock
}

export function smsg(conn, m, store) {
    if (!m) return m
    let M = proto.WebMessageInfo
    if (m.key) {
        m.id = m.key.id
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = conn.decodeJid(m.fromMe && conn.user.id || m.participant || m.key.participant || m.chat || '')
        if (m.isGroup) m.participant = conn.decodeJid(m.key.participant) || ''
    }
    if (m.message) {
        m.mtype = getContentType(m.message)
        m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype])
        m.body = m.message.conversation || m.msg?.caption || m.msg?.text || (m.mtype == 'listResponseMessage') && m.msg?.singleSelectReply?.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg?.selectedButtonId || (m.mtype == 'viewOnceMessage') && m.msg?.caption || m.text
        let quoted = m.quoted = m.msg?.contextInfo ? m.msg.contextInfo.quotedMessage : null
        m.mentionedJid = m.msg?.contextInfo ? m.msg.contextInfo.mentionedJid : []
        if (m.quoted) {
            let type = getContentType(quoted)
            m.quoted = m.quoted[type]
            if (['productMessage'].includes(type)) {
                type = getContentType(m.quoted)
                m.quoted = m.quoted[type]
            }
            if (typeof m.quoted === 'string') m.quoted = { text: m.quoted }
            m.quoted.mtype = type
            m.quoted.id = m.msg.contextInfo.stanzaId
            m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
            m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
            m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant)
            m.quoted.fromMe = m.quoted.sender === conn.decodeJid(conn.user.id)
            m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
            m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
            m.getQuotedObj = m.getQuotedMessage = async () => {
                if (!m.quoted.id) return false
                let q = await store.loadMessage(m.chat, m.quoted.id, conn)
                return exports.smsg(conn, q, store)
            }
            let vM = m.quoted.fakeObj = M.fromObject({
                key: {
                    remoteJid: m.quoted.chat,
                    fromMe: m.quoted.fromMe,
                    id: m.quoted.id
                },
                message: quoted,
                ...(m.isGroup ? { participant: m.quoted.sender } : {})
            })
            m.quoted.delete = () => conn.sendMessage(m.quoted.chat, { delete: vM.key })
            m.quoted.copyNForward = (jid, forceForward = false, options = {}) => conn.copyNForward(jid, vM, forceForward, options)
            m.quoted.download = () => conn.downloadMediaMessage(m.quoted)
        }
    }
    if (m.msg?.url) m.download = () => conn.downloadMediaMessage(m.msg)
    m.text = m.msg?.text || m.msg?.caption || m.message?.conversation || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || ''
    m.reply = (text, chatId = m.chat, options = {}) => Buffer.isBuffer(text) ? conn.sendMedia(chatId, text, 'file', '', m, { ...options }) : conn.sendText(chatId, text, m, { ...options })
    m.copy = () => exports.smsg(conn, M.fromObject(M.toObject(m)))
    m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => conn.copyNForward(jid, m, forceForward, options)
    
    return m
}

export function getContentType(content) {
    if (content) {
        const keys = Object.keys(content)
        const key = keys.find(k => (k === 'conversation' || k.endsWith('Message')) && k !== 'senderKeyDistributionMessage')
        return key
    }
}

export function serialize() {
    String.prototype.decodeJid = function() {
        const match = this.match(/@([0-9]+)/)
        return (match && match[1] + '@s.whatsapp.net') || this
    }
}

export function protoType() {
    Buffer.prototype.toArrayBuffer = function toArrayBufferV2() {
        const ab = new ArrayBuffer(this.length)
        const view = new Uint8Array(ab)
        for (let i = 0; i < this.length; ++i) {
            view[i] = this[i]
        }
        return ab
    }
}

function nullish(v) {
    return v == null || v == undefined
}