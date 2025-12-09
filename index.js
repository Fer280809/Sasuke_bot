process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'
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

// Importar dns y forzar IPv4
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

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

// Función de validación y corrección de teléfono
async function isValidPhoneNumber(number) {
  try {
    console.log(chalk.gray(`[isValidPhoneNumber] Validando número: ${number}`))
    let cleanNumber = number.replace(/\D/g, '')

    // Caso 1: Número mexicano con 52 + 10 dígitos (falta el 1)
    if (cleanNumber.match(/^52[0-9]{10}$/)) {
      console.log(chalk.yellow('⚠ [isValidPhoneNumber] Formato: 52 + 10 dígitos detectado'))
      cleanNumber = '521' + cleanNumber.substring(2)
      console.log(chalk.green(`✓ [isValidPhoneNumber] Número corregido a: +${cleanNumber}`))
      return cleanNumber
    }

    // Caso 2: Número mexicano con 521 + 10 dígitos (correcto)
    if (cleanNumber.match(/^521[0-9]{10}$/)) {
      console.log(chalk.green(`✓ [isValidPhoneNumber] Formato correcto detectado: +${cleanNumber}`))
      return cleanNumber
    }

    // Caso 3: Otros países - validar con la librería
    const parsedNumber = phoneUtil.parse('+' + cleanNumber, null)
    if (phoneUtil.isValidNumber(parsedNumber)) {
      console.log(chalk.green(`✓ [isValidPhoneNumber] Número válido: +${cleanNumber}`))
      return cleanNumber
    }

    console.log(chalk.red(`❌ [isValidPhoneNumber] Número no reconocido. Formato esperado:`))
    console.log(chalk.cyan(`   México: 5214181450063 (52 + 1 + 10 dígitos)`))
    console.log(chalk.cyan(`   O bien: 524181450063 (52 + 10 dígitos, se agregará el 1)`))
    return false

  } catch (e) {
    console.log(chalk.red(`❌ [isValidPhoneNumber] Error: ${e.message}`))
    return false
  }
}

// Selección de método
if (methodCodeQR) {
  opcion = '1'
}
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${global.sessions}/creds.json`)) {
  do {
    opcion = await question(chalk.bold.white("Seleccione una opción:\n") + chalk.blueBright("1. Con código QR\n") + chalk.cyan("2. Con código de 8 dígitos\n━━━> "))
    if (!/^[1-2]$/.test(opcion)) {
      console.log(chalk.bold.redBright(`❌ No se permiten números que no sean 1 o 2`))
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

// Proceso de código de 8 dígitos CORREGIDO
if (!fs.existsSync(`./${global.sessions}/creds.json`)) {
  if (opcion === '2' || methodCode) {
    opcion = '2'
    if (!conn.authState.creds.registered) {
      let addNumber;
      
      if (!!phoneNumber) {
        addNumber = phoneNumber.replace(/[^0-9]/g, '');
        if (addNumber.startsWith('52') && addNumber.length === 12) {
          console.log(chalk.yellow('⚠ Número mexicano: agregando "1"...'));
          addNumber = '521' + addNumber.substring(2);
          console.log(chalk.green(`✓ Número ajustado: ${addNumber}`));
        }
      } else {
        let validNumber = false;
        do {
          phoneNumber = await question(chalk.bgBlack(chalk.bold.red(`[ 🔐 ] Ingrese el número de WhatsApp:\n${chalk.cyan('Ejemplo México: 5214181450063 o 524181450063')}\n${chalk.bold.magentaBright('━━━> ')}`)));

          phoneNumber = phoneNumber.replace(/\D/g, '').trim();
          console.log(chalk.gray(`Procesando: ${phoneNumber}`));

          const result = await isValidPhoneNumber(phoneNumber);
          if (result) {
            addNumber = result;
            validNumber = true;
            console.log(chalk.bold.green(`✅ Número aceptado: ${addNumber}`));
          } else {
            console.log(chalk.red('❌ Intenta nuevamente\n'));
          }
        } while (!validNumber);

        rl.close();
      }

      // Formatear el número con phoneUtil
      try {
        const parsedNumber = phoneUtil.parse(`+${addNumber}`, null);
        addNumber = phoneUtil.format(parsedNumber, pkg.PhoneNumberFormat.E164);
        console.log(chalk.green(`✓ Número formateado: ${addNumber}`));
      } catch (error) {
        console.error(chalk.red('❌ Error al formatear el número:'), error.message);
        console.log(chalk.yellow('⚠ Intenta reiniciar el bot con: npm start'));
        return; // Salir si no se puede formatear el número
      }

      console.log(chalk.cyan(`\n⏳ Solicitando código de pareamiento para: ${addNumber}...\n`));

      setTimeout(async () => {
        try {
          // Escuchar el evento 'auth-code-request' (si existe)
          conn.ev.on('auth-code-request', async () => {
            console.log(chalk.cyan('✓ Solicitud de código de autenticación recibida'));
          });

          let codeBot = await conn.requestPairingCode(addNumber);
          codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
          console.log(chalk.bold.white(chalk.bgRed(`\n[ 🔑 ] CÓDIGO DE SASUKE: ${codeBot}\n`)));
          console.log(chalk.cyan(`💡 Pasos para vincular:`));
          console.log(chalk.cyan(`   1. Abre WhatsApp en tu teléfono`));
          console.log(chalk.cyan(`   2. Ve a Ajustes > Dispositivos vinculados`));
          console.log(chalk.cyan(`   3. Toca "Vincular un dispositivo"`));
          console.log(chalk.cyan(`   4. Ingresa este código: ${codeBot}\n`));
        } catch (error) {
          console.error(chalk.red('❌ Error al solicitar código:'), error.message);
          console.log(chalk.yellow('⚠ Intenta reiniciar el bot con: npm start'));
        }
      }, 3000);
    }
  }
}

conn.ev.on("creds.update", saveCreds)

// Guardado de BD
if (!opts['test']) {
  setInterval(async () => {
    if (global.db.data) await global.db.write().catch(() => {})
  }, 60 * 1000)
}

// Manejo de conexión
async function connectionUpdate(update) {
  console.log(chalk.gray(`[connectionUpdate] Update: ${JSON.stringify(update)}`))
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
      console.log(chalk.red.bold(`[ 📱 ] Escanea este código QR de Sasuke`))
    }
  }
  if (connection === "open") {
    const userName = conn.user.name || conn.user.verifiedName || "Usuario"
    console.log(chalk.bold.red(`\n╔═══════════════════════════════════╗`))
    console.log(chalk.bold.red(`║   ✅ SASUKE BOT CONECTADO EXITOSAMENTE   ║`))
    console.log(chalk.bold.red(`╚═══════════════════════════════════╝`))
    console.log(chalk.cyan(`👤 Usuario: ${userName}`))
    console.log(chalk.cyan(`📱 Número: ${conn.user.id.split(':')[0]}`))
    console.log(chalk.red(`🔥 Sharingan: Activado`))
    console.log(chalk.gray(`⏰ Hora: ${new Date().toLocaleString('es-MX')}\n`))

     // Mover la lógica para procesar mensajes aquí
    conn.ev.on('messages.upsert', async (m) => {
      const msg = m.messages[0];
      if (!msg.key.fromMe && m.key.remoteJid !== 'status@broadcast') {
        const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || msg.message?.listResponseMessage?.singleSelectReply?.selectedRowText || msg.message?.buttonsResponseMessage?.selectedButtonId || '';
        const chatId = msg.key.remoteJid;

        console.log('Recibido:', texto, 'de', chatId);

        // Procesar comandos
        if (texto.startsWith(global.prefix)) {
          const command = texto.slice(global.prefix.length).trim().split(' ')[0].toLowerCase();
          const args = texto.slice(global.prefix.length).trim().split(' ').slice(1);

          switch (command) {
            case 'ping':
              await conn.sendMessage(chatId, { text: 'Pong!' });
              break;
            case 'ayuda':
              const helpMessage = `
                Comandos disponibles:
                ${global.prefix}ping - Responde con "Pong!".
                ${global.prefix}info - Muestra información del bot.
                ${global.prefix}ayuda - Muestra este mensaje de ayuda.
              `;
              await conn.sendMessage(chatId, { text: helpMessage });
              break;
            case 'info':
              const infoMessage = `
                Bot de WhatsApp creado con Baileys.
                Desarrollado por [Tu Nombre/Organización].
              `;
              await conn.sendMessage(chatId, { text: infoMessage });
              break;
            default:
              await conn.sendMessage(chatId, { text: `Comando desconocido. Usa ${global.prefix}ayuda para ver la lista de comandos.` });
          }
        } else {
          // Responder a mensajes que no son comandos
          //await conn.sendMessage(chatId, { text: `Recibiste: ${texto}` });
        }
      }
    });
  }
  let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
  if (connection === "close") {
    if ([401, 440, 428, 405].includes(reason)) {
      console.log(chalk.red(`⚠ (${code}) › Sesión cerrada.`))
    }
    console.log(chalk.yellow("⟳ Reconectando Sasuke Bot..."))
    await global.reloadHandler(true).catch(console.error)
  }
}

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
  console.error("⚠ Rechazo no manejado:", reason)
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
        console.error(chalk.red(`❌ Error al recargar ${filename}:`), e)
        delete global.plugins[filename]
      }
    } else {
      console.log(chalk.red(`🗑 Plugin eliminado: ${filename}`))
      delete global.plugins[filename]
    }
  } else {
    console.log(chalk.blue(`➕ Nuevo plugin detectado: ${filename}`))
    try {
      const module = await import(`${dir}?update=${Date.now()}`)
      global.plugins[filename] = module.default || module
      console.log(chalk.green(`✓ Plugin cargado: ${filename}`))
    } catch (e) {
      console.error(chalk.red(`❌ Error al cargar ${filename}:`), e)
    }
  }
}

// Watcher de plugins
for (const folder of pluginFolders) {
  const pluginPath = join(__dirname, folder)
  if (existsSync(pluginPath)) {
    watch(pluginPath, async (eventType, filename) => {
      if (filename) {
        await global.reload(null, filename)
      }
    })
  }
}

// Inicialización final
async function startBot() {
  if (!handler || !handler.handler) {
    console.error(chalk.red('❌ Error: handler no disponible'))
    return
  }

  try {
    conn.ev.off('messages.upsert', conn.handler)
    conn.ev.off('connection.update', conn.connectionUpdate)
    conn.ev.off('creds.update', conn.credsUpdate)
  } catch {}

  conn.handler = handler.handler.bind(global.conn)
  conn.connectionUpdate = connectionUpdate.bind(global.conn)
  conn.credsUpdate = saveCreds.bind(global.conn, true)

  conn.ev.on('messages.upsert', conn.handler)
  conn.ev.on('connection.update', conn.connectionUpdate)
  conn.ev.on('creds.update', conn.credsUpdate)

  console.log(chalk.bold.green('\n🚀 SASUKE BOT INICIADO CORRECTAMENTE\n'))
}

startBot().catch(console.error)

