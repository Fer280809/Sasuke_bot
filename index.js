process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'

// Importaciones BÁSICAS Y ÚLTIMAS
import cfonts from 'cfonts'
import chalk from 'chalk'
import readline from 'readline'
import fs from 'fs'
import { useMultiFileAuthState, fetchLatestBaileysVersion, makeWASocket } from '@whiskeysockets/baileys'
import pino from 'pino'

// Configuración mínima
const sessions = 'Sessions/Principal'
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise(resolve => rl.question(texto, resolve))

// Validación para 13 dígitos (521XXXXXXXXX)
function isValidPhoneNumber(phoneNumber) {
  const cleanNumber = phoneNumber.replace(/\D/g, '')
  return /^\d{10,13}$/.test(cleanNumber)
}

// MENSAJE GRANDE DE COLORES
let { say } = cfonts
console.log(chalk.red('\n⚡ Iniciando Sistema...'))
say('SASUKE BOT', { font: 'block', align: 'center', gradient: ['red', 'blue'] })
say('Sistema Multi-Plugins Activado', { font: 'console', align: 'center', colors: ['cyan'] })
say('Sharingan Ready', { font: 'tiny', align: 'center', colors: ['red', 'white'] })

// Función principal - CON REINTENTOS DE CONEXIÓN
async function startBot() {
  // Crear carpeta de sesión
  if (!fs.existsSync(sessions)) fs.mkdirSync(sessions, { recursive: true })

  // Estado de autenticación y última versión de Baileys
  const { state, saveCreds } = await useMultiFileAuthState(sessions)
  const { version } = await fetchLatestBaileysVersion()

  // Logger válido
  const logger = pino({ level: 'warn' })

  // Conexión OPTIMIZADA PARA TERMUX
  const conn = makeWASocket({
    version,
    auth: state,
    browser: ["Mozilla", "Firefox", "120.0"],
    logger: logger,
    syncFullHistory: false,
    connectTimeoutMs: 30000, // Tiempo de espera mayor
    keepAliveIntervalMs: 25000,
    proxy: undefined, // Quitar proxy que pueda interferir
    qrTimeoutMs: 0 // QR sin tiempo de expiración
  })

  conn.ev.on('creds.update', saveCreds)

  // Proceso EXCLUSIVO de código de 8 dígitos o QR
  if (!conn.authState.creds.registered) {
    const cleanNumber = await askPhoneNumber()
    rl.close()

    // SOLUCIÓN: Esperar conexión con REINTENTOS (hasta 3 veces)
    console.log(chalk.yellow(`[ ⏳ ] Esperando conexión segura con WhatsApp... (hasta 3 reintentos)`))
    let connectionReady = false
    let reintentos = 0
    const maxReintentos = 3

    while (!connectionReady && reintentos < maxReintentos) {
      try {
        // Esperar a que la conexión esté lista (30 seg por intento)
        const timeout = setTimeout(() => {
          throw new Error('Tiempo de espera agotado en este intento')
        }, 30000)

        while (conn.ws.readyState !== 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }

        clearTimeout(timeout)
        connectionReady = true
        console.log(chalk.green(`✅ Conexión establecida en intento ${reintentos + 1}`))
      } catch (e) {
        reintentos++
        console.log(chalk.orange(`⚠ Intento ${reintentos} fallido - reintentando...`))
        // Reiniciar la conexión en cada intento
        conn.ws.close()
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    if (!connectionReady) {
      console.log(chalk.red(`❌ No se pudo establecer conexión - pero activamos el QR de todos modos!`))
      conn.ev.on('connection.update', (update) => {
        if (update.qr) {
          console.log(chalk.red.bold(`[ 📱 ] Escanea este QR - funciona sin importar el internet de Termux`))
        }
        if (update.connection === 'open') {
          console.log(chalk.bold.green(`\n✅ Bot conectado exitosamente!`))
        }
      })
      return
    }

    // Generar código de 8 dígitos si la conexión está lista
    try {
      const normalizedNumber = cleanNumber.startsWith('521') ? cleanNumber : 
                               cleanNumber.startsWith('52') ? `521${cleanNumber.slice(2)}` : 
                               `521${cleanNumber}`
      
      const pairingCode = await conn.requestPairingCode(normalizedNumber, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
        }
      })

      console.log(chalk.bold.green(`\n✅ ¡CÓDIGO DE 8 DÍGITOS FUNCIONAL!`))
      console.log(chalk.bold.white(chalk.bgRed(`  ${pairingCode.match(/.{1,4}/g)?.join("-") || pairingCode}  `)))
      console.log(chalk.cyan(`💡 INGRESALO AHORA: WhatsApp > Ajustes > Dispositivos vinculados`))
    } catch (e) {
      console.error(chalk.red(`\n⚠ Error al generar código - activando QR`))
      conn.ev.on('connection.update', (update) => {
        if (update.qr) {
          console.log(chalk.red.bold(`[ 📱 ] Escanea este QR - es la solución segura`))
        }
        if (update.connection === 'open') {
          console.log(chalk.bold.green(`\n✅ Bot conectado exitosamente!`))
        }
      })
    }
  }

  // Manejo de conexión exitosa
  conn.ev.on('connection.update', (update) => {
    if (update.connection === 'open') {
      console.log(chalk.bold.green(`\n✅ Bot conectado con tu número: ${conn.user.id.split(':')[0]}`))
    }
  })
}

// Función para preguntar número
async function askPhoneNumber() {
  let phoneNumber
  do {
    phoneNumber = await question(chalk.bgBlack(chalk.bold.red(`[ 🔐 ] Ingrese su número (ej: 5214181450063): `)))
    const cleanNumber = phoneNumber.replace(/\D/g, '')
    if (!isValidPhoneNumber(cleanNumber)) {
      console.log(chalk.bold.red(`❌ Número no válido - debe tener entre 10 y 13 dígitos`))
    } else {
      return cleanNumber
    }
  } while (true)
}

// Iniciar el bot
startBot()
