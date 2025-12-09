// lib/store.js
import { readFileSync, writeFileSync, existsSync } from 'fs'

const { initAuthCreds, BufferJSON, proto } = (await import('@whiskeysockets/baileys')).default

// Función para vincular el store con la conexión del bot (actualiza chats, contactos y grupos)
function bind(conn) {
    // Inicializar objeto de chats si no existe
    if (!conn.chats) conn.chats = {}

    // Función general para actualizar nombres en la DB de chats
    function updateNameToDb(contacts) {
        if (!contacts) return
        try {
            contacts = contacts.contacts || contacts
            for (const contact of contacts) {
                const id = conn.decodeJid ? conn.decodeJid(contact.id) : contact.id
                if (!id || id === 'status@broadcast') continue
                
                let chats = conn.chats[id]
                if (!chats) chats = conn.chats[id] = { ...contact, id }
                
                conn.chats[id] = {
                    ...chats,
                    ...({
                        ...contact, 
                        id, 
                        ...(id.endsWith('@g.us') ?
                            { subject: contact.subject || contact.name || chats.subject || '' } :
                            { name: contact.notify || contact.name || chats.name || chats.notify || '' })
                    } || {})
                }
            }
        } catch (e) {
            console.error('[STORE] Error al actualizar nombres:', e)
        }
    }

    // Escuchar eventos para actualizar chats y contactos
    conn.ev.on('contacts.upsert', updateNameToDb)
    conn.ev.on('groups.update', updateNameToDb)
    conn.ev.on('contacts.set', updateNameToDb)

    // Escuchar evento de establecimiento de chats
    conn.ev.on('chats.set', async ({ chats }) => {
        try {
            for (let { id, name, readOnly } of chats) {
                id = conn.decodeJid ? conn.decodeJid(id) : id
                if (!id || id === 'status@broadcast') continue
                
                const isGroup = id.endsWith('@g.us')
                let chats = conn.chats[id]
                if (!chats) chats = conn.chats[id] = { id }
                
                chats.isChats = !readOnly
                if (name) chats[isGroup ? 'subject' : 'name'] = name
                
                // Obtener metadatos de grupo si es necesario
                if (isGroup) {
                    const metadata = await conn.groupMetadata(id).catch(_ => null)
                    if (name || metadata?.subject) chats.subject = name || metadata.subject
                    if (metadata) chats.metadata = metadata
                }
            }
        } catch (e) {
            console.error('[STORE] Error al establecer chats:', e)
        }
    })

    // Escuchar actualizaciones de participantes de grupo
    conn.ev.on('group-participants.update', async function updateParticipantsToDb({ id, participants, action }) {
        if (!id) return
        id = conn.decodeJid ? conn.decodeJid(id) : id
        if (id === 'status@broadcast') return
        
        if (!(id in conn.chats)) conn.chats[id] = { id }
        let chats = conn.chats[id]
        chats.isChats = true
        
        // Actualizar metadatos de grupo
        const groupMetadata = await conn.groupMetadata(id).catch(_ => null)
        if (groupMetadata) {
            chats.subject = groupMetadata.subject
            chats.metadata = groupMetadata
        }
    })

    // Escuchar actualizaciones de grupos
    conn.ev.on('groups.update', async function groupUpdatePushToDb(groupsUpdates) {
        try {
            for (const update of groupsUpdates) {
                const id = conn.decodeJid ? conn.decodeJid(update.id) : update.id
                if (!id || id === 'status@broadcast' || !id.endsWith('@g.us')) continue
                
                let chats = conn.chats[id]
                if (!chats) chats = conn.chats[id] = { id }
                chats.isChats = true
                
                const metadata = await conn.groupMetadata(id).catch(_ => null)
                if (metadata) chats.metadata = metadata
                if (update.subject || metadata?.subject) chats.subject = update.subject || metadata.subject
            }
        } catch (e) {
            console.error('[STORE] Error al actualizar grupo:', e)
        }
    })

    // Escuchar creación de nuevos chats
    conn.ev.on('chats.upsert', function chatsUpsertPushToDb(chatsUpsert) {
        try {
            const { id, name } = chatsUpsert
            if (!id || id === 'status@broadcast') return
            
            conn.chats[id] = { ...(conn.chats[id] || {}), ...chatsUpsert, isChats: true }
            const isGroup = id.endsWith('@g.us')
            if (isGroup) conn.insertAllGroup().catch(_ => null)
        } catch (e) {
            console.error('[STORE] Error al crear chat:', e)
        }
    })

    // Escuchar actualizaciones de presencia
    conn.ev.on('presence.update', async function presenceUpdatePushToDb({ id, presences }) {
        try {
            const sender = Object.keys(presences)[0] || id
            const _sender = conn.decodeJid ? conn.decodeJid(sender) : sender
            const presence = presences[sender]['lastKnownPresence'] || 'composing'
            
            // Actualizar presencia del remitente
            let chats = conn.chats[_sender]
            if (!chats) chats = conn.chats[_sender] = { id: sender }
            chats.presences = presence
            
            // Actualizar grupo si corresponde
            if (id.endsWith('@g.us')) {
                let groupChat = conn.chats[id]
                if (!groupChat) groupChat = conn.chats[id] = { id }
            }
        } catch (e) {
            console.error('[STORE] Error al actualizar presencia:', e)
        }
    })
}

// Mapeo de tipos de claves para el estado de autenticación
const KEY_MAP = {
    'pre-key': 'preKeys',
    'session': 'sessions',
    'sender-key': 'senderKeys',
    'app-state-sync-key': 'appStateSyncKeys',
    'app-state-sync-version': 'appStateVersions',
    'sender-key-memory': 'senderKeyMemory'
}

// Función para usar estado de autenticación en un solo archivo
function useSingleFileAuthState(filename, logger) {
    let creds, keys = {}, saveCount = 0

    // Función para guardar el estado de autenticación
    const saveState = (forceSave) => {
        logger?.trace('[STORE] Guardando estado de autenticación')
        saveCount++
        if (forceSave || saveCount > 5) {
            writeFileSync(
                filename,
                JSON.stringify({ creds, keys }, BufferJSON.replacer, 2)
            )
            saveCount = 0
        }
    }

    // Cargar estado existente si el archivo existe
    if (existsSync(filename)) {
        try {
            const result = JSON.parse(
                readFileSync(filename, { encoding: 'utf-8' }),
                BufferJSON.reviver
            )
            creds = result.creds
            keys = result.keys
        } catch (e) {
            console.error('[STORE] Error al cargar estado de autenticación:', e)
            creds = initAuthCreds()
            keys = {}
        }
    } else {
        // Inicializar credenciales nuevas si no existe el archivo
        creds = initAuthCreds()
        keys = {}
    }

    return {
        state: {
            creds,
            keys: {
                get: (type, ids) => {
                    const key = KEY_MAP[type]
                    return ids.reduce(
                        (dict, id) => {
                            let value = keys[key]?.[id]
                            if (value) {
                                if (type === 'app-state-sync-key') {
                                    value = proto.AppStateSyncKeyData.fromObject(value)
                                }
                                dict[id] = value
                            }
                            return dict
                        }, {}
                    )
                },
                set: (data) => {
                    for (const _key in data) {
                        const key = KEY_MAP[_key]
                        keys[key] = keys[key] || {}
                        Object.assign(keys[key], data[_key])
                    }
                    saveState()
                }
            }
        },
        saveState
    }
}

// Exportar funciones para usar en el bot
export default {
    bind,
    useSingleFileAuthState
}
