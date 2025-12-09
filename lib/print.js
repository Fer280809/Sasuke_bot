import { WAMessageStubType } from '@whiskeysockets/baileys'
import chalk from 'chalk'
import { watchFile } from 'fs'

const urlRegex = (await import('url-regex-safe')).default({ strict: false })

export default async function (m, conn = { user: {} }) {
    let _name = await conn.getName(m.sender)
    let sender = '+' + m.sender.replace('@s.whatsapp.net', '') + (_name ? ' ~ ' + _name : '')
    let chat = await conn.getName(m.chat)
    
    let filesize = (m.msg ?
        m.msg.vcard ? m.msg.vcard.length :
        m.msg.fileLength ? m.msg.fileLength.low || m.msg.fileLength :
        m.msg.axolotlSenderKeyDistributionMessage ? m.msg.axolotlSenderKeyDistributionMessage.length :
        m.text ? m.text.length : 0
        : m.text ? m.text.length : 0) || 0
    
    let user = global.db.data.users[m.sender]
    let chatName = chat ? (m.isGroup ? 'Grupo ~ ' + chat : 'Privado ~ ' + chat) : ''
    let me = '+' + (conn.user?.jid || '').replace('@s.whatsapp.net', '')
    const userName = conn.user.name || conn.user.verifiedName || "Sasuke Bot"
    
    if (m.sender === conn.user?.jid) return
    
    const date = new Date(m.messageTimestamp ? 1000 * (m.messageTimestamp.low || m.messageTimestamp) : Date.now())
    const formattedDate = date.toLocaleString("es-MX", { 
        timeZone: "America/Mexico_City", 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    })
    
    // Sistema de Logs estilo Sasuke
    console.log(chalk.hex('#FF0000').bold('╭─[ 🔥 SASUKE LOG ⚡ SHARINGAN ]─────────────────────'))
    console.log(`${chalk.hex('#FF0000')('│')} Bot: ${chalk.red(me)} ~ ${chalk.blue(userName)}`)
    console.log(`${chalk.hex('#FF0000')('│')} Fecha: ${chalk.yellow(formattedDate)}`)
    console.log(`${chalk.hex('#FF0000')('│')} Tipo Evento: ${chalk.cyan(m.messageStubType ? WAMessageStubType[m.messageStubType] : 'Mensaje')}`)
    console.log(`${chalk.hex('#FF0000')('│')} Tamaño: ${chalk.green(filesize + ' B')} (${chalk.cyan((filesize / 1024).toFixed(2) + ' KB')})`)
    console.log(`${chalk.hex('#FF0000')('│')} Remitente: ${chalk.magenta(sender)}`)
    console.log(`${chalk.hex('#FF0000')('│')} Chat: ${chalk.blue(chatName)}`)
    console.log(`${chalk.hex('#FF0000')('│')} Tipo: ${chalk.yellow(m.mtype ? m.mtype.replace(/message$/i,'').replace('audio', m.msg?.ptt ? 'PTT' : 'audio').replace(/^./, v => v.toUpperCase()) : 'Desconocido')}`)
    console.log(chalk.hex('#FF0000').bold('╰────────────────────────────────────────────────'))
    
    // Formato de texto
    if (typeof m.text === 'string' && m.text) {
        let log = m.text.replace(/\u200e+/g, '')
        log = log.split('\n').map(line => {
            if (line.trim().startsWith('>')) return chalk.bgGray.white('┃ ' + line.replace(/^>/, ''))
            if (/^([1-9]|[1-9][0-9])\./.test(line.trim())) return chalk.cyan(line)
            if (/^[-*]\s/.test(line.trim())) return chalk.green('• ' + line.replace(/^[*-]\s?/, ''))
            return line
        }).join('\n')
        
        log = log.replace(urlRegex, url => chalk.blueBright.underline(url))
        console.log(m.error != null ? chalk.red(log) : m.isCommand ? chalk.yellowBright(log) : log)
    }
    
    // Documentos y otros
    if (/document/i.test(m.mtype)) console.log(chalk.magenta(`📄 ${m.msg.fileName || m.msg.displayName || 'Documento'}`))
    if (/contact/i.test(m.mtype)) console.log(chalk.cyan(`👤 ${m.msg.displayName || 'Contacto'}`))
    if (/audio/i.test(m.mtype)) {
        const duration = m.msg.seconds
        console.log(`${m.msg.ptt ? '🎙️ PTT' : '🎵 AUDIO'} ${Math.floor(duration / 60).toString().padStart(2,0)}:${(duration % 60).toString().padStart(2,0)}`)
    }
    
    console.log()
    watchFile(global.__filename(import.meta.url), () => console.log(chalk.redBright("Update 'lib/print.js'")))
}