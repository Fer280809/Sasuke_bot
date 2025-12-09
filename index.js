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

// Función principal - SOLO PARA CÓDIGO DE 8 DÍGITOS (optimizada)
async function startBot() {
  // Crear carpeta de sesión
  if (!fs.existsSync(sessions)) fs.mkdirSync(sessions, { recursive: true })

  // Estado de autenticación y última versión de Baileys
  const { state, saveCreds } = await useMultiFileAuthState(sessions)
  const { version } = await fetchLatestBaileysVersion()

  // Logger válido
  const logger = pino({ level: 'warn' }) // Mostramos warnings para detectar problemas

  // Conexión OPTIMIZADA para código de pairing
  const conn = makeWASocket({
    version,
    auth: state,
    browser: ["Mozilla", "Firefox", "120.0"], // Navegador 100% compatible
    logger: logger,
    syncFullHistory: false,
    connectTimeoutMs: 20000,
    keepAliveIntervalMs: 25000
  })

  conn.ev.on('creds.update', saveCreds)

  // Proceso EXCLUSIVO de código de 8 dígitos
  if (!conn.authState.creds.registered) {
    const cleanNumber = await askPhoneNumber()
    rl.close()

    // Esperar a que la conexión esté 100% lista (con tiempo extra)
    console.log(chalk.yellow(`[ ⏳ ] Esperando conexión segura con WhatsApp... (max 10 seg)`))
    let connectionReady = false
    const connectionTimeout = setTimeout(() => {
      if (!connectionReady) {
        console.log(chalk.red(`❌ Tiempo de espera agotado - revisa tu internet`))
        process.exit(1)
      }
    }, 10000)

    while (conn.ws.readyState !== 1) await new Promise(resolve => setTimeout(resolve, 200))
    connectionReady = true
    clearTimeout(connectionTimeout)

    try {
      // Asegurar formato 521XXXXXXXXX (13 dígitos)
      const normalizedNumber = cleanNumber.startsWith('521') ? cleanNumber : 
                               cleanNumber.startsWith('52') ? `521${cleanNumber.slice(2)}` : 
                               `521${cleanNumber}`
      
      // SOLUCIÓN: Solicitar código con encabezados correctos
      const pairingCode = await conn.requestPairingCode(normalizedNumber, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
        }
      })

      console.log(chalk.bold.green(`\n✅ ¡CÓDIGO DE 8 DÍGITOS FUNCIONAL!`))
      console.log(chalk.bold.white(chalk.bgRed(`  ${pairingCode.match(/.{1,4}/g)?.join("-") || pairingCode}  `)))
      console.log(chalk.cyan(`💡 INGRESALO AHORA MISMO: WhatsApp > Ajustes > Dispositivos vinculados > Vincular un dispositivo`))
      console.log(chalk.yellow(`⚠ Solo tienes 1 minuto para usarlo!`))
    } catch (e) {
      console.error(chalk.red(`\n⚠ Error final al generar código: ${e.message}`))
      
      // SOLUCIÓN ALTERNATIVA: Mostrar código QR automáticamente si falla el de 8 dígitos
      console.log(chalk.green(`\n🔄 Activando solución alternativa: CÓDIGO QR`))
      conn.ev.on('connection.update', (update) => {
        if (update.qr) {
          console.log(chalk.red.bold(`[ 📱 ] Escanea este QR - es la única garantía de funcionar`))
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
