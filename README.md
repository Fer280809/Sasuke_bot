# 🔥 SASUKE BOT - WhatsApp Multi Device 🔥

<div align="center">

![Sasuke Bot](https://files.catbox.moe/lajq7h.jpg)

### ⚡ Bot de WhatsApp Multi-Dispositivo con Sharingan ⚡

[![GitHub](https://img.shields.io/badge/GitHub-Fer280809-red?style=for-the-badge&logo=github)](https://github.com/Fer280809/Sasuke_bot)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Channel-blue?style=for-the-badge&logo=whatsapp)](https://whatsapp.com/channel/0029Vb64nWqLo4hb8cuxe23n)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge&logo=node.js)](https://nodejs.org)

</div>

---

## 📋 Características

✅ **Sistema Multi-Plugin** - 5 carpetas de plugins para máxima organización  
✅ **Logo Centralizado** - Siempre usa `lib/menu.jpg` automáticamente  
✅ **SubBots** - Soporte para bots secundarios  
✅ **Anti-Crash** - Sistema robusto de manejo de errores  
✅ **Auto-Recarga** - Los plugins se recargan automáticamente  
✅ **Base de Datos** - Sistema optimizado con LowDB  
✅ **Limpieza Automática** - Elimina archivos temporales cada 10 minutos  

---

## 🚀 Instalación en Termux

### Método Rápido (Recomendado)

```bash
bash <(curl -s https://raw.githubusercontent.com/Fer280809/Sasuke_bot/main/termux.sh)
```

### Método Manual

```bash
# 1. Actualizar Termux
pkg update && pkg upgrade -y

# 2. Instalar dependencias
pkg install -y git nodejs-lts ffmpeg imagemagick yarn libwebp

# 3. Clonar repositorio
git clone https://github.com/Fer280809/Sasuke_bot.git
cd Sasuke_bot

# 4. Instalar dependencias de Node
npm install

# 5. Iniciar bot
npm start
```

---

## 💻 Instalación en Windows/Linux/Mac

```bash
# 1. Instalar Node.js 20+ desde https://nodejs.org

# 2. Clonar repositorio
git clone https://github.com/Fer280809/Sasuke_bot.git
cd Sasuke_bot

# 3. Instalar dependencias
npm install

# 4. Iniciar bot
npm start
```

---

## 📱 Formas de Conexión

### Opción 1: Código QR (Predeterminado)
```bash
npm start
```
Escanea el QR con WhatsApp > Dispositivos Vinculados

### Opción 2: Código de 8 Dígitos
```bash
npm start -- code
```
Ingresa tu número y usa el código de 8 dígitos

---

## 🖼️ **IMPORTANTE: Logo del Bot**

### El bot SIEMPRE usa la imagen en `lib/menu.jpg`

**Para cambiar el logo:**

1. Coloca tu imagen en la carpeta `lib/`
2. Renómbrala como `menu.jpg`
3. El bot la usará automáticamente en todos los comandos

```
Sasuke_bot/
├── lib/
│   └── menu.jpg  ← 🔥 TU LOGO AQUÍ 🔥
```

**Recomendaciones:**
- Formato: JPG o PNG
- Tamaño: 500x500px o similar
- Peso: Menos de 1MB para mejor rendimiento

---

## 📁 Estructura de Carpetas

```
Sasuke_bot/
├── index.js              # Archivo principal
├── handler.js            # Manejador de mensajes
├── settings.js           # Configuración global
├── package.json          # Dependencias
├── termux.sh            # Instalador Termux
├── lib/                 # Librerías y archivos
│   ├── menu.jpg         # 🔥 LOGO DEL BOT
│   ├── simple.js
│   ├── store.js
│   └── print.js
├── plugins/             # Plugins principales
├── plugins2/            # Plugins secundarios
├── plugins3/            # Plugins terciarios
├── plugins4/            # Plugins cuaternarios
├── plugins5/            # Plugins quinarios
├── Sessions/
│   ├── Principal/       # Sesión del bot principal
│   └── SubBot/          # Sesiones de subbots
└── tmp/                 # Archivos temporales
```

---

## ⚙️ Configuración (settings.js)

Edita `settings.js` para personalizar tu bot:

```javascript
// Números de dueños
global.owner = ["5214181450063", "TU_NUMERO"]

// Información del bot
global.botname = "SASUKE BOT"
global.textbot = "SASUKE BOT • Powered By Uchiha Clan"

// Logo (automático desde lib/menu.jpg)
global.logo = fs.readFileSync('./lib/menu.jpg')

// Enlaces
global.group = "LINK_TU_GRUPO"
global.channel = "LINK_TU_CANAL"
```

---

## 🔧 Comandos de Sistema

| Comando | Descripción |
|---------|------------|
| `npm start` | Iniciar bot con QR |
| `npm start -- code` | Iniciar con código |
| `npm start -- qr` | Forzar QR |
| `node index.js` | Inicio directo |

---

## 📦 Sistema de Plugins

### Organización en 5 Carpetas

El bot carga plugins desde **5 carpetas** diferentes para mejor organización:

1. **plugins/** - Comandos principales
2. **plugins2/** - Comandos de entretenimiento
3. **plugins3/** - Comandos de utilidad
4. **plugins4/** - Comandos de grupos
5. **plugins5/** - Comandos personalizados

### Crear un Plugin

```javascript
// plugins/ejemplo.js
let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Tu código aquí
  await m.reply(`Hola! Soy Sasuke Bot 🔥`)
}

handler.command = ['ejemplo', 'test']
handler.tags = ['info']
handler.help = ['ejemplo']

export default handler
```

El plugin se cargará automáticamente.

---

## 🛡️ Solución de Problemas

### Error: "Cannot find module"
```bash
npm install
```

### Error: "lib/menu.jpg not found"
```bash
# Coloca tu imagen en la carpeta lib con el nombre menu.jpg
```

### Bot no responde
1. Verifica que el bot sea administrador (si está en grupo)
2. Revisa que el número esté en `global.owner`
3. Usa `#ping` para verificar conexión

### Reinstalar dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Características Técnicas

- **Librería:** @whiskeysockets/baileys
- **Base de Datos:** LowDB (JSON)
- **Node.js:** v20.0.0 o superior
- **Sistema:** Multi-Device compatible
- **Arquitectura:** Modular con 5 carpetas de plugins

---

## 🤝 Contribuir

¿Quieres mejorar Sasuke Bot?

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcion`)
3. Commit tus cambios (`git commit -am 'Agregar nueva función'`)
4. Push a la rama (`git push origin feature/nueva-funcion`)
5. Crea un Pull Request

---

## 📞 Soporte

- **Canal:** [WhatsApp Channel](https://whatsapp.com/channel/0029Vb64nWqLo4hb8cuxe23n)
- **Grupo:** [Grupo de Soporte](https://chat.whatsapp.com/BfCKeP10yZZ9ancsGy1Eh9)
- **GitHub:** [Issues](https://github.com/Fer280809/Sasuke_bot/issues)
- **Email:** fer2809fl@gmail.com

---

## 📜 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Créditos

- **Desarrollador:** Fernando
- **Librería:** @whiskeysockets/baileys
- **Comunidad:** Uchiha Clan

---

<div align="center">

### 🔥 Powered By Uchiha Clan 🔥

**Sasuke Bot** - El bot más poderoso con el Sharingan activado

[![GitHub Stars](https://img.shields.io/github/stars/Fer280809/Sasuke_bot?style=social)](https://github.com/Fer280809/Sasuke_bot)
[![GitHub Forks](https://img.shields.io/github/forks/Fer280809/Sasuke_bot?style=social)](https://github.com/Fer280809/Sasuke_bot/fork)

---

**¿Te gusta el proyecto? ¡Dale una ⭐ en GitHub!**

</div>