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
import pkgPhone from 'google-libphonenumber'
const { PhoneNumberUtil } = pkgPhone
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

// ARREGLADO: Validación para NÚMEROS DE HASTA 13 DÍGITOS (incluyendo 521)
function isValidPhoneNumber(phoneNumber) {
  const cleanNumber = phoneNumber.replace(/\D/g, '') // Quita todo lo que no sea número
  // Acepta de 10 a 13 dígitos (ej: 4181450063, 524181450063, 5214181450063)
  return /^\d{10,13}$/.test(cleanNumber)
}

// MENSAJE GRANDE DE COLORES
let { say } = cfonts
console.log(chalk.red('\n⚡ Iniciando Sistema...'))
say('SASUKE BOT', { font: 'block', align: 'center', gradient: ['red', 'blue'] })
say('Sistema Multi-Plugins Activado', { font: 'console', align: 'center', colors: ['cyan'] })
say('Sharingan Ready', { font: 'tiny', align: 'center', colors: ['red', 'white'] })

// Configuración de rutas globales
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

// Base de datos
const dbAdapter = /https?:\/\//.test(opts.db || '') ? new cloudDBAdapter(opts.db) : new JSONFile('database.json')
const defaultDBData = {
  users: {}, chats: {}, settings: {},
  gacha: { personajes: [], probabilidades: { comun: 70, raro: 20, epic: 8, legendario: 2 } },
  config: { prefix: '!', owner: '5214181450063', botName: 'Sasuke Bot' } // Tu número de 13 dígitos aquí
}

global.db = new Low(dbAdapter, defaultDBData)
global.loadDatabase = async () => {
  if (global.db.data) return
  await global.db.read().catch(console.error)
  global.db.data = { ...defaultDBData, ...global.db.data }
  global.db.chain = chain(global.db.data)
}
loadDatabase()

// Configuración de autenticación y versión
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

// Selección de método de inicio
if (methodCodeQR) opcion = '1'
if (!methodCodeQR && !methodCode && !fs.existsSync(`${sessions}/creds.json`)) {
  do {
    opcion = await question(chalk.bold.white("Seleccione una opción:\n1. Con código QR\n2. Con código de 8 dígitos\n━━━> "))
    if (!/^[1-2]$/.test(opcion)) console.log(chalk.bold.red(`❌ Solo números 1 o 2`))
  } while (opcion !== '1' && opcion !== '2')
}

// Logger válido
const logger = pino({ level: 'silent' })

// Opciones de conexión OPTIMIZADAS para evitar errores de pairing
const connectionOptions = {
  logger: logger,
  printQRInTerminal: opcion === '1' || methodCodeQR,
  mobile: true, // Modo móvil más estable para pairing
  browser: ["Sasuke Bot", "Android", "1.0.0"], // Navegador compatible
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, logger)
  },
  markOnlineOnConnect: false,
  generateHighQualityLinkPreview: true,
  syncFullHistory: false,
  getMessage: async () => "",
  msgRetryCounterCache,
  userDevicesCache,
  cachedGroupMetadata: (jid) => globalThis.conn.chats[jid] ?? {},
  version,
  keepAliveIntervalMs: 30000, // Intervalo de conexión más corto
  connectTimeoutMs: 15000 // Tiempo de espera más amplio
}

global.conn = makeWASocket(connectionOptions)
conn.ev.on("creds.update", saveCreds)

// Proceso de código de paring (ARREGLADO Y CON SOPORTE A 13 DÍGITOS)
if (!fs.existsSync(`${sessions}/creds.json`) && (opcion === '2' || methodCode)) {
  if (!conn.authState.creds.registered) {
    do {
      phoneNumber = await question(chalk.bgBlack(chalk.bold.red(`[ 🔐 ] Ingrese su número (hasta 13 dígitos): `)))
      if (!isValidPhoneNumber(phoneNumber)) {
        console.log(chalk.bold.red(`❌ Número no válido - debe tener entre 10 y 13 dígitos`))
      }
    } while (!isValidPhoneNumber(phoneNumber))
    rl.close()

    // Espera a que la conexión esté 100% lista
    const waitForConnection = () => new Promise(resolve => {
      const interval = setInterval(() => {
        if (conn.ws.readyState === ws.OPEN) {
          clearInterval(interval)
          resolve()
        }
      }, 300)
    })

    console.log(chalk.yellow(`[ ⏳ ] Esperando conexión con WhatsApp...`))
    await waitForConnection()

    try {
      const cleanNumber = phoneNumber.replace(/\D/g, '')
      // Asegura que el número tenga el prefijo 521 (si no lo tiene, se lo agrega)
      const normalizedNumber = cleanNumber.startsWith('521') ? cleanNumber : 
                               cleanNumber.startsWith('52') ? `521${cleanNumber.slice(2)}` : 
                               `521${cleanNumber}`
      
      // ARREGLADO: Solicita el código de pairing de forma estable
      const codeBot = await conn.requestPairingCode(normalizedNumber)
      console.log(chalk.bold.white(chalk.bgRed(`[ 🔑 ] CÓDIGO VÁLIDO DE SASUKE: `)), chalk.bold.white(codeBot.match(/.{1,4}/g)?.join("-") || codeBot))
      console.log(chalk.green(`✅ Código generado exitosamente - ingrésalo rápido en tu WhatsApp!`))
      console.log(chalk.cyan(`💡 Pasos: WhatsApp > Ajustes > Dispositivos vinculados > Vincular un dispositivo`))
    } catch (e) {
      console.error(chalk.red(`⚠ Error al generar código: ${e.message}`))
      // Mensaje de error específico
      if (e.message.includes('invalid number')) {
        console.log(chalk.red(`❌ Número no registrado en WhatsApp o formato incorrecto`))
      } else if (e.message.includes('connection')) {
        console.log(chalk.red(`❌ Problema de conexión - revisa tu internet en Termux`))
      }
      console.log(chalk.cyan(`💡 Prueba con la opción 1 (código QR) - es la más confiable`))
    }
  }
}

// Guardado automático de BD
if (!opts.test) setInterval(async () => global.db.data && await global.db.write().catch(() => {}), 60000)

// Manejo de conexión
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
    console.log(chalk.cyan(`📱 Número: ${conn.user.id.split(':')[0]} (13 dígitos)`))
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

// Subbots
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

// Carga de plugins
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
        const module = await import(path.resolve(folderPath, file))
        global.plugins[file] = module.default || module
        total++
      } catch (e) {
        console.error(chalk.red(`❌ ${folder}/${file}: ${e.message}`))
      }
    }
    console.log(chalk.green(`✓ ${folder}: ${files.length} plugins (${Object.keys(global.plugins).filter(k => files.includes(k)).length} cargados)`))
  }

  console.log(chalk.bold.red(`\n╔═══════════════════════════════════╗`))
  console.log(chalk.bold.red(`║  🔥 TOTAL: ${total} PLUGINS CARGADOS 🔥  ║`))
  console.log(chalk.bold.red(`╚═══════════════════════════════════╝`))
}

// Llamada a la función de carga de plugins
filesInit()
