process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'

// Importaciones básicas
import './settings.js'
import './plugins/_allfake.js'
import cfonts from 'cfonts'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import fs from 'fs'
import yargs from 'yargs'
import lodash from 'lodash'
import { SasukeJadiBot } from './plugins/sockets-serbot.js'
import chalk from 'chalk'
import pino from 'pino'
import path from 'path'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { proto } from '@whiskeysockets/baileys'
import { PhoneNumberUtil } from 'google-libphonenumber'
import { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser } from '@whiskeysockets/baileys'
import readline from 'readline'
import NodeCache from 'node-cache'

// Variables globales básicas
const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || 3000
const sessions = 'Sessions/Principal'
const jadi = 'jadi'
const phoneUtil = PhoneNumberUtil.getInstance()

// Función de validación de números (simplificada)
async function isValidPhoneNumber(phoneNumber) {
  try {
    const number = phoneUtil.parseAndKeepRawInput(phoneNumber)
    return phoneUtil.isValidNumber(number)
  } catch {
    return false
  }
}

// Mensaje de inicio con estilo
let { say } = cfonts
console.log(chalk.red('\n⚡ Iniciando Sistema...'))
say('SASUKE BOT', { font: 'block', align: 'center', gradient: ['red', 'blue'] })
say('Sistema Multi-Plugins Activado', { font: 'console', align: 'center', colors: ['cyan'] })
say('Sharingan Ready', { font: 'tiny', align: 'center', colors: ['red', 'white'] })

// Configuración de rutas globales (simplificada)
protoType()
serialize()

global.__filename = (pathURL = import.meta.url) => fileURLToPath(pathURL)
global.__dirname = () => path.dirname(global.__filename(import.meta.url))
global.__require = (dir = import.meta.url) => createRequire(dir)

// Timestamp y opciones
global.timestamp = { start: new Date }
const __dirname = global.__dirname()
global.opts = yargs(process.argv.slice(2)).exitProcess(false).parse()
global.prefix = new RegExp('^[#!./-]')

// Base de datos (simplificada pero compatible)
const dbAdapter = /https?:\/\//.test(opts.db || '') ? new cloudDBAdapter(opts.db) : new JSONFile('database.json')
const defaultDBData = {
  users: {}, chats: {}, settings: {},
  gacha: { personajes: [], probabilidades: { comun: 70, raro: 20, epic: 8, legendario: 2 } },
  config: { prefix: '!', owner: '521xxxxxxxxx', botName: 'Sasuke Bot' } // CAMBIA TU NÚMERO AQUÍ
}

global.db = new Low(dbAdapter, defaultDBData)
global.loadDatabase = async () => {
  if (global.db.data) return
  await global.db.read().catch(console.error)
  global.db.data = { ...defaultDBData, ...global.db.data }
  global.db.chain = chain(global.db.data)
}
loadDatabase()

// Configuración de autenticación y conexión
const { state, saveCreds } = await useMultiFileAuthState(sessions)
const msgRetryCounterCache = new NodeCache({ stdTTL: 0 })
const userDevicesCache = new NodeCache({ stdTTL: 0 })
const { version } = await fetchLatestBaileysVersion()
let phoneNumber = global.botNumber
const methodCodeQR = process.argv.includes("qr")
const methodCode = !!phoneNumber || process.argv.includes("code")
const MethodMobile = process.argv.includes("mobile")
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise(resolve => rl.question(texto, resolve))
let opcion

// Selección de método de inicio (simplificada)
if (methodCodeQR) opcion = '1'
if (!methodCodeQR && !methodCode && !fs.existsSync(`${sessions}/creds.json`)) {
  do {
    opcion = await question(chalk.bold.white("Seleccione una opción:\n1. Con código QR\n2. Con código de 8 dígitos\n━━━> "))
    if (!/^[1-2]$/.test(opcion)) console.log(chalk.bold.red(`❌ Solo números 1 o 2`))
  } while (opcion !== '1' && opcion !== '2')
}

// Opciones de conexión optimizadas
const connectionOptions = {
  logger: pino({ level: 'silent' }),
  printQRInTerminal: opcion === '1' || methodCodeQR,
  mobile: MethodMobile,
  browser: ["Sasuke Bot", "Chrome", "1.0.0"],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
  },
  markOnlineOnConnect: false,
  generateHighQualityLinkPreview: true,
  syncFullHistory: false,
  getMessage: async () => "",
  msgRetryCounterCache,
  userDevicesCache,
  cachedGroupMetadata: (jid) => globalThis.conn.chats[jid] ?? {},
  version,
  keepAliveIntervalMs: 50000
}

global.conn = makeWASocket(connectionOptions)
conn.ev.on("creds.update", saveCreds)

// Proceso de código de paring (simplificada)
if (!fs.existsSync(`${sessions}/creds.json`) && (opcion === '2' || methodCode)) {
  if (!conn.authState.creds.registered) {
    do {
      phoneNumber = await question(chalk.bgBlack(chalk.bold.red(`[ 🔐 ] Ingrese su número (+prefijo): `)))
      phoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber.replace(/\D/g, '')}`
    } while (!await isValidPhoneNumber(phoneNumber))
    rl.close()

    setTimeout(async () => {
      const codeBot = await conn.requestPairingCode(phoneNumber.replace(/\D/g, ''))
      console.log(chalk.bold.white(chalk.bgRed(`[ 🔑 ] Código Sasuke: `)), chalk.bold.white(codeBot.match(/.{1,4}/g)?.join("-") || codeBot))
    }, 3000)
  }
}

// Guardado automático de BD
if (!opts.test) setInterval(async () => global.db.data && await global.db.write().catch(() => {}), 60000)

// Manejo de conexión (simplificada)
async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin, qr } = update
  global.stopped = connection

  if (qr) console.log(chalk.red.bold(`[ 📱 ] Escanea el código QR de Sasuke`))
  if (connection === "open") {
    const userName = conn.user.name || "Usuario"
    console.log(chalk.bold.red(`\n╔═══════════════════════════════════╗`))
    console.log(chalk.bold.red(`║   ⚡ SASUKE BOT CONECTADO ⚡     ║`))
    console.log(chalk.bold.red(`╚═══════════════════════════════════╝`))
    console.log(chalk.cyan(`👤 Usuario: ${userName}`))
    console.log(chalk.cyan(`📱 Número: ${conn.user.id.split(':')[0]}`))
    console.log(chalk.red(`🔥 Sharingan: Activado`))
    console.log(chalk.gray(`⏰ Hora: ${new Date().toLocaleString('es-MX')}\n`))
  }

  if (connection === "close") {
    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
    if ([401, 440].includes(reason)) console.log(chalk.red(`⚠ Sesión cerrada - vuelve a iniciar`))
    console.log(chalk.yellow("⟳ Reconectando Sasuke Bot..."))
    await global.reloadHandler(true).catch(console.error)
  }
}

// Manejo de errores
process.on('uncaughtException', console.error)
process.on('unhandledRejection', (reason) => console.error("⚠ Rechazo no manejado:", reason))

// Carga de handler y recarga
let isInit = true
let handler = await import('./handler.js')

global.reloadHandler = async (restatConn) => {
  try {
    const newHandler = await import(`./handler.js?update=${Date.now()}`)
    if (newHandler) handler = newHandler
  } catch (e) { console.error(e) }

  if (restatConn) {
    global.conn?.ws.close()
    conn.ev.removeAllListeners()
    global.conn = makeWASocket(connectionOptions)
    isInit = true
  }

  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler)
    conn.ev.off('connection.update', conn.connectionUpdate)
  }

  conn.handler = handler.handler.bind(conn)
  conn.connectionUpdate = connectionUpdate.bind(conn)
  conn.ev.on('messages.upsert', conn.handler)
  conn.ev.on('connection.update', conn.connectionUpdate)
  isInit = false
  return true
}

// Subbots (simplificada)
global.rutaJadiBot = path.join(__dirname, jadi)
if (global.SasukeJadibts) {
  if (!fs.existsSync(global.rutaJadiBot)) {
    fs.mkdirSync(global.rutaJadiBot, { recursive: true })
    console.log(chalk.bold.cyan(`✓ Carpeta ${jadi} creada`))
  }

  fs.readdirSync(global.rutaJadiBot).forEach(gjbts => {
    const botPath = path.join(global.rutaJadiBot, gjbts)
    if (fs.existsSync(path.join(botPath, 'creds.json'))) {
      SasukeJadiBot({ pathSasukeJadiBot: botPath, conn, usedPrefix: '/', command: 'serbot' })
    }
  })
}

// Carga de plugins (simplificada pero con estilo)
const pluginFolders = ['./plugins', './plugins2', './plugins3', './plugins4', './plugins5']
const pluginFilter = (f) => f.endsWith('.js')
global.plugins = {}

async function filesInit() {
  console.log(chalk.bold.red('\n╔═══════════════════════════════════╗'))
  console.log(chalk.bold.red('║      CARGANDO PLUGINS...          ║'))
  console.log(chalk.bold.red('╚═══════════════════════════════════╝\n'))

  let total = 0
  for (const folder of pluginFolders) {
    const folderPath = path.join(__dirname, folder)
    if (!fs.existsSync(folderPath)) {
      console.log(chalk.gray(`⚠ ${folder} no existe`))
      continue
    }

    const files = fs.readdirSync(folderPath).filter(pluginFilter)
    for (const file of files) {
      try {
        global.plugins[file] = await import(path.join(folderPath, file))
        total++
      } catch (e) {
        console.error(chalk.red(`❌ ${folder}/${file}: ${e.message}`))
      }
    }
    console.log(chalk.green(`✓ ${folder}: ${files.length} plugins (${Object.keys(global.plugins).filter(k => k in files).length} cargados)`))
  }

  console.log(chalk.bold.red(`\n╔═══════════════════════════════════╗`))
  console.log(chalk.bold.red(`║  🔥 TOTAL: ${total} PLUGINS CARGADOS 🔥  ║`))
  console.log(chalk.bold.red(`╚═══════════════════════════════════╝`))
}

// Llamada a la función de carga de plugins (MÁS IMPORTANTE DE TODO)
filesInit()
