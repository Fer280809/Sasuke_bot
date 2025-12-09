process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
import './settings.js'
import './plugins/_allfake.js'
import cfonts from 'cfonts'
import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, readFileSync, rmSync, watch, writeFileSync } from 'fs'
import yargs from 'yargs'
import { spawn } from 'child_process'
import lodash from 'lodash'
import { SasukeJadiBot } from './plugins/sockets-serbot.js'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import pino from 'pino'
import Pino from 'pino'
import path, { join } from 'path'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import store from './lib/store.js'
const { proto } = (await import('@whiskeysockets/baileys')).default
import pkg from 'google-libphonenumber'
const { PhoneNumberUtil } = pkg
const phoneUtil = PhoneNumberUtil.getInstance()
const { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser } = await import('@whiskeysockets/baileys')
import readline from 'readline'
import NodeCache from 'node-cache'
const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

// MENSAJE DE INICIO
let { say } = cfonts
console.log(chalk.red('\n⚡ Iniciando Sistema...'))
say('SASUKE BOT', {
  font: 'block',
  align: 'center',
  gradient: ['red', 'blue']
})
say('Sistema Multi-Plugins Activado', {
  font: 'console',
  align: 'center',
  colors: ['cyan']
})
say('Sharingan Ready', {
  font: 'tiny',
  align: 'center',
  colors: ['red', 'white']
})

protoType()
serialize()

// Rutas globales
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString()
}
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true))
}
global.__require = function require(dir = import.meta.url) {
  return createRequire(dir)
}

// Variables globales
global.timestamp = { start: new Date }
const __dirname = global.__dirname(import.meta.url)
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp('^[#!./-]')

// Clase JSONFile alternativa para lowdb v3 o anterior
class JSONFileSync {
  constructor(filename) {
    this.filename = filename
  }
  read() {
    try {
      const data = readFileSync(this.filename, 'utf-8')
      return JSON.parse(data)
    } catch {
      return null
    }
  }
  write(obj) {
    writeFileSync(this.filename, JSON.stringify(obj, null, 2))
  }
}

// Base de datos con compatibilidad
const dbPath = 'database.json'

// Datos por defecto para la base de datos
const defaultData = {
  users: {},
  chats: {},
  settings: {},
  gacha: { 
    personajes: [], 
    probabilidades: { comun: 70, raro: 20, epic: 8, legendario: 2 } 
  },
  config: { 
    prefix: '!', 
    owner: '5214181450063', 
    botName: 'Sasuke Bot' 
  }
}

// Crear adaptador según versión de lowdb
let adapter
try {
  adapter = new JSONFile(dbPath)
  global.db = new Low(adapter, defaultData)
} catch (error) {
  try {
    adapter = new JSONFileSync(dbPath)
    global.db = new Low(adapter)
  } catch {
    adapter = new JSONFileSync(dbPath)
    global.db = { data: defaultData, read: async () => {}, write: async () => {} }
  }
}

global.DATABASE = global.db

global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise((resolve) => setInterval(async function() {
      if (!global.db.READ) {
        clearInterval(this)
        resolve(global.db.data == null ? global.loadDatabase() : global.db.data)
      }
    }, 1 * 1000))
  }
  if (global.db.data !== null) return
  global.db.READ = true

  try {
    await global.db.read()
  } catch (error) {
    console.log(chalk.yellow('⚠ Creando nueva base de datos...'))
  }

  global.db.READ = null

  global.db.data = global.db.data || defaultData
  global.db.data.users = global.db.data.users || {}
  global.db.data.chats = global.db.data.chats || {}
  global.db.data.settings = global.db.data.settings || {}
  global.db.data.gacha = global.db.data.gacha || { 
    personajes: [], 
    probabilidades: { comun: 70, raro: 20, epic: 8, legendario: 2 } 
  }
  global.db.data.config = global.db.data.config || { 
    prefix: '!', 
    owner: '5214181450063', 
    botName: 'Sasuke Bot' 
  }

  global.db.chain = chain(global.db.data)

  try {
    await global.db.write()
    console.log(chalk.green('✓ Base de datos inicializada'))
  } catch (error) {
    console.log(chalk.red('❌ Error al guardar BD:', error.message))
  }
}
loadDatabase()

// Configuración de sesión
global.sessions = 'Sessions/Principal'
const { state, saveCreds } = await useMultiFileAuthState(global.sessions)
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const { version } = await fetchLatestBaileysVersion()
let phoneNumber = global.botNumber
const methodCodeQR = process.argv.includes("qr")
const methodCode = !!phoneNumber || process.argv.includes("code")
const MethodMobile = process.argv.includes("mobile")
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))
let opcion

// Función de validación y corrección de teléfono MEJORADA
function cleanPhoneNumber(number) {
  return number.replace(/[^0-9]/g, '').trim()
}

function isValidMexicanNumber(cleanNumber) {
  // Formato correcto: 521 + 10 dígitos
  if (cleanNumber.match(/^521[0-9]{10}$/)) {
    return { valid: true, formatted: cleanNumber, needsFix: false }
  }
  
  // Formato incorrecto pero corregible: 52 + 10 dígitos (falta el 1)
  if (cleanNumber.match(/^52[2-9][0-9]{9}$/)) {
    const fixed = '521' + cleanNumber.substring(2)
    return { valid: true, formatted: fixed, needsFix: true }
  }
  
  return { valid: false }
}

async function validateAndFormatPhone(number) {
  const cleaned = cleanPhoneNumber(number)
  
  console.log(chalk.gray(`📱 Número ingresado: ${cleaned}`))
  
  // Validar número mexicano
  const mexValidation = isValidMexicanNumber(cleaned)
  if (mexValidation.valid) {
    if (mexValidation.needsFix) {
      console.log(chalk.yellow(`⚠️  Formato detectado: 52 + 10 dígitos`))
      console.log(chalk.green(`✅ Número corregido: ${mexValidation.formatted}`))
    } else {
      console.log(chalk.green(`✅ Formato correcto: ${mexValidation.formatted}`))
    }
    return mexValidation.formatted
  }
  
  // Validar con google-libphonenumber para otros países
  try {
    const parsedNumber = phoneUtil.parse('+' + cleaned, null)
    if (phoneUtil.isValidNumber(parsedNumber)) {
      console.log(chalk.green(`✅ Número internacional válido: ${cleaned}`))
      return cleaned
    }
  } catch (e) {
    // Continuar al error
  }
  
  // Número inválido
  console.log(chalk.red(`\n❌ Número inválido`))
  console.log(chalk.cyan(`\n📋 Formatos aceptados para México:`))
  console.log(chalk.white(`   • 5214181450063 (Correcto: 52 + 1 + 10 dígitos)`))
  console.log(chalk.white(`   • 524181450063 (Se corregirá automáticamente)`))
  console.log(chalk.cyan(`\n📋 Para otros países:`))
  console.log(chalk.white(`   • Código de país + número completo`))
  console.log(chalk.white(`   • Ejemplo USA: 1234567890\n`))
  
  return null
}

// Selección de método
if (methodCodeQR) {
  opcion = '1'
}

if (!methodCodeQR && !methodCode && !fs.existsSync(`./${global.sessions}/creds.json`)) {
  do {
    opcion = await question(chalk.bold.white("\n╔═══════════════════════════════════╗\n║  Seleccione método de conexión:  ║\n╚═══════════════════════════════════╝\n") + 
      chalk.blueBright("1. 📱 Con código QR (escanear)\n") + 
      chalk.cyan("2. 🔢 Con código de 8 dígitos\n") + 
      chalk.magentaBright("━━━> "))
    
    if (!/^[1-2]$/.test(opcion)) {
      console.log(chalk.bold.redBright(`\n❌ Opción inválida. Ingrese 1 o 2\n`))
    }
  } while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${global.sessions}/creds.json`))
}

console.info = () => {}

// Opciones de conexión
const connectionOptions = {
  logger: pino({ level: 'silent' }),
  printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
  mobile: MethodMobile,
  browser: ["Chrome (Linux)", "", ""],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
  },
  markOnlineOnConnect: false,
  generateHighQualityLinkPreview: true,
  syncFullHistory: false,
  getMessage: async (key) => {
    try {
      let jid = jidNormalizedUser(key.remoteJid)
      let msg = await store.loadMessage(jid, key.id)
      return msg?.message || ""
    } catch {
      return ""
    }
  },
  msgRetryCounterCache,
  userDevicesCache,
  defaultQueryTimeoutMs: undefined,
  cachedGroupMetadata: (jid) => globalThis.conn?.chats?.[jid] ?? {},
  version,
  keepAliveIntervalMs: 50000,
  maxIdleTimeMs: 60000,
}

global.conn = makeWASocket(connectionOptions)
conn.isInit = false
conn.well = false

// Proceso de código de 8 dígitos MEJORADO
if (!fs.existsSync(`./${global.sessions}/creds.json`)) {
  if (opcion === '2' || methodCode) {
    opcion = '2'
    
    if (!conn.authState.creds.registered) {
      let formattedNumber
      
      if (!!phoneNumber) {
        // Si ya viene definido en settings o argumentos
        formattedNumber = await validateAndFormatPhone(phoneNumber)
        if (!formattedNumber) {
          console.log(chalk.red('❌ Número predefinido inválido. Solicite uno manualmente.'))
          phoneNumber = null
        }
      }
      
      if (!phoneNumber || !formattedNumber) {
        // Solicitar número al usuario
        let validNumber = false
        
        console.log(chalk.bold.red(`\n╔═══════════════════════════════════╗`))
        console.log(chalk.bold.red(`║    VINCULACIÓN POR CÓDIGO         ║`))
        console.log(chalk.bold.red(`╚═══════════════════════════════════╝`))
        
        do {
          phoneNumber = await question(chalk.bold.cyan(`\n📱 Ingrese su número de WhatsApp:\n`) + 
            chalk.gray(`   (Ejemplo México: 5214181450063 o 524181450063)\n`) +
            chalk.magentaBright(`━━━> `))
          
          formattedNumber = await validateAndFormatPhone(phoneNumber)
          
          if (formattedNumber) {
            validNumber = true
            console.log(chalk.bold.green(`\n✅ Número aceptado: +${formattedNumber}\n`))
          } else {
            console.log(chalk.yellow(`\n⚠️  Intente nuevamente...\n`))
          }
        } while (!validNumber)
        
        rl.close()
      }
      
      console.log(chalk.cyan(`\n⏳ Solicitando código de pareamiento...`))
      console.log(chalk.gray(`   Número: +${formattedNumber}\n`))
      
      setTimeout(async () => {
        try {
          let codeBot = await conn.requestPairingCode(formattedNumber)
          codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
          
          console.log(chalk.bold.red(`\n╔═══════════════════════════════════╗`))
          console.log(chalk.bold.red(`║       CÓDIGO DE VINCULACIÓN       ║`))
          console.log(chalk.bold.red(`╚═══════════════════════════════════╝`))
          console.log(chalk.bold.white(chalk.bgRed(`\n    🔑  ${codeBot}  🔑    \n`)))
          
          console.log(chalk.cyan(`📋 Pasos para vincular:\n`))
          console.log(chalk.white(`   1️⃣  Abre WhatsApp en tu teléfono`))
          console.log(chalk.white(`   2️⃣  Ve a Configuración > Dispositivos vinculados`))
          console.log(chalk.white(`   3️⃣  Toca "Vincular un dispositivo"`))
          console.log(chalk.white(`   4️⃣  Selecciona "Vincular con número de teléfono"`))
          console.log(chalk.white(`   5️⃣  Ingresa el código: ${chalk.bold.green(codeBot)}\n`))
          
          console.log(chalk.yellow(`⏰ El código expira en 60 segundos\n`))
          
        } catch (error) {
          console.log(chalk.bold.red(`\n╔═══════════════════════════════════╗`))
          console.log(chalk.bold.red(`║         ERROR AL VINCULAR         ║`))
          console.log(chalk.bold.red(`╚═══════════════════════════════════╝`))
          console.error(chalk.red(`\n❌ ${error.message}\n`))
          
          if (error.message.includes('timed out') || error.message.includes('timeout')) {
            console.log(chalk.yellow(`⚠️  Posibles causas:`))
            console.log(chalk.white(`   • El número no tiene WhatsApp activo`))
            console.log(chalk.white(`   • Problemas de conectividad`))
            console.log(chalk.white(`   • El formato del número es incorrecto\n`))
          }
          
          console.log(chalk.cyan(`💡 Soluciones:\n`))
          console.log(chalk.white(`   1. Verifica que el número sea correcto`))
          console.log(chalk.white(`   2. Reinicia el bot: ${chalk.green('npm start')}`))
          console.log(chalk.white(`   3. Usa método QR: ${chalk.green('npm start -- qr')}\n`))
        }
      }, 3000)
    }
  }
}

// Guardado de BD
if (!opts['test']) {
  setInterval(async () => {
    if (global.db.data) await global.db.write().catch(() => {})
  }, 60 * 1000)
}

// Manejo de conexión
async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin, qr } = update
  global.stopped = connection
  
  if (isNewLogin) conn.isInit = true
  
  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
  
  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
    await global.reloadHandler(true).catch(console.error)
    global.timestamp.connect = new Date
  }
  
  if (global.db.data == null) loadDatabase()
  
  if (qr != 0 && qr != undefined || methodCodeQR) {
    if (opcion == '1' || methodCodeQR) {
      console.log(chalk.yellow(`\n📱 Escanea el código QR con WhatsApp\n`))
    }
  }
  
  if (connection === "open") {
    const userName = conn.user.name || conn.user.verifiedName || "Usuario"
    const userNumber = conn.user.id.split(':')[0]
    
    console.log(chalk.bold.red(`\n╔═══════════════════════════════════╗`))
    console.log(chalk.bold.red(`║   ✅ SASUKE BOT CONECTADO   ✅    ║`))
    console.log(chalk.bold.red(`╚═══════════════════════════════════╝`))
    console.log(chalk.cyan(`\n👤 Usuario: ${userName}`))
    console.log(chalk.cyan(`📱 Número: +${userNumber}`))
    console.log(chalk.red(`🔥 Sharingan: ${chalk.bold.green('ACTIVADO')}`))
    console.log(chalk.gray(`⏰ Conectado: ${new Date().toLocaleString('es-MX')}\n`))
  }
  
  let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
  
  if (connection === "close") {
    if ([401, 440, 428, 405].includes(reason)) {
      console.log(chalk.red(`\n⚠️  Sesión cerrada (código: ${code})`))
      console.log(chalk.yellow(`💡 Elimina la carpeta "${global.sessions}" y vuelve a conectar\n`))
    } else {
      console.log(chalk.yellow(`\n⟳ Reconectando Sasuke Bot...\n`))
      await global.reloadHandler(true).catch(console.error)
    }
  }
}

conn.ev.on("creds.update", saveCreds)

process.on('uncaughtException', console.error)

let isInit = true
let handler = await import('./handler.js')

// Recarga de handler
global.reloadHandler = async function(restatConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
    if (Object.keys(Handler || {}).length) handler = Handler
  } catch (e) {
    console.error(e)
  }
  if (restatConn) {
    const oldChats = global.conn.chats
    try {
      global.conn.ws.close()
    } catch {}
    conn.ev.removeAllListeners()
    global.conn = makeWASocket(connectionOptions, { chats: oldChats })
    isInit = true
  }
  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler)
    conn.ev.off('connection.update', conn.connectionUpdate)
    conn.ev.off('creds.update', conn.credsUpdate)
  }
  conn.handler = handler.handler.bind(global.conn)
  conn.connectionUpdate = connectionUpdate.bind(global.conn)
  conn.credsUpdate = saveCreds.bind(global.conn, true)
  conn.ev.on('messages.upsert', conn.handler)
  conn.ev.on('connection.update', conn.connectionUpdate)
  conn.ev.on('creds.update', conn.credsUpdate)
  isInit = false
  return true
}

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red("\n⚠️  Rechazo no manejado:"), reason)
})

// SubBots de Sasuke
global.rutaJadiBot = join(__dirname, `./jadi`)
global.SasukeJadibts = true

if (global.SasukeJadibts) {
  if (!existsSync(global.rutaJadiBot)) {
    mkdirSync(global.rutaJadiBot, { recursive: true })
    console.log(chalk.bold.cyan(`✓ Carpeta jadi creada`))
  }
  const readRutaJadiBot = readdirSync(rutaJadiBot)
  if (readRutaJadiBot.length > 0) {
    const creds = 'creds.json'
    for (const gjbts of readRutaJadiBot) {
      const botPath = join(rutaJadiBot, gjbts)
      const readBotPath = readdirSync(botPath)
      if (readBotPath.includes(creds)) {
        SasukeJadiBot({ pathSasukeJadiBot: botPath, m: null, conn, args: '', usedPrefix: '/', command: 'serbot' })
      }
    }
  }
}

// Carga de plugins
const pluginFolders = ['./plugins', './plugins2', './plugins3', './plugins4', './plugins5']
const pluginFilter = filename => /\.js$/.test(filename)
global.plugins = {}

async function filesInit() {
  console.log(chalk.bold.red('\n╔═══════════════════════════════════╗'))
  console.log(chalk.bold.red('║      CARGANDO PLUGINS...          ║'))
  console.log(chalk.bold.red('╚═══════════════════════════════════╝\n'))

  const allLoadPromises = []
  const folderStats = {}

  for (const folder of pluginFolders) {
    const folderPath = join(__dirname, folder)
    if (!existsSync(folderPath)) {
      console.log(chalk.gray(`⚠ ${folder} no existe`))
      continue
    }

    folderStats[folder] = 0
    const files = readdirSync(folderPath).filter(pluginFilter)

    for (const filename of files) {
      const file = global.__filename(join(folderPath, filename))
      allLoadPromises.push(
        import(`${file}?v=${Date.now()}`)
          .then(module => {
            global.plugins[filename] = module.default || module
            folderStats[folder]++
            return { folder, filename, success: true }
          })
          .catch(e => {
            console.error(chalk.red(`❌ ${folder}/${filename}: ${e.message}`))
            delete global.plugins[filename]
            return { folder, filename, success: false }
          })
      )
    }
  }

  await Promise.all(allLoadPromises)

  let total = 0
  for (const [folder, count] of Object.entries(folderStats)) {
    if (count > 0) {
      console.log(chalk.green(`✓ ${folder}: ${count} plugins`))
      total += count
    }
  }

  console.log(chalk.bold.red(`\n╔═══════════════════════════════════╗`))
  console.log(chalk.bold.red(`║  🔥 TOTAL: ${total} PLUGINS CARGADOS 🔥  ║`))
  console.log(chalk.bold.red(`╚═══════════════════════════════════╝\n`))
}

filesInit().catch(console.error)

// Recarga de plugins
global.reload = async (_ev, filename) => {
  if (!pluginFilter(filename)) return

  let dir
  for (const folder of pluginFolders) {
    const possiblePath = global.__filename(join(__dirname, folder, filename), true)
    if (existsSync(possiblePath)) {
      dir = possiblePath
      break
    }
  }

  if (!dir) return

  if (filename in global.plugins) {
    if (existsSync(dir)) {
      console.log(chalk.yellow(`♻ Recargando plugin: ${filename}`))
      try {
        const module = await import(`${dir}?update=${Date.now()}`)
        global.plugins[filename] = module.default || module
        console.log(chalk.green(`✓ Plugin recargado: ${filename}`))
      } catch (e) {
        con