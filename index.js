process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0' // Soluciona problemas de certificados en Termux

// Importaciones MÍNIMAS Y FUNCIONALES
import cfonts from 'cfonts'
import chalk from 'chalk'
import readline from 'readline'
import fs from 'fs'
import { useMultiFileAuthState, fetchLatestBaileysVersion, makeWASocket } from '@whiskeysockets/baileys'

// Configuración SUPER SIMPLE
const sessions = 'Sessions/Principal'
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise(resolve => rl.question(texto, resolve))

// Validación para 13 dígitos
function isValidPhoneNumber(phoneNumber) {
  const cleanNumber = phoneNumber.replace(/\D/g, '')
  return /^\d{10,13}$/.test(cleanNumber)
}

// MENSAJE GRANDE DE COLORES (sin cambios)
let { say } = cfonts
console.log(chalk.red('\n⚡ Iniciando Sistema...'))
say('SASUKE BOT', { font: 'block', align: 'center', gradient: ['red', 'blue'] })
say('Sistema Multi-Plugins Activado', { font: 'console', align: 'center', colors: ['cyan'] })
say('Sharingan Ready', { font: 'tiny', align: 'center', colors: ['red', 'white'] })

// Función principal - QR PRIORITARIO
async function startBot() {
  // Crear carpeta de sesión
  if (!fs.existsSync(sessions)) fs.mkdirSync(sessions, { recursive: true })

  // Última versión de Baileys y estado de autenticación
  const { state, saveCreds } = await useMultiFileAuthState(sessions)
  const { version } = await fetchLatestBaileysVersion()

  // Conexión BÁSICA Y COMPATIBLE CON TERMUX
  const conn = makeWASocket({
    version,
    auth: state,
    browser: ["Chrome", "Windows", "125.0.0.0"],
    printQRInTerminal: true, // Mostrar QR directamente en Termux
    syncFullHistory: false,
    connectTimeoutMs: 40000,
    keepAliveIntervalMs: 30000
  })

  conn.ev.on('creds.update', saveCreds)

  // Si no está registrado: preguntar número y probar código de 8 dígitos (pero QR primero)
  if (!conn.authState.creds.registered) {
    const cleanNumber = await askPhoneNumber()
    rl.close()

    console.log(chalk.yellow(`[ ⏳ ] Probando código de 8 dígitos... si falla, escanea el QR que aparecerá`))

    try {
      // Formato 521XXXXXXXXX
      const normalizedNumber = cleanNumber.startsWith('521') ? cleanNumber : 
                               cleanNumber.startsWith('52') ? `521${cleanNumber.slice(2)}` : 
                               `521${cleanNumber}`
      
      const pairingCode = await conn.requestPairingCode(normalizedNumber)
      console.log(chalk.bold.green(`\n✅ ¡CÓDIGO DE 8 DÍGITOS FUNCIONAL!`))
      console.log(chalk.bold.white(chalk.bgRed(`  ${pairingCode.match(/.{1,4}/g)?.join("-") || pairingCode}  `)))
      console.log(chalk.cyan(`💡 INGRESALO AHORA: WhatsApp > Ajustes > Dispositivos vinculados`))
    } catch (e) {
      console.error(chalk.red(`\n⚠ No se pudo generar código de 8 dígitos - ESCANA EL QR ABAJO`))
    }
  }

  // Manejo de conexión exitosa
  conn.ev.on('connection.update', (update) => {
    if (update.connection === 'open') {
      console.log(chalk.bold.green(`\n✅ ¡BOT CONECTADO EXITOSAMENTE! 🎉`))
      console.log(chalk.cyan(`👤 Número: ${conn.user.id.split(':')[0]}`))
    }
    if (update.connection === 'close') {
      console.log(chalk.yellow(`\n⟳ Reconectando... escanea el nuevo QR si aparece`))
      startBot()
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
      console.log(chalk.bold.red(`❌ Número no válido - entre 10 y 13 dígitos`))
    } else {
      return cleanNumber
    }
  } while (true)
}

// Iniciar el bot
startBot()
