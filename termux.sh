#!/bin/bash

# ═══════════════════════════════════════════════
#           SASUKE BOT • ACTUALIZADOR V3
#           • Modo: Sharingan Máximo •
# ═══════════════════════════════════════════════

clear

# Colores modernos y vibrantes
BLACK='\033[0;30m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'
BRIGHT_RED='\033[1;31m'
BRIGHT_GREEN='\033[1;32m'
BRIGHT_YELLOW='\033[1;33m'
BRIGHT_BLUE='\033[1;34m'
BRIGHT_MAGENTA='\033[1;35m'
BRIGHT_CYAN='\033[1;36m'
BRIGHT_WHITE='\033[1;37m'
BG_BLACK='\033[40m'
BG_BRIGHT_BLUE='\033[44;1m'
NC='\033[0m' # No Color

# Función de "indicador de carga" (efecto chido)
loading() {
    local msg="$1"
    local delay=0.1
    local spinner='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    echo -n -e "${BRIGHT_CYAN}[${NC} ${BRIGHT_YELLOW}⟳${NC} ${BRIGHT_CYAN}] ${NC}${msg}... "
    while true; do
        for ((i=0; i<${#spinner}; i++)); do
            echo -n -e "\b${spinner:$i:1}"
            sleep $delay
        done
    done
}

# -------------------------- BANNER NUEVO (MODERNO) --------------------------
echo -e "${BG_BRIGHT_BLUE}${BRIGHT_WHITE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BG_BRIGHT_BLUE}${BRIGHT_WHITE}║                                               ║${NC}"
echo -e "${BG_BRIGHT_BLUE}${BRIGHT_WHITE}║    ${BRIGHT_RED}⚡ SASUKE BOT • ACTUALIZADOR V3 ${BRIGHT_WHITE}⚡    ║${NC}"
echo -e "${BG_BRIGHT_BLUE}${BRIGHT_WHITE}║                                               ║${NC}"
echo -e "${BG_BRIGHT_BLUE}${BRIGHT_WHITE}║    ${BRIGHT_YELLOW}🔥 MODO: SHARINGAN MÁXIMO ACTIVADO 🔥${BRIGHT_WHITE}    ║${NC}"
echo -e "${BG_BRIGHT_BLUE}${BRIGHT_WHITE}║                                               ║${NC}"
echo -e "${BG_BRIGHT_BLUE}${BRIGHT_WHITE}║    ${BRIGHT_CYAN}⦿⦿⦿⦿⦿⦿⦿⦿⦿⦿⦿⦿⦿⦿⦿⦿⦿⦿⦿⦿⦿⦿⦿⦿⦿⦿⦿⦿⦿${BRIGHT_WHITE}    ║${NC}"
echo -e "${BG_BRIGHT_BLUE}${BRIGHT_WHITE}╚═══════════════════════════════════════════════╝${NC}"
echo -e "\n"

# Paso 1: Verificar carpeta del bot (sin preguntas)
echo -e "${BRIGHT_MAGENTA}────────────────────────────────────────────────────────────${NC}"
echo -e "${BRIGHT_WHITE}• PASO 1: VERIFICANDO CARPETA DEL BOT •${NC}"
echo -e "${BRIGHT_MAGENTA}────────────────────────────────────────────────────────────${NC}"

if [ -d "$HOME/Sasuke_bot" ]; then
    cd "$HOME/Sasuke_bot" || { echo -e "${BRIGHT_RED}[✗] No se pudo entrar a la carpeta${NC}"; exit 1; }
    echo -e "${BRIGHT_GREEN}[✓] Carpeta 'Sasuke_bot' detectada y accesible${NC}"
else
    echo -e "${BRIGHT_RED}[✗] ERROR: Carpeta 'Sasuke_bot' no existe!${NC}"
    echo -e "${BRIGHT_YELLOW}[ℹ] Clónala primero con: git clone https://github.com/Fer280809/Sasuke_bot.git${NC}"
    exit 1
fi
echo -e "\n"

# Paso 2: Actualizar paquetes de Termux (con loading)
echo -e "${BRIGHT_MAGENTA}────────────────────────────────────────────────────────────${NC}"
echo -e "${BRIGHT_WHITE}• PASO 2: ACTUALIZANDO TERMUX •${NC}"
echo -e "${BRIGHT_MAGENTA}────────────────────────────────────────────────────────────${NC}"

loading "${BRIGHT_YELLOW}Preparando actualización de paquetes" &
LOAD_PID=$!
pkg update -y && pkg upgrade -y && pkg install -y --upgrade git nodejs-lts ffmpeg imagemagick yarn libwebp > /dev/null 2>&1
kill $LOAD_PID
echo -e "\b${BRIGHT_GREEN}[✓] Termux actualizado a la última versión${NC}"
echo -e "\n"

# Paso 3: Actualizar código del repositorio Git (sin preguntas)
echo -e "${BRIGHT_MAGENTA}────────────────────────────────────────────────────────────${NC}"
echo -e "${BRIGHT_WHITE}• PASO 3: ACTUALIZANDO CÓDIGO DEL BOT •${NC}"
echo -e "${BRIGHT_MAGENTA}────────────────────────────────────────────────────────────${NC}"

loading "${BRIGHT_YELLOW}Sincronizando con GitHub" &
LOAD_PID=$!
git pull origin main > /dev/null 2>&1 # Solo actualiza, no pregunta
kill $LOAD_PID
echo -e "\b${BRIGHT_GREEN}[✓] Código del bot actualizado con los últimos cambios${NC}"
echo -e "\n"

# Paso 4: Limpiar archivos conflictivos (con loading)
echo -e "${BRIGHT_MAGENTA}────────────────────────────────────────────────────────────${NC}"
echo -e "${BRIGHT_WHITE}• PASO 4: LIMPIANDO ARCHIVOS CONFLICTIVOS •${NC}"
echo -e "${BRIGHT_MAGENTA}────────────────────────────────────────────────────────────${NC}"

loading "${BRIGHT_YELLOW}Eliminando dependencias antiguas" &
LOAD_PID=$!
rm -rf node_modules package-lock.json yarn.lock > /dev/null 2>&1
kill $LOAD_PID
echo -e "\b${BRIGHT_GREEN}[✓] Carpeta limpia de conflictos${NC}"
echo -e "\n"

# Paso 5: Instalar/actualizar dependencias de Node.js (con loading)
echo -e "${BRIGHT_MAGENTA}────────────────────────────────────────────────────────────${NC}"
echo -e "${BRIGHT_WHITE}• PASO 5: INSTALANDO DEPENDENCIAS •${NC}"
echo -e "${BRIGHT_MAGENTA}────────────────────────────────────────────────────────────${NC}"

loading "${BRIGHT_YELLOW}Instalando paquetes actualizados" &
LOAD_PID=$!
npm install @hapi/boom@latest @whiskeysockets/baileys@latest awesome-phonenumber@latest axios@latest boxen@latest cfonts@latest chalk@latest cheerio@latest file-type@latest fluent-ffmpeg@latest form-data@latest formdata-node@latest google-libphonenumber@latest human-readable@latest jimp@latest jsdom@latest lodash@latest lowdb@latest mime-types@latest moment-timezone@latest node-cache@latest node-fetch@latest node-webpmux@latest performance-now@latest pino@latest qrcode@latest syntax-error@latest url-regex-safe@latest ws@latest yargs@latest yt-search@latest wa-sticker-formatter@latest > /dev/null 2>&1
kill $LOAD_PID
echo -e "\b${BRIGHT_GREEN}[✓] Todas las dependencias instaladas correctamente${NC}"
echo -e "\n"

# Paso 6: Crear carpetas necesarias (si no existen)
echo -e "${BRIGHT_MAGENTA}────────────────────────────────────────────────────────────${NC}"
echo -e "${BRIGHT_WHITE}• PASO 6: PREPARANDO CARPETAS NECESARIAS •${NC}"
echo -e "${BRIGHT_MAGENTA}────────────────────────────────────────────────────────────${NC}"

mkdir -p tmp Sessions/Principal Sessions/SubBot lib plugins plugins2 plugins3 plugins4 plugins5
echo -e "${BRIGHT_GREEN}[✓] Carpetas de trabajo creadas/verificadas${NC}"
echo -e "\n"

# Paso 7: Verificar archivos clave
echo -e "${BRIGHT_MAGENTA}────────────────────────────────────────────────────────────${NC}"
echo -e "${BRIGHT_WHITE}• PASO 7: VERIFICANDO ARCHIVOS CLAVE •${NC}"
echo -e "${BRIGHT_MAGENTA}────────────────────────────────────────────────────────────${NC}"

[ -f "lib/menu.jpg" ] && echo -e "${BRIGHT_GREEN}[✓] Logo 'menu.jpg' encontrado${NC}" || echo -e "${BRIGHT_YELLOW}[ℹ] Logo 'menu.jpg' no encontrado (colócalo en lib/ para el menú)${NC}"
[ -f "settings.js" ] && echo -e "${BRIGHT_GREEN}[✓] Archivo 'settings.js' encontrado${NC}" || echo -e "${BRIGHT_YELLOW}[ℹ] Archivo 'settings.js' no encontrado (configúralo antes de iniciar)${NC}"
echo -e "\n"

# -------------------------- MENSAJE FINAL NUEVO --------------------------
echo -e "${BG_BLACK}${BRIGHT_RED}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BG_BLACK}${BRIGHT_RED}║                                               ║${NC}"
echo -e "${BG_BLACK}${BRIGHT_RED}║    ${BRIGHT_GREEN}✅ ACTUALIZACIÓN COMPLETADA CON ÉXITO!${BRIGHT_RED}    ║${NC}"
echo -e "${BG_BLACK}${BRIGHT_RED}║                                               ║${NC}"
echo -e "${BG_BLACK}${BRIGHT_RED}║    ${BRIGHT_WHITE}→ INICIAR BOT: ${BRIGHT_CYAN}npm start${BRIGHT_WHITE} (QR)      ║${NC}"
echo -e "${BG_BLACK}${BRIGHT_RED}║    ${BRIGHT_WHITE}→ CÓDIGO DE ACCESO: ${BRIGHT_CYAN}npm start -- code${BRIGHT_WHITE}  ║${NC}"
echo -e "${BG_BLACK}${BRIGHT_RED}║                                               ║${NC}"
echo -e "${BG_BLACK}${BRIGHT_RED}║    ${BRIGHT_YELLOW}⚠️ NO OLVIDES CONFIGURAR settings.js!${BRIGHT_RED}      ║${NC}"
echo -e "${BG_BLACK}${BRIGHT_RED}║                                               ║${NC}"
echo -e "${BG_BLACK}${BRIGHT_RED}║    ${BRIGHT_MAGENTA}🔥 UCHIHA CLAN • V2.0.0 ACTUALIZADO 🔥${BRIGHT_RED}    ║${NC}"
echo -e "${BG_BLACK}${BRIGHT_RED}╚═══════════════════════════════════════════════╝${NC}"
echo -e "\n"

# Efecto de cierre
echo -e "${BRIGHT_CYAN}[ℹ] Presiona cualquier tecla para salir...${NC}"
read -n 1 -s
clear
echo -e "${BRIGHT_RED}⚡ SASUKE BOT • LISTO PARA LUCHAR! ⚡${NC}"
sleep 1
clear
