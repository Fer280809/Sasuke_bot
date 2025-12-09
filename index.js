process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'
import './settings.js'
import cfonts from 'cfonts'
import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import fs, { readdirSync, existsSync, mkdirSync, readFileSync, writeFileSync, watch } from 'fs'
import yargs from 'yargs'
import lodash from 'lodash'
import chalk from 'chalk'
import pino from 'pino'
import path, { join, dirname } from 'path'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node' // Importación corregida
import pkg from 'google-libphonenumber'
const { PhoneNumberUtil } = pkg
const phoneUtil = PhoneNumberUtil.getInstance()
import baileys from '@whiskeysockets/baileys'
import readline from 'readline'

// Importar dns y forzar IPv4
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

// Funciones y variables globales
const __filename = (pathURL = import.meta.url, rmPrefix = platform !== 'win32') => rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString()
const __dirnameFile = dirname(fileURLToPath(import.meta.url));
const require = dir => createRequire(dir)
global.timestamp = { start: new Date() }
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp('^[#!./-]')
global.sessions = 'Sessions/Principal'

// Clase JSONFile alternativa para lowdb v3 o anterior
class JSONFileSync {
  constructor(filename) {
    this.filename = filename
  }
  read() { try { return JSON.parse(readFileSync(this.filename, 'utf-8')) } catch { return null } }
  write(obj) { writeFileSync(this.filename, JSON.stringify(obj, null, 2)) }
}

// Base de datos con compatibilidad
const dbPath = 'database.json'
const defaultData = { users: {}, chats: {}, settings: {}, gacha: { personajes: [], probabilidades: { comun: 70, raro: 20, epic: 8, legendario: 2 } }, config: { prefix: '!', owner: '5214181450063', botName: 'Sasuke Bot' } }
let adapter
try { adapter = new JSONFile(dbPath); global.db = new Low(adapter, defaultData) } catch { adapter = new JSONFileSync(dbPath); global.db = new Low(adapter) }
global.DATABASE = global.db

// Cargar la base de datos
global.loadDatabase = async () => {
  if (global.db.READ) return new Promise(resolve => setInterval(async function() { if (!global.db.READ) { clearInterval(this); resolve(global.db.data == null ? global.loadDatabase() : global.db.data) } }, 1000))
  if (global.db.data !== null) return
  global.db.READ = true
  try { await global.db.read() } catch (error) { console.log(chalk.yellow('⚠ Creando nueva base de datos...')) }
  global.db.READ = null
  global.db.data = global.db.data || defaultData
  global.db.chain = lodash.chain(global.db.data)
  try { await global.db.write(); console.log(chalk.green('✓ Base de datos inicializada')) } catch (error) { console.log(chalk.red('❌ Error al guardar BD:', error.message)) }
}
loadDatabase()

// Configuración de conexión
const { useMultiFileAuthState } = await import('@whiskeysockets/baileys')
const { state, saveCreds } = await useMultiFileAuthState(global.sessions)
const { version } = await import('@whiskeysockets/baileys')
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = texto => new Promise(resolve => rl.question(texto, resolve))

// Función de validación y corrección de teléfono
async function isValidPhoneNumber(number) {
  try {
    console.log(chalk.gray(`[isValidPhoneNumber] Validando número: ${number}`))
    let cleanNumber = number.replace(/\D/g, '')
    if (cleanNumber.match(/^52[0-9]{10}$/)) { console.log(chalk.yellow('⚠ [isValidPhoneNumber] Formato: 52 + 10 dígitos detectado')); cleanNumber = '521' + cleanNumber.substring(2); console.log(chalk.green(`✓ [isValidPhoneNumber] Número corregido a: +${cleanNumber}`)); return cleanNumber }
    if (cleanNumber.match(/^521[0-9]{10}$/)) { console.log(chalk.green(`✓ [isValidPhoneNumber] Formato correcto detectado: +${cleanNumber}`)); return cleanNumber }
    const parsedNumber = phoneUtil.parse(`+${cleanNumber}`, null);
    if (phoneUtil.isValidNumber(parsedNumber)) { console.log(chalk.green(`✓ [isValidPhoneNumber] Número válido: +${cleanNumber}`)); return cleanNumber }
    console.log(chalk.red(`❌ [isValidPhoneNumber] Número no reconocido. Formato esperado:`));
    console.log(chalk.cyan(`   México: 5214181450063 (52 + 1 + 10 dígitos)`));
    console.log(chalk.cyan(`   O bien: 524181450063 (52 + 10 dígitos)`));
    return false
  } catch (e) { console.log(chalk.red(`❌ [isValidPhoneNumber] Error: ${e.message}`)); return false }
}

// Opciones de conexión
const connectionOptions = {
  logger: pino({ level: 'silent' }),
  printQRInTerminal: process.argv.includes("qr"),
  mobile: process.argv.includes("mobile"),
  browser: ["Chrome (Linux)", "", ""],
  auth: { creds: state.creds, keys: baileys.makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })) },
  markOnlineOnConnect: false,
  generateHighQualityLinkPreview: true,
  syncFullHistory: false,
  getMessage: async (key) => (await store.loadMessage((0, import('@whiskeysockets/baileys').jidNormalizedUser)(key.remoteJid), key.id))?.message || "",
  defaultQueryTimeoutMs: undefined,
  cachedGroupMetadata: (jid) => globalThis.conn?.chats?.[jid] ?? {},
  version: await (0, import('@whiskeysockets/baileys')).fetchLatestBaileysVersion(),
  keepAliveIntervalMs: 50000,
  maxIdleTimeMs: 60000,
}

// Crear conexión
global.conn = makeWASocket(connectionOptions)
conn.isInit = false
conn.well = false

// Proceso de código de 8 dígitos CORREGIDO
if (!fs.existsSync(`./${global.sessions}/creds.json`)) {
  if (process.argv.includes("code") || global.botNumber) {
    let addNumber, validNumber = false
    do {
      const phoneNumber = global.botNumber || await question(chalk.bgBlack(chalk.bold.red(`[ 🔐 ] Ingrese el número de WhatsApp:\n${chalk.cyan('Ejemplo México: 5214181450063 o 524181450063')}\n${chalk.bold.magentaBright('━━━> ')}`)))
      const result = await isValidPhoneNumber(phoneNumber);
      if (result) { addNumber = result; validNumber = true; console.log(chalk.bold.green(`✅ Número aceptado: ${addNumber}`)) } else { console.log(chalk.red('❌ Intenta nuevamente\n')) }
    } while (!validNumber)
    rl.close()

    // Formatear el número con phoneUtil
    try {
      const parsedNumber = phoneUtil.parse(`+${addNumber}`, null)
      addNumber = phoneUtil.format(parsedNumber, pkg.PhoneNumberFormat.E164)
      console.log(chalk.green(`✓ Número formateado: ${addNumber}`))
    } catch (error) {
      console.error(chalk.red('❌ Error al formatear el número:'), error.message)
      console.log(chalk.yellow('⚠ Intenta reiniciar el bot con: npm start'))
      process.exit(1); // Salir del proceso si no se puede formatear el número
    }

    console.log(chalk.cyan(`\n⏳ Solicitando código de pareamiento para: ${addNumber}...\n`))
    let pairingSuccessful = false;

    setTimeout(async () => {
      try {
        let codeBot = await conn.requestPairingCode(addNumber)
        codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
        console.log(chalk.bold.white(chalk.bgRed(`\n[ 🔑 ] CÓDIGO DE SASUKE: ${codeBot}\n`)))
        console.log(chalk.cyan(`💡 Pasos para vincular:`))
        console.log(chalk.cyan(`   1. Abre WhatsApp en tu teléfono`))
        console.log(chalk.cyan(`   2. Ve a Ajustes > Dispositivos vinculados`))
        console.log(chalk.cyan(`   3. Toca "Vincular un dispositivo"`))
        console.log(chalk.cyan(`   4. Ingresa este código: ${codeBot}\n`))
        pairingSuccessful = true; // Marcar que la solicitud fue exitosa
      } catch (error) {
        console.error(chalk.red('❌ Error al solicitar código:'), error.message)
        console.log(chalk.yellow('⚠ Intenta reiniciar el bot con: npm start'))
      }
    }, 3000)
    // Si la solicitud falla después de 3 segundos, salir
    setTimeout(() => {
      if (!pairingSuccessful) {
        console.error(chalk.red('❌ Fallo al solicitar el código de vinculación. Verifica tu conexión y reinicia el bot.'));
        process.exit(1);
      }
    }, 6000); // 6 segundos (3 segundos para solicitar + 3 segundos de espera)
  }
}

// Manejo de eventos
conn.ev.on("creds.update", saveCreds)
setInterval(async () => { if (global.db.data) await global.db.write().catch(() => {}) }, 60000)

// Manejo de conexión
async function connectionUpdate(update) {
  console.log(chalk.gray(`[connectionUpdate] Update: ${JSON.stringify(update)}`))
  const { connection, lastDisconnect, isNewLogin, qr } = update
  global.stopped = connection
  if (isNewLogin) conn.isInit = true
  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
  if (code && code !== baileys.DisconnectReason.loggedOut && conn?.ws.socket == null) { await global.reloadHandler(true).catch(console.error); global.timestamp.connect = new Date }
  if (global.db.data == null) loadDatabase()
  if (qr != 0 && qr != undefined || process.argv.includes("qr")) { if (process.argv.includes("qr")) console.log(chalk.red.bold(`[ 📱 ] Escanea este código QR de Sasuke`)) }
  if (connection === "open") {
    const userName = conn.user.name || conn.user.verifiedName || "Usuario"
    console.log(chalk.bold.red(`\n╔═══════════════════════════════════╗`))
    console.log(chalk.bold.red(`║   ✅ SASUKE BOT CONECTADO EXITOSAMENTE   ║`))
    console.log(chalk.bold.red(`╚═══════════════════════════════════╝`))
    console.log(chalk.cyan(`👤 Usuario: ${userName}`))
    console.log(chalk.cyan(`📱 Número: ${conn.user.id.split(':')[0]}`))
    console.log(chalk.red(`🔥 Sharingan: Activado`))
    console.log(chalk.gray(`⏰ Hora: ${new Date().toLocaleString('es-MX')}\n`))
    conn.ev.on('messages.upsert', async m => {
      const msg = m.messages[0]
      if (!msg.key.fromMe && msg.key.remoteJid !== 'status@broadcast') {
        const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || msg.message?.listResponseMessage?.singleSelectReply
