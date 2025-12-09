process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'
import './settings.js'
import './plugins/_allfake.js'
import cfonts from 'cfonts'
import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, readFileSync, rmSync, watch } from 'fs'
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

// Ajuste: Definir carpeta de sesiones
const sessions = 'Sessions/Principal'
// Ajuste: Definir carpeta jadi (para subbots) - si no la tienes, dejar así
const jadi = 'jadi'

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

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString()
}
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true))
}
global.__require = function require(dir = import.meta.url) {
  return createRequire(dir)
}

global.timestamp = { start: new Date }
const __dirname = global.__dirname(import.meta.url)
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp('^[#!./-]')

// Base de datos optimizada (ARREGLADA - LowDB v7.x compatible)
const dbAdapter = /https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile('database.json')

// DATOS POR DEFECTO REQUERIDOS POR LOWDB v7.x - CAMBIA TU NÚMERO AQUÍ
const defaultDBData = {
  users: {},
  chats: {},
  settings: {},
  gacha: { personajes: [], probabilidades: { comun: 70, raro: 20, epic: 8, legendario: 2 } },
  config: { prefix: '!', owner: '521xxxxxxxxx', botName: 'Sasuke Bot' }
}

global.db = new Low(dbAdapter, defaultDBData)
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
  await global.db.read().catch(console.error)
  global.db.READ = null
  global.db.data = { ...defaultDBData, ...(global.db.data || {}) }
  global.db.chain = chain(global.db.data)
}
loadDatabase()

const { state, saveCreds } = await useMultiFileAuthState(sessions)
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

if (methodCodeQR) {
  opcion = '1'
}
if (!methodCodeQR && !methodCode && !fs.existsSync(`${sessions}/creds.json`)) {
  do {
    opcion = await question(chalk.bold.white("Seleccione una opción:\n") + chalk.redBright("1. Con código QR\n") + chalk.blueBright("2. Con código de 8 dígitos\n━━━> "))
    if (!/^[1-2]$/.test(opcion)) {
      console.log(chalk.bold.redBright(`❌ No se permiten números que no sean 1 o 2`))
    }
  } while (opcion !== '1' && opcion !== '2')
}

console.info = () => {}

// Opciones de conexión optimizadas (ARREGLADA - sin store.loadMessage)
const connectionOptions = {
  logger: pino({ level: 'silent' }),
  printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
  mobile: MethodMobile,
  browser: ["Sasuke Bot", "Chrome", "1.0.0"],
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
      return "" // Baileys maneja el mensaje faltante automáticamente
    } catch {
      return ""
    }
  },
  msgRetryCounterCache,
  userDevicesCache,
  defaultQueryTimeoutMs: undefined,
  cachedGroupMetadata: (jid) => globalThis.conn.chats[jid] ?? {},
  version,
  keepAliveIntervalMs: 50000,
  maxIdleTimeMs: 60000,
}

global.conn = makeWASocket(connectionOptions)
conn.ev.on("creds.update", saveCreds)

if (!fs.existsSync(`${sessions}/creds.json`)) {
  if (opcion === '2' || methodCode) {
    opcion = '2'
    if (!conn.authState.creds.registered) {
      let addNumber
      if (!!phoneNumber) {
        addNumber = phoneNumber.replace(/[^0-9]/g, '')
      } else {
        do {
          phoneNumber = await question(chalk.bgBlack(chalk.bold.redBright(`[ 🔐 ] Ingrese el número de WhatsApp.\n${chalk.bold.blue('━━━> ')}`)))
          phoneNumber = phoneNumber.replace(/\D/g, '')
          if (!phoneNumber.startsWith('+')) {
            phoneNumber = `+${phoneNumber}`
          }
        } while (!await isValidPhoneNumber(phoneNumber))
        rl.close()
        addNumber = phoneNumber.replace(/\D/g, '')
        setTimeout(async () => {
          let codeBot = await conn.requestPairingCode(addNumber)
          codeBot = codeBot.match(/.{1,4}/g)?.join("-") || codeBot
          console.log(chalk.bold.white(chalk.bgRed(`[ 🔑 ] Código Sasuke:`)), chalk.bold.white(codeBot))
        }, 3000)
      }
    }
  }
}

conn.isInit = false
conn.well = false

if (!opts['test']) {
  setInterval(async () => {
    if (global.db.data) await global.db.write().catch(() => {})
  }, 60 * 1000)
}

async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin } = update
  global.stopped = connection
  if (isNewLogin) conn.isInit = true
  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
    await global.reloadHandler(true).catch(console.error)
    global.timestamp.connect = new Date
  }
  if (global.db.data == null) loadDatabase()
  if (update.qr != 0 && update.qr != undefined || methodCodeQR) {
    if (opcion == '1' || methodCodeQR) {
      console.log(chalk.red.bold(`[ 📱 ] Escanea el código QR de Sasuke`))
    }
  }
  if (connection === "open") {
    const userName = conn.user.name || conn.user.verifiedName || "Usuario"
    await joinChannels(conn).catch(() => {})
    console.log(chalk.bold.red(`\n╔═══════════════════════════════════╗`))
    console.log(chalk.bold.red(`║   ⚡ SASUKE BOT CONECTADO ⚡     ║`))
    console.log(chalk.bold.red(`╚═══════════════════════════════════╝`))
    console.log(chalk.cyan(`👤 Usuario: ${userName}`))
    console.log(chalk.cyan(`📱 Número: ${conn.user.id.split(':')[0]}`))
    console.log(chalk.red(`🔥 Sharingan: Activado`))
    console.log(chalk.gray(`⏰ Hora: ${new Date().toLocaleString('es-MX')}\n`))
  }
  let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
  if (connection === "close") {
    if ([401, 440, 428, 405].includes(reason)) {
      console.log(chalk.red(`⚠ (${code}) › Sesión principal cerrada.`))
    }
    console.log(chalk.yellow("⟳ Reconectando Sasuke Bot..."))
    await global.reloadHandler(true).catch(console.error)
  }
}

process.on('uncaughtException', console.error)
let isInit = true
let handler = await import('./handler.js')

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
  console.error("⚠ Rechazo no manejado:", reason)
})

// SubBots - CAMBIADAS SOLO LAS REFERENCIAS CON "Asta"
global.rutaJadiBot = join(__dirname, `${jadi}`)
if (global.SasukeJadibts) { // Cambiado AstaJadibts por SasukeJadibts
  if (!existsSync(global.rutaJadiBot)) {
    mkdirSync(global.rutaJadiBot, { recursive: true })
    console.log(chalk.bold.cyan(`✓ Carpeta ${jadi} creada`))
  }
  const readRutaJadiBot = readdirSync(rutaJadiBot)
  if (readRutaJadiBot.length > 0) {
    const creds = 'creds.json'
    for (const gjbts of readRutaJadiBot) {
      const botPath = join(rutaJadiBot, gjbts)
      const readBotPath = readdirSync(botPath)
      if (readBotPath.includes(creds)) {
        SasukeJadiBot({ pathSasukeJadiBot: botPath, m: null, conn, args: '', usedPrefix: '/', command: 'serbot' }) // Cambiado AstaJadiBot y pathAstaJadiBot
      }
    }
  }
}

// Sistema de carga de plugins OPTIMIZADO - 5 Carpetas
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
        import(file)
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
  console.log(chalk.bold.red(`║  🔥 TOTAL: ${total} PLUGINS 🔥  ║`))
  console.log(chalk.bold.red(`╚═══════════════════════════════════╝\n`))
}

filesInit().catch(console.error)

// Recarga optimizada de plugins - COMPLETA Y
