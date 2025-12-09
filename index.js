process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'

// Importaciones básicas necesarias
import { useMultiFileAuthState, fetchLatestBaileysVersion, makeWASocket } from '@whiskeysockets/baileys'
import readline from 'readline'
import chalk from 'chalk'
import fs from 'fs'

// Configuración básica
const sessions = 'Sessions/Principal'
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise(resolve => rl.question(texto, resolve))

// Función para preguntar número (solo acepta 52 + 9 o 10 dígitos)
async function askPhoneNumber() {
  let phoneNumber
  do {
    phoneNumber = await question(chalk.bgBlack(chalk.bold.red(`[ 🔐 ] Ingrese su número (ej: 524181450063): `)))
    const cleanNumber = phoneNumber.replace(/\D/g, '')
    if (!/^52\d{9,10}$/.test(cleanNumber)) {
      console.log(chalk.bold.red(`❌ Número no válido - debe empezar con 52 y tener 11 o 12 dígitos`))
    } else {
      return cleanNumber
    }
  } while (true)
}

// Función principal
async function startBot() {
  console.log(chalk.red('\n⚡ Iniciando Sasuke Bot...'))

  // Crear carpeta de sesión si no existe
  if (!fs.existsSync(sessions)) fs.mkdirSync(sessions, { recursive: true })

  // Estado de autenticación y versión de Baileys
  const { state, saveCreds } = await useMultiFileAuthState(sessions)
  const { version } = await fetchLatestBaileysVersion()

  // Seleccionar método de inicio
  let opcion
  do {
    opcion = await question(chalk.bold.white("Seleccione una opción:\n1. Con código QR\n2. Con código de 8 dígitos\n━━━> "))
    if (!/^[1-2]$/.test(opcion)) console.log(chalk.bold.red(`❌ Solo números 1 o 2`))
  } while (opcion !== '1' && opcion !== '2')

  // Crear conexión
  const conn = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: opcion === '1',
    browser: ["Sasuke Bot", "Chrome", "1.0.0"],
    logger: { level: 'silent' }
  })

  // Guardar credenciales
  conn.ev.on('creds.update', saveCreds)

  // Proceso con código de 8 dígitos (CONFIGURACIÓN CORRECTA PARA MÉXICO)
  if (opcion === '2' && !conn.authState.creds.registered) {
    const cleanNumber = await askPhoneNumber()
    rl.close()

    // Esperar a que la conexión esté lista
    console.log(chalk.yellow(`[ ⏳ ] Esperando conexión con WhatsApp...`))
    while (conn.ws.readyState !== 1) await new Promise(resolve => setTimeout(resolve, 500))

    try {
      // AGREGAR 1 DESPUÉS DE 52 (FORMATO CORRECTO PARA MÉXICO)
      const normalizedNumber = cleanNumber.startsWith('521') ? cleanNumber : `521${cleanNumber.slice(2)}`
      const pairingCode = await conn.requestPairingCode(normalizedNumber)
      console.log(chalk.bold.green(`\n[ 🔑 ] CÓDIGO DE PAIRED VÁLIDO:`))
      console.log(chalk.bold.white(chalk.bgRed(`  ${pairingCode.match(/.{1,4}/g)?.join("-") || pairingCode}  `)))
      console.log(chalk.cyan(`💡 Ingresa este código en tu WhatsApp (Dispositivos vinculados > Vincular dispositivo)`))
    } catch (e) {
      console.error(chalk.red(`\n⚠ Error al generar código: ${e.message}`))
      console.log(chalk.cyan(`💡 Prueba con la opción 1 (código QR) - es más confiable`))
    }
  }

  // Manejo de conexión exitosa
  conn.ev.on('connection.update', (update) => {
    const { connection } = update
    if (connection === 'open') {
      console.log(chalk.bold.green(`\n✅ Bot conectado exitosamente!`))
      console.log(chalk.cyan(`👤 Número: ${conn.user.id.split(':')[0]}`))
    }
    if (connection === 'close') {
      console.log(chalk.yellow(`\n⟳ Reconectando bot...`))
      startBot()
    }
  })
}

// Iniciar el bot
startBot()
