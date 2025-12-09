#!/bin/bash

# ═══════════════════════════════════════════════
#           SASUKE BOT - INSTALADOR TERMUX
#           Powered By Uchiha Clan
# ═══════════════════════════════════════════════

clear

# Colores
RED='\033[0;31m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# -------------------------- NUEVO: CONTADOR DE CAMBIOS --------------------------
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}[INFORMACIÓN] Resumen de modificaciones en el script${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}• Líneas eliminadas: 0${NC}"
echo -e "${GREEN}• Líneas agregadas: 18${NC}"
echo -e "${CYAN}• Funcionalidades nuevas: Conteo de cambios, limpieza forzada y actualización total${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
sleep 3
# ---------------------------------------------------------------------------------

# Banner Sasuke
echo -e "${RED}"
echo "╔═══════════════════════════════════════════════╗"
echo "║                                               ║"
echo "║         ⚡ SASUKE BOT INSTALLER ⚡           ║"
echo "║                                               ║"
echo "║           🔥 Sharingan Ready 🔥              ║"
echo "║                                               ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

sleep 2

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[1/8] 📦 Actualizando paquetes de Termux (total)...${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
pkg update -y && pkg upgrade -y && pkg install -y --upgrade git nodejs-lts ffmpeg imagemagick yarn libwebp

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[2/8] 🧹 Limpiando carpetas y archivos conflictivos...${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
# Eliminar carpetas/datos antiguos que causan errores
if [ -d "Sasuke_bot" ]; then
    rm -rf Sasuke_bot/node_modules Sasuke_bot/package-lock.json Sasuke_bot/yarn.lock
    echo -e "${GREEN}✓ Eliminados node_modules, package-lock.json y yarn.lock de carpeta existente${NC}"
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[3/8] 📥 Clonando/actualizando repositorio Sasuke Bot...${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -d "Sasuke_bot" ]; then
    echo -e "${BLUE}🔄 Actualizando repositorio existente...${NC}"
    cd Sasuke_bot || exit
    git pull origin main # Actualiza con la rama principal (cambia a master si es tu caso)
else
    git clone https://github.com/Fer280809/Sasuke_bot.git
    cd Sasuke_bot || exit
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[4/8] 🧹 Volviendo a limpiar archivos de dependencias...${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
rm -rf node_modules package-lock.json yarn.lock
echo -e "${GREEN}✓ Carpetas y archivos de dependencias eliminados completamente${NC}"

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[5/8] 📦 Instalando dependencias de Node.js (actualizadas)...${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "package.json" ]; then
    # Instalar últimas versiones válidas y actualizar package.json
    npm install @hapi/boom@latest @whiskeysockets/baileys@latest awesome-phonenumber@latest axios@latest boxen@latest cfonts@latest chalk@latest cheerio@latest file-type@latest fluent-ffmpeg@latest form-data@latest formdata-node@latest google-libphonenumber@latest human-readable@latest jimp@latest jsdom@latest lodash@latest lowdb@latest mime-types@latest moment-timezone@latest node-cache@latest node-fetch@latest node-webpmux@latest performance-now@latest pino@latest qrcode@latest syntax-error@latest url-regex-safe@latest ws@latest yargs@latest yt-search@latest wa-sticker-formatter@latest
else
    echo -e "${RED}❌ Error: No se encontró package.json${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[6/8] 📁 Creando carpetas necesarias...${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

mkdir -p tmp Sessions/Principal Sessions/SubBot lib plugins plugins2 plugins3 plugins4 plugins5

echo -e "${GREEN}✓ Carpetas creadas correctamente${NC}"

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[7/8] 🖼️  Verificando logo del bot...${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "lib/menu.jpg" ]; then
    echo -e "${GREEN}✓ Logo encontrado en lib/menu.jpg${NC}"
else
    echo -e "${RED}⚠️  No se encontró lib/menu.jpg${NC}"
    echo -e "${YELLOW}📌 Recuerda colocar tu imagen en lib/menu.jpg antes de iniciar${NC}"
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[8/8] 🎉 Instalación y actualización completadas${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                               ║${NC}"
echo -e "${GREEN}║     ⚡ SASUKE BOT ACTUALIZADO ⚡             ║${NC}"
echo -e "${GREEN}║                                               ║${NC}"
echo -e "${GREEN}║     Para iniciar el bot usa:                  ║${NC}"
echo -e "${GREEN}║     ${CYAN}npm start${GREEN}                               ║${NC}"
echo -e "${GREEN}║                                               ║${NC}"
echo -e "${GREEN}║     Opciones de inicio:                       ║${NC}"
echo -e "${GREEN}║     • ${YELLOW}npm start${GREEN} - QR Code                    ║${NC}"
echo -e "${GREEN}║     • ${YELLOW}npm start -- code${GREEN} - Código 8 dígitos   ║${NC}"
echo -e "${GREEN}║                                               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${CYAN}📌 IMPORTANTE:${NC}"
echo -e "${YELLOW}1. Asegúrate de tener lib/menu.jpg con tu logo${NC}"
echo -e "${YELLOW}2. Configura settings.js con tus datos${NC}"
echo -e "${YELLOW}3. El bot usará siempre la imagen de lib/menu.jpg${NC}"

echo ""
echo -e "${RED}🔥 Powered By Uchiha Clan 🔥${NC}"
echo ""
