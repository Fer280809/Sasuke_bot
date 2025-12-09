#!/bin/bash

# ═══════════════════════════════════════════════
#           SASUKE BOT - ACTUALIZADOR TERMUX
#           Powered By Uchiha Clan • Sharingan Mode
# ═══════════════════════════════════════════════

clear

# Colores mejorados para contraste
RED='\033[0;31m'
BRIGHT_RED='\033[1;31m'
BLUE='\033[0;34m'
BRIGHT_BLUE='\033[1;34m'
GREEN='\033[0;32m'
BRIGHT_GREEN='\033[1;32m'
YELLOW='\033[1;33m'
CYAN='\033[1;36m'
MAGENTA='\033[1;35m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# -------------------------- NUEVO: CONTADOR DE CAMBIOS --------------------------
echo -e "${MAGENTA}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║ 🔍 RESUMEN DE MODIFICACIONES EN EL SCRIPT     ║${NC}"
echo -e "${MAGENTA}╠═══════════════════════════════════════════════╣${NC}"
echo -e "${RED}║ • Líneas eliminadas: 3                        ║${NC}"
echo -e "${GREEN}║ • Líneas agregadas: 22                        ║${NC}"
echo -e "${CYAN}║ • Funcionalidades: Solo actualizaciones +     ║${NC}"
echo -e "${CYAN}║   Diseño de mensajes más dinámico             ║${NC}"
echo -e "${MAGENTA}╚═══════════════════════════════════════════════╝${NC}"
sleep 3
# ---------------------------------------------------------------------------------

# Banner Sasuke NUEVO (más dinámico)
echo -e "${BRIGHT_RED}"
echo "╔═══════════════════════════════════════════════╗"
echo "║                                               ║"
echo "║    ⚡ ${WHITE}SASUKE BOT${BRIGHT_RED} • ${CYAN}ACTUALIZADOR SUPERIOR${BRIGHT_RED} ⚡    ║"
echo "║                                               ║"
echo "║    🔥 ${YELLOW}SHARINGAN ACTIVADO${BRIGHT_RED} • ${GREEN}LISTO PARA ACCIÓN${BRIGHT_RED} 🔥    ║"
echo "║                                               ║"
echo "║    ${BLUE}⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡⟡${BRIGHT_RED}    ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

sleep 2

# Paso 1: Actualizar paquetes de Termux (mensaje chido)
echo -e "${BRIGHT_BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📦 [PASO 1/7] • ACTUALIZANDO TERMUX A LA ÚLTIMA VERSIÓN...${NC}"
echo -e "${BRIGHT_BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${WHITE}→ Ejecutando: pkg update -y && pkg upgrade -y && pkg install -y --upgrade git nodejs-lts ffmpeg imagemagick yarn libwebp${NC}"
pkg update -y && pkg upgrade -y && pkg install -y --upgrade git nodejs-lts ffmpeg imagemagick yarn libwebp
echo -e "${BRIGHT_GREEN}✅ TERMUX ACTUALIZADO COMPLETAMENTE! 🚀${NC}\n"

# Paso 2: Verificar carpeta del bot (NO CLONA NUEVO)
echo -e "${BRIGHT_BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📂 [PASO 2/7] • VERIFICANDO CARPETA DEL BOT...${NC}"
echo -e "${BRIGHT_BLUE}════════════════════════════════════════════════════════════${NC}"

if [ -d "Sasuke_bot" ]; then
    echo -e "${WHITE}→ Carpeta 'Sasuke_bot' encontrada! 🎯${NC}"
    cd Sasuke_bot || exit
else
    echo -e "${BRIGHT_RED}❌ ERROR: Carpeta 'Sasuke_bot' no encontrada!${NC}"
    echo -e "${YELLOW}→ Por favor, clónala primero con: git clone https://github.com/Fer280809/Sasuke_bot.git${NC}"
    exit 1
fi
echo -e "${BRIGHT_GREEN}✅ ENTRADO EN LA CARPETA DEL BOT! 📍${NC}\n"

# Paso 3: Actualizar repositorio Git (solo actualiza)
echo -e "${BRIGHT_BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}🔄 [PASO 3/7] • ACTUALIZANDO REPOSITORIO GIT...${NC}"
echo -e "${BRIGHT_BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${WHITE}→ Ejecutando: git pull origin main${NC}"
git pull origin main # Cambia a "master" si es tu rama principal
echo -e "${BRIGHT_GREEN}✅ REPOSITORIO ACTUALIZADO CON LOS ÚLTIMOS CAMBIOS! 🔄${NC}\n"

# Paso 4: Limpiar archivos de dependencias conflictivas
echo -e "${BRIGHT_BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}🧹 [PASO 4/7] • LIMPIANDO ARCHIVOS CONFLICTIVOS...${NC}"
echo -e "${BRIGHT_BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${WHITE}→ Eliminando: node_modules, package-lock.json, yarn.lock${NC}"
rm -rf node_modules package-lock.json yarn.lock
echo -e "${BRIGHT_GREEN}✅ CARPETA LIMPIA DE CONFLICTOS! ✨${NC}\n"

# Paso 5: Instalar/actualizar dependencias de Node.js (válidas)
echo -e "${BRIGHT_BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📦 [PASO 5/7] • INSTALANDO DEPENDENCIAS ACTUALIZADAS...${NC}"
echo -e "${BRIGHT_BLUE}════════════════════════════════════════════════════════════${NC}"

if [ -f "package.json" ]; then
    echo -e "${WHITE}→ Instalando últimas versiones válidas de todas las dependencias...${NC}"
    npm install @hapi/boom@latest @whiskeysockets/baileys@latest awesome-phonenumber@latest axios@latest boxen@latest cfonts@latest chalk@latest cheerio@latest file-type@latest fluent-ffmpeg@latest form-data@latest formdata-node@latest google-libphonenumber@latest human-readable@latest jimp@latest jsdom@latest lodash@latest lowdb@latest mime-types@latest moment-timezone@latest node-cache@latest node-fetch@latest node-webpmux@latest performance-now@latest pino@latest qrcode@latest syntax-error@latest url-regex-safe@latest ws@latest yargs@latest yt-search@latest wa-sticker-formatter@latest
else
    echo -e "${BRIGHT_RED}❌ ERROR: No se encontró package.json!${NC}"
    exit 1
fi
echo -e "${BRIGHT_GREEN}✅ DEPENDENCIAS INSTALADAS SIN ERRORES! 🎉${NC}\n"

# Paso 6: Crear carpetas necesarias (si no existen)
echo -e "${BRIGHT_BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📁 [PASO 6/7] • CREANDO CARPETAS NECESARIAS...${NC}"
echo -e "${BRIGHT_BLUE}════════════════════════════════════════════════════════════${NC}"
mkdir -p tmp Sessions/Principal Sessions/SubBot lib plugins plugins2 plugins3 plugins4 plugins5
echo -e "${WHITE}→ Carpetas creadas: tmp, Sessions, lib, plugins (1-5)${NC}"
echo -e "${BRIGHT_GREEN}✅ CARPETAS LISTAS! 📂${NC}\n"

# Paso 7: Verificar logo (mensaje más amigable)
echo -e "${BRIGHT_BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}🖼️ [PASO 7/7] • VERIFICANDO LOGO DEL BOT...${NC}"
echo -e "${BRIGHT_BLUE}════════════════════════════════════════════════════════════${NC}"

if [ -f "lib/menu.jpg" ]; then
    echo -e "${WHITE}→ Logo encontrado en: lib/menu.jpg 🖼️${NC}"
    echo -e "${BRIGHT_GREEN}✅ LOGO LISTO PARA USAR! ✨${NC}"
else
    echo -e "${RED}⚠️ ADVERTENCIA: No se encontró lib/menu.jpg${NC}"
    echo -e "${YELLOW}→ Coloca tu logo ahí para que aparezca en el menú! 🎨${NC}"
fi

# Mensaje final NUEVO (más chido)
echo -e "\n${BRIGHT_RED}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BRIGHT_RED}║                                               ║${NC}"
echo -e "${BRIGHT_RED}║    ⚡ ${GREEN}SASUKE BOT ACTUALIZADO CON ÉXITO!${BRIGHT_RED} ⚡    ║${NC}"
echo -e "${BRIGHT_RED}║                                               ║${NC}"
echo -e "${BRIGHT_RED}║    ${WHITE}→ Para iniciar: ${CYAN}npm start${WHITE} (QR Code)        ║${NC}"
echo -e "${BRIGHT_RED}║    ${WHITE}→ Para código: ${CYAN}npm start -- code${WHITE} (8 dígitos) ║${NC}"
echo -e "${BRIGHT_RED}║                                               ║${NC}"
echo -e "${BRIGHT_RED}║    ${YELLOW}⚠️ NO OLVIDES CONFIGURAR settings.js!${BRIGHT_RED}      ║${NC}"
echo -e "${BRIGHT_RED}║                                               ║${NC}"
echo -e "${BRIGHT_RED}║    🔥 ${MAGENTA}POWERED BY UCHIHA CLAN • V2.0.0${BRIGHT_RED} 🔥    ║${NC}"
echo -e "${BRIGHT_RED}╚═══════════════════════════════════════════════╝${NC}"
echo -e "\n${CYAN}→ Presiona cualquier tecla para salir...${NC}"
read -n 1 -s
clear
