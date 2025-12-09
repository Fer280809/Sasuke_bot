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
echo -e "${YELLOW}[1/7] 📦 Actualizando paquetes de Termux...${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
pkg update -y && pkg upgrade -y

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[2/7] 🔧 Instalando dependencias básicas...${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
pkg install -y git nodejs-lts ffmpeg imagemagick yarn libwebp

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[3/7] 📥 Clonando repositorio Sasuke Bot...${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Verificar si existe la carpeta
if [ -d "Sasuke_bot" ]; then
    echo -e "${RED}⚠️  La carpeta Sasuke_bot ya existe.${NC}"
    echo -e "${YELLOW}¿Deseas eliminarla y clonar de nuevo? (s/n)${NC}"
    read -r respuesta
    if [ "$respuesta" = "s" ] || [ "$respuesta" = "S" ]; then
        rm -rf Sasuke_bot
        git clone https://github.com/Fer280809/Sasuke_bot.git
    else
        echo -e "${GREEN}✓ Usando carpeta existente${NC}"
    fi
else
    git clone https://github.com/Fer280809/Sasuke_bot.git
fi

cd Sasuke_bot || exit

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[4/7] 📦 Instalando dependencias de Node.js...${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Verificar si existe package.json
if [ -f "package.json" ]; then
    npm install
else
    echo -e "${RED}❌ Error: No se encontró package.json${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[5/7] 📁 Creando carpetas necesarias...${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

mkdir -p tmp
mkdir -p Sessions/Principal
mkdir -p Sessions/SubBot
mkdir -p lib
mkdir -p plugins
mkdir -p plugins2
mkdir -p plugins3
mkdir -p plugins4
mkdir -p plugins5

echo -e "${GREEN}✓ Carpetas creadas correctamente${NC}"

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[6/7] 🖼️  Verificando logo del bot...${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "lib/menu.jpg" ]; then
    echo -e "${GREEN}✓ Logo encontrado en lib/menu.jpg${NC}"
else
    echo -e "${RED}⚠️  No se encontró lib/menu.jpg${NC}"
    echo -e "${YELLOW}📌 Recuerda colocar tu imagen en lib/menu.jpg antes de iniciar${NC}"
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[7/7] 🎉 Instalación completada${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                               ║${NC}"
echo -e "${GREEN}║     ⚡ SASUKE BOT INSTALADO ⚡               ║${NC}"
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